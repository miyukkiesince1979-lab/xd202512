# flocss_SPtoPC_2025

静的サイト制作のためのGulp開発環境です。
FLOCSS設計、スマホファースト、CSS変数対応、自動リロードなど開発環境を提供します。

## 動作環境
- **Node.js**: v14.0.0 以上（推奨: v16以上）
- **Gulp**: 4系

## セットアップ

```bash
# プロジェクトフォルダに移動
cd gulp

# パッケージをインストール
npm install

# 開発サーバーを起動（ファイル監視 + 自動リロード）
npm start
# または
npx gulp
```

## 使用可能なコマンド

```bash
npm start          # 開発モード（ファイル監視 + BrowserSync）
npm run build      # 本番ビルド（全ファイル生成）
npm run clean      # dist フォルダをクリーン

# 個別タスク
npx gulp sass      # Sassのみコンパイル
npx gulp img       # 画像のみ最適化
npx gulp js        # JavaScriptのみ処理
npx gulp html      # HTMLのみコピー
```

## ディレクトリ構成

```
project/
├── src/              # 開発用ソースファイル
│   ├── sass/         # Sassファイル（FLOCSS設計）
│   ├── css/          # CDN用CSSファイル（整形処理なし）
│   ├── js/           # JavaScriptファイル
│   │   └── vendor/   # CDN用JSファイル（整形処理なし）
│   ├── images/       # 画像ファイル
│   └── index.html    # HTMLファイル（開発用）
├── dist/             # 出力先（納品用）
│   ├── css/          # コンパイル済みCSS
│   ├── js/           # 圧縮済みJS
│   ├── images/       # 最適化済み画像
│   └── index.html    # HTMLファイル（src/から自動コピー）
└── gulp/             # Gulp設定
    ├── gulpfile.js   # タスク定義
    └── package.json  # 依存関係
```

## 主な機能

### 📦 Sass/CSS
- ✅ **Dart Sass** 対応
- ✅ **CSS変数（カスタムプロパティ）** サポート
- ✅ **Autoprefixer** でベンダープレフィックス自動付与
- ✅ **CSSプロパティの自動整列**（アルファベット順）
- ✅ 開発用（styles.css + sourcemap）と本番用（styles.min.css）を自動生成
- ✅ **FLOCSS設計** 採用
- ✅ **インデント2スペース**で自動整形
- ✅ CDNファイル（`.min.css`や`src/css/`フォルダ）は整形処理をスキップ

### 🖼️ 画像最適化
- ✅ JPEG/PNG/SVG を自動圧縮
- ✅ **WebP形式** に自動変換

### 📝 JavaScript
- ✅ 圧縮版（.min.js）を自動生成
- ✅ エラー時も処理を継続
- ✅ **インデント2スペース**で自動整形
- ✅ CDNファイル（`.min.js`や`vendor/`フォルダ）は整形処理をスキップ

### 📄 HTML
- ✅ src/ から dist/ へ自動コピー
- ✅ ファイル変更を自動検知してブラウザリロード
- ✅ **インデント2スペース**で自動整形

### 🚀 開発サーバー
- ✅ **BrowserSync** による自動リロード
- ✅ ファイル変更を自動検知

## CSS設計（FLOCSS）

```
sass/
├── foundation/      # リセットCSS、変数定義
├── layout/          # レイアウト（l-）
├── object/
│   ├── component/   # 再利用可能なコンポーネント（c-）
│   ├── project/     # プロジェクト固有のパターン（p-）
│   └── utility/     # ユーティリティクラス（u-）
└── styles.scss      # メインファイル
```

## CSS変数の使い方

```scss
// _variable.scss で定義
:root {
  --font-main: "Noto Sans JP", sans-serif;
  --c-main: #333;
  --white: #fff;
}

// _setting.scss でSass変数として参照可能
$font-main: var(--font-main);
$black: var(--c-main);
```

## 出力ファイル

### CSS
- `styles.css` - 開発用（読みやすい形式）
- `styles.css.map` - ソースマップ（デバッグ用）
- `styles.min.css` - 本番用（圧縮版）

### JavaScript
- `script.js` - 開発用
- `script.min.js` - 本番用（圧縮版）

### 画像
- 元の形式（JPEG/PNG/SVG）で圧縮
- WebP形式も同時生成

## 開発フロー

### 開発用（src/）
HTMLを含むすべてのファイルは `src/` フォルダで編集します：
- **HTML**: `src/index.html` を編集
- **Sass**: `src/sass/` 内のファイルを編集
- **JavaScript**: `src/js/` 内のファイルを編集
- **画像**: `src/images/` に配置

### 納品用（dist/）
Gulpが自動的に以下を生成します：
- HTMLファイル（src/からコピー）
- コンパイル済みCSS（圧縮版含む）
- 圧縮済みJavaScript
- 最適化済み画像（WebP含む）

## CDNライブラリの追加方法

### ✅ 推奨：すべてのファイルは `src` に配置

**❌ `dist` に直接入れないでください**
- `gulp clean` で削除される可能性があります
- Gitで管理できません

### 📦 ライブラリファイルの配置ルール

#### 1. `.min.js` や `.min.css` のファイル
**自動的に整形処理をスキップします**

```bash
# 例：Swiperライブラリ
src/js/swiper-bundle.min.js       → dist/js/swiper-bundle.min.js（そのままコピー）
src/css/swiper-bundle.min.css     → dist/css/swiper-bundle.min.css（そのままコピー）
```

#### 2. `.min` が付いていないCDNファイル
**`vendor/` フォルダに配置してください**

```bash
# 例：圧縮されていないライブラリ
src/js/vendor/library.js          → dist/js/vendor/library.js（整形処理なし）
src/css/library.css               → dist/css/library.css（整形処理なし）
```

### 📝 使用例

```bash
# jQuery UI（minファイル）
src/js/jquery-ui.min.js           # そのままコピーされる

# GSAP（minなし）
src/js/vendor/gsap.js             # vendorフォルダに入れれば整形処理されない

# AOS（CSS）
src/css/aos.css                   # src/css/に入れれば整形処理されない
```

### ⚙️ 自動処理の仕組み

- **開発したファイル**: インデント2スペースで自動整形
- **`.min.js` / `.min.css`**: 整形処理をスキップ（そのままコピー）
- **`src/js/vendor/`**: 整形処理をスキップ（そのままコピー）
- **`src/css/`**: 整形処理をスキップ（そのままコピー）

## クライアント納品時

### 本番環境用ファイル（必須）
`dist/` フォルダ全体を納品します：
```
dist/
├── css/
│   └── styles.min.css           # 本番用CSS（圧縮版）
├── js/
│   └── *.min.js                 # 本番用JS（圧縮版）
├── images/                      # 最適化済み画像
└── index.html                   # HTMLファイル
```

### 開発用ファイル（任意）
クライアントが今後も編集する可能性がある場合は、以下も含める：
- `src/` フォルダ全体（HTML、Sass、JS、画像のソースファイル）
- `gulp/` フォルダ全体（ビルド設定）
- `styles.css` + `styles.css.map` - ソースマップ付きCSS（デバッグ用）
- `*.js`（非圧縮版） - 読みやすいJavaScript

### 納品不要なファイル
本番環境のみの場合は、以下は不要です：
- `src/` フォルダ全体（Sassソースファイル）
- `gulp/` フォルダ全体（ビルド設定）
- `.map` ファイル（本番環境では不要）

## 備考
- **CSS設計**: [FLOCSS](https://github.com/hiloki/flocss)
- **スマホファースト設計**
- **rem単位推奨**
- **対応ブラウザ**: モダンブラウザのみ（IE11非対応）"# xd202512" 
