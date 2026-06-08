import React, { useState, useEffect } from 'react';
import { BirthdayItem, CATEGORIES, BirthDayCategory } from '../types';
import { X, Calendar, User, FileText, Gift, Info } from 'lucide-react';

interface AddBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<BirthdayItem, 'id'> & { id?: string }) => void;
  editItem?: BirthdayItem | null;
}

export default function AddBirthdayModal({ isOpen, onClose, onSave, editItem }: AddBirthdayModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<BirthDayCategory>('family');
  const [notes, setNotes] = useState('');
  const [noYear, setNoYear] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDate(editItem.date);
      setCategory(editItem.category);
      setNotes(editItem.notes || '');
      
      // If the year is 2000 or similar placeholder, let's treat it based on your standard
      const year = editItem.date.split('-')[0];
      if (year === '2000') {
        setNoYear(true);
      } else {
        setNoYear(false);
      }
    } else {
      // Set to today's date formatted as YYYY-MM-DD
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localToday = new Date(today.getTime() - (offset*60*1000));
      setDate(localToday.toISOString().split('T')[0]);
      setName('');
      setCategory('family');
      setNotes('');
      setNoYear(false);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    let finalDate = date;
    if (noYear) {
      // Overwrite year with 2000 as our marker for "year unknown"
      const [, m, d] = date.split('-');
      finalDate = `2000-${m}-${d}`;
    }

    onSave({
      name: name.trim(),
      date: finalDate,
      category,
      notes: notes.trim(),
      ...(editItem ? { id: editItem.id } : {})
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#FFDE59] px-6 py-4 border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white border-2 border-black rounded-lg">
              <Gift className="w-6 h-6 text-black animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-black tracking-tight font-sans uppercase">
              {editItem ? 'Editar Data Especial' : 'Cadastrar Data'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white rounded-lg transition text-black"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <User className="w-4 h-4 text-black stroke-[2.5]" />
              Nome da Pessoa / Título do Evento
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mãe Querida, Ayrton Senna, Bodas de Prata..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-3 border-black rounded-lg px-4 py-3 text-black font-extrabold focus:outline-none focus:bg-[#FFDE59]/10 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
              Dia e Mês de Nascimento / Lembrete
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border-3 border-black rounded-lg px-4 py-3 text-black font-extrabold focus:outline-none focus:bg-[#FFDE59]/10 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            />

            {/* Checkbox for No Year */}
            <label className="flex items-center gap-2.5 pt-1.5 text-black hover:text-black cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={noYear}
                onChange={(e) => setNoYear(e.target.checked)}
                className="w-4 h-4 rounded text-black border-2 border-black focus:ring-black accent-black scale-110"
              />
              <span className="font-extrabold uppercase tracking-tight text-[11px]">Ocultar o ano / Não sei o ano (Mostra apenas dia/mês)</span>
            </label>
          </div>

          {/* Category Selector (Vibrant Radio Cards) */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-black block">
              Selecione a Categoria:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(CATEGORIES) as BirthDayCategory[]).map((catKey) => {
                const info = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`flex flex-col text-left p-3.5 rounded-lg border-2 transition-all duration-150 cursor-pointer ${
                      isSelected 
                        ? `${info.colorClass} border-4 border-black text-black scale-[1.01] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` 
                        : 'border-2 border-slate-350 bg-white hover:bg-slate-50 text-black'
                    }`}
                  >
                    <span className="font-black uppercase text-xs tracking-wider mb-1 text-black">
                      {info.label}
                    </span>
                    <span className="text-[10px] text-black/75 font-semibold leading-tight">
                      {catKey === 'family' && 'Parentes e primos'}
                      {catKey === 'friend' && 'Amigos próximos'}
                      {catKey === 'famous' && 'Cantores, ídolos ou heróis'}
                      {catKey === 'reminder' && 'Lembretes e datas importantes'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-black stroke-[2.5]" />
              Observações / Dicas de Presente / Descrição (Opcional)
            </label>
            <textarea
              placeholder="Ex: Gosta de ficção científica, café expresso ou chocolate amargo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border-3 border-black rounded-lg p-4 text-black font-semibold focus:outline-none focus:bg-[#FFDE59]/10 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
        </form>

        {/* Modal Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t-4 border-black flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border-2 border-black text-black font-black uppercase tracking-wider text-xs rounded-lg hover:bg-black hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-black text-white hover:bg-white hover:text-black font-black uppercase tracking-wider text-xs px-6 py-2.5 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {editItem ? 'Salvar Data ✔' : 'Salvar Evento +'}
          </button>
        </div>

      </div>
    </div>
  );
}
