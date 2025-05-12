var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
postcss = require("gulp-postcss");
autoprefixer = require("autoprefixer");
var sourcemaps = require('gulp-sourcemaps'); 
var browserSync = require('browser-sync').create(); 
cssbeautify = require('gulp-cssbeautify');
var beautify = require('gulp-beautify');

/*******************  LTR   ******************/


//_______ task for scss folder to css main style 
function scss() {
    console.log('Command executed successfully compiling SCSS in assets.');
    return gulp.src('./src/assets/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(beautify.css({ indent_size: 4 }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./src/assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
}

function watch() {
    gulp.watch(['./src/assets/scss/**/*.scss'], gulp.series('scss'));  
}

const defaults = gulp.series(
gulp.parallel(scss, watch));


exports.scss = scss;
exports.watch = watch;

exports.default = defaults;

