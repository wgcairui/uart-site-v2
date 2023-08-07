const express = require('express')
const connect = require("connect-history-api-fallback")
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path')
const app = express()

// const xprofiler_1 = require("xprofiler");
// // @ts-ignore：无法被执行的代码的错误
// const xtransit_1 = require("xtransit");
// const xt_config_1 = require("./xt.config");
// xprofiler_1.start({ log_dir: xt_config_1.xconfig.logDir });
// xtransit_1.start(xt_config_1.xconfig);

/* 
app.use(function (req, res, next) {
  console.log(req.url);
  if (/^\/v2/.test(req.url)) req.url = req.url.replace("/v2", "")
  console.log({ u: req.url });
  next()
})
 */
app.use('/api', createProxyMiddleware({ target: 'https://uart.ladishb.com', changeOrigin: true }));
app.use('/client', createProxyMiddleware({ target: 'https://uart.ladishb.com', changeOrigin: true }));
app.use(connect())
app.use(express.static(path.join(__dirname, 'dist')))
app.listen(9004, '0.0.0.0', () => {
  
  console.log('express listen 9004');
});