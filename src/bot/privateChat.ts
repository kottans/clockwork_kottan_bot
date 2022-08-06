import { Telegraf } from 'telegraf';
import {
  botReplies,
  faq,
  keyboard,
  lastMessage,
  lastQuestion,
  letMeOut,
} from './translations';

const questions = Object.keys(faq);
let currentQuestion = 0;

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

const createFaqLoop = (bot: Telegraf) => {
  bot.hears(questions, (ctx) => {
    ctx.reply(
      JSON.stringify({
        isLast: questions[currentQuestion],
        answer: faq[ctx.message.text],
      })
    );

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

const requestCaptcha = (bot: Telegraf) => {
  let hasPassedCheck = false;

  return new Promise((resolve) => {
    bot.on('message', async (ctx) => {
      //@ts-expect-error bad types
      const { voice, chat } = ctx.message;

      if (chat.type !== 'private') {
        return;
      }

      if (voice && !hasPassedCheck) {
        ctx.reply(
          botReplies.successCaptcha,
          getReplyKeyboard(questions[currentQuestion])
        );

        hasPassedCheck = true;

        createFaqLoop(bot);
        resolve(hasPassedCheck);
      }

      if (!voice && !hasPassedCheck) {
        ctx.reply(botReplies.repeatCaptchaRequest);
      }
    });
  });
};

export const handlePrivateChat = async (bot: Telegraf) => {
  const hasPassedCaptcha = await requestCaptcha(bot);

  if (hasPassedCaptcha) {
    createFaqLoop(bot);
  }
};
