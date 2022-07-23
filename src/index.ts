import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { keyboard, faq, lastQuestion, letMeOut, lastMessage } from './faq';

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
//@ts-expect-error we need to liestn port or heroku will kill the app
bot.startWebhook(`/bot${BOT_TOKEN}`, null, Number(PORT));

const questions = Object.keys(faq);
let currentQuestion = 0;
let hasPassedCheck = false;

const getReplyKeyboard = (keyboardSource: Array<Array<string>> | string) => {
  const keyboard =
    typeof keyboardSource === 'string' ? [[keyboardSource]] : keyboardSource;

  return {
    reply_markup: {
      keyboard,
    },
    resize_keyboard: true,
  };
};

const welcomeMessage = `
Привет!

Я Заводной Коттан и я тут, чтобы помочь тебе начать обучение на нашем курсе.

Для начала, мне нужно, чтобы ты подтвердил, что ты живой. Времена такие, сам понимаешь.

Отправь голосовушку с текстом: "Я хочу стать крутым разработчиком!"`;

bot.start((ctx) => {
  ctx.reply(welcomeMessage);
});

bot.hears(questions, (ctx) => {
  if (!questions[currentQuestion]) {
    ctx.reply(faq[ctx.message.text]);
    return;
  }

  currentQuestion++;

  const nextQuestion = questions[currentQuestion] || lastQuestion;

  ctx.reply(faq[ctx.message.text], getReplyKeyboard(nextQuestion));
});

bot.hears(lastQuestion, (ctx) => {
  const replyKeyboard: Array<Array<string>> = [];
  const questions = Object.values(keyboard);

  for (let i = 0; i < questions.length; i += 2) {
    replyKeyboard.push([questions[i], questions[i + 1] || letMeOut]);
  }

  ctx.reply(
    'Я готов повторить ответы. Хочешь?',
    getReplyKeyboard(replyKeyboard)
  );
});

bot.hears(letMeOut, (ctx) => {
  ctx.reply(lastMessage);
});

bot.on('message', async (ctx) => {
  //@ts-expect-error bad types
  const { voice } = ctx.message;

  if (voice && !hasPassedCheck) {
    ctx.reply(
      'Отлично! Прослушаю ее я немного позже. Много чего надо успеть. Тебя наверное мучает самый главный вопрос?',
      getReplyKeyboard(questions[currentQuestion])
    );

    hasPassedCheck = true;
  }

  if (!voice && !hasPassedCheck) {
    ctx.reply(
      'Отлично! Но я не смогу тебе доверять до того как ты отправишь голосовое сообщение. ;)'
    );
  }
});

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
