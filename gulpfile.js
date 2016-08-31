'use strict';
let gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync').create();

// JS 
gulp.task('js', function () {
	return gulp.src('./app/js/main.js')
		.pipe(browserify())
		.pipe(rename('app.js'))
		.pipe(gulp.dest('./app/js/bundle/'));
});

// SASS
gulp.task('sass', function () {
    gulp.src('./app/scss/style.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/css/'));
    browserSync.reload();
});

// create a task that ensures the `js` task is complete before reloading browsers
gulp.task('js-watch', ['js'], function (done) {
	browserSync.reload();
	done();
});

// Browsersync
gulp.task('browser-sync', ['js'], function() {
	browserSync.init({
		server: {
			baseDir: './app'
		}
	});
	gulp.watch('./app/js/**/*.js', ['js-watch']);
});

// Watch
gulp.task('watch', function() {
	gulp.watch('./app/scss/*.scss', ['sass']);
});

// default
gulp.task('default', ['js', 'sass', 'browser-sync', 'watch']);
