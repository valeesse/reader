import { build, createServer, preview } from 'vite';

const host = '127.0.0.1';
const port = 3000;

if (process.env.ZENITH_HMR === 'true') {
  const server = await createServer({ server: { host, port, strictPort: true, hmr: true } });
  await server.listen();
  server.printUrls();
} else {
  // Vite's cold on-demand TSX/Tailwind transforms can keep WebView2 waiting
  // for many seconds. Build the optimized browser graph before Tauri creates
  // its window, then serve immutable chunks; subsequent edits rebuild dist in
  // the background and take effect on the next app reload.
  const watcher = await build({
    build: { watch: {} },
    logLevel: 'warn',
  });
  const rollupWatcher = Array.isArray(watcher) ? watcher[0] : watcher;
  await new Promise((resolve, reject) => {
    const onEvent = (event) => {
      if (event.code === 'END') resolve();
      if (event.code === 'ERROR') reject(event.error);
    };
    rollupWatcher.on('event', onEvent);
  });
  const server = await preview({
    preview: { host, port, strictPort: true },
    logLevel: 'warn',
  });
  console.info(`  Zenith fast dev server: http://${host}:${port}/`);

  const close = async () => {
    await rollupWatcher.close();
    await server.httpServer.close();
    process.exit(0);
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}
