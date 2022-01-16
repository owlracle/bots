const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const fetch = require('node-fetch');


const configFile = JSON.parse(fs.readFileSync(`${__dirname}/config.json`));


const telegram = {
    url: `https://api.telegram.org/bot{{token}}/sendMessage?chat_id={{chatId}}&text=`,

    alert: async function(message){
        if (configFile.alert.enabled){
            if (!this.token){
                this.token = configFile.alert.token;
                this.chatId = configFile.alert.chatId;
    
                this.url = this.url.replace(`{{token}}`, this.token).replace(`{{chatId}}`, this.chatId);
            }
            if (typeof message !== 'string'){
                message = JSON.stringify(message);
            }
    
            const resp = await (await fetch(this.url + encodeURIComponent(message))).json();
            return resp;
        }
        return false;
    }
}


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

// when user type /start
bot.start((ctx) => {
    // the group is already registered
    if (configFile.groups[ctx.chat.id]){
        ctx.replyWithHTML(`🦉\nHello <b>${ctx.message.from.first_name}</b>. Welcome to my domain.\nI see you want to know about <b>gas prices</b>.⛽ You came to the right entity. That is my sole purpose.\n\nJust type /gas to summon my wisdom. 🔮`);
        return;
    }

    const buttons = Markup.inlineKeyboard([
        Markup.button.callback('Yes', 'yes'),
        Markup.button.callback('No', 'no'),
    ]);
    
    ctx.replyWithHTML(`🦉\nGreetings. I see we have not met each other yet. That is ok, I will guide you through the process.\nYou know, I make API requests all the time. And for that I need a special word called API key 🪄. Do you have one already?`, buttons);

    bot.action('yes', async ctx => {
        ctx.replyWithHTML(`🦉\nNice! I need you to say it to me, but you should tell me in a private message, so others cannot hear. Just send me <code>/add CHATID APIKEY</code>, replacing <i>APIKEY</i> with your actual API key and <i>CHATID</i> with this chat's id. If you do not know it, just say /chatid and I will tell you.`);
        ctx.deleteMessage();
    });
    bot.action('no', async ctx => {
        ctx.replyWithHTML(`🦉\nOK. So the first thing you need to do is create one. <a href="https://owlracle.info/?action=newkey">Just follow me</a>. It takes less than a minute ⏳.`);
        ctx.deleteMessage();
    });
});


// when user type /help
bot.help((ctx) => {
    ctx.replyWithHTML(`🦉\nDo not worry, I am here to help.🆘\nIf there is one thing you should know about me, is that I am very good at predicting <b>gas prices</b>.⛽ Some say I am the best around!🥇\nJust type /gas and try me.`);
});


// /chatid
bot.command('chatid', (ctx) => {
    ctx.replyWithHTML(`🦉\nHere it goes. This chat's id is...🥁🥁🥁\n<b>${ctx.chat.id}</b>`);
});


// add group api key
bot.command('add', async (ctx) => {
    const args = ctx.update.message.text.split(' ').slice(1);
    if (args && args.length == 2){

        // save group record
        if (!configFile.groups[args[0]]){
            ctx.replyWithHTML(`🦉\nAllright. I will just check to make sure everything is working as expected...`);

            const gas = await (await fetch(`https://owlracle.info/eth/gas?apikey=${args[1]}`)).json();

            if (gas.error) {
                ctx.replyWithHTML(`🦉\nWell... The request I made using the API key you provided returned an error. Check your key and try again.`);
                return;
            }

            configFile.groups[args[0]] = args[1];
            fs.writeFileSync('config.json', JSON.stringify(configFile));

            ctx.replyWithHTML(`🦉\nIt is done! Now that we know each other better, I can take this group's requests more seriously.`);

            telegram.alert(`A new group started to use Owlracle bot: ${args[0]}. Total: ${Object.keys(configFile.groups).length}`);
            return;
        }

        ctx.replyWithHTML(`🦉\nSorry! I am already working at this group.⚒️ If you want to replace your API key you should contact my master at <a href="https://t.me/owlracle">Owlracle's group</a>.`);
        return;
    }

    ctx.replyWithHTML(`🦉\nSorry! I cannot recognize what you are asking me. But it is simple: <code>/add CHATID APIKEY</code>.`);
});


// when user type /gas
bot.command('gas', (ctx) => {
    let apiKey = configFile.groups[ctx.chat.id];
    if (!apiKey){
        ctx.replyWithHTML(`🦉\nSorry, but I am new to this group. I am sure I would love working here ♥️, but first we need to discuss some things. Say /start so we can speak about it.`);
        return;
    }
    
    ctx.replyWithHTML(`🦉\nHello <b>${ctx.message.from.first_name}</b>. Did you summon me? 🔮\nI can tell you the current <b>gas prices</b>.⛽ Just give me the network name:`, buttons);
    
    Object.entries(networkList).forEach(async ([k,v]) => bot.action(k, async ctx => {
        ctx.deleteMessage();
        
        ctx.replyWithHTML(`🦉\n<b>${v}</b>, good choice! One moment while I perform some calculations... 🧠`);
        
        const gas = await (await fetch(`https://owlracle.info/${k}/gas?apikey=${apiKey}`)).json();

        if (gas.error){
            if (gas.status == 401){
                ctx.replyWithHTML(`🦉\nSomething went wrong! And I think your API key is the problema. Maybe you should report this problem.`);
                return;
            }
            ctx.replyWithHTML(`🦉\nSomething went wrong! I will just throw some stuff here hoping you understand it. 😟\n<pre>${JSON.stringify(gas)}</pre> If you don't, plase report this message.`);
            return;
        }

        await ctx.replyWithHTML(`🦉\nI think you should pay no more than this for submitting transactions on the <b>${v}</b> network:`);
        
        const speeds = ['🚲 Slow', '🚗 Standard', '✈️ Fast', '🚀 Instant'];
        await Promise.all(speeds.map((e,i) => ctx.replyWithHTML(`\n<b>${e}</b>\n\n⛽ <b>${gas.speeds[i].gasPrice.toFixed(2)}</b> GWei\n 💰$<b>${gas.speeds[i].estimatedFee.toFixed(2)}</b>\n\n`)));
        
        ctx.replyWithHTML(`🦉\nUse this information wisely. And don't forget to <a href="https://owlracle.info">visit me</a> if you want further knowledge.`);
    }));
});


// when user send a dm
bot.on('message', (ctx) => {
    ctx.replyWithHTML(`🦉\nThanks for reaching out. Currently, I am not very capable of making complex conversations.🤖 But one thing I am very good at is predicting <b>gas prices</b>.⛽\n\nType /gas and just try me.`);
});


bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

telegram.alert('Bot started');
