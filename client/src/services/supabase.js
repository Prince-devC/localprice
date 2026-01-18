import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing: REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY');
  supabase = {
    auth: {
      getSession: async () => ({
        data: { session: null },
        error: new Error('Supabase non configuré'),
      }),
      signInWithPassword: async () => ({
        data: null,
        error: new Error('Supabase non configuré'),
      }),
      signUp: async () => ({
        data: null,
        error: new Error('Supabase non configuré'),
      }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
      updateUser: async () => ({
        data: null,
        error: new Error('Supabase non configuré'),
      }),
      signOut: async () => ({
        error: new Error('Supabase non configuré'),
      }),
    },
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
