/**
 * GRUNT builds for tipzy
 *
 * Run `grunt watch` to develop, and this will automatically trigger
 * js/less dev buids as appropriate.
 *
 * Run `grunt production` to build for production, and this will trigger
 * js/less productuon builds, which are minified and ready for prime time.
 *
 */
module.exports = function(grunt) {

	// @note run `grunt watch` to have ongoing dev builds as files are modified
	grunt.registerTask('watch', ['watch']);

	/**
	 * The dev build task will create a full build of LESS / JS but does not minify
	 */
	grunt.registerTask('develop', ['concat', 'less:dev' ]);


	/**
	 * This task builds our JS and LESS in a production configuration
	 */
	grunt.registerTask('production', [
		'concat', // concatinate require.js and our application js into one file
		'uglify', // uglify/min our JS
		'less:prod', // stick with me now - i've added some other tasks for minifications
	]);

	/**
	 * The default build is a production build -- JS/LESS are minified and uglified
	 */
	grunt.registerTask('default', ['production']);

	// some handy vars maybe
	var cnf = {
		pkg: grunt.file.readJSON('package.json'),
		banner: "/**" +
					'\n* <%= cnf.pkg.name %>' +
					'\n* v<%= cnf.pkg.version %>' +
					'\n* <%= grunt.template.today("yyyy-mm-dd hh:MM:ss TT") %> ' +
					"\n*/ \n\n"
	};

	grunt.initConfig({

		cnf: cnf,

		concat: {
			jsMain: {
				options: {
					separator: '\n',
					banner: "<%= cnf.banner %>"
				},
				src: [
					"js-src/tipzy.main.js",
				],
				dest: "dist/js/tipzy.main.js"
			},
			
			jsFull: {
				options: {
					separator: '\n',
					banner: "<%= cnf.banner %>"
				},
				src: [
					"js-src/header.full.js",
					"vendor/inView/inView.js",
					"vendor/endedEvents/endedEvents.js",
					"js-src/tipzy.main.js",
					"js-src/footer.full.js",
				],
				dest: "dist/js/tipzy.full.js"
			},
			
			jsAMD: {
				options: {
					separator: '\n',
					banner: "<%= cnf.banner %>"
				},
				src: [
					"js-src/header.amd.js",
					"vendor/inView/inView.js",
					"js-src/tipzy.main.js",
					"js-src/footer.amd.js",
				],
				dest: "dist/js/tipzy.amd.js"
			},

		},

		/**
		 * Minify our JS for production builds
		 */
		uglify: {
			options: {
				mangle: true,
				banner: "<%= cnf.banner %>"
			},
			js: {
				files: {
					'dist/js/tipzy.main.min.js' : ['dist/js/tipzy.main.js'],
					'dist/js/tipzy.full.min.js' : ['dist/js/tipzy.full.js'],
					'dist/js/tipzy.amd.min.js' : ['dist/js/tipzy.amd.js']
				}
			},
		},

		less: {
			dev: {
				options: {
					cleancss: true,
					banner: "<%= cnf.banner %>"
				},
				files: {
					"dist/css/tipzy.css" : "dist/tipzy-less/tipzy.less"
				}
			},
			prod: {
				options: {
					cleancss: true,
					compress: true,
					banner: "<%= cnf.banner %>"
				},
				files: {
					"dist/css/tipzy.min.css" : "dist/tipzy-less/tipzy.less"
				}
			}
		},

		jshint: {
			options: {
				curly: false,
				eqeqeq: false,
				eqnull: false,
				browser: true,
				force: true,
				globals: {
					jQuery: true
				},
				ignores: [
					"js-src/header.amd.js",
					"js-src/header.full.js",
					"js-src/footer.amd.js",
					"js-src/footer.full.js"
				]
			},
			dev: ['js-src/**/*.js']
		},

		watch: {
			js: {
				files: [
					'js-src/**/*.js'
				],
				// watch assumes 'dev' is happening
				tasks: ['jshint:dev', 'concat']
			},
			css: {
				files: [
					'dist/tipzy-less/**/*.less'
				],
				tasks: ['less:dev']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

};
