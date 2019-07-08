const gulp      = require('gulp');
const apidoc    = require('gulp-apidoc');


gulp.task('gulpApiDoc', (done) => {
    apidoc({
        src: "./routes",
        dest: "./public/docs/apidoc"
    }, done);
});

gulp.task("watch", () => {
    gulp.watch(["./routes/**"], ["apidoc"]);
});
