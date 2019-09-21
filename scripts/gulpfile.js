const gulp = require("gulp");
const eslint = require("gulp-eslint");
const rimraf = require("gulp-rimraf");
const child_process = require("child_process");
// const readline = require("readline");
const chalk = require("chalk");
const path = require("path");
// const fs = require("fs");
const fancy = require("./fancy");

var lintfailed = false;

const envpath = path.resolve(__dirname, "../.env");
const srcpath = path.resolve(__dirname, "../src");
const buildpath = path.resolve(__dirname, "../build");

/**
 * ESLint Gulp task
 */
const lint = () => {
	lintfailed = false;

	let stream = gulp
		.src(`${srcpath}/**/*.js`)
		// eslint
		.pipe(eslint())
		// ESLint report header
		.pipe(
			eslint.results(results => {
				if (results.errorCount > 0) {
					fancy.error.bg("    ESLint Report    ");
					lintfailed = true;
				} else if (results.warningCount > 0)
					fancy.warn.bg("    ESLint Report    ");
				else fancy.complete("ESLint Report: No Issues Found");
			})
		)
		// format eslint report
		.pipe(eslint.format("stylish", process.stdout));

	if (watching) {
		stream = stream
			// ESLint report footer
			.pipe(
				eslint.results(results => {
					if (lintfailed) {
						fancy.space();
						fancy.error("ESLint has cancelled the build");
						fancy.info("waiting for file changes to restart...");
					} else if (results.warningCount > 0) fancy.space();
				})
			);
	} else {
		stream = stream.pipe(eslint.failAfterError());
	}

	return stream;
};

/**
 * Compile Gulp task
 */
const compile = () =>
	gulp
		.src(`${srcpath}/**/*.js`)
		// babel compile
		// .pipe(babel())
		// output to build dir
		.pipe(gulp.dest(buildpath))
		// console log when finished
		.on("end", () => {
			if (!lintfailed) fancy.complete("Build Complete");
		});

/**
 * Clean build folder task
 */
const clean = () =>
	gulp.src(buildpath, { read: false, allowEmpty: true }).pipe(rimraf());
/**
 * GraphQL schema file task
 */
// const schema = () => {
// 	schemafailed = false;

// 	return (
// 		gulp
// 			.src("build/graphql/index.js")
// 			// graphql
// 			.pipe(
// 				graphql({
// 					json: true,
// 					graphql: false
// 				})
// 			)
// 			.on("error", error => {
// 				fancy.space();
// 				fancy.error("Failed to create GraphQL schema.json");
// 				fancy.space();
// 				console.log(`\t${error.fileName.replace("\\build\\", "\\src\\")}`);
// 				console.log(`\t${chalk.red(error.stack.split("\n")[0])}`);
// 				fancy.space();
// 				fancy.info("waiting for file changes to restart...");
// 				schemafailed = true;
// 			})
// 			// output to build dir
// 			.pipe(gulp.dest("build/graphql"))
// 			// console log when finished
// 			.on("end", () => {
// 				if (!schemafailed) fancy.complete("Created GraphQL Schema File");
// 			})
// 	);
// };

/**
 * Build Gulp task
 *
 * Runs Lint and Compile in parallel
 */
const build = gulp.series(
	cb => {
		fancy.space();
		fancy.info("Building Bot...");
		fancy.space();
		cb();
	},
	lint,
	clean,
	compile
	// schema
);

/**
 * Spawned Server Process
 */
var node;

const killserver = cb => {
	if (node) {
		// kill running node and callback when it exits
		node.on("close", () => {
			cb();
		});
		node.kill("SIGINT");
	} else {
		// no node to kill
		cb();
	}
};

/**
 * Gulp task that spawns the server process or restarts if already running
 */
const spawnserver = gulp.series(killserver, cb => {
	if (lintfailed) {
		cb();
		return;
	}

	process.stdin.pause();

	// start server process
	node = child_process.fork(".", [], {
		stdio: [process.stdin, "inherit", "pipe", "ipc"],
		env: { NODE_ENV: "development", DOTENV_CONFIG_PATH: envpath },
		execArgv: ["--inspect"]
	});

	// pipe input to server process
	// process.stdin.pipe(node.stdin);

	// color stderr red
	node.stderr.on("data", data => {
		if (/Debugger listening on ws/g.test(data.toString()))
			console.log(chalk.gray(data));
		else console.log(chalk.red(data));
	});

	// handle process close event
	node.on("close", code => {
		if (!restarting) fancy.space(2);

		if (code) {
			if (code === 0)
				fancy.event(
					`bot process ${
						restarting ? "killed" : "exited"
					} with code ${code}`
				);
			else
				fancy.error(
					`bot process ${
						restarting ? "killed" : "exited"
					} with code ${code}`
				);
		} else fancy.event(`bot process ${restarting ? "killed" : "exited"}`);

		if (!restarting) {
			fancy.info("waiting for file changes to restart...");
			if (!code) fancy.info("do ctrl+c again to exit");
		}

		//? this seems to work
		process.stdin.resume();
		node = null;
	});

	// task callback
	cb();

	fancy.space();
	fancy.info("Starting Bot Process...");
	fancy.space();
});

var restarting = false;

const restart = gulp.series(
	cb => {
		fancy.space();
		fancy.info("Restarting Bot process due to file change...");
		restarting = true;
		cb();
	},
	killserver,
	cb => {
		console.log(
			chalk.gray(
				"------------------------------------------------------------"
			)
		);
		cb();
	},
	build,
	spawnserver,
	cb => {
		restarting = false;
		cb();
	}
);

// var watchcallback = () => {};
var watching = false;

const watch = () => {
	// watchcallback = cb;

	// keypress listener

	// readline.emitKeypressEvents(process.stdin);
	// process.stdin.setRawMode(true);

	// process.stdin.on("keypress", (str, key) => {
	// 	// ctrl + C exit
	// 	if (key.sequence === "\u0003") {
	// 		process.stdin.pause();

	// 		// async close watch task
	// 		watchcallback();

	// 		// kill process
	// 		// eslint-disable-next-line no-process-exit
	// 		process.exit("SIGINT");
	// 	}

	// 	// console.log('gulp keypress ' + key.name);
	// });

	return gulp.watch(`${srcpath}/**/*.*`, restart);
};

// build and spawn then start watching
exports.watch = gulp.series(
	cb => {
		watching = true;
		cb();
	},
	build,
	spawnserver,
	watch
);

exports.test = gulp.series(lint);

// run the build task by default
exports.default = exports.build = build;
