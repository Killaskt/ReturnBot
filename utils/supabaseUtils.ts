import { createClient } from '@supabase/supabase-js';
import { EXPO_SUPABASE_URL, EXPO_SUPABASE_KEY } from '@env';

// Initialize Supabase client
const supabaseUrl = EXPO_SUPABASE_URL!;
const supabaseKey = EXPO_SUPABASE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Updated function to save a reminder to Supabase with the new schema
export async function saveReminderToSupabase(
    userId: string,
    store: string,
    lastReturnDate: string,
    itemType: string | null = null
  ) {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ user_id: userId, store, last_return_date: lastReturnDate, item_type: itemType }]);
  
    if (error) {
      console.error('Error saving reminder to Supabase:', error);
      throw error;
    }
  
    return data;
  }

export async function getCurrentUser() {
  const { data: session, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session?.user || null;
}