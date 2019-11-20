require("dotenv").config();
const { RichEmbed } = require("discord.js");
var expr = require("expression-eval");

// todo make this configurable per server
/**
 * chat command prefix
 */
const prefix = "$";

// initialize the wolfram api client
const WolframAlphaAPI = require("wolfram-alpha-api");
//const waApi = WolframAlphaAPI(process.env.WOLFRAM_APP_ID);
const waApi = WolframAlphaAPI(process.env.WOLFRAM_APP_ID);

/**
 * Registers all chat commands
 */
exports.registerCommands = () => {
	// register help command
	_registerCommand(["h", "help"], "lists commands", (client, message) =>
		message.channel.send(
			new RichEmbed({
				title: "Math.bot Commands",
				fields: Object.values(_registeredCommands).map(command => ({
					name: command.aliases.join(" "),
					value: command.description
				}))
			})
		)
	);

	_registerCommand( 
		["greatJSpog"],
		"Jacob's meme",
		(client, message) => {
			client.channel.send(
				"https://i.imgur.com/0xQZ8NH.png"
			)
		}

	)

	// register wolfram alpha command
	_registerCommand(
		["wa", "wolfram"],
		"wolfram alpha",
		(client, message, params) =>
			new Promise((resolve, reject) => {
				waApi
					.getFull(params.join(" "))
					.then(result => {
						const { success, pods } = result;

						// wolfram error
						if (!success) {
							message.channel.send(
								"wolfram: " + result.error.msg
							);

							resolve();
							return;
						}

						// dumps the wolfram json response
						// console.log(JSON.stringify(result, null, 2));

						//
						// we have to split and format the wolfram json response into multiple RichEmbed messages due to the following limitations:
						// 		- one image per message
						// 		- embed fields have a character limit of 1024
						//

						const embedBuffer = [new RichEmbed()];
						// current embed we are writing to
						let curEmbed = embedBuffer[0];

						let fieldBuffer = "";
						let podTitle = "---";

						for (let i = 0; i < pods.length; i++) {
							const pod = pods[i];
							podTitle = pod.title;

							for (let j = 0; j < pod.subpods.length; j++) {
								const subpod = pod.subpods[j];

								// todo handle fields exceeding 1024 characters

								// if image
								if (!subpod.plaintext && subpod.img) {
									// if current embed already has fields
									if (curEmbed.fields.length > 0)
										// push current field buffer
										curEmbed.addField(
											"\u200B",
											`**${pod.title}**`
										);
									else curEmbed.setTitle(pod.title);

									fieldBuffer = "";

									// set image for embed
									curEmbed.setImage(subpod.img.src);

									// make next embed if not the last pod or subpod
									if (
										i !== pods.length - 1 ||
										j !== pod.subpods.length - 1
									) {
										curEmbed = new RichEmbed();
										embedBuffer.push(curEmbed);
									}
								} else fieldBuffer += subpod.plaintext + "\n";
							}

							// push current field buffer if not empty
							if (fieldBuffer.length > 0) {
								curEmbed.addField(
									pod.title,
									fieldBuffer || "\u200B"
								);
								fieldBuffer = "";
							}
						}

						// push current field buffer if not empty
						if (fieldBuffer.length > 0)
							// push current field buffer
							curEmbed.addField(
								podTitle,
								fieldBuffer || "\u200B"
							);

						// send the embed messages to the channel
						embedBuffer.forEach(e =>
							message.channel.send(e).catch(console.error)
						);

						// command is complete
						resolve();
					})
					.catch(reason => reject(reason));
			})
	);

	// register base conversion command

	const prefixToBase = {
		"0x": { name: "Hexadecimal", radix: 16 },
		"0b": { name: "Binary", radix: 2 },
		"0o": { name: "Octal", radix: 8 }
	};
	_registerCommand(
		["calc"],
		"Simple calc",
		(client, message, params) =>
			new Promise((resolve, reject) => {
				//const output = expr.eval(ast);
				let temp = "";
				for (let i = 0; i < params.length; i++) {
					temp += params[i];
				}
				var value = 0;
				var success = true;
				try {
					const ast = expr.parse(temp);
					value = expr.eval(ast);
				} catch (err) {
					value =
						"Math.bot was unable to figure this out\n and is sending the job to WolframAlpha";
					success = false;
				}
				console.log(success);
				if (success)
					message.channel
						.send(
							new RichEmbed({
								title: "Simple Calculator",
								description: `Simple Calc : ${value}`
							})
						)
						.then(resolve)
						.catch(reject);
				else {
					message.channel
						.send("Math.bot was unable to handle this")
						.then(resolve)
						.catch(reject);
					message.channel
						.send(">wa " + temp)
						.then(resolve)
						.catch(reject);
				}
			})
	);
	_registerCommand(
		["base"],
		"base conversion",
		(client, message, params) =>
			new Promise((resolve, reject) => {
				if (params.length !== 1) return reject("invalid parameters");

				// grab the number prefix
				const prefix = params[0].slice(0, 2);
				const base = prefixToBase[prefix] || {
					name: "Decimal",
					radix: 10
				};

				// convert to decimal int
				const number = parseInt(params[0], base.radix);

				// send the conversions
				message.channel
					.send(
						new RichEmbed({
							title: "base conversion",
							description: `input: ${params[0]} -> ${
								base.name
							} (base ${base.radix})
${"```"}
	 Binary: ${number.toString(2)}
	  Octal: ${number.toString(8)}
	Decimal: ${number.toString(10)}
Hexidecimal: ${number.toString(16)}
${"```"}
			`
						})
					)
					.then(resolve)
					.catch(reject);
			})
	);

	console.log(
		`Registered ${Object.keys(_registeredCommands).length} commands`
	);
};

/**
 * only _registerCommand() should modify this
 *
 * @type {Object.<string, CommandEntry>}
 */
const _registeredCommands = {};
/**
 * only _registerCommand() should modify this
 *
 * this is for matching aliases to command entries
 *
 * @type {Object.<string, CommandEntry>}
 */
const _registeredCommandsAliases = {};

/**
 * command entry structure for registry
 * @typedef CommandEntry
 * @property {string[]} aliases command aliases used to call the command ["h", "help"]
 * @property {string} description short description used in the command list
 * @property {CommandHandler} handler command handler for when the command is called by a user
 */

/**
 * command handler for implementing command functionality
 * @callback CommandHandler
 * @param {Client} client discord client instance
 * @param {Message} message discord message
 * @param {string[]} params command parameters
 * @returns {Promise<any>} promise that resolves when the command is completed
 */

/**
 * Registers a new CommandEntry
 *
 * @param {string[]} aliases command aliases used to call the command ["h", "help"]
 * @param {string} description short description used in the command list
 * @param {CommandHandler} handler command handler for when the command is called by a user
 */
function _registerCommand(aliases, description, handler) {
	// create command entry object
	const command = {
		aliases,
		description,
		handler
	};

	// register the aliases
	for (let i = 0; i < aliases.length; i++) {
		// if command alias is already being used
		if (
			Object.prototype.hasOwnProperty.call(
				_registeredCommands,
				aliases[i]
			)
		) {
			const error = new Error(
				`command alias "${
					aliases[i]
				}" is already being used by the ${_registeredCommandsAliases[
					aliases[i]
				].aliases.reduce((max, alias) =>
					alias.length > max.length ? alias : max
				)} command`
			);

			// make the error message obnoxious
			console.error(error.message);
			console.error(error.message);
			console.error(error.message);

			throw error;
		}

		_registeredCommandsAliases[aliases[i]] = command;
	}

	// register the command
	_registeredCommands[aliases[0]] = command;
}

/**
 * Process discord chat message for commands.
 *
 * @param {Client} client discord client instance
 * @param {Message} message discord message
 */
exports.processMessage = (client, message) => {
	const { content } = message;

	// only continue if the message starts with prefix
	if (!content.startsWith(prefix)) return;

	// split up the parameters by spaces
	const split = content.slice(prefix.length).split(" ");

	// if command is registered
	if (
		Object.prototype.hasOwnProperty.call(
			_registeredCommandsAliases,
			split[0]
		)
	) {
		// call the command
		_callCommand(split[0], client, message, split.slice(1));
	} else {
		// command not found
		message.channel.send("error: unknown command").catch(console.error);

		// send the command list instead
		_callCommand("help", client, message, []);
	}
};

// emotes to use in error messages
const errorEmotes = [
	"<:weirdchamp:616719575626678277>",
	"<:pepehands:616717788161245257>",
	"<:Reee:616717788160983050>",
	"<:pepega:616717789150969856>",
	"<:facepalm:438537401409994752>"
];

/**
 * Calls a registered command and handles the errors for you.
 *
 * @param {string} command command alias
 * @param {Client} client discord client instance
 * @param {Message} message discord message
 * @param {string[]} params command parameters extracted from the message content
 */
function _callCommand(command, client, message, params) {
	// start typing indicator if the command is slow
	// this should prevent the typing indicator from showing for too long
	const typingTimeout = setTimeout(() => {
		message.channel.startTyping();
	}, 800);

	// get command entry
	_registeredCommandsAliases[command]
		// call handler for the command
		.handler(client, message, params)
		.then(() => {
			// stop typing indicator
			clearTimeout(typingTimeout);
			message.channel.stopTyping();
		})
		// handle errors
		.catch(error => {
			// stop typing indicator
			clearTimeout(typingTimeout);
			message.channel.stopTyping();

			// internal errors have a stack trace
			if (error.stack) {
				// print the internal error to console
				console.error(error);

				// and send the trace to the channel
				message.channel
					.send(
						new RichEmbed({
							fields: [
								{
									// picks a random emote to add to the message
									name: `⚠ Internal Bot Error ${
										errorEmotes[
											Math.floor(
												Math.random() *
													errorEmotes.length
											)
										]
									}`,
									value: "```" + error.stack + "```"
								}
							]
						})
					)
					.catch(console.error);
			} else {
				// This means that the command promise was rejected but not from
				// an internal error.  So we need to send the error message to
				// the channel

				message.channel.send(error).catch(console.error);
			}
		});
}
