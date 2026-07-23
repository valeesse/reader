// Raw development HTML bypasses Vite's HTML transform. The default Tauri
// development mode intentionally disables HMR, so the application graph can
// start immediately without loading /@react-refresh and /@vite/client.
void import('./main.tsx');
