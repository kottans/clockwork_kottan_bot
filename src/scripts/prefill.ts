import 'dotenv/config';
import { readFile } from 'fs/promises';
import { trimDashSymbols } from '../helpers';
import { insertToSupabase } from '../supabase';

async function main() {
  const file = await readFile(process.argv[2], 'utf-8');
  const json = JSON.parse(file);

  const doneRawMessages = json.messages.map((message) => {
    let doneIndex = message.text?.findIndex?.(
      (part) => part?.type === 'hashtag' && part.text === '#done'
    );
    if (!doneIndex || doneIndex < 1) return null;

    let textBeforeDone = message.text[doneIndex - 1];
    let cleanTextBeforeDone = trimDashSymbols(textBeforeDone);
    return {
      groupId: -1 * json.id,
      groupName: json.name,
      userId: message.from_id.replace('user', ''),
      userName: message.from,
      textBeforeDone: cleanTextBeforeDone,
      timestamp: new Date(message.date_unixtime * 1000),
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
