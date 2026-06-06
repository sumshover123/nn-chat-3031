'use strict';
const http = require('node:http');
const router = require('./lib/router'); // auth の読み込みを削除

// basic の設定部分を丸ごと削除

// basic.check(...) を外し、直接 router.route を呼び出す形に修正
const server = http.createServer((req, res) => {
    router.route(req, res);
  })
  .on('error', e => {
    console.error('Server Error', e);
  })
  .on('clientError', e => {
    console.error('Client Error', e);
  });

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info(`Listening on ${port}`);
});