const fs = require("fs");
const path = require("path");
const fancy = require("./fancy");

const requirements = {
	DISCORD_TOKEN: "",
	WOLFRAM_APP_ID: ""
};

const envpath = path.resolve(__dirname, "../.env");

// create .env file if it doesn't exist
if (process.env.NODE_ENV !== "production" && !fs.existsSync(envpath)) {
	const header = `#######################################################
###     THIS FILE CONTAINS SENSITIVE INFORMATION    ###
### DO NOT SHARE WITH ANYONE OUTSIDE OF THE PROJECT ###
#######################################################

### Project Environment Variables
###
### NOTE: add new entries to the requirements in lookenv.config.js
`;

	fancy.space();
	fancy.space();
	fancy.info(".env file not found!  Creating a new .env file!");
	fancy.space();
	fancy.warn("GET THE KEYS FROM SOMEONE WHO ALREADY HAS THEM !!!");
	fancy.warn("THE BOT WILL NOT FUNCTION WITHOUT THEM !!!");
	fancy.space();

	fs.writeFileSync(
		envpath,
		Object.keys(requirements).reduce(
			(file, e) => (file += e + "=\n"),
			header + "\n"
		)
	);

	// eslint-disable-next-line no-process-exit
	process.exit(1);
}

exports.default = requirements;
