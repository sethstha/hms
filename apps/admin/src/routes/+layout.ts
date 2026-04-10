// Static SPA mode: no SSR, all routes pre-rendered to a single shell.
// Cloudflare Pages serves 404.html as the SPA fallback for client-side routing.
export const prerender = false;
export const ssr = false;
