var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var gutil = require('gulp-util')
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config.js')
var stream = require('webpack-stream')
var less = require('gulp-less')
var plumber = require('gulp-plumber')
var coffee = require('gulp-coffee')

var path = {
  HTML: './index.html',
  SCRIPTS: ['src/**/*.js'],
  STYLES: ['src/**/*.less'],
  STYLES_ENTRY: ['src/styles/index.less'],
  DEST: './dist'
}

gulp.task('webpack-dev-server', function(callback) {
	var myConfig = Object.create(webpackConfig)
	myConfig.devtool = "eval"
	myConfig.debug = true

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(myConfig), {
		publicPath: myConfig.output.publicPath,
		stats: {
			colors: true
		}
	}).listen(8080, "localhost", function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
	});
})

gulp.task('webpack', [], function() {
  return gulp.src(path.SCRIPTS)
    .pipe(plumber())
    .pipe(coffee())
    .pipe(sourcemaps.init())
    .pipe(stream(webpackConfig))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.DEST))
})

gulp.task('less', function () {
  return gulp.src(path.STYLES_ENTRY)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('watch:less', function() {
  console.log('watching')
  gulp.watch(path.STYLES, ['less'])
})

gulp.task('watch:js', function() {
  gulp.watch(path.SCRIPTS, ['webpack-dev-server'])
})
