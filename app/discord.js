const { Client, Intents } = require('discord.js');
const { config, networkList, alert, request } = require('./utils.js');
const fetch = require('node-fetch');

const configFile = config.get('discord');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate',async msg => {
    // start interaction with the bot
    if (msg.content === '!start' || msg.content === '/start') {
        if (configFile.groups[msg.guildId]){
            msg.reply(`🦉\nHello **${msg.author.username}**. Welcome to my domain.\nI see you want to know about **gas prices**.⛽ You came to the right entity. That is my sole purpose.\n\nJust type \`/gas\` to summon my wisdom. 🔮`);
            return;
        }

        const buttons = { type: 1, components: ['yes', 'no'].map(e => { return {
            type: 2,
            style: 1,
            label: e[0].toUpperCase() + e.slice(1),
            custom_id: e
        }})};

        msg.reply({
            content: `🦉\nGreetings. I see we have not met each other yet. That is ok, I will guide you through the process.\nYou know, I make API requests all the time. And for that I need a special word called API key 🪄. Do you have one already?`,
            components: [buttons],
        });
    }

    // get gas from owlracle api
    if (msg.content === '!gas' || msg.content === '/gas') {
        const apiKey = configFile.groups[msg.guildId];
        if (!apiKey){
            msg.reply(`🦉\nSorry, but I am new to this server. I am sure I would love working here ❤️, but first we need to discuss some things. Say \`/start\` so we can speak about it.`);
            return;
        }

        const buttons = Object.entries(networkList).map(([id, name]) => { return {
            type: 2,
            style: 1,
            label: name,
            custom_id: id
        }});

        msg.reply({
            content: `🦉\nHello **${msg.author.username}**. Did you summon me? 🔮\nI can tell you the current **gas prices**.⛽ Just give me the network name:`,
            components: [
                { type: 1, components: buttons.slice(0,4) },
                { type: 1, components: buttons.slice(4,7) },
                { type: 1, components: buttons.slice(7) },
            ]
        });

        return;
    }

    // add bot to server
    const args = msg.content.split(' ');
    if (args[0] === '!add' || args[0] === '/add') {
        if (!args[1]){
            msg.reply(`🦉\nSorry! I cannot recognize what you are asking me. But it is simple: \`/add APIKEY\`.`);
            return;
        }
        if (configFile.groups[msg.guildId]){
            msg.reply(`🦉\nSorry! I am already working here.🛠️ If you want to replace your *API key* you should use \`/remove\` then \`/add\` again. You can contact us at https://t.me/owlracle for further help.`);
            return;
        }

        msg.reply(`🦉\nAllright. I will just check to make sure everything is working as expected...`);

        const gas = await request(`eth/gas?apikey=${args[1]}&source=bot`, {}, 'POST');

        if (gas.error) {
            msg.reply(`🦉\nWell... The request I made using the API key you provided returned an error. Check your key and try again.`);
            return;
        }

        configFile.groups[msg.guildId] = args[1];
        config.set('discord', configFile);

        msg.reply(`🦉\nIt is done! Now that we know each other better, I can take this group's requests more seriously.`);

        alert.send(`A new discord group started to use Discord Owlracle bot: ${args[1]}. Total: ${Object.keys(configFile.groups).length}`);
        return;
    }

    // remove bot from server
    if (args[0] === '!remove' || args[0] === '/remove') {
        if (!args[1]){
            msg.reply(`🦉\nSorry! I cannot recognize what you are asking me. But it is simple: \`/remove APIKEY\`.`);
            return;
        }
        if (!configFile.groups[msg.guildId] || configFile.groups[msg.guildId] != args[1]){
            msg.reply(`🦉\nSorry! I am not working for this server, or the API key you provided does not match the server. Check this information and try again, or contact us at https://t.me/owlracle for further help.`);
            return;
        }

        delete configFile.groups[msg.guildId];
        config.set('discord', configFile);

        msg.reply(`🦉\nIt is done! I am no longer working for your server. 😢 It was good while it lasted though.\nIf you change your mind, you can \`/add\` me again.`);

        alert.send(`A server stopped using Discord Owlracle bot: ${args[1]}. Total: ${Object.keys(configFile.groups).length}`);
        return;
    }
});


// listen to the button click
client.on('interactionCreate', async itr => {
	if (!itr.isButton()) return;
    
    // starting interaction buttons
    if (['yes', 'no'].includes(itr.customId)){
        await itr.deferUpdate();
        if (itr.customId == 'no'){
            await itr.editReply({
                content: `🦉\nOK. So the first thing you need to do is create one. Just follow me. It takes less than a minute ⏳.`,
                components: [{ type: 1, components: [{
                    type: 2,
                    style: 5,
                    label: 'Create API key',
                    url: 'https://owlracle.info/?action=newkey'
                }]}]
            });

        }
        if (itr.customId == 'yes'){
            await itr.editReply({
                content: `🦉\nNice! I need you to say it to me, but you should tell me in a private channel, so others cannot hear. Just send me \`/add APIKEY\`, replacing *APIKEY* with your actual API key.`,
                components: []
            });
        }
        return;
    }
    
    const ntw = networkList[itr.customId];

    // template for the response embed card
    const templateEmbed = {
        title: `${ntw} Gas Prices`,
        url: `https://owlracle.info/${itr.customId}`,
        color: `0x0099ff`,
        timestamp: new Date(),
        author: {
            name: `Owlracle`,
            icon_url: `https://owlracle.info/img/owl.png`,
            url: `https://owlracle.info`,
        },
        thumbnail: {
           url: `https://owlracle.info/img/owl.png`
        },
        footer: {
            text: `Fetched from Owlracle.info`
        }
    }
      
    await itr.deferUpdate();
    await itr.editReply({
        content: `🦉\n**${ntw}**, good choice! One moment while I perform some calculations... 🧠`,
    });

    const apiKey = configFile.groups[itr.guildId];
    const gas = await request(`${itr.customId}/gas?apikey=${apiKey}&source=bot`);

    // put information inside the card and update the reply
    const speeds = ['🛴 Slow', '🚗 Standard', '✈️ Fast', '🚀 Instant'];
    templateEmbed.fields = speeds.map((e,i) => { return { 
        inline: true,
        name: e,
        value: `\n**${gas.speeds[i].gasPrice.toFixed(2)}** GWei\n$ **${gas.speeds[i].estimatedFee.toFixed(4)}**`,
    }});

    const blankComponenet = { name: '\u200b', value: '\u200b', inline: true };
    templateEmbed.fields = [templateEmbed.fields[0], blankComponenet, ...templateEmbed.fields.slice(1,3), blankComponenet, templateEmbed.fields.slice(-1)];
    
    await itr.editReply({ 
        content: `🦉\nI think you should pay no more than this for submitting transactions on the **${ntw}** network:`,
        embeds: [templateEmbed],
        components: [],
    });
});


alert.send('Discord bot started');

// this need to be the last line
client.login(configFile.token);
