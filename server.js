require('dotenv').config()
const DISCORD_CHANNEL=process.env.DISCORD_CHANNEL //timer channel
const DISCORD_BOT_TOKEN=process.env.DISCORD_BOT_TOKEN
const DISCORD_BOT_ID=process.env.DISCORD_BOT_ID

const Eris = require("eris");
const snoowrap = require('snoowrap');

var bot = new Eris(DISCORD_BOT_TOKEN);
const botId = DISCORD_BOT_ID;
const r = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

//commands
const COMMAND_NEW = ['new', 'n'];
const COMMAND_RANDOM = ['random', 'rand', 'r'];

bot.on("ready", () => {
    console.log("Ready!");
});

bot.on("messageCreate", (msg) => {
  if(msg.author.id == botId) return;

  let content = msg.content.split(' ');
  let cmd = content[0].toLowerCase();

  if(msg.channel.id != DISCORD_CHANNEL && (COMMAND_NEW.includes(cmd) || COMMAND_RANDOM.includes(cmd))) {
    bot.createMessage(msg.channel.id, `<@${msg.author.id}>, please use the <#${DISCORD_CHANNEL}> channel.`);
    return;
  }

  if(COMMAND_NEW.includes(cmd)) {
      if(content.length == 2) {
        getNewest(content[1]);
      } else {
        getNewest();
      }
  } else if (COMMAND_RANDOM.includes(cmd)) {
      if(content.length == 2) {
        getRandom(content[1]);
      } else {
        getRandom();
      }
  }
});

function getNewest(subreddit='ProgrammerHumor')
{
    console.log('Getting newest from ' + subreddit + '...')
    r.getSubreddit(subreddit).getNew().then((posts) => {
        // post.post_hint: 'image'
        // post.url_overridden_by_dest > image url
        for(post of posts) {
            if(post.over_18 === undefined) {
                notSureIfNSFW();
                return;
            }
            if(post.over_18) {
                ohNoNSFW();
                return;
            }

            if(post.post_hint != 'image' && post.post_hint != 'rich:video') {
                continue;
            }

            let title = post.title;
            let url_overridden_by_dest = post.url_overridden_by_dest;
            console.log(title, url_overridden_by_dest);

            const content = {};

            if(post.post_hint == 'image') {
                content.embed = {
                    "title": title,
                    "image": {
                        "url": url_overridden_by_dest
                    }
                };
            } else if(post.post_hint == 'rich:video') {
                content.content = url_overridden_by_dest;
            }

            bot.createMessage(DISCORD_CHANNEL, content);
            break;
        }
    })
    .catch((e) => {
        console.log(e);
        bot.createMessage(DISCORD_CHANNEL, "**OOF** an error occured. Please try again, b0ss.");
    })
}

function getRandom(subreddit='ProgrammerHumor')
{
    console.log('Getting random from ' + subreddit + '...')
    r.getSubreddit(subreddit).getRandomSubmission().then((post) => {
        if(post.over_18 === undefined) {
            notSureIfNSFW();
            return;
        }
        if(post.over_18) {
            ohNoNSFW();
            return;
        }
        // post.post_hint: 'image'
        // post.url_overridden_by_dest > image url
        if(post.post_hint != 'image' && post.post_hint != 'rich:video') {
            console.log('looking for anotha');
            getRandom(subreddit);
        } else {
            let title = post.title;
            let url_overridden_by_dest = post.url_overridden_by_dest;
            console.log(title, url_overridden_by_dest);

            const content = {};
            if(post.post_hint == 'image') {
                content.embed = {
                    "title": title,
                    "image": {
                        "url": url_overridden_by_dest
                    }
                };
            } else if(post.post_hint == 'rich:video') {
                content.content = url_overridden_by_dest;
            }

            bot.createMessage(DISCORD_CHANNEL, content);
        }
    })
    .catch((e) => {
        console.log(e);
        bot.createMessage(DISCORD_CHANNEL, "**OOF** an error occured. Please try again, b0ss.");
    })
}

function notSureIfNSFW()
{
    bot.createMessage(DISCORD_CHANNEL, "🤔🤔🤔 Not sure about this one, chief.");
}

function ohNoNSFW()
{
    const content = {};
    content.embed = {
        "title": 'STOP',
        "image": {
            "url": 'https://i.imgur.com/dbQNfJN.png'
        }
    };

    bot.createMessage(DISCORD_CHANNEL, content);
}

bot.connect();
