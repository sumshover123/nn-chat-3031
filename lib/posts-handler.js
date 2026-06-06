'use strict';
const pug = require('pug');
const Cookies = require('cookies');
const util = require('./handler-util');
const { currentThemeKey } = require('../config');
const crypto = require('node:crypto');

const oneTimeTokenMap = new Map(); // CSRF対策トークン用（セッション代わりに一時トークンを保持）
const FORTUNE_KEY = 'last_fortune'; // 運勢を保存するCookieのキー名

// おみくじの選択肢
const fortunes = ['大吉', '中吉', '小吉', '吉', '末吉', '凶', '大凶'];

async function handle(req, res) {
  const cookies = new Cookies(req, res);
  const currentTheme = cookies.get(currentThemeKey) || 'light';
  const options = { maxAge: 30 * 86400 * 1000 };
  cookies.set(currentThemeKey, currentTheme, options);

  // Cookie から前回の結果を取得（なければ null）
  const lastFortune = cookies.get(FORTUNE_KEY) ? decodeURIComponent(cookies.get(FORTUNE_KEY)) : null;

  // CSRF対策用のトークン生成（認証を外したため、今回は 'anonymous' という固定キーで管理）
  const tokenKey = 'anonymous';

  switch (req.method) {
    case 'GET': {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });

      const oneTimeToken = crypto.randomBytes(8).toString('hex');
      oneTimeTokenMap.set(tokenKey, oneTimeToken);

      // 初回表示（GET）のときは、今回の運勢（fortune）はまだ無いので null を渡す
      res.end(pug.renderFile('./views/posts.pug', {
        currentTheme,
        fortune: null,
        lastFortune,
        oneTimeToken
      }));
      break;
    }
    case 'POST': {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      }).on('end', async () => {
        const params = new URLSearchParams(body);
        const requestedOneTimeToken = params.get('oneTimeToken');

        // CSRFトークンのチェック
        if (!requestedOneTimeToken || oneTimeTokenMap.get(tokenKey) !== requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }

        // 1. ランダムで運勢を決定
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const newFortune = fortunes[randomIndex];

        // 2. 新しい運勢を Cookie に保存（日本語が化けないようにエンコード）
        cookies.set(FORTUNE_KEY, encodeURIComponent(newFortune), options);

        // トークンを使い果たしたのでリセット
        const oneTimeToken = crypto.randomBytes(8).toString('hex');
        oneTimeTokenMap.set(tokenKey, oneTimeToken);

        // 3. 画面に結果を描画してレスポンスを返す
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8'
        });
        res.end(pug.renderFile('./views/posts.pug', {
          currentTheme,
          fortune: newFortune,      // 新しく引いた結果
          lastFortune,              // 引く前のCookieに入っていた「前回の結果」
          oneTimeToken
        }));
      });
      break;
    }
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

// 削除機能は使わないため、空の関数にするかエラーを返す仕様にします
function handleDelete(req, res) {
  util.handleBadRequest(req, res);
}

module.exports = {
  handle,
  handleDelete,
};