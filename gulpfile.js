var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('./package.json');

var paths = {
    src: 'src/' + pkg.name + '.js'
};

// Using a banner that is stored in a file to make it easier to work with.
try {
    var banner = fs.readFileSync('banner.txt');
} catch(e) {
    throw new Error('There was an error reading in the banner.');
}

gulp.task('default', ['build']);

gulp.task('lint', function() {
    gulp.src(paths.src)
        .pipe(jshint())
        .pipe(jshint.reporter('checkstyle'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['lint'], function() {
    gulp.src(paths.src)
        .pipe(uglify())
        .pipe(concat(pkg.name + '.min.js'))
        .pipe(header(banner, { pkg: pkg, buildDate: gutil.date(new Date(), 'yyyy-mm-dd') }))
        .pipe(gulp.dest('build'));
});
