const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * ESPN `site.api` does not send Access-Control-Allow-Origin for browser requests.
 * Proxy it under /api/espn-site so the CRA dev server stays same-origin.
 * For production, configure the same path on your host (see vercel.json / README).
 */
module.exports = function setupProxy(app) {
  app.use(
    '/api/espn-site',
    createProxyMiddleware({
      target: 'https://site.api.espn.com',
      changeOrigin: true,
      pathRewrite: { '^/api/espn-site': '' },
      logLevel: 'warn',
    })
  );

  app.use(
    '/api/espn-news',
    createProxyMiddleware({
      target: 'https://site.api.espn.com',
      changeOrigin: true,
      pathRewrite: { '^/api/espn-news': '' },
      logLevel: 'warn',
    })
  );
};
