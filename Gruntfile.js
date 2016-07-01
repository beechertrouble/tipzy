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
	grunt.registerTask('develop', ['js:dev', 'less:dev', 'cmq' ]);

	/**
	 * This task builds our JS application in a dev configuration
	 */
	grunt.registerTask('js:dev', [
		'requirejs', // build our application and direct dependencies
		'concat:js', // concatinate require.js and our application js into one file
		'concat:egg', //
		'concat:dev', // copy the final dev JS to public
		'clean' // CLEAN UR ROOM!
	]);

	/**
	 * This task builds our JS and LESS in a production configuration
	 */
	grunt.registerTask('production', [
		'requirejs', // build our application and direct dependencies
		'concat:js', // concatinate require.js and our application js into one file
		'concat:egg', //
		'uglify', // uglify/min our JS
		'less:dev', // stick with me now - i've added some other tasks for minifications
		'cmq', // combine our scattered media queries
		'cssmin', // now minify the css
		'clean' // CLEAN UR ROOM!
	]);

	/**
	 * The default build is a production build -- JS/LESS are minified and uglified
	 */
	grunt.registerTask('default', ['production']);

	// some handy vars maybe
	var cnf = {
		src: 'app/src',
		pub: 'app/public',
		vendor: 'app/public/vendor',
		// tmp: 'app/src/tmp',
		pkg: grunt.file.readJSON('package.json'),
		banner: "/**" +
					'\n* <%= cnf.pkg.name %>' +
					'\n* v<%= cnf.pkg.version %>' +
					'\n* <%= grunt.template.today("yyyy-mm-dd hh:MM:ss TT") %> ' +
					"\n*/ \n\n"
	};

	grunt.initConfig({

		cnf: cnf,

		/**
		 * Clean up some intermediary JS files created in the build process
		 */
		clean: {
			build: {
				src: [
					"<%= cnf.src %>/js/main.build.js",
					"<%= cnf.src %>/js/main.concat.js"
				]
			}
		},

		/**
		 * Build our full JS dependency chain, excluding 'header' and 'footer' which are added by concat
		 */
		requirejs: {
			compile: {
				options: {
					paths : {
						// note that vendor is symlinked inside src/js/ to make this less painful:
						"jquery" : "vendor/jquery/dist/jquery",
						"ikelos" : "vendor/ikelos/dist/ikelos",
						"ikelos/ui" : "vendor/ikelos.plugin.ui-radcom",
						"audia" : "vendor/audia/audia"
					},
					baseUrl: "<%= cnf.src %>/js",
					include: ['radical/main'],
					out: "<%= cnf.src %>/js/main.build.js",
					optimize: 'none'
				}
			}
		},

		/**
		 * Add our GROOWM compatibility wrap (header/footer) and a task to copy app to main.js in dev
		 */
		concat: {
			js: {
				options: {
					separator: '\n'
				},
				src: [
					"<%= cnf.src %>/js/header.js",
					"<%= cnf.vendor %>/requirejs/require.js",
					"<%= cnf.src %>/js/vendor/dashjs/dist/dash.all.min.js",
					"<%= cnf.src %>/js/main.build.js",
					"<%= cnf.src %>/js/footer.js"
				],
				dest: "<%= cnf.src %>/js/main.concat.js"
			},

			// dev: just copy the wrapped file to public
			dev: {
				options: {
					separator: '\n'
				},
				src: [
					"<%= cnf.src %>/js/main.concat.js"
				],
				dest: "<%= cnf.pub %>/js/main.js"
			},

			// eggdev: copy w/o mangle
			egg: {
				options: {
					separator: '\n'
				},
				src: [
					"<%= cnf.src %>/js/egg/runner.js",
					"<%= cnf.src %>/js/egg/eggs/*.js"
				],
				dest: "<%= cnf.pub %>/js/egg.js"
			}

			// production: this copy is handled by uglify, see below
		},

		/**
		 * Minify our JS for production builds
		 */
		uglify: {
			options: {
				mangle: true
			},
			js: {
				files: {
					'<%= cnf.pub %>/js/main.js' : ['<%= cnf.src %>/js/main.concat.js']
				}
			},
			egg : {
				files: {
					'<%= cnf.pub %>/js/egg.js' : ['<%= cnf.pub %>/js/egg.js']
				}
			}
		},

		less: {
			dev: {
				options: {
					cleancss: true,
					banner: "<%= cnf.banner %>"
				},
				files: {
					"<%= cnf.pub %>/css/main.css" : "<%= cnf.src %>/less/main.less",
					"<%= cnf.pub %>/css/egg.css" : "<%= cnf.src %>/less/egg/egg.less",
					"<%= cnf.pub %>/css/noscript.css" : "<%= cnf.src %>/less/noscript.less",
					"<%= cnf.pub %>/css/groowm_edit_mode.css" : "<%= cnf.src %>/less/groowm_edit_mode.less"
				}
			},
			/*
			production: {
				options: {
					cleancss: true,
					compress: true,
					banner: "<%= cnf.banner %>"
				},
				files: {
					"<%= cnf.pub %>/css/main.min.css" : "<%= cnf.src %>/less/main.less",
					"<%= cnf.pub %>/css/noscript.min.css" : "<%= cnf.src %>/less/noscript.less",
					"<%= cnf.pub %>/css/groowm_edit_mode.min.css" : "<%= cnf.src %>/less/groowm_edit_mode.less"
				}
			}*/
		},

		/**
		* consolidate media queries from less dev output
		*/
		cmq: {
			options: {
				log: false
			},
			your_target: {
				files: {
					'<%= cnf.pub %>/css/': ['<%= cnf.pub %>/css/main.css']
				}
			}
		},

		/**
		* give us jsut the critical css for abaove the fold content for inlining later
		* more info here: https://github.com/filamentgroup/grunt-criticalcss
		*/
		/* @todo: revist this when everything else is done
		criticalcss: {
			home: {
				options: {
					url: "http://radcom-dev.radops.io/",
					width: 1440,
					height: 900,
					outputfile: "<%= cnf.pub %>/css/critical.pagetype_home.css",
					filename: "<%= cnf.pub %>/css/main.css", // Using path.resolve( path.join( ... ) ) is a good idea here
					buffer: 800*1024,
					ignoreConsole: true
				}
			},
			search: {
				options: {
					url: "http://radcom-dev.radops.io/page/search?render&preview&s=video", // @revisit: search term that will give us a good representation of results?
					width: 1440,
					height: 900,
					outputfile: "<%= cnf.pub %>/css/critical.pagetype_search.css",
					filename: "<%= cnf.pub %>/css/main.css",
					buffer: 800*1024,
					ignoreConsole: true
				}
			},
			fourohfour: {
				options: {
					url: "http://radcom-dev.radops.io/page/this-page-will-never-exist-like-ever?render&preview",
					width: 1440,
					height: 900,
					outputfile: "<%= cnf.pub %>/css/critical.pagetype_404.css",
					filename: "<%= cnf.pub %>/css/main.css",
					buffer: 800*1024,
					ignoreConsole: true
				}
			},
			worksplash: {
				options: {
					url: "http://radcom-dev.radops.io/page/work?render&preview",
					width: 1440,
					height: 900,
					outputfile: "<%= cnf.pub %>/css/critical.pagetype_workspash.css",
					filename: "<%= cnf.pub %>/css/main.css",
					buffer: 800*1024,
					ignoreConsole: true
				}
			},
			projectpage: {
				options: {
					url: "http://radcom-dev.radops.io/page/work?render&preview",
					width: 1440,
					height: 900,
					outputfile: "<%= cnf.pub %>/css/critical.pagetype_workspash.css",
					filename: "<%= cnf.pub %>/css/main.css",
					buffer: 800*1024,
					ignoreConsole: true
				}
			},
			directorsindex: {
				options: {
					url: "http://radcom-dev.radops.io/page/directors?render&preview",
					width: 1440,
					height: 900,
					outputfile: "<%= cnf.pub %>/css/critical.pagetype_directorsindex.css",
					filename: "<%= cnf.pub %>/css/main.css",
					buffer: 800*1024,
					ignoreConsole: true
				}
			}
		},
		*/

		/**
		* minify css from less:dev & cms output
		*/
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'<%= cnf.pub %>/css/main.css': ['<%= cnf.pub %>/css/main.css'],
					//'<%= cnf.pub %>/css/critical.pagetype_home.min.css': ['<%= cnf.pub %>/css/critical.pagetype_home.css'],
					//'<%= cnf.pub %>/css/critical.pagetype_search.min.css': ['<%= cnf.pub %>/css/critical.pagetype_search.css'],
					//'<%= cnf.pub %>/css/critical.pagetype_404.min.css': ['<%= cnf.pub %>/css/critical.pagetype_404.css'],
					//'<%= cnf.pub %>/css/critical.pagetype_workspash.min.css': ['<%= cnf.pub %>/css/critical.pagetype_workspash.css']
				}
			}
		},

		/**
		* for svg sprite management
		*/
		svg_sprite	: {
			options: {
				//
			},
			rm_icons_target: {
				expand: true,
				cwd: "<%= cnf.src %>/svg/icons/",
				src: ['**/*.svg'],
				dest: "<%= cnf.pub %>/img/icons",
				options: {
					// Target-specific options
					spacing: {
						padding: 0
					},
					shape: {
						dimension: {
							maxWidth: 600,
							precision: 3,
							attributes: false,
							transform: ['svgo'],
							dest: "<%= cnf.pub %>/img/icons/intermediate"
						}
					},
					mode: {
						symbol: true,
						view: {
							bust: false,
							render: {
								less: true
							}
						}
					}
				}
			},
			ikelos_ui_target: {
				expand: true,
				cwd: "<%= cnf.src %>/svg/ikelosui/",
				src: ['**/*.svg'],
				dest: "<%= cnf.pub %>/img/ikelosui",
				options: {
					// Target-specific options
					spacing: {
						padding: 0
					},
					shape: {
						dimension: {
							maxWidth: 600,
							precision: 2,
							attributes: false,
							transform: ['svgo'],
							dest: "<%= cnf.pub %>/img/ikelosui/intermediate"
						}
					},
					mode: {
						symbol: true
					}
				}
			},
			networkbugs_target: {
				expand: true,
				cwd: "<%= cnf.src %>/svg/networkbugs/",
				src: ['**/*.svg'],
				dest: "<%= cnf.pub %>/img/networkbugs",
				options: {
					// Target-specific options
					spacing: {
						padding: 0
					},
					shape: {
						dimension: {
							maxWidth: 600,
							precision: 2,
							attributes: false,
							transform: ['svgo'],
							dest: "<%= cnf.pub %>/img/networkbugs/intermediate"
						}
					},
					mode: {
						symbol: true
					}
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
					/*
					"<%= cnf.src %>/js/header.js",
					"<%= cnf.src %>/js/footer.js",
					"<%= cnf.src %>/js/vendor"
					*/
				]
			},
			dev: ['<%= cnf.src %>/js/radical/**/*.js']
		},

		watch: {
			js: {
				files: [
					'<%= cnf.src %>/js/radical/**/*.js',
					"<%= cnf.src %>/js/header.js",
					"<%= cnf.src %>/js/footer.js",
					"<%= cnf.src %>/js/egg/*.js", // egg runner
					"<%= cnf.src %>/js/egg/eggs/*.js", // individual eggs
					"<%= cnf.src %>/js/vendor/*.js"
				],
				// watch assumes 'dev' is happening
				// @todo maybe remove less from this proc for speed with either
				tasks: ['jshint:dev', 'js:dev']
			},
			css: {
				files: [
					'<%= cnf.src %>/less/*.less',
					'<%= cnf.src %>/less/*/*.less',
					'<%= cnf.src %>/less/*/*/*.less',
					'<%= cnf.src %>/less/*/*/*/*.less'
				],
				tasks: ['less:dev', 'cmq']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-combine-media-queries');
	grunt.loadNpmTasks('grunt-criticalcss');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-svg-sprite');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');

};
