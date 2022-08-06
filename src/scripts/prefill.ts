import 'dotenv/config';
import { readFile } from 'fs/promises';
import { trimDashSymbols } from '../helpers';
import { insertToSupabase } from '../supabase';

interface TgJsonExport {
  name: string;
  id: number;
  messages: [
    {
      date_unixtime: string;
      from?: string;
      from_id?: string;
      text: '' | ['' | { type: string; text: string }];
    }
  ];
}

async function main() {
  const file = await readFile(process.argv[2], 'utf-8');
  const json: TgJsonExport = JSON.parse(file);

  const doneRawMessages = json.messages.map((message) => {
    if (!(message.text instanceof Array)) {
      return null;
    }
    let doneIndex = message.text?.findIndex?.((part) => {
      if (!(part instanceof Object)) {
        return false;
      }
      return part?.type === 'hashtag' && part.text === '#done';
    });
    if (!doneIndex || doneIndex < 1) {
      return null;
    }
    let textBeforeDone = message.text[doneIndex - 1];
    if (typeof textBeforeDone !== 'string') {
      return null;
    }
    let cleanTextBeforeDone = trimDashSymbols(textBeforeDone);
    return {
      groupId: -1 * json.id,
      groupName: json.name,
      userId: Number(message.from_id.replace('user', '')),
      userName: message.from,
      textBeforeDone: cleanTextBeforeDone,
      timestamp: new Date(Number(message.date_unixtime) * 1000),
      messageHash: `${message.from_id.replace('user', '')}+${
        message.date_unixtime
      }`,
    };
  });
  const doneMessages = doneRawMessages.filter((m) => m !== null);

  // Inserting separately to avoid error for *all* messages if only *one* message is duplicated.
  doneMessages.forEach((message) => insertToSupabase(message));
}

main();
