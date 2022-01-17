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

module.exports = { networkList, alert, config };