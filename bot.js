const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const fetch = require('node-fetch');
const sharp = require('sharp');


const configFile = JSON.parse(fs.readFileSync(`${__dirname}/config.json`));


if (configFile.token === undefined) {
    throw new TypeError('BOT_TOKEN must be provided!');
}

const networkList = {
    eth: 'Ethereum',
    bsc: 'BSC',
    poly: 'Polygon',
    ftm: 'Fantom',
    avax: 'Avalanche',
    movr: 'Moonriver',
    cro: 'Cronos',
};

const buttonArray = Object.entries(networkList).map(([k,v]) => Markup.button.callback(v, k));
const buttons = Markup.inlineKeyboard([buttonArray.slice(0,4), buttonArray.slice(-3)]);

const bot = new Telegraf(configFile.token);

bot.start((ctx) => {
    ctx.replyWithHTML(`🦉\nHello <b>${ctx.message.from.first_name}</b>. Welcome to my domain.\nI see you want to know about <b>gas prices</b>.⛽ You came to the right entity. That is my sole purpose.\n\nJust type /gas to summon my wisdom. 🔮`);
});

bot.help((ctx) => {
    ctx.replyWithHTML(`🦉\nDo not worry, I am here to help.🆘\nIf there is one thing you should know about me, is that I am very good at predicting <b>gas prices</b>.⛽ Some say I am the best around!🥇\nJust type /gas and try me.`);
});

bot.command('gas', (ctx) => {
    // const ntw = ctx.update.message.text.split(' ')[1];
    ctx.replyWithHTML(`🦉\nHello <b>${ctx.message.from.first_name}</b>. Did you summon me? 🔮\nI can tell you the current <b>gas prices</b>.⛽ Just give me the network name:`, buttons);
    
    Object.entries(networkList).forEach(async ([k,v]) => bot.action(k, async ctx => {
        ctx.deleteMessage();
        ctx.replyWithHTML(`🦉\n<b>${v}</b>, good choice! One moment while I perform some calculations... 🧠`);
        
        const gas = await (await fetch(`https://owlracle.info/${k}/gas?apikey=d766098dd42c4caebdf0fa7e344a2743`)).json();
        await ctx.replyWithHTML(`🦉\nI think you should pay no more than this for submitting transactions on the <b>${v}</b> network:`);
        
        const speeds = ['🚲 Slow', '🚗 Standard', '✈️ Fast', '🚀 Instant'];
        await Promise.all(speeds.map((e,i) => ctx.replyWithHTML(`\n<b>${e}</b>\n\n⛽ <b>${gas.speeds[i].gasPrice.toFixed(2)}</b> GWei\n 💰$<b>${gas.speeds[i].estimatedFee.toFixed(2)}</b>\n\n`)));
        
        ctx.replyWithHTML(`🦉\nUse this information wisely. And don't forget to <a href="https://owlracle.info">visit me</a> if you want further knowledge.`);

        // const svg = fs.readFileSync('svg.svg');
        // svg.querySelectorAll('#gas').forEach((e,i) => e.innerHTML = gas.speeds[i].gasPrice.toFixed(2));
        
        // const png = sharp(svg).png();
        // ctx.replyWithPhoto({ source: png });
    }));
});

bot.on('message', (ctx) => {
    ctx.replyWithHTML(`🦉\nThanks for reaching out. Currently, I am not very capable of making complex conversations.🤖 But one thing I am very good at is predicting <b>gas prices</b>.⛽\n\nType /gas and just try me.`);
});


// bot.action('delete', (ctx) => ctx.deleteMessage());


// bot.action('delete', (ctx) => ctx.deleteMessage());
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
