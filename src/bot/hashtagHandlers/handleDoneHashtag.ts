import type { Telegraf } from 'telegraf';

const isTrustedGroup = (chatId: number) => {
  const chatIds = {
    feStudents: -1001655806824,
    dev: -1001655806824,
  };

  return Object.values(chatIds).includes(chatId);
};

export const handleDoneHashtag = (bot: Telegraf) => {
  bot.hashtag('done', (ctx) => {
    if (isTrustedGroup(ctx.message.chat.id)) {
      ctx.reply(JSON.stringify(ctx.message));
    }
  });
};
