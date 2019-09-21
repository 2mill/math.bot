require("dotenv").config();
const { Client } = require("discord.js");
const client = new Client();
const prefix = ">";

const WolframAlphaAPI = require("wolfram-alpha-api");
const waApi = WolframAlphaAPI(process.env.WOLFRAM_APP_ID);

client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
	console.log("Client is running");
});

client.on("message", message => {
	if (message.content.startsWith(prefix + "wa")) {
		let msg = message.content.slice(3);
		message.channel.send(waApi.getSimple(msg).then());

		//	waApi.getFull(msg).then(queryresult => {
		//		const pods = queryresult.pods;
		//		const output = pods.map(pod => {
		//			const subpodContent = pod.subpods.map(subpod => {
		//				message.channel.send(subpod.img.src);
		//			})
		//
		//		})

		//
		//	}).catch(console.error);
	}
	if (message.content.startsWith(prefix + "base")) {
		let temp = message.content;
		temp = temp.slice(6);
		let non = true;
		let pre = temp.slice(0, 2);
		let detection = null;
		if (pre === "0x") {
			temp = parseInt(temp.slice(2), 16);
			detection = "Hex";
			if (!isNaN(temp)) {
				message.channel.send(
					"```Dec " +
						temp +
						"\nBin " +
						temp.toString(2) +
						"\nOct " +
						temp.toString(8) +
						"```"
				);
				non = false;
			}
		} else if (pre === "0b") {
			temp = parseInt(temp.slice(2), 2);
			detection = "binary";
			if (!isNaN(temp)) {
				message.channel.send(
					"```Dec " +
						temp +
						"\nOctal " +
						temp.toString(8) +
						"\nHex " +
						temp.toString(16) +
						"```"
				);
				non = false;
			}
		} else if (pre === "0o") {
			temp = parseInt(temp.slice(2), 8);
			detection = "Octal";
			if (!isNaN(temp)) {
				message.channel.send(
					"```Dec " +
						temp +
						"\nBin " +
						temp.toString(2) +
						"\nHex " +
						temp.toString(16) +
						"```"
				);
				non = false;
			}
		} else {
			temp = parseInt(temp);
			detection = "Decimal";
			if (!isNaN(temp)) {
				message.channel.send(
					"```Bin " +
						temp.toString(2) +
						"\nOctal " +
						temp.toString(8) +
						"\nHex " +
						temp.toString(16) +
						"```"
				);
				non = false;
			}
		}
		//detection part
		if (non) message.channel.send("Not a number");
		else message.channel.send("Detected " + detection);
	}
});
