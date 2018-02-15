var del = require('del');
var gulp = require('gulp');
var path = require('path');
var argv = require('yargs').argv;
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('gulp-buffer');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var exorcist = require('exorcist');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync');

/**
 * Using different folders/file names? Change these constants:
 */
var SOURCE_PATH = './src';

var BUILD_PATH         = './build';
var BUILD_SCRIPTS_PATH = BUILD_PATH + '/js';

var ENTRY_FILE  = 'index.js';
var OUTPUT_FILE = 'script.js';

var STATIC_PATH = './static';

var keepFiles = false;

/**
 * Simple way to check for development/production mode.
 */
function isProduction() {
  return argv.production;
}

/**
 * Logs the current build mode on the console.
 */
function logBuildMode() {
  if (isProduction()) {
    gutil.log(gutil.colors.green('Running production build...'));
  } else {
    gutil.log(gutil.colors.yellow('Running development build...'));
  }
}

/**
 * Deletes all content inside the './build' folder.
 * If 'keepFiles' is true, no files will be deleted. This is a dirty workaround since we can't have
 * optional task dependencies :(
 * Note: keepFiles is set to true by gulp.watch (see serve()) and reseted here to avoid conflicts.
 */
function cleanBuild() {
  if (!keepFiles) {
    del([BUILD_PATH + '/**/*.*']);
  } else {
    keepFiles = false;
  }
}

/**
 * Copies everything from the static directory to the build directory.
 */
function copyStatic() {
  return gulp.src(STATIC_PATH + '/**/*')
    .pipe(gulp.dest(BUILD_PATH));
}

/**
 * Builds client application
 */
function buildClient() {
  var sourcemapPath = BUILD_SCRIPTS_PATH + '/' + OUTPUT_FILE + '.map';
  logBuildMode();

  return browserify({
      paths: [path.join(__dirname, SOURCE_PATH)],
      entries: SOURCE_PATH + '/' + ENTRY_FILE,
      debug: true
    })
    .transform(babelify)
    .bundle().on('error', function(error) {
      gutil.log(gutil.colors.red('[Build Error]', error.message));
      this.emit('end');
    })
    .pipe(gulpif(!isProduction(), exorcist(sourcemapPath)))
    .pipe(source(OUTPUT_FILE))
    .pipe(buffer())
    .pipe(gulpif(isProduction(), uglify()))
    .pipe(gulp.dest(BUILD_SCRIPTS_PATH));
}

/**
 * Starts the Browsersync server.
 * Watches for file changes in the 'src' folder.
 */
function serve() {
  var options = {
    server: {
      baseDir: BUILD_PATH
    },
    open: false // Change it to true if you wish to allow Browsersync to open a browser window.
    //, open: 'tunnel' 
  };
  
  browserSync(options);
  
  // Watches for changes in files inside the './src' folder.
  gulp.watch(SOURCE_PATH + '/**/*.js', ['watch-js'])
  
  // Watches for changes in files inside the './static' folder. Also sets 'keepFiles' to true (see cleanBuild()).
  gulp.watch(STATIC_PATH + '/**/*', ['watch-static']).on('change', function() {
    keepFiles = true;
  });
}


// ------------------ TASKS ------------------

gulp.task('cleanBuild', cleanBuild);
gulp.task('copyStatic', ['cleanBuild'], copyStatic);
gulp.task('buildClient', ['copyStatic'], buildClient);
gulp.task('fastBuild', buildClient); // For watcher, so it only rebuils client on change

// Host & Watch
gulp.task('serve', ['buildClient'], serve);
gulp.task('watch-js', ['fastBuild'], browserSync.reload); // Rebuilds and reloads the project when executed.
gulp.task('watch-static', ['copyStatic'], browserSync.reload);

gulp.task('default', ['serve']);
