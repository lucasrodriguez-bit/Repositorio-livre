export interface BirthdayMetadata {
  daysRemaining: number;
  isToday: boolean;
  isTomorrow: boolean;
  ageNext: number | null;
  formattedDate: string;
  formattedShortDate: string;
  zodiac: { name: string; emoji: string; color: string };
}

// Brazilian Month Names
export const MONTHS_BR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

// Zodiac Signs
export function getZodiacSign(day: number, month: number): { name: string; emoji: string; color: string } {
  // Month is 1-indexed (1 = Jan, 12 = Dec)
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: 'Áries', emoji: '♈', color: 'text-red-500' };
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: 'Touro', emoji: '♉', color: 'text-green-600' };
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: 'Gêmeos', emoji: '♊', color: 'text-yellow-500' };
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: 'Câncer', emoji: '♋', color: 'text-blue-500' };
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: 'Leão', emoji: '♌', color: 'text-orange-500' };
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: 'Virgem', emoji: '♍', color: 'text-emerald-700' };
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: 'Libra', emoji: '♎', color: 'text-pink-500' };
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: 'Escorpião', emoji: '♏', color: 'text-red-700' };
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: 'Sagitário', emoji: '♐', color: 'text-indigo-500' };
  }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { name: 'Capricórnio', emoji: '♑', color: 'text-slate-600' };
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: 'Aquário', emoji: '♒', color: 'text-sky-500' };
  }
  return { name: 'Peixes', emoji: '♓', color: 'text-teal-500' };
}

// Calculate the next birthday metadata
export function getBirthdayMetadata(dateString: string): BirthdayMetadata {
  const parts = dateString.split('-');
  const year = parts[0] ? parseInt(parts[0], 10) : 2000;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Today's date with time set to midnight for clean comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Target birthday this year
  const bdayThisYear = new Date(today.getFullYear(), month - 1, day);
  
  let daysRemaining = 0;
  let birthdayDate = bdayThisYear;
  let upcomingYear = today.getFullYear();

  if (bdayThisYear.getTime() < today.getTime()) {
    // Already passed this year, next one will be next year
    upcomingYear = today.getFullYear() + 1;
    birthdayDate = new Date(upcomingYear, month - 1, day);
  }

  // Calculate difference in days
  const diffTime = birthdayDate.getTime() - today.getTime();
  daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isToday = daysRemaining === 0;
  // Handle tomorrow
  const isTomorrow = daysRemaining === 1;

  // Age the person will become next
  // Note: if user entered date with year 2000 or similar arbitrarily we will estimate if it has a real historical birth year.
  // Let's check if the entered year is at least 3 years before current year
  const hasRealYear = year > 1850 && year < today.getFullYear();
  const ageNext = hasRealYear ? (upcomingYear - year) : null;

  // Format short date: e.g. "12 Jun" or "12/06"
  const monthNameShort = MONTHS_BR[month - 1].slice(0, 3);
  const formattedShortDate = `${day} de ${monthNameShort}`;
  
  // Format long date with or without year
  const formattedDate = hasRealYear 
    ? `${day} de ${MONTHS_BR[month - 1]} de ${year} (faz ${ageNext ? ageNext - (upcomingYear - today.getFullYear() === 1 ? 1 : 0) : ''} anos)`
    : `${day} de ${MONTHS_BR[month - 1]}`;

  const zodiac = getZodiacSign(day, month);

  return {
    daysRemaining,
    isToday,
    isTomorrow,
    ageNext,
    formattedDate,
    formattedShortDate,
    zodiac,
  };
}

export function sortBirthdaysByUpcoming(items: any[]): any[] {
  return [...items].map(item => ({
    ...item,
    meta: getBirthdayMetadata(item.date),
  })).sort((a, b) => a.meta.daysRemaining - b.meta.daysRemaining);
}
