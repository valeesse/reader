import {createRoot} from 'react-dom/client';
import './index.css';

const ignoredResizeObserverMessages = [
  'ResizeObserver loop completed',
  'ResizeObserver loop limit exceeded',
];

window.addEventListener('error', (event) => {
  if (ignoredResizeObserverMessages.some((message) => String(event.message).includes(message))) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

const root = createRoot(document.getElementById('root')!);

type StartupState = {
  shellReadyAt?: number;
  resumeBook?: import('./types').Book | null;
};

const startup = (window as Window & { __ZENITH_STARTUP__?: StartupState }).__ZENITH_STARTUP__;
const appModulePromise = import('./App.tsx');
const resumeWarmupPromise = startup?.resumeBook
  ? Promise.all([
      import('./ReaderLayoutNext'),
      import('./lib/readerPublication').then((module) => {
        // Start native parsing/index restoration now; ReaderLayout will consume
        // this same promise as soon as it mounts.
        void module.prewarmReaderPublication(startup.resumeBook!).catch(() => {});
      }),
    ])
  : Promise.resolve();

// Paint React as soon as its minimal coordinator is available. Resume parsing
// continues concurrently and dynamic imports are shared by the browser module
// cache; the persisted reading frame remains above both until the live reader
// reports that its exact position is presentable.
void resumeWarmupPromise.catch(() => {});
void appModulePromise.then(({ default: App }) => {
  root.render(<App />);
  window.setTimeout(() => localStorage.removeItem('zenith_resume_render_v2'), 5000);
  window.requestAnimationFrame(() => {
    console.info('[startup] React first frame', {
      elapsedMs: Math.round(performance.now()),
      shellReadyMs: Math.round(startup?.shellReadyAt || 0),
    });
  });
}).catch((error) => {
  console.error('[startup] failed to load application', error);
  const overlay = document.getElementById('zenith-startup-overlay');
  if (overlay) {
    overlay.classList.add('startup-error');
    overlay.textContent = '启动失败，请查看控制台';
  }
});
