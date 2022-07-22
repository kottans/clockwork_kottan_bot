import { Context, Scenes, Telegraf } from 'telegraf';
import { keyboard, faq } from './faq';

const totalSteps = Object.keys(faq).length;
const questions = Object.values(keyboard);

export const createWelcomeScene = (bot: Telegraf) => {
  let currentQuestion = 0;
  const scene = new Scenes.BaseScene('WELCOME_SCENE');

  scene.start((ctx) => {
    ctx.reply('start');
  });

  scene.enter(async (sceneContext) => {
    sceneContext.reply(
      'Отлично! Прослушаю ее я немного позже. Много чего надо успеть. Тебя наверное мучает самый главный вопрос?',
      {
        reply_markup: {
          keyboard: [[questions[currentQuestion]]],
        },
      }
    );

    scene.hears(Object.keys(faq), (ctx) => {
      if (currentQuestion === totalSteps) {
        //@ts-expect-error
        ctx.scene.leave();
      }

      currentQuestion++;

      ctx.reply(faq[ctx.message.text], {
        reply_markup: {
          keyboard: [[questions[currentQuestion]]],
        },
      });
    });
  });

  return scene;
};
