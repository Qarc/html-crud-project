//npm install --save-dev gulp-minify-css gulp-autoprefixer gulp-rename gulp-sass gulp-connect gulp-livereload gulp-uglify
var	gulp = require('gulp'),
	minifycss = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	connect = require('gulp-connect'),
	livereload = require('gulp-livereload'),
	uglify = require('gulp-uglify');

var site = 'public',
	inputCss = 'source/stylesheets/sass/*.{sass,scss}',
	outputCss = 'source/stylesheets/css',
	outputMinCss = 'public/assets/css',
	inputJs = 'source/javascripts/*.js',
	outputMinJs = 'public/assets/js',
	inputSass = 'source/stylesheets/sass/**/*.{sass,scss}';

gulp.task('connect', function() {
  connect.server({
    root: site,
    livereload: true
  });
});

gulp.task('html', function(){
	gulp.src(site+'/*.html')
	.pipe(connect.reload());
});

gulp.task('styles', function() {
	gulp.src(inputCss)
	.pipe(sass({
		outputStyle: 'expanded'
	}).on('error', sass.logError))
	.pipe(autoprefixer('last 99 version'))
	.pipe(gulp.dest(outputCss))
});

gulp.task('cssmin', function() {
  return gulp.src(outputCss+'/*.css')
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(outputMinCss))
    .pipe(connect.reload());
});

gulp.task('js', function() {
  return gulp.src(inputJs)
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(outputMinJs))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch(inputJs, ['js'])
	gulp.watch(outputCss+'/*.css', ['cssmin'])
	gulp.watch(inputCss, ['styles'])
	gulp.watch(inputSass, ['styles'])
	gulp.watch(site+'/*.html', ['html']);
});

gulp.task('default', ['connect', 'html', 'styles', 'cssmin', 'js', 'watch'], function() {

});