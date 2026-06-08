import { createClient } from '@supabase/supabase-js';
import { BirthdayItem } from './types';

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  supabaseAnonKey.trim() !== '' && 
  supabaseAnonKey !== 'MY_SUPABASE_KEY';

// Initialize the Supabase client if configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial dummy data for the user to see the app fully working upon first launch
const INITIAL_SAMPLE_DATA: BirthdayItem[] = [
  {
    id: 'sample-1',
    name: 'Ayrton Senna',
    date: '1960-03-21',
    category: 'famous',
    notes: 'O maior piloto de Fórmula 1 de todos os tempos 🏎️',
    color: 'bg-indigo-500'
  },
  {
    id: 'sample-2',
    name: 'Mãe Querida 🌸',
    date: '1975-06-12',
    category: 'family',
    notes: 'Comprar um bouquet de flores e bolo de morango!',
    color: 'bg-rose-500'
  },
  {
    id: 'sample-3',
    name: 'Lucas (Melhor Amigo)',
    date: '1998-09-04',
    category: 'friend',
    notes: 'Combinar churrasco com a galera do colégio! 🍖',
    color: 'bg-emerald-500'
  },
  {
    id: 'sample-4',
    name: 'Santos Dumont',
    date: '1873-07-20',
    category: 'famous',
    notes: 'Pai da aviação brasileira ✈️',
    color: 'bg-indigo-500'
  },
  {
    id: 'sample-5',
    name: 'Renovação do Seguro do Carro',
    date: '2026-11-15',
    category: 'reminder',
    notes: 'Mudar de corretora se o preço estiver muito alto',
    color: 'bg-amber-500'
  },
  {
    id: 'sample-6',
    name: 'Vó Maria 👵',
    date: '1948-12-25',
    category: 'family',
    notes: 'Aniversário no dia de Natal! Mandar mensagem cedo.',
    color: 'bg-rose-500'
  }
];

// Helper to interact with the active database (Supabase or LocalStorage)
export const db = {
  getSupabaseConfig: () => ({
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  }),

  getBirthdays: async (): Promise<BirthdayItem[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('birthdays')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;
        return (data || []) as BirthdayItem[];
      } catch (err) {
        console.warn('Erro ao carregar dados do Supabase, utilizando LocalStorage como fallback:', err);
        return db.getLocalBirthdays();
      }
    } else {
      return db.getLocalBirthdays();
    }
  },

  getLocalBirthdays: (): BirthdayItem[] => {
    const list = localStorage.getItem('birthday_items');
    if (!list) {
      localStorage.setItem('birthday_items', JSON.stringify(INITIAL_SAMPLE_DATA));
      return INITIAL_SAMPLE_DATA;
    }
    try {
      return JSON.parse(list) as BirthdayItem[];
    } catch {
      return INITIAL_SAMPLE_DATA;
    }
  },

  addBirthday: async (item: Omit<BirthdayItem, 'id'>): Promise<BirthdayItem> => {
    const newItem: BirthdayItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('birthdays')
          .insert([newItem])
          .select();

        if (error) throw error;
        if (data && data[0]) return data[0] as BirthdayItem;
      } catch (err) {
        console.error('Erro ao salvar no Supabase, salvando apenas localmente:', err);
      }
    }

    // Always keep LocalStorage updated as backup or master of local state
    const current = db.getLocalBirthdays();
    const updated = [newItem, ...current];
    localStorage.setItem('birthday_items', JSON.stringify(updated));
    return newItem;
  },

  deleteBirthday: async (id: string): Promise<boolean> => {
    let success = true;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('birthdays')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Erro ao deletar no Supabase, deletando localmente:', err);
        success = false;
      }
    }

    const current = db.getLocalBirthdays();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem('birthday_items', JSON.stringify(updated));
    return success;
  },

  updateBirthday: async (updatedItem: BirthdayItem): Promise<BirthdayItem> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('birthdays')
          .update(updatedItem)
          .eq('id', updatedItem.id)
          .select();

        if (error) throw error;
        if (data && data[0]) return data[0] as BirthdayItem;
      } catch (err) {
        console.error('Erro ao atualizar no Supabase, atualizando localmente:', err);
      }
    }

    const current = db.getLocalBirthdays();
    const updated = current.map(item => item.id === updatedItem.id ? updatedItem : item);
    localStorage.setItem('birthday_items', JSON.stringify(updated));
    return updatedItem;
  },

  // Helper to re-sync local data to Supabase (useful when they supply keys)
  syncLocalToSupabase: async (): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, count: 0, error: 'Supabase não está configurado nas variáveis de ambiente!' };
    }

    try {
      const localItems = db.getLocalBirthdays();
      if (localItems.length === 0) return { success: true, count: 0 };

      // Get current supabase IDs to avoid duplicates
      const { data: remoteData, error: fetchError } = await supabase
        .from('birthdays')
        .select('id');

      if (fetchError) throw fetchError;
      const remoteIds = new Set((remoteData || []).map(r => r.id));

      const toInsert = localItems.filter(item => !remoteIds.has(item.id));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('birthdays')
          .insert(toInsert);

        if (insertError) throw insertError;
      }

      return { success: true, count: toInsert.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || JSON.stringify(err) };
    }
  }
};
