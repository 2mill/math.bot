require("dotenv").config();
const { Client } = require("discord.js");
const { processMessage, registerCommands } = require("./commands");
// setup bot client
const client = new Client();
// login to discord api
client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
	console.log("Bot is now Online!");
});

client.on("message", message => {
	// send message to be processed for commands
	processMessage(client, message);
});

// register commands
registerCommands();
//adding a comment for testing docker with git
