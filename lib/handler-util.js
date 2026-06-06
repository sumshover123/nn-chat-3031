'use strict';
const fs = require('node:fs');
const Cookies = require('cookies');
const { currentThemeKey } = require('../config');

// ルーター側でのエラーを防ぐためにシンプルなメッセージを返す形に残すか、リンクから外す。
function handleLogout(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(
    `<!DOCTYPE html><html lang="ja">
        <body>
            <h1>セッションを終了しました</h1>
            <a href="/">トップページへ戻る</a>
        </body>
    </html>`
  );
}

function handleChangeTheme(req, res) {
  const cookies = new Cookies(req, res);
  const currentTheme = (cookies.get(currentThemeKey) !== 'light' ? 'light' : 'dark');
  cookies.set(currentThemeKey, currentTheme);
  res.writeHead(303, {
    // 変更後はトップページではなくおみくじ画面（/posts）に戻るように
    'Location': '/posts'
  });
  res.end();
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
    'Cache-Control': 'public, max-age=604800'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
  });
  const file = fs.readFileSync('./public/style.css');
  res.end(file);
}

function handleNnChatJsFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript',
  });
  const file = fs.readFileSync('./public/nn-chat.js');
  res.end(file);
}

// 練習2で追加したトップページの文言をおみくじ仕様に変更
function handleTopPage(req, res) {
  res.writeHead(200, { // 404から200（正常）に変更
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.write('<h1>NNおみくじの入口</h1>');
  res.write('<p><a href="/posts">おみくじを引く</a></p>');
  res.end();
}

// 404エラーページのリンクをおみくじ仕様に変更
function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.write('<p>ページがみつかりません</p>');
  res.write('<p><a href="/posts">NNおみくじに戻る</a></p>');
  res.end();
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストです');
}

module.exports = {
  handleLogout,
  handleChangeTheme,
  handleFavicon,
  handleStyleCssFile,
  handleTopPage,
  handleNnChatJsFile,
  handleNotFound,
  handleBadRequest,
};