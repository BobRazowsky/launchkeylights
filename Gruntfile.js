module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
	  		'public/app.js': ['client/app.js']
		},
		copy: {
			main: {
				expand: true,
				cwd: 'client',
				src: '**',
				dest: 'public/',
			}
		},
	    watch: {
			files: ['client/*'],
			tasks: ['browserify']
		}
	});
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['copy','browserify']);
};