require("dotenv").config();
const { Client, RichEmbed } = require("discord.js");
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

		// start typing indicator
		message.channel.startTyping();

		waApi
			.getFull(msg)
			.then(result => {
				// stop typing indicator
				message.channel.stopTyping();

				const { pods } = result;

				// console.log(JSON.stringify(result, null, 2));

				const embedBuffer = [new RichEmbed()];
				let curEmbed = embedBuffer[0];

				let fieldBuffer = "";
				let podTitle = "---";

				for (let i = 0; i < pods.length; i++) {
					const pod = pods[i];
					podTitle = pod.title;

					for (let j = 0; j < pod.subpods.length; j++) {
						const subpod = pod.subpods[j];

						// if image
						if (!subpod.plaintext && subpod.img) {
							// if current embed already has fields
							if (curEmbed.fields.length > 0)
								// push current field buffer
								curEmbed.addField("\u200B", `**${pod.title}**`);
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

					if (fieldBuffer.length > 0) {
						// push current field buffer
						curEmbed.addField(pod.title, fieldBuffer || "\u200B");
						fieldBuffer = "";
					}
				}

				if (fieldBuffer.length > 0)
					// push current field buffer
					curEmbed.addField(podTitle, fieldBuffer || "\u200B");

				embedBuffer.forEach(e =>
					message.channel.send(e).catch(console.error)
				);
			})
			.catch(error => {
				// stop typing indicator
				message.channel.stopTyping();

				console.error(error);
				message.channel.send(error.message).catch(console.error);
			});
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
