import type { Telegraf, Context } from 'telegraf';
import type { TaskDoneRecord } from '../../global.types';
import { trimDashSymbols } from '../../helpers';
import { insertToSupabase } from '../../supabase';

const isTrustedGroup = (chatId: number) => {
  const chatIds = {
    feStudents: -1001655806824,
    dev: -1001655806824,
  };

  return Object.values(chatIds).includes(chatId);
};

const formDoneRecord = (ctx: Context): TaskDoneRecord => {
  if (!('message' in ctx.update) || !('text' in ctx.update.message)) return;
  const { from, chat, text, date } = ctx.update.message;
  const textBeforeDone: string = text.split('#done')[0];
  const cleanTextBeforeDone: string = trimDashSymbols(textBeforeDone);

  return {
    groupId: chat.id,
    groupName: 'title' in chat ? chat.title : null,
    userId: from.id,
    userName: from.first_name + (from.last_name ? ` ${from.last_name}` : ``),
    textBeforeDone: cleanTextBeforeDone,
    timestamp: new Date(date * 1000),
    messageHash: `${Math.abs(from.id)}+${date}`,
  };
};

export const handleDoneHashtag = (bot: Telegraf) => {
  bot.hashtag('done', (ctx) => {
    if (isTrustedGroup(ctx.message.chat.id)) {
      const doneRecord = formDoneRecord(ctx);
      insertToSupabase(doneRecord);
    }
  });
};
