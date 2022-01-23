require('dotenv').config();
const { NlpManager } = require("node-nlp");
const Discord = require('discord.js-selfbot');
var fs = require('fs');

// Creating new Instance of NlpManager class.
const manager = new NlpManager({ languages: ["en"] });
// Loading our saved model
manager.load();

require("./extendedMessage");

const client = new Discord.Client({
    allowedMentions: {
        // set repliedUser value to `false` to turn off the mention by default
        repliedUser: true
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    let minutesToAdd = process.env.MESSAGE_DELAY;
    let currentDate = new Date();
    let countDownDate = new Date(currentDate.getTime() + (minutesToAdd * 60000)).getTime();
    let countDownDistance;
    let currentlyRunning = false;

    var x = setInterval(function() {
        // Get today's date and time
        var now = new Date().getTime();
        // Find the distance between now and the count down date
        countDownDistance = countDownDate - now;
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write("Countdown to Next Message: " + Math.max(0, Math.ceil(countDownDistance / 1000)) + ' seconds');
    }, 1000);

    client.on("message", function(message) {
        if (message.author.bot) return;
        if (message.author.id == client.user.id) return;
        if (message.channel.id != channelId) return;
        if (countDownDistance > 0 || currentlyRunning) return;
        currentlyRunning = true;

        (async() => {
            await sleep(3000);
            const response = await manager.process("en", message.content);

            if (response.answer == undefined || response.answer == lastResponse) {
                console.log('\n couldnt get an answer! for: ' + message.content);
                currentlyRunning = false;
                return;
            } else if (isEmoji(response.answer)) {
                message.react(response.answer);
            } else {
                message.inlineReply(`${response.answer}`);
            }
            lastResponse = response.answer.toLowerCase().trim();
            console.log('\n Replying to:' + message.author.tag + ', with message: ' + message.content + ', response: ' + response.answer);
            currentDate = new Date();
            countDownDate = new Date(currentDate.getTime() + (minutesToAdd * 60000)).getTime();
            setTimeout(() => { currentlyRunning = false; }, 1000);
        })();
    });
});

let prompt = ''

fs.readFile('./prompt.txt', 'utf8', function(err, data) {
    prompt = data;
});

let channelId = process.env.CHANNEL_ID;
let counter = 0;
let lastResponse = '';

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

client.login(process.env.BURNER_TOKEN);

// async function testAi(prompt, model) {
//     await prompt.get(['question'], async function(err, result) {
//         const passage = "The following is a conversation with an AI named Virgile. Virgile thinks he's human. Virgile is helpful and very friendly. He is currently trying to grind the whitelist of C-01. Grinding this whitelist will make him able to mint a NFT. A NFT is a cryptocurrency visual token. The minting date is 2022-01-13. He is not whitelisted yet.";
//         const question = result.question;

//         // Finding the answers
//         const answers = await model.findAnswers(question, passage);
//         console.log(answers);
//         testAi(prompt, model);
//     });
// }


// async function startAi() {
//     const qna = require('@tensorflow-models/qna');
//     const model = await qna.load();
//     var prompt = require('prompt');
//     prompt.start();

//     testAi(prompt, model);

// }

// startAi();