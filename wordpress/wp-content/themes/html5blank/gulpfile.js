/* jshint node: true */
/* global $: true */
"use strict";

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
var replace = require('gulp-replace');

var gulp = require( "gulp" ),
	/** @type {Object} Loader of Gulp plugins from `package.json` */
	$ = require( "gulp-load-plugins" )(),
	/** @type {Array} JS source files to concatenate and uglify */
	uglifySrc = [
		/** Modernizr */
		"src/js/lib/modernizr.js",
		/** Conditionizr */
		"src/js/lib/conditionizr-4.3.0.min.js",
		/** jQuery */
		"node_modules/jquery/dist/jquery.js",
		/** Page scripts */
		"src/js/dist/scripts.js"
	],
	/** @type {Object of Array} CSS source files to concatenate and minify */
	cssminSrc = {
		development: [
			/** The banner of `style.css` */
			"src/css/banner.css",
			/** Theme style */
			//"src/css/style.css"
		],
		production: [
			/** The banner of `style.css` */
			"src/css/banner.css",
			/** Normalize */
			"node_modules/normalize.css/normalize.css",
			/** Theme style */
			"src/css/style.css"
		]
	},
	/** @type {String} Used inside task for set the mode to 'development' or 'production' */
	env = (function() {
		/** @type {String} Default value of env */
		var env = "development";

		/** Test if there was a different value from CLI to env
			Example: gulp styles --env=production
			When ES6 will be default. `find` will replace `some`  */
		process.argv.some(function( key ) {
			var matches = key.match( /^\-{2}env\=([A-Za-z]+)$/ );

			if ( matches && matches.length === 2 ) {
				env = matches[1];
				return true;
			}
		});

		return env;
	} ());

/** Clean */
gulp.task( "clean", require( "del" ).bind( null, [ ".tmp", "dist" ] ) );

/** Copy */
gulp.task( "copy", function() {
	return gulp.src([
			"src/*.{php,png,css}",
			"src/modules/*.php",
			"src/template-parts/**/*.php",
			"src/PHPMailer/*.php",
			"src/includes/*.php",
			"src/img/**/*.{jpg,png,svg,gif,webp,ico}",
			"src/fonts/*.{woff,woff2,ttf,otf,eot,svg}",
			"src/languages/*.{po,mo,pot}"
		], {
			base: "src"
		})
		.pipe( gulp.dest( "dist" ) );
});

/** CSS Preprocessors */
gulp.task( "sass", function () {
	return gulp.src( "src/css/sass/style.scss" )
		.pipe( $.sourcemaps.init() )
		.pipe( $.sass() )
		.pipe( $.autoprefixer( "last 2 version" ) )
		.pipe( $.sourcemaps.write( "." ) )
		.on( "error", function( e ) {
			console.error( e );
		})
		.pipe( gulp.dest( "src/css" ) );
});

// /** Reassert Image URLs in CSS */
// gulp.task( "imgurls", function() {
// 	return gulp.src("src/css/style.css")
// 		.pipe(replace('../img', './img'))
// 		.pipe( gulp.dest( "src/css/prod/"));
// })

/** STYLES */
gulp.task( "styles", [ "sass" ], function() {
	console.log( "`styles` task run in `" + env + "` environment" );

	var stream = gulp.src( cssminSrc[ env ] )
		.pipe( $.concat( "style.css" ));

	if ( env === "production" ) {
		stream = stream.pipe( $.csso() )
			.pipe(replace('../img', './img'))
			.pipe(replace('../font', './font'));
	}

	return stream.on( "error", function( e ) {
			console.error( e );
		})
		.pipe( gulp.dest( "src" ) );
});

/** JSHint */
gulp.task( "jshint", function () {
	/** Test all `js` files exclude those in the `lib` folder */
	return gulp.src( ["src/js/*.js", "!src/js/lib/*.js", "!src/js/dist/*.js" ])
		.pipe( $.jshint() )
		.pipe( $.jshint.reporter( "jshint-stylish" ) )
		.pipe( $.jshint.reporter( "fail" ) );
});

/** Webpack */
gulp.task('webpack', () => {
	var options = {
		output: {
			filename: 'scripts.js',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/, 
					loader: "babel-loader",
					query: {
						presets: 'env'
					}
				}
			]
		}
	}

	if(env !== "production") {
		options.devtool = 'source-map'
	}
	gulp.src('./src/js/scripts.js')
		.pipe(webpackStream(options))
		.pipe(gulp.dest('./src/js/dist'));
});

/** Browser Sync */
gulp.task("browser-sync", function() {

    var files = [
                    "**/*.css",
                   // "**/*.php",
                    "**/*.js",
                    "**/*.{png,jpg,gif}"
                ];

    require('browser-sync').init(files, {
        proxy: "localhost:8000",
    });

});

/** Templates */
gulp.task( "template", function() {
	console.log( "`template` task run in `" + env + "` environment" );

    var is_debug = ( env === "production" ? "false" : "true" );

    return gulp.src( "src/dev-templates/is-debug.php" )
        .pipe( $.template({ is_debug: is_debug }) )
        .pipe( gulp.dest( "src/modules" ) );
});

/** Modernizr **/
gulp.task( "modernizr", function() {
	var modernizr = require( "modernizr" ),
		config = require( "./node_modules/modernizr/lib/config-all"),
		fs = require( "fs" );

		modernizr.build(config, function(code) {
			fs.writeFile("./src/js/lib/modernizr.js", code);
		});
});

/** Uglify */
gulp.task( "uglify", function() {
	return gulp.src( uglifySrc )
		.pipe( $.concat( "scripts.min.js" ) )
		.pipe( $.uglify() )
		.pipe( gulp.dest( "dist/js" ) );
});

/** jQuery **/
gulp.task("jquery", function() {
	return gulp.src("node_modules/jquery/dist/jquery.js")
		.pipe( $.sourcemaps.init() )
		.pipe( $.sourcemaps.write( "." ) )
		.pipe( gulp.dest( "src/js/lib" ) );
});

gulp.task("normalize", function() {
	return gulp.src("node_modules/normalize.css/normalize.css")
		.pipe( gulp.dest( "src/css/lib" ) );
});

/** `env` to 'production' */
gulp.task( "envProduction", function() {
	env = "production";
});

/** Livereload */
gulp.task( "watch", [ "template", "styles", "jshint", "modernizr", "jquery", "normalize", "browser-sync" ], function() {
	var server = $.livereload;
	server.listen();

	/** Watch for livereoad */
	gulp.watch([
		"src/js/**/*.js",
		"src/*.php",
		"src/*.css"
	]).on( "change", function( file ) {
		console.log( file.path );
		server.changed( file.path );
	});

	/** Watch for autoprefix */
	gulp.watch( [
		"src/css/*.css",
		"src/css/sass/**/*.scss"
	], [ "styles" ] );

	/** Watch for JSHint */
	gulp.watch( "src/js/{!(lib)/*.js,!(dist)/*.js,*.js}", ["jshint", "webpack"] );
});

/** Build */
gulp.task( "build", [
	"envProduction",
	"clean",
	"template",
	"styles",
	"modernizr",
	"jshint",
	"webpack",
	"copy",
	"uglify"
], function () {
	console.log("Build is finished");
});

/** Gulp default task */
gulp.task( "default", ["watch"] );