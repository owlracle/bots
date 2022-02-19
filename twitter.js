const fetch = require('node-fetch');
const { config, logError, networkList } = require('./utils.js');
const { TwitterApi } = require('twitter-api-v2');

const configFile = config.get('twitter');


const args = {
    aggressive: false,
    rebuildRules: false,
};

process.argv.forEach((val, index, array) => {
    // aggressive mode = do not require mention
    if ((val == '-a' || val == '--aggressive')){
        console.log('Aggressive mode - Bot will not care about mention and hashtag when searching for tweets.')
        args.aggressive = true;
    }
    // rebuild rules
    if ((val == '-r')){
        const m = array.match(/-r "(.+)"/);
        if (m && m.length > 1){
            console.log(`Custom rules - Bot will use this rule when searching for tweets: ${m[1]}`);
            args.rebuildRules = m[1];
        }
    }
});


const api = {
    botName: 'owlracleapi',
    callsReceived: {
        lastReport: new Date().getTime(),
        count: 0,
    },

    networkAlias: {
        bsc: [ 'bnb', 'bsc', 'binance' ],
        poly: [ 'matic', 'poly', 'polygon' ],
        ftm: [ 'ftm', 'fantom' ],
        eth: [ 'eth', 'ethereum' ],
        avax: [ 'avax', 'avalanche' ],
        cro: [ 'cro', 'cronos' ],
        movr: [ 'movr', 'moonriver' ],
        one: [ 'one', 'harmony' ],
        ht: [ 'ht', 'huobi', 'heco' ],
        celo: [ 'celo' ],
    },

    init: async function() {
        this.client = new TwitterApi({
            appKey: configFile.apiKey,
            appSecret: configFile.secret,
            accessToken: configFile.access,
            accessSecret: configFile.accessSecret,
        });

        const mainRule = `@${this.botName} #gas`;
        let newRule = mainRule;
        if (args.aggressive) {
            const aliases = Object.values(this.networkAlias).map(n => n.map(a => `"${a}"`).join(' OR ')).join(' OR ');
            newRule = `-from:${this.botName} ("gas price" OR "gas prices" OR #gas OR #GasPrice OR #gasprices) (${aliases})`;
        }
        if (args.rebuildRules) {
            newRule = args.rebuildRules;
        }

        this.blacklist = configFile.blacklist || [];
        newRule += ' ' + this.blacklist.map(e => `-from:${e}`).join(' ');
        
        const rulesObj = await this.rules.get();
        
        if (rulesObj.data[0].value != newRule){
            console.log('Updating rules');
            await this.rules.clear();
            await this.rules.add(newRule);
            await this.rules.add(mainRule);
        }

        console.log(await this.rules.get());
        await this.scan();
    },

    rules: {
        get: async function() {
            return await (await fetch(`https://api.twitter.com/2/tweets/search/stream/rules`, {
                headers: { 'Authorization': `Bearer ${configFile.bearer}` }
            })).json();
        },

        clear: async function() {
            const response = await this.get();
            
            if (response.data){
                await (await fetch(`https://api.twitter.com/2/tweets/search/stream/rules`, {
                    method: 'POST',
                    headers: {
                        'Content-type': `application/json`,
                        'Authorization': `Bearer ${configFile.bearer}`
                    },
                    body: JSON.stringify({ delete: { ids: response.data.map(e => e.id) } })
                })).json();
            }
        },

        add: async function(values) {
            if (!Array.isArray(values)){
                values = [values];
            }

            await (await fetch(`https://api.twitter.com/2/tweets/search/stream/rules`, {
                method: 'POST',
                headers: {
                    'Content-type': `application/json`,
                    'Authorization': `Bearer ${configFile.bearer}`
                },
                body: JSON.stringify({ add: values.map(e => { return { value: e } }) })
            })).json();
        },
    },

    scan: async function() {
        const stream = await fetch(`https://api.twitter.com/2/tweets/search/stream`, {
            headers: { 'Authorization': `Bearer ${configFile.bearer}` },
        });

        if (!stream.body){
            logError({ message: 'Error retrieving stream' });
            return;
        }

        stream.body.setEncoding('utf8');
        stream.body.on('data', async chunk => {
            // keep alive msg
            if (chunk == '\r\n'){
                return;
            }

            try {
                const data = JSON.parse(chunk);

                // logError({ message: 'Got a new tweet', tweet: chunk, alert: false });

                const tweet = data.data.text.toLowerCase();
                const tweetId = data.data.id;

                const network = this.findNetwork(tweet);
                if (!network){
                    logError({ message: 'Provided network is not available', network: parts[2], alert: false });
                    return;
                }

                const gas = await this.getGas(network);
                if (!gas) {
                    return;
                }
                gas.network = network;
                this.sendMessage(tweetId, gas);
            }
            catch (error) {
                logError({ message: 'Error parsing the json', alert: false });
                // console.log(chunk);
            }
        })
        stream.body.on('end', () => {
            console.log(`That's it folks!`);
        })
    },

    findNetwork: function(text){
        // try to find inside text any of the aliases from each network
        const network = Object.entries(this.networkAlias).map(([k,v]) => {
            const kwRegex = new RegExp(`(?:${ v.join(')|(?:') })`, 'g');
            const matches = text.match(kwRegex);
            return matches ? k : false;
        }).filter(e => e);
        return network.length ? network[0] : false;
    },

    getGas: async function(network) {
        const apiKey = configFile.owlracleKey;

        const gas = await (await fetch(`https://owlracle.info/${network}/gas?apikey=${apiKey}&source=bot`)).json();

        if (gas.error){
            logError({ message: 'Error retrieving gas', error: gas, apiKey: apiKey, network: network });
            return false;
        }

        return gas;
    },

    sendMessage: async function(id, message) {
        const network = ( text => text[0].toUpperCase() + text.slice(1).toLowerCase() )(networkList[message.network]);
        const time = message.timestamp;

        let tags = '';
        if (networkList[message.network] && this.networkAlias[message.network]){
            tags = `\n\n#GasPrice #${networkList[message.network]} #${this.networkAlias[message.network][0].toUpperCase()}`;
        }

        const speeds = ['🛴 Slow', '🚗 Standard', '✈️ Fast', '🚀 Instant'];
        message = speeds.map((e,i) => `${e}: ${message.speeds[i].gasPrice.toFixed(2)} GWei ≈ $ ${message.speeds[i].estimatedFee.toFixed(4)}`).join('\n');
        message = `⛽${network} Gas Price\n\n${message}\n\n🦉Fetched from owlracle.info @ ${time}${tags}`;
        
        try {
            this.client.v2.reply(message, id);

            // report every 24h
            this.callsReceived.count++;
            if (this.callsReceived.lastReport <= new Date().getTime() - 1000*3600*24){
                logError({ message: `${new Date().toISOString()}: ${this.callsReceived.count} Calls since last day`, alert: true });
                this.callsReceived.count = 0;
                this.callsReceived.lastReport = new Date().getTime();
            }
            // logError({ id: id, message: message, alert: true });
        }
        catch (error) {
            console.log(error);
        }
    
    },
}

api.init();