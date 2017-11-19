var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var electron = require('electron-connect').server.create();
var packager = require('electron-packager');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');

var webpackConfig = require('./webpack.config');
var srcDir = 'src';
var distDir = 'dist';
var releaseDir = 'release';

// scssファイルのコンパイル
gulp.task('compile:styles', function() {
    return gulp.src([srcDir + '/styles/**/*.scss'])
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.sourcemaps.write('.'))
        .pipe($.minifyCss({advanced:false}))
        .pipe(gulp.dest(distDir + '/styles'));
});

// htmlファイルへのcssファイルのinject
gulp.task('inject', ['compile:styles'], function() {
    return gulp.src(srcDir + '/**/*.html')
        .pipe($.inject(gulp.src(distDir + '/styles/**/*.css'), {
            relative: true,
            ignorePath: ['../dist', '..'],
            addPrefix: '.'
        }))
        .pipe(gulp.dest(distDir));
});

// webpackでトランスコンパイル
gulp.task('webpack', function() {
    return webpackStream(webpackConfig, webpack)
        .pipe(gulp.dest(distDir));
});

// ビルド
gulp.task('build', ['inject', 'webpack']);

// コンパイルしてElectron起動
gulp.task('start', ['build'], function() {
    // Electron開始
    electron.start();
    
    // BrowserProcessが読み込むファイルが変更されたらリスタート
    gulp.watch([distDir + '/index.js'], electron.restart);
    // RendererProcessが読み込むファイルが変更されたらリロード
    gulp.watch([distDir + '/index.html', distDir + '/**/*.{html,js,css}'], electron.reload);
});

// パッケージング
gulp.task('package', ['win32', 'darwin', 'linux'].map(function(platform) {
    var taskName = 'package:' + platform;
    gulp.task(taskName, ['build'], function(done) {
        packager({
            dir: __dirname,
            out: releaseDir + '/' + platform,
            name: 'ElectronApp',
            arch: 'x64',
            platform: platform,
            electronVersion: '1.7.9'
        }, function(err) {
            done();
        });
    });
    return taskName;
}));

gulp.task('default', ['build']);