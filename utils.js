const fs = require('fs');
const fetch = require('node-fetch');

const config = {
    path: './config.json',

    get: function(arg) {
        const file = JSON.parse(fs.readFileSync(this.path));
        return file[arg];
    },
    
    set: function(arg, value) {
        const file = JSON.parse(fs.readFileSync(this.path));
        
        if (file[arg]){
            file[arg] = value;
            fs.writeFileSync(this.path, JSON.stringify(file));
            return true;
        }
        return false;
    }
};
const configFile = config.get('alert');


const networkList = {
    eth: 'Ethereum',
    bsc: 'BSC',
    poly: 'Polygon',
    ftm: 'Fantom',
    avax: 'Avalanche',
    movr: 'Moonriver',
    cro: 'Cronos',
    one: 'Harmony',
    ht: 'Heco',
    celo: 'Celo',
    fuse: 'Fuse',
};


const alert = {
    url: `https://api.telegram.org/bot{{token}}/sendMessage?chat_id={{chatId}}&text=`,

    send: async function(message){
        if (configFile.enabled){
            if (!this.token){
                this.token = configFile.token;
                this.chatId = configFile.chatId;
    
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


// save to text log errors
const logError = (data) => {
    try {
        data.timestamp = new Date().toISOString();

        if (data.alert !== false){
            alert.send(data);
        }
        
        if (data.console !== false){
            console.log(data);
        }
        
        delete data.alert;
        delete data.console;

        const log = JSON.parse(fs.readFileSync(`${__dirname}/log.json`));
        log.push(data);
        fs.writeFileSync(`${__dirname}/log.json`, JSON.stringify(log));

        return true;
    }
    catch (error) {
        console.log(error)
        return false;
    }
}


// encapsulate fetch requests
const request = async (url, args={}, method='GET') => {
    if (!url) {
        return {
            error: true,
            message: 'URL not provided or invalid',
        };
    }

    const baseURL = config.get('requestURL');

    if (method == 'GET') {
        const query = new URLSearchParams(args).toString() || '';
        try {
            const req = await fetch(`${baseURL}/${url}?${query}`);
            return await req.json();
        }
        catch(error) {
            return {
                error: true,
                message: error,
            };
        }
    }

    try {
        const req = await fetch(`${baseURL}/${url}`, {
            method: method || 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(args) || null,
        });
        return await req.json();
    }
    catch(error) {
        return {
            error: true,
            message: error,
        };
    }
} 


module.exports = { networkList, alert, config, logError, request };