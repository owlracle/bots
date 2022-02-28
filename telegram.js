const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');
const { networkList, alert, config } = require('./utils.js');

const configFile = config.get('telegram');

if (configFile.token === undefined) {
    throw new TypeError('BOT_TOKEN must be provided!');
}


const buttonArray = Object.entries(networkList).map(([k,v]) => Markup.button.callback(v, k));
const buttons = Markup.inlineKeyboard([
    buttonArray.slice(0,4),
    buttonArray.slice(4,7),
    buttonArray.slice(7)
]);

const bot = new Telegraf(configFile.token);

// when user type /start
bot.start((ctx) => {
    let args = ctx.update.message.text.split(' ').slice(1);

    // deeplink to add alert
    if (args && args[0] == 'credit'){
        ctx.replyWithHTML(`🦉\nHello! I see that you want me to send you alerts about your API credits.🚨\nThat is really easy. Just type /credit_alert and I will guide you through this.`);
        return;
    }

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

            const gas = await (await fetch(`https://owlracle.info/eth/gas?apikey=${args[1]}&source=bot`)).json();

            if (gas.error) {
                ctx.replyWithHTML(`🦉\nWell... The request I made using the API key you provided returned an error. Check your key and try again.`);
                return;
            }

            configFile.groups[args[0]] = args[1];
            config.set('telegram', configFile);

            ctx.replyWithHTML(`🦉\nIt is done! Now that we know each other better, I can take this group's requests more seriously.`);

            alert.send(`A new group started to use Telegram Owlracle bot: ${args[0]}. Total: ${Object.keys(configFile.groups).length}`);
            return;
        }

        ctx.replyWithHTML(`🦉\nSorry! I am already working at this group.🛠️ If you want to replace your API key you should use /remove then /add again. You can contact us at <a href="https://t.me/owlracle">Owlracle's group</a> for further help.`);
        return;
    }

    ctx.replyWithHTML(`🦉\nSorry! I cannot recognize what you are asking me. But it is simple: <code>/add CHATID APIKEY</code>.`);
});


bot.command('remove', async (ctx) => {
    const args = ctx.update.message.text.split(' ').slice(1);
    if (args && args.length == 2){

        // erase group record
        if (configFile.groups[args[0]] && configFile.groups[args[0]] == args[1]){
            delete configFile.groups[args[0]];
            config.set('telegram', configFile);

            ctx.replyWithHTML(`🦉\nIt is done! I am no longer working for your group. 😢 It was good while it lasted though.\nIf you change your mind, you can /add me again.`);

            alert.send(`A group stopped using Telegram Owlracle bot: ${args[0]}. Total: ${Object.keys(configFile.groups).length}`);
            return;
        }

        ctx.replyWithHTML(`🦉\nSorry! I am not working for the group you informed, or the API key you provided does not match the group. Check this information and try again, or contact us at <a href="https://t.me/owlracle">Owlracle's group</a> for further help.`);
        return;
    }

    ctx.replyWithHTML(`🦉\nSorry! I cannot recognize what you are asking me. But it is simple: <code>/remove CHATID APIKEY</code>.`);
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
        
        const gas = await (await fetch(`https://owlracle.info/${k}/gas?apikey=${apiKey}&source=bot`)).json();

        if (gas.error){
            if (gas.status == 401){
                ctx.replyWithHTML(`🦉\nSomething went wrong! And I think your API key is the problema. Maybe you should report this problem.`);
                return;
            }
            ctx.replyWithHTML(`🦉\nSomething went wrong! I will just throw some stuff here hoping you understand it. 😟\n<pre>${JSON.stringify(gas)}</pre> If you don't, plase report this message.`);
            return;
        }

        await ctx.replyWithHTML(`🦉\nI think you should pay no more than this when submitting transactions on the <b>${v}</b> network:`);
        
        const speeds = ['🛴 Slow', '🚗 Standard', '✈️ Fast', '🚀 Instant'];
        await Promise.all(speeds.map((e,i) => ctx.replyWithHTML(`\n<b>${e}</b>\n\n<b>${gas.speeds[i].gasPrice.toFixed(2)}</b> GWei\n$ <b>${gas.speeds[i].estimatedFee.toFixed(4)}</b>\n\n`)));
        
        ctx.replyWithHTML(`🦉\nUse this information wisely. And don't forget to <a href="https://owlracle.info">visit me</a> if you want further knowledge.`);
    }));
});


// create alert
bot.command('credit_alert', async ctx => {
    const args = ctx.update.message.text.split(' ').slice(1);
    const id = ctx.chat.id;

    // invalid parameter
    if (!args || !(args.length == 0 || args.length == 2) ) {
        ctx.replyWithHTML(`🦉\nSorry! I cannot recognize what you are asking me. Type /credit_alert and I can guide you through this.`);
        return;
    }

    const info = await (await fetch(`https://owlracle.info/alerts/credit/${id}`)).json();

    if (info.status != 'success'){
        ctx.replyWithHTML(`🦉\nSomething went wrong while retrieving your information from Owlracle server. Try again later or report this error.`);
        return;
    }

    // send command without api key
    if (args.length == 0){
        // not registered
        if (!info.apiKeys.length){
            ctx.replyWithHTML(`🦉\nLet's do this. To start receiving alerts about your API credits, just tell me your api key by typing <code>/credit_alert add APIKEY</code>.`);
            return;
        }
        
        // already registed, so check information
        ctx.replyWithHTML(`🦉\nHey. I know you! I am already commited to alert you about your API credits for the following API keys:`);
        
        info.apiKeys.forEach(e => {
            ctx.replyWithHTML(`Key: ${e.apiKey}, Credits: $${parseFloat(e.credit).toFixed(4)}`);
        });

        ctx.replyWithHTML(`If you want to add a key, just type <code>/credit_alert add APIKEY</code> and I will start watching it for you.`);
        ctx.replyWithHTML(`Or if you need me to stop watching some key, just type <code>/credit_alert remove APIKEY</code>.`);

        return;
    }

    if (args.length == 2){
        if (args[0] == 'add'){
            // already registered for this key
            if (info.apiKeys.filter(e => e.apiKey == args[1]).length) {
                ctx.replyWithHTML(`🦉\nI am already delivering you alerts for this key. If you want to stop receiving alerts, just type <code>/credit_alert remove ${args[1]}</code>.`);
                return;
            }
            
            // register key
            ctx.replyWithHTML(`🦉\nAllright. I will just check if your key is valid...`);

            const gas = await (await fetch(`https://owlracle.info/eth/gas?apikey=${args[1]}&source=bot`)).json();
        
            if (gas.error) {
                ctx.replyWithHTML(`🦉\nWell... The request I made using the API key you provided returned an error. Check your key and try again.`);
                return;
            }
        
            // add to the db
            fetch(`https://owlracle.info/alerts/credit/${args[1]}`, {
                method: 'POST',
                body: JSON.stringify({ chatid: id }),
            });
        
            ctx.replyWithHTML(`🦉\nIt is done! From now on I will keep you informed about your credit usage on this API key.`);
            ctx.replyWithHTML(`If you want to add a new key, just type <code>/credit_alert add APIKEY</code> again.`);
            ctx.replyWithHTML(`Or if you need me to stop watching it, just type <code>/credit_alert remove APIKEY</code>.`);
            
            alert.send(`A user started receiving alerts: ${id}. Key: ${args[1]}.`);
            return;
        }

        if (args[0] == 'remove'){
            if (!info.apiKeys.filter(e => e.apiKey == args[1]).length){
                ctx.replyWithHTML(`🦉\nSorry! I don't recall you asking me to watch for this key. But there is no problem, if you want I can do it. Just type <code>/credit_alert add ${args[1]}</code>`);
                return;
            }

            // delete from db
            fetch(`https://owlracle.info/alerts/credit/${args[1]}`, {
                method: 'DELETE',
                body: JSON.stringify({ chatid: id }),
            });

            ctx.replyWithHTML(`🦉\nIt is done! I will no longer give you alerts about this key.\nIf you change your mind, you can type <code>/credit_alert add ${args[1]}</code> and I will resume serving you.`);
    
            alert.send(`A user stopped receiving alerts: ${id}.`);
            return;
    
        }

        // invalid parameter
        ctx.replyWithHTML(`🦉\nSorry! I cannot recognize what you are asking me. Type /credit_alert and I can guide you through this.`);
        return;
    }
});


// when user send a dm
bot.on('message', (ctx) => {
    if (ctx.update.message.chat.type == 'private'){
        ctx.replyWithHTML(`🦉\nThanks for reaching out. Currently, I am not very capable of making complex conversations.🤖 But one thing I am very good at is predicting <b>gas prices</b>.⛽\n\nType /gas and just try me.`);
    }
});


bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

alert.send('Telegram Bot started');
