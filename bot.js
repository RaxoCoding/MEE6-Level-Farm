require('dotenv').config();
const { NlpManager } = require("node-nlp");
const Discord = require('discord.js-selfbot');
var fs = require('fs');
const client = new Discord.Client();

// Creating new Instance of NlpManager class.
const manager = new NlpManager({ languages: ["en"] });
// Loading our saved model
manager.load();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let prompt = ''

fs.readFile('./prompt.txt', 'utf8', function(err, data) {
    prompt = data;
});

let channelId = process.env.CHANNEL_ID;
let counter = 0;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


client.on("message", function(message) {
    if (message.author.bot) return;
    if (message.channel.id != channelId) return;
    counter++;
    if (counter <= process.env.MESSAGE_DELAY) return;
    counter = 0;
    (async() => {
        await sleep(3000);
        const response = await manager.process("en", message.content);
        if (response.answer == undefined) {
            console.log('couldnt get an answer! for: ' + message.content);
            return;
        } else if (Math.random() < 0.80) {
            message.channel.send(`${response.answer}`);
        } else {
            message.reply(`${response.answer}`);
        }
        console.log('Replying to:' + message.author.tag + ', with message: ' + message.content + ', response: ' + response.answer);
    })();
});

client.login(process.env.BURNER_TOKEN);