import 'dotenv/config';
import { readFile } from 'fs/promises';
import { getTextsBeforeDones } from '../helpers';
import { insertToSupabase } from '../supabase';

interface TgJsonExport {
  name: string;
  id: number;
  messages: [
    {
      date_unixtime: string;
      from?: string;
      from_id?: string;
      text: string | Array<string | { type: string; text: string }>;
    }
  ];
}

async function main() {
  const file = await readFile(process.argv[2], 'utf-8');
  const json: TgJsonExport = JSON.parse(file);

  const doneRawMessages = json.messages.map((message) => {
    if (typeof message.text === 'string') {
      return null;
    }

    let stringifiedText = message.text
      .map((part) => {
        return typeof part === 'string' ? part : part.text;
      })
      .join('');
    if (!stringifiedText.includes('#done')) {
      return null;
    }

    let textsBeforeDone = getTextsBeforeDones(stringifiedText);
    if (textsBeforeDone.length === 0) {
      return null;
    }

    return textsBeforeDone.map((textBeforeDone) => ({
      groupId: -json.id,
      groupName: json.name,
      userId: Number(message.from_id.replace('user', '')),
      userName: message.from,
      textBeforeDone,
      timestamp: new Date(Number(message.date_unixtime) * 1000),
      messageHash: `${message.from_id.replace('user', '')}+${
        message.date_unixtime
      }+${textBeforeDone}`,
    }));
  });
  const doneMessages = doneRawMessages.filter((m) => m !== null);

  // Inserting separately to avoid error for *all* messages if only *one* message is duplicated.
  doneMessages.forEach((message) => insertToSupabase(message));
}

main();
