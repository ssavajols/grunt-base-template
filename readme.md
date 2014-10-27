# GRUNT-BASE-TEMPLATE

Boilerplate to start project with grunt, bower, sass, requirejs

<br />
<img src="http://gruntjs.com/img/grunt-logo.png" align="center" width="200" />


### REQUIREMENT

#### GRUNT-CLI

Grunt needs grunt-cli module to work. Please, install grunt-cli with root/administrator rights :

	$ sudo npm install grunt-cli -g

#### BOWER

Bower is required to import JS libraries files :

	$ sudo npm install bower -g

#### SASS

Sass is required to compile CSS files :

	$ sudo gem install sass

<hr />
### HOW TO USE

	$ npm install                  // Will install node module packages.
	                               // Execute once before start project

	$ bower install                // Will install bower javascript libraries.

	$ npm start                    // Start watcher with html server
	$ npm run start                // Same as npm start
	$ npm run start_php            // Start watcher with php server
	$ npm run start_no_server      // Start watcher without server
	$ npm run build                // Compile files only without watcher




<hr />
### CONFIGURATION FILES

#### config_app.json

```javascript
{
  "public_path": "./public",       // Path to public files (www)
  "vendor_path": "./vendor",       // Path to vendor files
  "sass_path": "./scss",           // Path to SCSS files
  "app_path": "./app",             // Path to app JS files
  "css_dir": "css",                // Path to output CSS folder
  "js_dir": "js",                  // Path to output JS folder

  "protocole": "http",              // Server configuration protocole (http|https)
  "hostname": "localhost",          // Server hostname (localhost|127.0.0.1)
  "port": 8080,                     // Server port (8080|80)

  "require_include_modules" : ["main"]     // Main modules in app folder.
                                           // Dependencies will be automatically detected

  "bower_dependencies" : {                 // Bower JS libraries dependencies
  },
  "bower_main_files" : {                   // Bower mainFiles for missing mainFiles path
  }                                        // in bower.json file library
}
```

##### public_path
Public path is the path to the public folder. Where JS and CSS will be generated.

##### vendor_path
Path to the vendors files. files "_" prefixed will be ignored by the compiler.
Sourcemaps are generated by the compiler.

##### sass_path
Path to the SCSS files .
Sourcemaps are generated by the compiler.

##### app_path
Path to the app JS files. Almond.js will be used to generate requireJS modules. No need to load require.js library. Sourcemaps are generated by the compiler.

##### css_dir
Name for the generated CSS folder.

##### js_dir
Name for the generated JS folder.

##### protocole
`http` or `https`<br />
Protocole to use for the web server.

##### hostname
Hostname for the web server. Needed to be in the HOST file system.

##### port
Port for the web server.

##### require_include_modules
Require main modules. Dependencies will be detected and automatically included.

##### bower_dependencies
Bower dependencies libraries.

```javascript
// Ex: Backbone need jquery and underscore.

"backbone" : ["jquery", "underscore"]
```

##### bower_main_files
Some libraries didn't explicitly declare mainFile to use. Bower_concat need to know which file is needed to compile and
concat it with other vendors.<br /><br />

```javascript
// Ex: simple-slideshow

mainFiles: {
  'simple-slideshow': ['dist/simple-slideshow.min.js', 'dist/simple-slideshow.min.css']
}
```

#### Gruntfile.js

Most configuration parameters are in the config_app.json file.


```javascript
module.exports = function (grunt) {

    var config = grunt.file.readJSON('config_app.json');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        // JS HINT
        jshint: {
            all: ['Gruntfile.js', '<%= config.app_path %>/**/*.js' ],
            options: {
                force: true,
                reporter: require('jshint-stylish')
            }
        },

        clean: {
            sourceMap: ["<%= config.public_path %>/**/*.map"],
            tmp: ["<%= config.tmp_path %>/*"]
        },

        // FOR DEV APP FILES AND VENDOR FILES JS
        uglify: {
            options: {
                mangle: true,
                sourceMap: true,
                compress: true,
                preserveComments: false
            },
            dev_vendor: {
                options: {
                    compress: {
                        warnings: false
                    }
                },
                files: {
                    '<%= config.public_path %>/<%= config.js_dir %>/vendor.js': [
                        // BEFORE
                        '<%= config.tmp_path %>/_bower.js',

                        // ALL
                        '<%= config.vendor_path %>/**/*.js',
                        '!<%= config.vendor_path %>/**/_*.js', // IGNORED
                        '!<%= config.vendor_path %>/bower_components/**/*'

                        // AFTER
                    ]
                }
            },
            dev_app: {
                files: {
                    "<%= config.public_path %>/<%= config.js_dir %>/app.js": [
                        '<%= config.app_path %>/**/*.js',
                        '!<%= config.app_path %>/**/_*.js' // IGNORED
                    ]
                }
            },
            // ONLY VENDORS
            prod: {
                options: {
                    sourceMap: false,
                    compress: {
                        drop_console: true,
                        warnings: false
                    }
                },
                files: {
                    '<%= config.public_path %>/<%= config.js_dir %>/vendor.js': [
                        // BEFORE
                        '<%= config.tmp_path %>/_bower.js',

                        // ALL
                        '<%= config.vendor_path %>/**/*.js',
                        '!<%= config.vendor_path %>/**/_*.js', // IGNORED
                        '!<%= config.vendor_path %>/bower_components/**/*'

                        // AFTER
                    ]
                }
            }
        },

        bower_concat: {
            dev: {
                dest: '<%= config.tmp_path %>/_bower.js',
                cssDest: '<%= config.public_path%>/<%= config.css_dir %>/vendor.css',
                exclude: [
                    'almond'
                ],
                dependencies: config.bower_dependencies,
                mainFiles: config.bower_main_files,
                bowerOptions: {
                    sourceMap: true
                }
            },
            prod: {
                dest: '<%= config.tmp_path %>/_bower.js',
                cssDest: '<%= config.public_path%>/<%= config.css_dir %>/vendor.css',
                exclude: [
                    'requirejs',
                    'almond'
                ],
                dependencies: config.bower_dependencies,
                mainFiles: config.bower_main_files,
                bowerOptions: {
                }
            }
        },

        // APP FILES FOR BUILD ONLY
        requirejs: {
            compile: {
                options: {
                    baseUrl: "<%= config.app_path %>",
                    include: "<%= config.require_include_modules %>",
                    name: "../vendor/bower_components/almond/almond", // assumes a production build using almond
                    out: "<%= config.public_path %>/<%= config.js_dir %>/app.js",
                    optimize: "uglify2",
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    findNestedDependencies: true
                }
            }
        },

        // SASS FILES
        sass: {
            dist: {
                options: {
                    sourcemap: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.sass_path %>',
                        src: ['**/*.scss'],
                        dest: '<%= config.public_path %>/<%= config.css_dir %>/',
                        ext: '.css'
                    }
                ]
            }
        },

        // WEB SERVER HTML
        connect: {
            dev: {
                options: {
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
                files: ['Gruntfile.js', "config_app.json"],
                options: {
                    reload: true
                }
            },
            scripts: {
                files: ['<%= config.app_path %>/**/*.js'],
                tasks: ['jshint', 'uglify:dev_app'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            sass: {
                files: ['<%= config.sass_path %>/**/*.scss'],
                tasks: ['sass']
            },
            css: {
                files: ['<%= config.public_path %>/**/*.css'],
                options: {
                    // To use with external server, copy/paste the next script tag
                    // <script src="//localhost:35729/livereload.js"></script>
                    livereload: true
                }
            },
            vendor: {
                files: ['<%= config.vendor_path %>/**/*.js', '<%= config.vendor_path %>/**/*.css'],
                tasks: ['bower_concat', 'uglify:dev_vendor', "clean:tmp"],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        }
    });

    // LOAD GRUNT NPM TASKS
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-php');


    // REGISTER TASKS
    // $ grunt // Will trigger "default" task
    // $ grunt compile // Will trigger "compile" task
    // which perform "jshint", "sass", "uglify", "requirejs" tasks

    grunt.registerTask('compile', ["jshint", "bower_concat:prod", "uglify:prod", "requirejs", "sass", "clean"]);
    grunt.registerTask('watch_tasks', ["jshint", "bower_concat:dev", "uglify:dev_vendor", "uglify:dev_app", "sass", "clean:tmp"]);
    grunt.registerTask('watch_php', ["watch_tasks", "php", "watch"]);
    grunt.registerTask('watch_server', ["watch_tasks", "connect", "watch"]);
    grunt.registerTask('watch_no_server', ["watch_tasks", "watch"]);
    grunt.registerTask('default', ["watch_server"]);

};

```

<hr />
## NOTES

### Grunt packages used

[grunt-contrib-uglify](https://github.com/gruntjs/grunt-contrib-uglify)<br />
[grunt-contrib-sass](https://github.com/gruntjs/grunt-contrib-sass)<br />
[grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch)<br />
[grunt-contrib-requirejs](https://github.com/gruntjs/grunt-contrib-requirejs)<br />
[grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint)<br />
[grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect)<br />
[grunt-bower-concat](https://github.com/sapegin/grunt-bower-concat)<br />
[grunt-php](https://github.com/sindresorhus/grunt-php)


## Tutorials

[Grunt video tutorial](https://www.youtube.com/watch?v=q3Sqljpr-Vc)<br />
[Bower video tutorial](https://egghead.io/lessons/bower-introduction-and-setup)<br />
[SASS video tutorial](https://www.youtube.com/watch?v=fbVD32w1oTo&list=PL2CB1F80266E986EA)<br />
[requireJS video tutorial](https://www.youtube.com/watch?v=VGlDR1QiV3A)


