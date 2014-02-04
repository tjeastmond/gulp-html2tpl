var gulp = require('gulp');
var concat = require('gulp-concat');
var coffee = require('gulp-coffee');
var src = 'src/**/*.coffee';

gulp.task('compile', function() {
	gulp.src(src)
		.pipe(coffee({ bare: true }))
		.pipe(concat('index.js'))
		.pipe(gulp.dest('./'))
});

gulp.task('default', function() {
	gulp.run('compile');
	gulp.watch(src, function(e) {
		gulp.run('compile');
	});
});
