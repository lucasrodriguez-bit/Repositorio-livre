import React, { useState } from 'react';
import { BirthdayItem, CATEGORIES } from '../types';
import { getBirthdayMetadata, MONTHS_BR } from '../dateHelpers';
import { 
  Heart, 
  Smile, 
  Sparkles, 
  CalendarDays, 
  Trash2, 
  Pencil, 
  Share2, 
  Gift,
  Check,
  Calendar
} from 'lucide-react';

interface BirthdayCardProps {
  key?: string;
  item: BirthdayItem;
  onDelete: (id: string) => any;
  onEdit: (item: BirthdayItem) => void;
}

export default function BirthdayCard({ item, onDelete, onEdit }: BirthdayCardProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const metadata = getBirthdayMetadata(item.date);
  const categoryInfo = CATEGORIES[item.category];

  // Helper to get Category Icon component
  const getIcon = () => {
    switch (item.category) {
      case 'family':
        return <Heart className="w-5 h-5" />;
      case 'friend':
        return <Smile className="w-5 h-5" />;
      case 'famous':
        return <Sparkles className="w-5 h-5" />;
      case 'reminder':
        return <CalendarDays className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  // Generate a customized congratulatory message to send
  const getShareText = () => {
    if (item.category === 'reminder') {
      return `Lembrete Importante 📅: "${item.name}" está chegando! Data: ${metadata.formattedShortDate}. Notas: ${item.notes || 'Sem observações.'}`;
    }
    
    const ageText = metadata.ageNext ? ` que celebrará ${metadata.ageNext} anos!` : '!';
    let base = `Parabéns, ${item.name}! 🥳🎂\n`;
    if (item.category === 'family') {
      base += `Desejo um feliz aniversário para a pessoa mais especial da família${ageText} Que seu dia seja cheio de carinho, paz, doces e muitas realizações. Amo você! ❤️👵👨‍👩‍👧`;
    } else if (item.category === 'friend') {
      base += `Feliz aniversário, meu amigo do peito${ageText} Desejo muita cerveja gelada, festa, saúde, paz, dindin no bolso e conquistas infinitas. Obrigado por sua parceria! 🍻🔥🚀`;
    } else {
      base += `Hoje é aniversário de uma das minhas inspirações: ${item.name}! Desejo mais sucesso, luz e realizações. Parabéns por ser um exemplo para todos nós! ✨🏆`;
    }
    return base;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(getShareText());
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  // Determine interactive tags for remaining days
  const renderCountdown = () => {
    if (metadata.isToday) {
      return (
        <span className="bg-[#FF70A6] text-black font-black text-xs px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider flex items-center gap-1.5 self-start">
          <span className="text-sm">🎉</span> HOJE! 🎉
        </span>
      );
    }
    if (metadata.isTomorrow) {
      return (
        <span className="bg-[#FF9770] text-black font-black text-xs px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider flex items-center gap-1.5 self-start">
          <span>🎂</span> AMANHÃ! 🎂
        </span>
      );
    }
    if (metadata.daysRemaining <= 10) {
      return (
        <span className="bg-[#FFDE59] text-black font-black text-xs px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider self-start">
          FALTAM {metadata.daysRemaining} DIAS! 🚀
        </span>
      );
    }
    return (
      <span className="bg-white text-black font-bold text-[10px] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider self-start">
        Faltam {metadata.daysRemaining} dias
      </span>
    );
  };

  // Separate day and month from birthday
  const [, monthStr, dayStr] = item.date.split('-');
  const displayDayMonth = `${dayStr}/${monthStr}`;

  return (
    <div 
      className={`relative flex flex-col bg-white rounded-xl p-6 border-4 border-black ${
        metadata.isToday 
          ? 'shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-[#FFDE59]/20' 
          : 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1'
      } transition-all duration-200 overflow-hidden`}
    >
      {/* Background decoration for today's birthday in retro/brutalist style */}
      {metadata.isToday && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-[#FFDE59]/10 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Header with Category Badge and Edit/Delete controls */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border-2 ${categoryInfo.badgeClass}`}>
          {getIcon()}
          {categoryInfo.label.toUpperCase()}
        </span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-black hover:bg-slate-100 border-2 border-transparent hover:border-black rounded-lg transition duration-150"
            title="Editar aniversário"
          >
            <Pencil className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Deseja mesmo remover a data de "${item.name}"?`)) {
                onDelete(item.id);
              }
            }}
            className="p-2 text-rose-600 hover:bg-rose-50 border-2 border-transparent hover:border-black rounded-lg transition duration-150"
            title="Excluir do calendário"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow space-y-4">
        <h4 className="text-3xl font-black text-black tracking-tighter leading-none uppercase font-sans break-words select-all">
          {item.name}
        </h4>

        {/* Date Display Section with big colorful date circle */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border-2 border-black">
          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg text-black font-black text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${categoryInfo.colorClass}`}>
            <span className="text-[10px] leading-none opacity-90 uppercase tracking-widest font-mono">
              {MONTHS_BR[parseInt(monthStr, 10) - 1].slice(0, 3)}
            </span>
            <span className="text-2xl leading-none font-bold mt-1">
              {parseInt(dayStr, 10)}
            </span>
          </div>

          <div className="flex-grow">
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 uppercase tracking-wider font-extrabold leading-none mb-1">
              <Calendar className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              Dia & Mês
            </p>
            <p className="text-sm font-black text-black leading-tight uppercase tracking-tight">
              {metadata.formattedDate}
            </p>
          </div>
        </div>

        {/* Zodiac and Notes Section */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span 
            className="inline-flex items-center gap-1 bg-white border-2 border-black px-2.5 py-1 rounded-lg text-black font-extrabold"
            title="Zodíaco"
          >
            <span className={metadata.zodiac.color}>{metadata.zodiac.emoji}</span>
            <span className="uppercase tracking-tight">{metadata.zodiac.name}</span>
          </span>

          <span 
            className="bg-[#00C2FF]/10 text-black border-2 border-black px-2.5 py-1 rounded-lg font-black font-mono uppercase tracking-wider"
            title="Data original cadastrada"
          >
            🗓️ {displayDayMonth}
          </span>
        </div>

        {item.notes && (
          <div className="text-xs text-black bg-white p-3.5 rounded-lg border-2 border-black border-l-[6px] border-l-black font-medium leading-relaxed break-words shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            "{item.notes}"
          </div>
        )}
      </div>

      {/* Footer Countdown with actions */}
      <div className="mt-5 pt-4 border-t-2 border-black flex items-center justify-between gap-2 flex-wrap">
        {renderCountdown()}

        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-lg border-2 border-black transition-all duration-150 cursor-pointer ${
            copiedMessage 
              ? 'bg-emerald-300 text-black shadow-none translate-x-[2px] translate-y-[2px]' 
              : 'bg-white text-black hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
          }`}
          title="Copiar mensagem pronta para dar parabéns ou detalhes"
        >
          {copiedMessage ? (
            <>
              <Check className="w-4 h-4 text-black stroke-[3px]" />
              <span className="uppercase font-extrabold">Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span className="uppercase font-extrabold">{item.category === 'reminder' ? 'Copiar Info' : 'Mensagem Festa'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
