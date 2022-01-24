<p align=center>
<img width="800" src="https://user-images.githubusercontent.com/19828711/140464079-683afdb2-a213-4e02-a032-93a42e3a93e8.png">
</p>


# Owlracle Bots

This is Owlracle's repo for his bots. All the bots serve a key function in the Owlracle ecossystem, delivering gas prices to different platforms using Owlracle's API.


# Table of Contents

1. [Install](#install)
2. [Telegram Bot](#telegram)
3. [Discord Bot](#discord)
4. [Twitter Bot](#twitter)
5. [Contact and Support](#contact)

---

# Install the bots <a name="install"></a>

All bots come with the same repo. Before getting any of them to work, you must first clone the repo

```
git clone https://github.com/owlracle/telegram_bot.git
```

Then go to the dir, then install dependencies
```
npm init
```

All of Owlracle's bots in this repo share the same `config.json` file. You must create this file on repo root with the following format:

```
{
    "telegram": {
        "token": "TELEGRAM_BOT_TOKEN",
        "groups": {}
    },
    "discord": {
        "token": "DISCORD_BOT_TOKEN",
        "groups": {}
    },
    "twitter": {
        "apiKey": "TWITTER_CONSUMER_API_KEY",
        "secret": "TWITTER_CONSUMER_API_SECRET",
        "bearer": "TWITTER_AUTHENTICATION_BEARER_TOKEN",
        "access": "TWITTER_AUTHENTICATION_ACCESS_TOKEN",
        "accessSecret": "TWITTER_AUTHENTICATION_ACCESS_SECRET",
        "owlracleKey": "OWLRACLE_API_KEY",
	"blacklist": []
    },
    "alert": {
        "enabled": false,
        "token": "TELEGRAM_ALERT_BOT_TOKEN",
        "chatId": "TELEGRAM_USER_CHATID"
    }
}
```

* **telegram**: Information about your Telegram bot setup.
  * **token**: The _TELEGRAM_BOT_TOKEN_ is taken from Telegram service when you create your bot. For instructions about how to set a new bot, refer to the [Telegram docs](https://core.telegram.org/bots).
  * **groups**: Object that will be filled when Telegram groups add your bot.
* **discord**: Information about your Discord bot setup.
  * **token**: The _DISCORD_BOT_TOKEN_ is taken from Discord service when you create your bot. For instructions about how to set a new bot, refer to the [discord.js docs](https://discordjs.guide/).
  * **groups**: Object that will be filled when Discord servers add your bot.
* **twitter**: Information about your Twitter bot setup.
  * **apiKey**: The _TWITTER_CONSUMER_API_KEY_ and all other tokens can be generated on Tweeter Developer Portal. Know more about it at [Twitter API docs](https://developer.twitter.com/).
  * **secret**: The _TWITTER_CONSUMER_API_SECRET_ is generated at the same time as _TWITTER_CONSUMER_API_KEY_.
  * **bearer**: The _TWITTER_AUTHENTICATION_BEARER_TOKEN_ Is used to identify your application. See **apiKey** above.
  * **access**: The _TWITTER_AUTHENTICATION_ACCESS_TOKEN_ is used to get authorization to post a tweet. See **apiKey** above.
  * **accessSecret**: The _TWITTER_AUTHENTICATION_ACCESS_SECRET_ is generated together with _TWITTER_AUTHENTICATION_ACCESS_TOKEN_. See **apiKey** above.
  * **owlracleKey**: Whoever running this bot must provide an Owlracle API key. You can generate one [here](http://owlracle.info/?action=newkey).
  * **blacklist**: List of tweeter users that will not get a reply from Owlracle bot. This list is useful to prevent replying to other bots.
* **alert**: This is used to receive alerts from your bot on your personal Telegram.
  * **enabled**: If set to _true_, you will receive telegram alerts.
  * **token**: The token for the Telegram bot that will send you the alerts. This is not the same Owlralce Telegram bot we will use for gas prices.
  * **chatId**: This is your personal account chat id (google about it).

After that you are ready to start the bots.


# Owlracle's Telegram Bot <a name="telegram"></a>

<p align="center"><img src="https://user-images.githubusercontent.com/19828711/150151758-4470fd5b-82ff-4bc2-9a97-13e2719b2630.png"></p>

This repo is about Owlracle Telegram Bot's webhook. Before you must have created a Telegram bot. For more information about this, check [Telegram docs](https://core.telegram.org/bots).

## Usage

Run the bot:

```
node telegram.js
```

Now you can interact with your bot. Invite him to one of your groups and start interacting with him:

```
\start
```

That is it! Enjoy.


# Owlracle's Discord Bot <a name="discord"></a>

<p align="center"><img src="https://user-images.githubusercontent.com/19828711/150152065-6871062f-598a-47c8-a271-77f405efd949.png"></p>

This repo deals with the Owlracle Discord Bot webhook. Before running your bot you must have create it. Go to [Discord's dev portal](https://discord.com/developers/applications) and create your bot. Look at some resources [like this](https://www.freecodecamp.org/news/create-a-discord-bot-with-python/) as to how to do it properly.


## Usage


Run the bot:

```
node discord.js
```

Now your bot must be added to the desired server. If you followed a tutorial on how to make a discord bot, you know what this is about.
After your bot is running, you can start talking to him with `!start` or `/start`.

You can test it on [Owlracle's Telegram](https://t.me/owlracle) group.

That is it! Enjoy.


# Owlracle's Twitter Bot <a name="twitter"></a>

<p align="center"><img src="https://user-images.githubusercontent.com/19828711/150651509-0b947e03-0c90-40eb-812c-f9da7e37527d.png"></p>

This repo deals with the Owlracle Twitter Bot webhook. You will tie your bot's logic with an existing Twitter account. Check their [docs](https://developer.twitter.com/en/docs) to know more about their API. The tokens provided in `config.json` will bound the bot with the account.


## Usage


Run the bot:

```
node twitter.js
```

Now the bot will fetch gas prices using Owlracle API and tweet a reply to whoever make a tweet containing the following:

* A mention to the bot's bound profile.
* The hashtag `#gas`.
* A reference to any supported network. Any of the following will work:
  * **BSC**: _bsc_, _bnb_, _binance_.
  * **Polygon**: _poly_, _matic_, _polygon_.
  * **Fantom**: _ftm_, _fantom_.
  * **Avalanche**: _avax_, _avalanche_.
  * **Ethereum**: _eth_, _ethereum_.
  * **Moonriver**: _movr_, _moonriver_.
  * **Cronos**: _cro_, _moonriver_.

Check a sample tweet in the [image](#twitter) above.

You can also test it sending a tweet to [@owlracleapi](https://twitter.com/owlracleapi).


That is it! Enjoy.


---


# Contact us: <a name="contact"></a>

<a href="https://twitter.com/owlracleAPI">
<img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white">
</a>

<a href="https://facebook.com/owlracle">
<img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white">
</a>

<a href="https://t.me/owlracle">
<img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white">
</a>

<a href="https://github.com/owlracle">
<img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white">
</a>


## Like what we are doing?

Then support our project! We accept any token donation on <img src="https://owlracle.info/img/bsc.png" height="20"> **BSC**, <img src="https://owlracle.info/img/poly.png" height="20"> **Polygon**, <img src="https://owlracle.info/img/ftm.png" height="20"> **Fantom**, <img src="https://owlracle.info/img/eth.png" height="20"> **Ethereum**, and <img src="https://owlracle.info/img/avax.png" height="20"> **Avalanche** networks.

<a href="https://user-images.githubusercontent.com/19828711/139945432-f6b07860-c986-4221-a291-10370f24ea5a.png">
<h3 align=center><img src="https://img.shields.io/badge/Wallet-0xA6E126a5bA7aE209A92b16fcf464E502f27fb658-blue"></h3>
<p align=center>
	<img width="200" src="https://user-images.githubusercontent.com/19828711/139945432-f6b07860-c986-4221-a291-10370f24ea5a.png">
</p>
</a>



