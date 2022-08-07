import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { TaskDoneRecord } from './global.types';

const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_TABLE } = process.env;
let supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function insertToSupabase(
  records: TaskDoneRecord | TaskDoneRecord[]
): Promise<void> {
  try {
    const { data, error } = await supabase.from(SUPABASE_TABLE).insert(records);
    if (data) {
      console.log('Inserted to Supabase:', data);
    }
    if (error) {
      throw error;
    }
  } catch (e) {
    console.log('Error inserting to Supabase:', e);
  }
}
