module.exports = function(grunt) {

  var config = grunt.file.readJSON('config_path.json');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: grunt.file.readJSON('config_path.json'),

    // JS HINT
    jshint: {
      all: ['Gruntfile.js', '<%= config.app_path %>/**/*.js', '<%= config.vendor_path %>/**/*.js', ]
    },

    // VENDORS JS
    uglify: {
      options: {
        mangle: false,
        sourceMap:true,
        compress: true,
        preserveComments: false
      },
      vendor: {
        files: {
          '<%= config.public_path %>/<%= config.js_dir %>/vendor.js':
           [
              // BEFORE

              // ALL
              '<%= config.vendor_path %>/**/*.js',
              '!<%= config.vendor_path %>/**/_*.js' // IGNORED

              // AFTER
           ]
        }
      }
    },

    // APP FILES
    requirejs: {
      compile: {
        options: {
          baseUrl: "<%= config.app_path %>",
          include: config.require_include_modules,
          name: "../vendor/_almond", // assumes a production build using almond
          out: "<%= config.public_path %>/<%= config.js_dir %>/app.js",
          optimize: "uglify2",
          generateSourceMaps: true,
          preserveLicenseComments: false,
          findNestedDependencies: true
        }
      }
    },

    // SASS FILES
    sass: {
      dist: {
        options: {
          sourcemap:true
        },
        files: [{
          expand: true,
          cwd: '<%= config.sass_path %>',
          src: ['**/*.scss'],
          dest: '<%= config.public_path %>/<%= config.css_dir %>/',
          ext: '.css'
        }]
      }
    },

    // WEB SERVER HTML
    connect: {
      dev: {
        options:{
          protocol: "<%= config.protocole %>",
          hostname: "<%= config.hostname %>",
          port: "<%= config.port %>",
          base: "<%= config.public_path %>",
          livereload: true,
          open: true
        }
      }
    },

    // WEB SERVER PHP
    php: {
      dev: {
          options: {
          base: "<%= config.public_path %>",
            keepalive: true,
            open: true,
            hostname: "<%= config.hostname %>",
            port: "<%= config.port %>"
          }
      }
    },

    // WATCHER
    watch: {
      config: {
        files: ['Gruntfile.js', "config_path.json"],
        options: {
          reload: true
        },
      },
      scripts: {
        files: ['<%= config.app_path %>/**/*.js'],
        tasks: ['jshint', 'requirejs'],
        options: {
          spawn: false
        },
      },
      sass: {
        files: ['<%= config.sass_path %>/**/*.scss'],
        tasks: ['sass']
      },
      css: {
        files: ['<%= config.public_path %>/**/*.css'],
        options:{
          // To use with external server, copy/paste the next script tag
          // <script src="//localhost:35729/livereload.js"></script>
          livereload: true
        }
      },
      vendor: {
        files: ['<%= config.vendor_path %>/**/*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false
        },
      }
    }
  });

  // LOAD GRUNT NPM TASKS
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-php');

  // REGISTER TASKS
  // $ grunt // Will trigger "degault" task
  // $ grunt compile // Will trigger "compile" task
  // which perform "jshint", "sass", "uglify", "requirejs" tasks
  grunt.registerTask('compile', ["jshint", "sass", "uglify", "requirejs"]);
  grunt.registerTask('watch_php', ["compile", "php", "watch"]);
  grunt.registerTask('watch_server', ["compile", "connect", "watch"]);
  grunt.registerTask('watch_no_server', ["compile", "watch"]);
  grunt.registerTask('default', ["watch_server"]);

};
