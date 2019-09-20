/**
 * This is a reimplementation of the npm update script.
 * https://github.com/npm/cli/blob/latest/lib/update.js
 */

// path arguments with defaults
const paths = process.argv.length > 2 ? process.argv.slice(2) : ["./"];

process.stdout.write(`\x1b[36m ●  Loading npm...\n\n\x1b[0m`);

var npm;

try {
	// try to load global-npm
	npm = require("global-npm");
	// it worked, so now we can start
	start();
} catch (error) {
	// failed to load global-npm

	// run npm install global-npm as a child process (cause we can't use global-npm to do it)

	require("child_process")
		.spawn(
			// you have to use npm.cmd on windows
			process.platform === "win32" ? "npm.cmd" : "npm",
			// npm install global-npm
			["install", "global-npm"]
		)
		// finished installing
		.on("exit", () => {
			// now we can load global-npm and start
			npm = require("global-npm");
			start();
		});
}

// start checkdeps after global-npm is loaded
function start() {
	// load npm
	npm.load({}, (err, npm) => {
		if (err) {
			console.error(err);
			return;
		}

		process.stdout.write(
			`${"\r\033[2A"}\x1b[36m ●  Checking Dependencies...\n\n\x1b[0m`
		);

		// run npm outdated for each path
		const outdated = [];
		var complete = 0;
		paths.forEach(prefix => {
			// prefix the command with the path
			npm.prefix = prefix;

			// run npm outdated
			npm.commands.outdated([], true, (err, data) => {
				if (err) {
					console.error(err);
					complete++;
					return;
				}

				// store results in custom format
				outdated.push(
					...data.map(p => ({
						dep: p[0],
						depname: p[1],
						current: p[2],
						wanted: p[3],
						latest: p[4],
						req: p[5],
						what: `${p[1]}@${p[3]}`
					}))
				);

				complete++;

				// this is the last path to run on so we can continue
				if (complete === paths.length) outdatedComplete();
			});
		});

		function outdatedComplete() {
			// dependencies we want to install
			const wanted = outdated
				// only include if wanted version is not installed
				.filter(
					dep =>
						(dep.wanted === "remote" && !dep.current) ||
						(dep.wanted !== "remote" && dep.current !== dep.wanted)
				);

			// nothing to install
			if (wanted.length === 0) {
				process.stdout.write(
					`${"\r\033[1A"}\x1b[32m 🗸  All dependencies are installed and up-to-date!\x1b[0m\n\n`
				);
				// exit
				return;
			}

			process.stdout.write(
				`${"\r\033[2A"}\x1b[36m ●  Installing/Updating ${
					wanted.length
				} package${wanted.length > 1 ? "s" : ""}...\n\x1b[0m`
			);

			// we only need this if we are installing packages
			const { URL } = require("url");

			const toInstall = {};

			wanted.forEach(e => {
				// support repo, tar, and git installation methods
				if (new URL(e.req).protocol) {
					e.what = e.req;
				}

				// get path prefix for dep
				const prefix =
					(e.dep.parent && e.dep.parent.path) || e.dep.path;

				const isTransitive = !(e.dep.requiredBy || []).some(
					p => p.isTop
				);
				const key = `${prefix}:${String(isTransitive)}`;

				// create new entry if one doesn't exist
				if (!Object.prototype.hasOwnProperty.call(toInstall, key))
					toInstall[key] = {
						where: prefix,
						opts: { saveOnlyLock: isTransitive },
						what: [e.what]
					};
				// push dependency in if it doesn't already exist
				else if (toInstall[key].what.indexOf(e.what) === -1)
					toInstall[key].what.push(e.what);
			});

			const dryrun = !!npm.config.get("dry-run");

			// run npm install on each prefix
			Promise.all(
				Object.keys(toInstall).map(prefix => {
					const deps = toInstall[prefix];

					// runs the internal installer and returns a promise
					return new npm.commands.install.Installer(
						deps.where,
						dryrun,
						deps.what,
						deps.opts
					).run();
				})
			).then(() => {
				process.stdout.write(
					`\n\x1b[32m 🗸  All dependencies are now installed and up-to-date!\x1b[0m\n\n`
				);
			});
		}
	});
}
