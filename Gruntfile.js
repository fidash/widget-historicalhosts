/*
 * widget-historicalhosts
 * https://github.com/fidash/widget-historicalhosts
 *
 * Copyright (c) 2016 CoNWeT
 * Licensed under the Apache-2.0 license.
 */

var ConfigParser = require('wirecloud-config-parser');
var parser = new ConfigParser('src/config.xml');

module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        metadata: parser.getData(),

        bower: {
            install: {
                options: {
                    layout: function (type, component, source) {
                        return type;
                    },
                    targetDir: './build/lib/lib'
                }
            }
        },

        jshint: {
            options: {
                jshintrc: true
            },
            all: {
                files: {
                    src: ['src/js/**/*.js']
                }
            },
            grunt: {
                options: {
                    jshintrc: '.jshintrc-node'
                },
                files: {
                    src: ['Gruntfile.js']
                }
            },
            test: {
                options: {
                    jshintrc: '.jshintrc-jasmine'
                },
                files: {
                    src: ['src/test/**/*.js', '!src/test/fixtures/']
                }
            }
        },

        jscs: {
            widget: {
                src: 'src/js/**/*.js',
                options: {
                    config: ".jscsrc"
                }
            },
            grunt: {
                src: 'Gruntfile.js',
                options: {
                    config: ".jscsrc"
                }
            }
        },

        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '*',
                    dest: 'build/src/js'
                }, {
                    expand: true,
                    cwd: 'src/lib/js',
                    src: '*',
                    dest: 'build/lib/lib/js'
                }]
            }
        },

        strip_code: {
            multiple_files: {
                src: ['build/src/js/**/*.js']
            },
            imports: {
                options: {
                    start_comment: 'import-block',
                    end_comment: 'end-import-block'
                },
                src: ['src/js/*.js']
            }
        },

        compress: {
            widget: {
                options: {
                    mode: 'zip',
                    archive: 'dist/<%= metadata.vendor %>_<%= metadata.name %>_<%= metadata.version %>.wgt'
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: [
                        'DESCRIPTION.md',
                        'css/**/*',
                        'doc/**/*',
                        'images/**/*',
                        'index.html',

                        'config.xml'
                    ]
                }, {
                    expand: true,
                    cwd: 'build/lib',
                    src: [
                        'lib/**/*'
                    ]
                }, {
                    expand: true,
                    cwd: 'build/src',
                    src: [
                        'js/**/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.',
                    src: [
                        'LICENSE'
                    ]
                }]
            }
        },

        clean: {
            build: {
                src: ['build', 'bower_components']
            },
            temp: {
                src: ['build/src']
            }
        },

        jsbeautifier: {
            files: ["Gruntfile.js"],
            options: {
                js: {
                    spaceAfterAnonFunction: true,
                    endWithNewline: false,
                    jslintHappy: true
                }
            }
        },

        jasmine: {
            test: {
                src: ['src/js/*.js', '!src/js/main.js'],
                options: {
                    specs: 'src/test/js/*Spec.js',
                    helpers: ['src/test/helpers/*.js'],
                    vendor: ['node_modules/jquery/dist/jquery.js',
                        'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
                        'node_modules/babel-polyfill/dist/polyfill.js',
                        "node_modules/mock-applicationmashup/dist/MockMP.js",
                        "bower_components/d3/d3.min.js",
                        'src/test/vendor/*.js'
                    ]
                }
            },
            coverage: {
                src: '<%= jasmine.test.src %>',
                options: {
                    helpers: '<%= jasmine.test.options.helpers %>',
                    specs: '<%= jasmine.test.options.specs %>',
                    vendor: '<%= jasmine.test.options.vendor %>',
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'build/coverage/json/coverage.json',
                        report: [{
                            type: 'html',
                            options: {
                                dir: 'build/coverage/html'
                            }
                        }, {
                            type: 'cobertura',
                            options: {
                                dir: 'build/coverage/xml'
                            }
                        }, {
                            type: 'text-summary'
                        }]
                    }
                }
            }
        },

        wirecloud: {
            options: {
                overwrite: false
            },
            publish: {
                file: 'dist/<%= metadata.vendor %>_<%= metadata.name %>_<%= metadata.version %>.wgt'
            }
        }
    });

    grunt.loadNpmTasks('grunt-wirecloud');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine'); // when test?
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('test', [
        'bower:install',
        'jshint',
        'jshint:grunt',
        'jscs',
        'jasmine:coverage'
    ]);

    grunt.registerTask('build', [
        'clean:temp',
        'copy:main',
        'strip_code',
        'compress:widget'
    ]);

    grunt.registerTask('default', [
        'jsbeautifier',
        'test',
        'build'
    ]);

    grunt.registerTask('publish', [
        'default',
        'wirecloud'
    ]);

};
