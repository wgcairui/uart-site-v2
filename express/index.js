const express = require('express')
const path = require('path')
const app = express()


app.use(function (req, res, next) {
  console.log(req.url);
  if (/^\/v2/.test(req.url)) req.url = req.url.replace("/v2", "")
  console.log({ u: req.url });
  next()
})


app.use(express.static(path.join(__dirname, 'dist')))
app.listen(9004, '0.0.0.0', () => {
  console.log('express listen 9004');
});