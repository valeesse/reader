import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig} from 'vite';

const uiRoot = path.resolve(__dirname, 'packages/reader-ui');

export default defineConfig(({ command }) => {
  const developmentReactAliases = command === 'serve' ? [
    { find: /^react$/, replacement: path.join(uiRoot, 'vendor/prebuilt-react/react.js') },
    { find: /^react\/jsx-runtime$/, replacement: path.join(uiRoot, 'vendor/prebuilt-react/react-jsx-runtime.js') },
    { find: /^react\/jsx-dev-runtime$/, replacement: path.join(uiRoot, 'vendor/prebuilt-react/react-jsx-dev-runtime.js') },
    { find: /^react-dom\/client$/, replacement: path.join(uiRoot, 'vendor/prebuilt-react/react-dom-client.js') },
  ] : [];
  return {
    plugins: [instantStartupHtml(), ...reactWithPrebuiltRuntime(), tailwindcss()],
    resolve: {
      alias: [
        ...developmentReactAliases,
        { find: '@', replacement: uiRoot },
      ],
    },
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: true,
      // The WebView cold-start path must not download and compile Vite's large
      // HMR client before the reader. Opt in when actively editing UI with
      // `ZENITH_HMR=true`; the normal `tauri dev` command prioritizes launch.
      hmr: process.env.ZENITH_HMR === 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': 'http://127.0.0.1:8080',
      },
    },
    optimizeDeps: {
      noDiscovery: true,
      // The startup document must never wait for an eager prebundle of the
      // complete reader/library graph. Dependencies are transformed on demand
      // behind the already-painted zero-dependency shell.
      // React's CommonJS-compatible wrappers are checked-in as a split ESM
      // development runtime, so even a completely empty .vite cache has no
      // dependency optimization work on the startup path.
      include: [],
      exclude: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'],
      holdUntilCrawlEnd: false,
    },
    build: {
      outDir: path.resolve(__dirname, 'target/dist'),
      emptyOutDir: true,
    },
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
  };
});

/**
 * Vite waits for dependency optimization before returning transformed HTML.
 * On Windows that can hold the WebView on its unpainted surface for seconds.
 * Serve the zero-dependency shell verbatim in development and start the Vite
 * graph from a separate module only after the document has painted.
 */
function instantStartupHtml() {
  return {
    name: 'zenith-instant-startup-html',
    enforce: 'pre' as const,
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split('?', 1)[0];
        const vendorPrefix = '/packages/reader-ui/vendor/prebuilt-react/';
        if (pathname?.startsWith(vendorPrefix)) {
          const relativePath = pathname.slice(vendorPrefix.length);
          if (!/^[a-zA-Z0-9_./-]+\.js$/.test(relativePath) || relativePath.includes('..')) return next();
          const vendorPath = path.join(uiRoot, 'vendor/prebuilt-react', relativePath);
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          response.setHeader('Cache-Control', 'no-cache');
          response.end(fs.readFileSync(vendorPath));
          return;
        }
        if (pathname !== '/' && pathname !== '/index.html') return next();
        const source = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
        const html = source.replace(
          /<script type="module" id="zenith-production-entry">[\s\S]*?<\/script>/,
          `<script id="zenith-development-entry">
            setTimeout(function () {
              var script = document.createElement('script');
              script.type = 'module';
              script.src = '/packages/reader-ui/dev-entry.ts';
              document.head.appendChild(script);
            }, 0);
          </script>`,
        );
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(html);
      });
    },
  };
}

function reactWithPrebuiltRuntime() {
  const plugins = react();
  const optimizerPlugin = plugins.find((plugin) => plugin && 'name' in plugin && plugin.name === 'vite:react-refresh');
  if (optimizerPlugin && 'config' in optimizerPlugin && typeof optimizerPlugin.config === 'function') {
    const originalConfig = optimizerPlugin.config;
    optimizerPlugin.config = async function (...args: Parameters<typeof originalConfig>) {
      const result = await originalConfig.apply(this, args);
      if (result?.optimizeDeps) result.optimizeDeps.include = [];
      return result;
    };
  }
  return plugins;
}
