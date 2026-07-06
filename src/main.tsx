import {createRoot} from 'react-dom/client';
import App from './App.tsx';
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

createRoot(document.getElementById('root')!).render(
  <App />,
);
