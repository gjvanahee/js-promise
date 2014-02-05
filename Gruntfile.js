module.exports = function (grunt) {
	"use strict";
	// Project configuration.
	grunt.initConfig({
		// vars
		pkg: grunt.file.readJSON('package.json'),
		// tasks
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> Licence <%= pkg.license %> */\n'
			},
			latest: {
				src: '<%= jshint.files[2] %>',
				dest: 'lib/<%= pkg.name %>-latest.min.js'
			},
			production: {
				src: '<%= jshint.files[2] %>',
				dest: 'lib/<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		},
		jshint: {
			// define the files to lint
			files: [
				'Gruntfile.js', 
				'test/test.js', 
				'src/promise.js'
			],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				// reporter: 'js/jshint-reporter.js',
				curly: true,
				eqeqeq: true,
				eqnull: false,
				unused: true,
				strict: true,
				// reporterOutput: "production/jshint.log",
				// more options here if you want to override JSHint defaults
				globals: {
					require: true,
					exports: true,
					module: true
				}
			}
		}
	});
	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	// Default task(s).
	grunt.registerTask('latest', ['jshint', 'uglify:latest']);
	grunt.registerTask('default', ['jshint', 'uglify']);
};
