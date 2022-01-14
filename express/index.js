const express = require('express')
const connect = require("connect-history-api-fallback")
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path')
const app = express()

/* 
app.use(function (req, res, next) {
  console.log(req.url);
  if (/^\/v2/.test(req.url)) req.url = req.url.replace("/v2", "")
  console.log({ u: req.url });
  next()
})
 */
app.use('/api', createProxyMiddleware({ target: 'https://uart.ladishb.com', changeOrigin: true }));
app.use(connect())
app.use(express.static(path.join(__dirname, 'dist')))
app.listen(9004, '0.0.0.0', () => {
  console.log('express listen 9004');
});