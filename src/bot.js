require("dotenv").config();
const { Client } = require("discord.js");
const { processMessage, registerCommands } = require("./commands");
// setup bot client
const client = new Client();
// login to discord api
client.login("NjQzNTg3MjA3NzY0MTE1NDc1.XcnpUg.UU3DUdfQf0_k771B5Scia_Q4GcE");

client.on("ready", () => {
	console.log("Bot is now Online!");
});

client.on("message", message => {
	// send message to be processed for commands
	processMessage(client, message);
});

// register commands
registerCommands();
