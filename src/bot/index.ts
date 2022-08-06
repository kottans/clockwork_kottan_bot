import { Telegraf } from 'telegraf';

import { welcomeMessage } from './translations';

import { handlePrivateChat } from './privateChat';
import { handleDoneHashtag } from './hashtagHandlers';

export const initBot = () => {
  let bot: Telegraf | null = null;

  if (process.env.DEVELOPMENT_MODE) {
    bot = new Telegraf(process.env.BOT_TOKEN_DEV);
  } else {
    const {
      BOT_TOKEN,
      PORT = 3000,
      URL = 'https://clockwork-kottan-bot.herokuapp.com/',
    } = process.env;

    bot = new Telegraf(BOT_TOKEN);
    bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
    //@ts-expect-error we need to listen port or heroku will kill the app
    bot.startWebhook(`/bot${BOT_TOKEN}`, null, Number(PORT));
  }

  bot.start((ctx) => {
    ctx.reply(welcomeMessage);
  });

  // TODO: Order matters
  handleDoneHashtag(bot);
  handlePrivateChat(bot);

  return bot;
};
