import 'dotenv/config';
import { initBot } from './bot';

const { BOT_TOKEN, DEVELOPMENT_MODE } = process.env;

if (!BOT_TOKEN) {
  throw new Error('no BOT_TOKEN provided');
}

const bot = initBot();

bot
  .launch()
  .catch((reason) => {
    console.error('failed to launch', reason);
    bot.stop(reason);
  })
  .then(() => {
    console.log(
      `${DEVELOPMENT_MODE ? 'Dev' : ''} Bot is up and running`,
      bot.botInfo,
      `https://t.me/${bot.botInfo?.username}`
    );
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
