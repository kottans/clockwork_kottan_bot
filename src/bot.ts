import { Telegraf } from 'telegraf';
import {
  keyboard,
  faq,
  lastQuestion,
  letMeOut,
  lastMessage,
  botReplies,
} from './translations';

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

export const createFaqLoop = (bot: Telegraf) => {
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

    ctx.reply(botReplies.proposeAnswers, getReplyKeyboard(replyKeyboard));
  });

  bot.hears(letMeOut, (ctx) => {
    ctx.reply(lastMessage);
  });
};

export const requestCaptcha = (bot: Telegraf) => {
  bot.on('message', async (ctx) => {
    //@ts-expect-error bad types
    const { voice } = ctx.message;

    if (voice && !hasPassedCheck) {
      ctx.reply(
        botReplies.successCaptcha,
        getReplyKeyboard(questions[currentQuestion])
      );

      hasPassedCheck = true;
    }

    if (!voice && !hasPassedCheck) {
      ctx.reply(botReplies.repeatCaptchaRequest);
    }
  });
};
