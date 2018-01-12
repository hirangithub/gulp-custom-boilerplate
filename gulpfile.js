'use strict';

var browserSync = require('browser-sync');
var del = require('del');
var gulp = require('gulp');
// gulp 
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');  // Temporary solution until Gulp 4
                                            // https://github.com/gulpjs/gulp/issues/355

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;
var reload = browserSync.reload;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var browserSyncOptions = {

    // In-depth information about the options:
    // http://www.browsersync.io/docs/options/

    logPrefix: 'H5BP',
    notify: false,
    port: 8080,
    injectChanges: true,
    watchTask: true,
    
};

// gulp.task('browser-sync', function() {  
//     browserSync.init(['./dist/css/**.*', './dist/js/**.*'], {
//       server: {
//         baseDir: "./build"
//       }
//     });
//   });

// var supportedBrowsers = [

//     // In-depth information about the options:
//     // https://github.com/postcss/autoprefixer#browsers

//     'last 2 versions',
//     'ie > 8',
//     '> 1%'
// ];

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
    del([dirs.dist]).then(function () {
        done();
    });
});

// gulp.task('clean:after', function (done) {
//     del([
//         dirs.dist + '/{css,css/**}',
//         dirs.dist + '/{img,/img/**}',
//         dirs.dist + '/{js,/js/**}'
//     ]).then(function () {
//         done();
//     });
// });

gulp.task('copy', [
    'copy:misc'
]);



gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/index.html',
        '!' + dirs.src + '/{css,css/**}'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});



gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/**/*.js',
    ]).pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')));
});

gulp.task('minify:html', function () {

    // In-depth information about the `htmlmin` options:
    // https://github.com/kangax/html-minifier#options-quick-reference
    var htmlminOptions = {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true
    };

    return gulp.src([
        dirs.src + '/index.html'
    ]).pipe(plugins.smoosher())
      .pipe(plugins.htmlmin(htmlminOptions))
      .pipe(gulp.dest('dist'));

});

gulp.task('minify', function () {
    gulp.src(['./src/js/jquery.min.js','./src/js/typed.min.js', './src/js/main.js'])
       .pipe(concat('main.js'))
       .pipe(uglify())
       .pipe(gulp.dest('dist/js'));
 });

 gulp.task('minify-css', function() {
    return gulp.src(['./src/css/*.css'])
      .pipe(cleanCSS())
      .pipe(concat('all.min.css'))
      .pipe(gulp.dest('./dist/css/'));
  });


gulp.task('watch', function () {


    gulp.watch([
        dirs.src + '/**/*.html'
    ], ['minify:html',reload]);

    gulp.watch([
        dirs.src + '/css/**/*.css',
    ], ['minify-css']);

    gulp.watch([
        dirs.src + '/js/**/*.js',
        'gulpfile.js'
    ], [
        //'lint:js',
    'minify', reload]);

});
// gulp.task('compress', function() {
//    gulp.src(dirs.dist + '/**/*.{css,html,ico,js,svg,txt,xml}')
//         .pipe(gzip())
//         .pipe(gulp.dest(dirs.dist));
// });


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', function (done) {
    runSequence(
        'clean','minify',
        'minify-css',
        'minify:html', 'watch',
        
    done);
});



gulp.task('default', ['build']);


gulp.task('serve:build', ['build'], function () {
    browserSyncOptions.server = dirs.dist;
    browserSync(browserSyncOptions);
});
