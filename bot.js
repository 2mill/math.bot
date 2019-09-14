var Discord = require('discord.js');
var client = new Discord.Client();
var conf = require('./conf.json');
var prefix = conf.prefix;
var wolfram = require('wolfram-alpha').createClient(conf.wf, 0);

client.login(conf.token);

client.on("ready", () => {
	console.log("Client is running");
})
client.on("message", (message) => {
	if (message.content.startsWith(prefix + "wa")) {
		message.channel.send("Wolfram query received");
		let msg = message.content;
		msg = msg.slice(3);
		result = yield wolfram.query(msg);
		channel.message.send(result);
	}
	if (message.content.startsWith(prefix + "base")) {
		let temp = message.content;
		temp = temp.slice(6);
		let non = true;
		let pre = temp.slice(0,2);
		let detection = null;
		if (pre === "0x") {
			temp = parseInt(temp.slice(2), 16);
			detection = "Hex";
			if (!isNaN(temp)) {
				message.channel.send("```Dec " + temp + "\nBin " + temp.toString(2) + "\nOct " + temp.toString(8)+ "```");
				non = false;
			}
		} else if (pre === "0b") {
			temp = parseInt(temp.slice(2), 2);	
			detection = "binary";
			if (!isNaN(temp)) {
				message.channel.send("```Dec " + temp + "\nOctal " + temp.toString(8) + "\nHex " + temp.toString(16) + "```");
				non = false;
			}

			
		} else if(pre === "0o") {
			temp = parseInt(temp.slice(2),8);
			detection = "Octal"
			if (!isNaN(temp)) {
				message.channel.send("```Dec " + temp + "\nBin " + temp.toString(2) + "\nHex " + temp.toString(16) + "```");
				non = false;
			}
		} else {
			temp = parseInt(temp);
			detection = "Decimal";
			if (!isNaN(temp)) {
				message.channel.send("```Bin " + temp.toString(2)+ "\nOctal " + temp.toString(8) + "\nHex " + temp.toString(16)+ "```");
				non = false;
			}
		}
		//detection part
		if (non) message.channel.send("Not a number");
		else message.channel.send("Detected " + detection);
		
	}


});
