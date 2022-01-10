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

function isEmoji(str) {
    var ranges = [
        '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])' // U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
        return true;
    } else {
        return false;
    }
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
        } else if (isEmoji(response.answer)) {
            message.react(response.answer);
        } else if ((Math.random() < 0.80)) {
            message.channel.send(`${response.answer}`);
        } else {
            message.reply(`${response.answer}`);
        }
        console.log('Replying to:' + message.author.tag + ', with message: ' + message.content + ', response: ' + response.answer);
    })();
});

client.login(process.env.BURNER_TOKEN);