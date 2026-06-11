# To Do アプリ 📝

シンプルで使いやすいブラウザ版のTo Doアプリです。

## 機能

- ✅ タスク追加・削除
- ☑️ 完了状態の切り替え
- 🔍 フィルター機能（すべて・未完了・完了）
- 💾 ローカルストレージで自動保存
- 📱 レスポンシブデザイン
- 🎨 モダンなUI

## 使い方

### インストール

```bash
git clone https://github.com/YOUR_USERNAME/to-do-app.git
cd to-do-app
```

### 実行

Node.jsを使った方法：
```bash
node server.js
```

ブラウザで `http://localhost:3000` にアクセスしてください。

または、ファイルをHTTPサーバーで公開：
```bash
python -m http.server 8000
```

## ファイル構成

- `index.html` - HTML構造
- `styles.css` - スタイル
- `app.js` - JavaScript機能
- `server.js` - Node.jsサーバー（オプション）

## 技術スタック

- HTML5
- CSS3
- JavaScript (vanilla)
- localStorage API

## 特徴

- ✨ フレームワーク不要
- 🚀 高速で軽量
- 💾 オフライン対応
- 🛡️ XSS対策（HTMLエスケーピング）

## ライセンス

MIT License
