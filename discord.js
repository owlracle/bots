const { Client, Intents } = require('discord.js');
const fs = require('fs');
const configFile = require('./config.json').discord;
// const fetch = require('node-fetch');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', msg => {
    if (msg.content === '!ping') {
        msg.reply('Pong!');
    }
});


// this need to be the last line
client.login(configFile.CLIENT_TOKEN);