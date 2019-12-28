module.exports = function(grunt) {
  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  var js = [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/handlebars/handlebars.js',
        'bower_components/swag/lib/swag.js',
        'bower_components/underscore/underscore.js',
        'bower_components/bootstrap/dist/bootstrap.js',
        'bower_components/bootstrap-jasny/dist/js/jasny-bootstrap.js',
        'bower_components/backbone/backbone.js',
        'bower_components/backbone.wreqr/lib/backbone.wreqr.js',
        'bower_components/backbone.babysitter/lib/backbone.babysitter.js',
        'bower_components/backbone.supermodel/build/backbone.supermodel.js',
        'bower_components/marionette/lib/backbone.marionette.js',
        'bower_components/backbone.marionette.handlebars/backbone.marionette.handlebars.js',
        'bower_components/backbone-forms/distribution/backbone-forms.js',
        'bower_components/backbone-forms/distribution/editors/list.js',
        'bower_components/backbone-forms/distribution/templates/bootstrap.js',
        'bower_components/microplugin/src/microplugin.js',
        'bower_components/sifter/sifter.js',
        'bower_components/selectize/dist/selectize.js',
        'bower_components/spin.js/spin.js',
        'bower_components/ladda-bootstrap/dist/ladda.js',
        'bower_components/moment/moment.js',
        'bower_components/jQuery-Mask-Plugin/dist/jquery.mask.js',
        'bower_components/placeholders/dist/placeholders.js',
        'bower_components/messenger/build/js/messenger.js',
        'bower_components/messenger/build/js/messenger-theme-future.js'
      ],
      css = [
        'bower_components/bootstrap/dist/css/bootstrap.css',
        'bower_components/bootstrap-jasny/dist/css/jasny-bootstrap.css',
        'bower_components/font-awesome/css/font-awesome.css',
        'bower_components/selectize/dist/selectize.css',
        'bower_components/ladda-bootstrap/dist/ladda-themeless.css',
        'bower_components/messenger/build/css/messenger.css',
        'bower_components/messenger/build/css/messenger-theme-future.css',
        'assets/css/bootstrap.min.css',
        'assets/css/custom.css'
      ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: './lib',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'assets/js/**/*.js'],
      server: ['server.js', 'routes/index.js']
    },
    uglify: {
      options: {
        beautify: true,
        mangle: false
      },
      vendors: {
        options: {
          sourceMap: 'public/js/vendors.min.map'
        },
        files: {
          'public/js/vendors.min.js': js
        }
      },
      app: {
        options: {
          sourceMap: 'public/js/app.min.map'
        },
        files: {
          'public/js/app.min.js': [
            'assets/js/**/*.js'
          ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/css/app.css': css
        }
      }
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      css: {
        src: css,
        dest: 'public/css/app.css',
      },
      app: {
        src: [
          'assets/js/**/*.js'
        ],
        dest: 'public/js/app.min.js',
      },
      jsDev: {
        src: js,
        dest: 'public/js/vendors.min.js',
      },
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/bootstrap/*.svg',
              'bower_components/bootstrap/*.eot',
              'bower_components/bootstrap/*.ttf',
              'bower_components/bootstrap/*.woff',
              'bower_components/font-awesome/*',
            ],
            dest: 'public/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/leaflet/dist/*.css'
            ],
            dest: 'public/css/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/leaflet/dist/images/*.*'
            ],
            dest: 'public/images/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/cartodb.js/themes/img/*.*'
            ],
            dest: 'public/images/',
            filter: 'isFile'
          },

          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/font-awesome/*.css'
            ],
            dest: 'public/css/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/cartodb.js/dist/*.css'
            ],
            dest: 'public/css/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/ion.rangeSlider/img/*.png'
            ],
            dest: 'public/images/',
            filter: 'isFile'
          },

        ]
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: "Templates",
          processName: function(filePath) { // input:  templates/_header.hbs
            var pieces = filePath.split("/");
            return pieces[pieces.length - 1].split(".")[0]; // output: _header.hbs
          },
          compilerOptions: {
            knownHelpers: {
              "ul": true
            }
          }
        },
        files: {
          "public/js/templates.js": ["assets/templates/*.html"]
        }
      }
    },
    watch: {
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['build', 'express:dev', 'watch'],
        options: {
          spawn: true,
        },
      },
      scripts: {
        files: ['assets/js/**/*.js'],
        tasks: ['jshint:all', 'concat:app'],
        options: {
          spawn: true,
        },
      },
      express: {
        files: ['server.js', 'routes/index.js', 'io-routes/index.js'],
        tasks: ['jshint:server', 'express:dev'],
        options: {
          nospawn: true //Without this option specified express won't be reloaded
        }
      },
      css: {
        files: ['assets/css/*.css'],
        tasks: ['concat:css'],
        options: {
          spawn: true,
        },
      },
      templates: {
        files: ['assets/templates/*.html'],
        tasks: ['handlebars'],
        options: {
          spawn: true,
        },
      },
      data: {
        files: ['assets/data/*.json'],
        tasks: ['json:data'],
        options: {
          spawn: true,
        },
      }
    },
    express: {
      options: {
        debug: true
        // Override defaults here
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    'node-inspector': {
      default: {}
    },
    json: {
      data: {
        options: {
          namespace: 'Data',
          includePath: true,
          processName: function(filename) {
            var _name = filename.split("/"),
                len = _name.length-1,
                name = _name[len].split(".")[0];
            return name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
          }
        },
        src: ['assets/data/**/*.json'],
        dest: 'public/js/json.js'
      }
    }
  });

  grunt.registerTask('build', [
    'bower:install',
    'jshint:server',
    'jshint:all',
    'uglify',
    'cssmin',
    'copy',
    'handlebars',
    'json:data'
  ]);

  grunt.registerTask('build-dev', [
    'bower:install',
    'jshint:server',
    'jshint:all',
    'concat',
    'copy',
    'handlebars',
    'json:data'
  ]);

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  grunt.registerTask('server', [ 'build-dev', 'express:dev', 'watch' ]);

  // Default task(s).
  grunt.registerTask('default', ['build']);

};
