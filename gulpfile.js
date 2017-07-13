// require gulp
var gulp = require('gulp');
// require other packages
var concat = require('gulp-concat');
var cssmin = require('gulp-minify-css');
var rename = require("gulp-rename");
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

//Default
gulp.task('default', ['scripts', 'styles', 'watch']);

// scripts task
gulp.task('scripts', function() {
  return gulp.src("./public/js/src/*.js")
  .pipe(uglify())
  .pipe(rename({
    suffix: ".min"
  }))
  .pipe(gulp.dest("./public/js/dist/"))
  //.pipe(concat("scripts.min.js"))
  //.pipe(gulp.dest("./public/js/dist/"));
});


// styles task
gulp.task('styles', function() {
  return gulp.src('./public/stylesheets/src/*.scss')
  .pipe(sass())
  .pipe(cssmin())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('./public/stylesheets/dist/'))
  //.pipe(concat("styles.min.css"))
  //.pipe(gulp.dest("./public/css/dist/"));
});

gulp.task('watch', function() {
  gulp.watch('./public/js/src/*.js', ['scripts']);
  gulp.watch('./public/stylesheets/src/*.scss', ['styles']);
  gulp.watch('./public/stylesheets/src/partials/*.scss', ['styles']);
  gulp.watch('./public/stylesheets/src/bootstrap-partials/*.scss', ['styles']);
  gulp.watch('./public/stylesheets/src/dashboard-partials/*.scss', ['styles']);
});
