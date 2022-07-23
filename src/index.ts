import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { createFaqLoop, requestCaptcha } from './bot';
import { welcomeMessage } from './translations';

if (!process.env.BOT_TOKEN) {
  throw new Error('no BOT_TOKEN provided');
}

const {
  BOT_TOKEN,
  PORT = 3000,
  URL = 'https://clockwork-kottan-bot.herokuapp.com/',
} = process.env;

const bot = new Telegraf(BOT_TOKEN);

bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
//@ts-expect-error we need to listen port or heroku will kill the app
bot.startWebhook(`/bot${BOT_TOKEN}`, null, Number(PORT));

bot.start((ctx) => {
  ctx.reply(welcomeMessage);
});

requestCaptcha(bot);
createFaqLoop(bot);

bot
  .launch()
  .catch((reason) => {
    console.error('failed to launch', reason);
    bot.stop(reason);
  })
  .then(() => {
    console.log(
      'Bot is up and running',
      bot.botInfo,
      `https://t.me/${bot.botInfo?.username}`
    );
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
