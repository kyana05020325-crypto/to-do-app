# To Do アプリ 📝

シンプルで使いやすいブラウザ版のTo Doアプリです。

## 機能

- ✅ タスク追加・削除
- ☑️ 完了状態の切り替え
- 🔍 フィルター機能（すべて・未完了・完了）
- 📂 **カテゴリー分け機能** - 仕事、プライベート、買い物などで分類
- 🎤 **音声入力機能** - Web Speech APIでテキスト化
- 🔐 **ユーザー認証** - Supabaseで安全にログイン/登録
- ☁️ **クラウド保存** - Supabaseで複数デバイス間でデータ同期
- 📱 レスポンシブデザイン
- 🎨 モダンなUI

## 🌐 ウェブアプリ

オンラインで今すぐ使用できます：

**GitHub Pages:**
👉 **[https://kyana05020325-crypto.github.io/to-do-app/](https://kyana05020325-crypto.github.io/to-do-app/)**

**Vercel（推奨）:**
👉 **[https://to-do-app-to9k.vercel.app/](https://to-do-app-to9k.vercel.app/)**

（インストール不要！ブラウザで直接アクセスして使用してください）

---

## 使い方

### インストール

```bash
git clone https://github.com/YOUR_USERNAME/to-do-app.git
cd to-do-app
npm install
```

### Supabase セットアップ

1. https://supabase.com で新規プロジェクトを作成
2. `Project URL` と `Anon Key` をコピー
3. `.env` ファイルを作成：
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

4. Supabaseでテーブルを作成（SQL実行）：
```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  text TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### 実行

```bash
node server.js
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## ファイル構成

- `index.html` - HTML構造と認証UI
- `styles.css` - レスポンシブスタイル
- `app.js` - Supabase連携、認証、タスク管理ロジック
- `server.js` - Node.jsサーバー（環境変数管理）
- `.env` - Supabase認証情報（Gitに上げない）
- `package.json` - 依存関係管理

## 技術スタック

- **フロントエンド**
  - HTML5
  - CSS3
  - JavaScript (ES6+ with Modules)
  - Web Speech API（音声入力）

- **バックエンド**
  - Node.js
  - Supabase (PostgreSQL)
  - Supabase Auth (ユーザー認証)
  - Supabase Realtime (リアルタイム同期)

## 特徴

- ✨ フレームワーク不要（バニラJS）
- 🚀 高速で軽量
- 🔐 ユーザー認証とデータ保護
- ☁️ クラウド同期（複数デバイス対応）
- 🎤 音声入力対応
- 📱 レスポンシブデザイン
- 🛡️ XSS対策（HTMLエスケーピング）
- 🔑 環境変数で安全な設定管理

## ライセンス

MIT License
