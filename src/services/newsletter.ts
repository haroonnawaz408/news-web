import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const LOCAL_SUBSCRIBERS_KEY = 'techpulse_local_subscribers';

function getLocalSubscribers(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_SUBSCRIBERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Error reading subscribers:', err);
  }
  return ['reader@example.com', 'developer@techpulse.dev'];
}

function saveLocalSubscribers(list: string[]) {
  try {
    localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving subscribers:', err);
  }
}

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await (supabase.from('newsletter_subscribers') as any)
        .insert({ email: cleanEmail });

      if (error) {
        if (error.code === '23505') {
          // Unique violation
          return { success: false, message: 'This email is already subscribed to PulseNews.' };
        }
        throw error;
      }

      return { success: true, message: 'Welcome to PulseNews Pakistan! You have successfully subscribed.' };
    } catch (err) {
      console.warn('Supabase subscribe error, falling back to local storage:', err);
    }
  }

  // Local storage fallback
  const subscribers = getLocalSubscribers();
  if (subscribers.includes(cleanEmail)) {
    return { success: false, message: 'This email is already subscribed to PulseNews.' };
  }

  subscribers.push(cleanEmail);
  saveLocalSubscribers(subscribers);
  return { success: true, message: 'Welcome to PulseNews Pakistan! You have successfully subscribed.' };
}

export async function getSubscribersCount(): Promise<number> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.warn('Supabase subscriber count error:', err);
    }
  }

  return getLocalSubscribers().length;
}
