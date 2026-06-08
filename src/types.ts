export type BirthDayCategory = 'family' | 'friend' | 'famous' | 'reminder';

export interface BirthdayItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  category: BirthDayCategory;
  notes?: string;
  color?: string; // Tailwind background/border accent class
  created_at?: string;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasKey: boolean;
}

export const CATEGORIES: Record<
  BirthDayCategory,
  {
    label: string;
    icon: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    badgeClass: string;
  }
> = {
  family: {
    label: 'Família',
    icon: 'Heart',
    colorClass: 'bg-[#FF70A6]',
    bgClass: 'bg-[#FF70A6]/10',
    borderClass: 'border-black',
    textClass: 'text-black',
    badgeClass: 'bg-[#FF70A6] text-black border-black',
  },
  friend: {
    label: 'Amigo(a)',
    icon: 'Smile',
    colorClass: 'bg-[#00C2FF]',
    bgClass: 'bg-[#00C2FF]/10',
    borderClass: 'border-black',
    textClass: 'text-black',
    badgeClass: 'bg-[#00C2FF] text-black border-black',
  },
  famous: {
    label: 'Pessoa Famosa',
    icon: 'Sparkles',
    colorClass: 'bg-[#70D6FF]',
    bgClass: 'bg-[#70D6FF]/10',
    borderClass: 'border-black',
    textClass: 'text-black',
    badgeClass: 'bg-[#70D6FF] text-black border-black',
  },
  reminder: {
    label: 'Lembrete Especial',
    icon: 'CalendarDays',
    colorClass: 'bg-[#FF9770]',
    bgClass: 'bg-[#FF9770]/10',
    borderClass: 'border-black',
    textClass: 'text-black',
    badgeClass: 'bg-[#FF9770] text-[#1A1A1A] border-black',
  },
};
