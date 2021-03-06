'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const browserSync = require('browser-sync').create()
const webpack = require('webpack-stream')
const ROOT = './src'
const DIR = {
  root: ROOT,
  sass: ROOT + '/scss/**/*.scss',
  css: './build/css',
  html: ROOT + '/*.html',
  js: {
    dir: ROOT + '/**/*.js',
    root: ROOT + '/*.js',
    js: ROOT + '/js/**/*.js',
    entry: {
      popup: './src/js/popup.js',
      background: './src/js/background.js'
    },
    dest: './build/js'
  }
}

gulp.task('sass', function () {
  return gulp.src(DIR.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DIR.css))
    .pipe(browserSync.stream()) // for reloads
})

gulp.task('sass:watch', function () {
  gulp.watch(DIR.sass, ['sass'])
})

gulp.task('webpack', () => {
  if (!DIR.js) {
    return
  }
  console.log('js: ', DIR.js)
  webpack({
    // watch:true,
    entry: DIR.js.entry,
    output: {
      filename: '[name].bundled.js'
    },
    module: {
      rules: [{
        test: /\.json$/,
        use: 'json-loader'
      }],
      loaders: [
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            // cacheDirectory: true,
            // plugins: ['transform-runtime'],
            presets: ['es2015']
          }
        },
        // { test: /\.hbs$/, loader: "handlebars-loader" }
      ]
    },
    node: {
      dgram: 'empty',
      net: 'empty'
    }
  }).pipe(gulp.dest(DIR.js.dest))
})

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'webpack'], () => {
  browserSync.init({
    server: [DIR.root, './build']
  })

  gulp.watch(DIR.sass, ['sass'])
  gulp.watch(DIR.html).on('change', browserSync.reload)

  if (DIR.js) {
    gulp.watch(DIR.js.js, ['webpack'])
    gulp.watch(DIR.js.root, ['webpack'])
    gulp.watch(DIR.js.dir).on('change', browserSync.reload)
    // gulp.watch(DIR.js.dest).on('change', browserSync.reload)
  }
})

gulp.task('default', ['serve'])
