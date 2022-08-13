import type { Telegraf, Context } from 'telegraf';
import type { TaskDoneRecord } from '../../global.types';
import { getTextsBeforeDones } from '../../helpers';
import { insertToSupabase } from '../../supabase';

const isTrustedGroup = (chatId: number) => {
  const chatIds = {
    feStudents: -1001382428271,
    dev: -1001655806824,
  };

  return Object.values(chatIds).includes(chatId);
};

const createDoneRecords = (ctx: Context): TaskDoneRecord[] => {
  if (!('message' in ctx.update) || !('text' in ctx.update.message)) {
    return;
  }
  const { from, chat, text, date, entities } = ctx.update.message;
  let textsBeforeDone = getTextsBeforeDones(text);
  if (textsBeforeDone.length === 0) {
    textsBeforeDone = [text];
  }
  let urlEntity = entities.find((entity) => entity.type === 'url');
  let url;
  if (urlEntity) {
    url = text.substring(urlEntity.offset, urlEntity.offset + urlEntity.length);
  }

  return textsBeforeDone.map((textBeforeDone) => ({
    groupId: chat.id,
    groupName: 'title' in chat ? chat.title : null,
    userId: from.id,
    userName: from.first_name + (from.last_name ? ` ${from.last_name}` : ``),
    textBeforeDone,
    timestamp: new Date(date * 1000),
    messageHash: `${Math.abs(from.id)}+${date}+${textBeforeDone}`,
    url,
  }));
};

export const handleDoneHashtag = (bot: Telegraf) => {
  bot.hashtag('done', (ctx) => {
    if (process.env.IS_DEVELOPMENT || isTrustedGroup(ctx.message.chat.id)) {
      const doneRecords = createDoneRecords(ctx);
      insertToSupabase(doneRecords);
    }
  });
};
