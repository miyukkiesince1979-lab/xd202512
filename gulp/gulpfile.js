const { src, dest, watch, series, parallel } = require("gulp");

const srcBase = "../src";
const distBase = "../dist";
const srcPath = {
  css: `${srcBase}/sass/**/*.scss`,
  cssVendor: `${srcBase}/css/**/*.css`, // vendorフォルダ内のCSSファイルをそのままコピー（CDN用）
  img: srcBase + "/images/**/*",
  html: `${srcBase}/**/*.html`,
  js: [
    `${srcBase}/js/**/*.js`,
    `!${srcBase}/js/vendor/**`, // vendorフォルダ全体を除外
    `!${srcBase}/js/**/*.min.js`, // すべてのminファイルを除外
  ],
  jsVendor: `${srcBase}/js/vendor/**/*.js`, // vendorフォルダ内のファイルをそのままコピー（CDN用）
  jsMinified: [
    `${srcBase}/js/**/*.min.js`,
    `!${srcBase}/js/vendor/**/*.min.js`, // vendorフォルダ内のminファイルは除外（jsVendorで処理）
  ], // vendorフォルダ外のminファイルをそのままコピー
};
const distPath = {
  css: distBase + "/css/",
  img: distBase + "/images/",
  html: distBase + "/",
  js: distBase + "/js/",
};

// ローカルサーバー立ち上げ
const browserSync = require("browser-sync");
const browserSyncOption = {
  server: distBase, // サーバーのルートディレクトリ
};
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption); // Browsersyncの初期化
};
const browserSyncReload = (done) => {
  browserSync.reload(); // ページのリロード
  done();
};

// Sassコンパイル
const gulpSass = require("gulp-sass");
const dartSass = require("sass");
const sass = gulpSass(dartSass);
const sassGlob = require("gulp-sass-glob-use-forward");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssDeclarationSorter = require("css-declaration-sorter");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const beautify = require("gulp-beautify");

// ブラウザ対応設定
const browsers = [
  "last 2 versions",
  "> 1%",
  "not dead",
  "not ie <= 10",
];

const cssSass = () => {
  return src(srcPath.css)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(sourcemaps.init()) // ソースマップ開始
    .pipe(sassGlob())
    .pipe(
      sass.sync({
        includePaths: ["src/sass"],
        outputStyle: "expanded",
        silenceDeprecations: ["legacy-js-api"], // レガシーAPI警告を非表示
      })
    )
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: browsers,
          cascade: false, // CSSを整形しない
          grid: "autoplace", // CSS Gridのサポート
        }),
        cssDeclarationSorter({
          order: "alphabetical", // アルファベット順に整理
        }),
      ])
    )
    .pipe(
      beautify.css({
        indent_size: 2,
        indent_char: " ",
      })
    )
    .pipe(sourcemaps.write("./")) // インラインソースマップ
    .pipe(dest(distPath.css)) // styles.css + styles.css.map を出力（開発用）
    .pipe(
      notify({
        message: "Sassをコンパイルして圧縮してるんやで〜！",
        onLast: true,
      })
    );
};

// CSS圧縮タスク（minified版を生成）
const cssMinify = () => {
  return src(`${distPath.css}styles.css`) // コンパイル済みのCSSを読み込み
    .pipe(
      cleanCSS({
        compatibility: "ie11",
        level: {
          1: {
            specialComments: 0,
          },
        },
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(distPath.css)); // styles.min.css を出力（ソースマップなし）
};

// ベンダーCSSファイルをそのまま出力（CDNファイル用）
const cssCopy = (done) => {
  src(srcPath.cssVendor, { allowEmpty: true })
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(dest(distPath.css));
  done();
};

const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");
const webp = require("gulp-webp");

const imgImagemin = () => {
  return src(srcPath.img)
    .pipe(
      imagemin(
        [
          imageminMozjpeg({
            quality: 80,
          }),
          imageminPngquant(),
          imageminSvgo({
            plugins: [
              {
                removeViewbox: false,
              },
            ],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(dest(distPath.img))
    .pipe(webp())
    .pipe(dest(distPath.img));
};

const jsUglify = () => {
  return src(srcPath.js)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(
      beautify.js({
        indent_size: 2,
        indent_char: " ",
      })
    )
    .pipe(dest(distPath.js))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(distPath.js))
    .pipe(
      notify({
        message: "JavaScriptをコンパイルして圧縮してるんやで〜！",
        onLast: true,
      })
    );
};

// ライブラリファイルをそのまま出力（整形処理なし）
const jsCopy = (done) => {
  // vendorフォルダのファイルをjs/直下にコピー（vendorフォルダを無くす）
  src(srcPath.jsVendor, { allowEmpty: true, base: `${srcBase}/js/vendor` })
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(dest(distPath.js));
  done();
};

// HTMLファイルをコピー
const htmlCopy = () => {
  return src(srcPath.html)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(
      beautify.html({
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 1,
        preserve_newlines: true,
        wrap_line_length: 0, // 自動折り返しなし
        unformatted: [], // すべての要素を整形
        content_unformatted: ['pre', 'textarea'], // preとtextareaのみ内容を整形しない
        extra_liners: [], // 追加の改行なし
      })
    )
    .pipe(dest(distPath.html));
};

// ファイルの変更を検知
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, cssMinify, browserSyncReload)); // CSSファイルの変更を監視
  watch(srcPath.cssVendor, series(cssCopy, browserSyncReload)); // CSSライブラリファイルの変更を監視
  watch(srcPath.img, series(imgImagemin, browserSyncReload)); // 画像ファイルの変更を監視
  watch(srcPath.js, series(jsUglify, browserSyncReload)); // JSファイルの変更を監視
  watch(srcPath.jsVendor, series(jsCopy, browserSyncReload)); // ライブラリファイルの変更を監視
  watch(srcPath.html, series(htmlCopy, browserSyncReload)); // HTMLファイルの変更を監視
};

const del = require("del");
const delPath = {
  css: [
    `${distBase}/css/styles.css`,
    `${distBase}/css/styles.min.css`,
  ], // ビルド生成ファイルのみ削除（CDNのCSSは除外）
  cssMap: `${distBase}/css/**/*.css.map`,
  img: `${distBase}/images/**/*`,
  html: `${distBase}/**/*.html`,
  js: [
    `${distBase}/js/script.js`,
    `${distBase}/js/script.min.js`,
  ], // ビルド生成ファイルのみ削除（CDNのJSは除外）
};

const clean = (done) => {
  del([...delPath.css, delPath.cssMap, delPath.img, delPath.html, ...delPath.js], {
    force: true,
  });
  done();
};

// タスクのエクスポート
exports.sass = series(cssSass, cssMinify); // CSS生成（通常版+圧縮版）
exports.css = series(cssSass, cssMinify, cssCopy);
exports.img = imgImagemin;
exports.js = series(jsUglify, jsCopy);
exports.html = htmlCopy;
exports.clean = clean;
exports.build = series(clean, parallel(imgImagemin, series(cssSass, cssMinify), jsUglify, htmlCopy), parallel(cssCopy, jsCopy));

// デフォルトタスク（開発用）
exports.default = series(
  clean,
  parallel(imgImagemin, series(cssSass, cssMinify), jsUglify, htmlCopy),
  parallel(cssCopy, jsCopy),
  parallel(watchFiles, browserSyncFunc)
);
