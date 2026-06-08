import React, { useState, useEffect } from 'react';
import { BirthdayItem, CATEGORIES, BirthDayCategory } from './types';
import { db } from './supabaseClient';
import { getBirthdayMetadata, MONTHS_BR } from './dateHelpers';
import BirthdayCard from './components/BirthdayCard';
import AddBirthdayModal from './components/AddBirthdayModal';
import SupabaseInfoTab from './components/SupabaseInfoTab';
import { 
  Gift, 
  Plus, 
  Search, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  CalendarDays, 
  Sparkles,
  RefreshCw,
  Heart,
  Smile,
  X,
  Calendar,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<BirthdayItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BirthDayCategory | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  
  // Modals / Tabs states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BirthdayItem | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'supabase'>('calendar');
  
  // Synchronization feedback states
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ count: number; success: boolean } | null>(null);

  const supabaseConfig = db.getSupabaseConfig();

  // Load birthdays on startup
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await db.getBirthdays();
      setItems(data);
    } catch (err) {
      console.error('Error fetching birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add or update birthday item
  const handleSaveBirthday = async (formData: Omit<BirthdayItem, 'id'> & { id?: string }) => {
    if (formData.id) {
      // Editing
      const updatedItem = await db.updateBirthday(formData as BirthdayItem);
      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    } else {
      // Creating
      const newItem = await db.addBirthday(formData);
      setItems(prev => [newItem, ...prev]);
    }
    setEditingItem(null);
  };

  // Delete birthday
  const handleDeleteBirthday = async (id: string) => {
    const success = await db.deleteBirthday(id);
    if (success) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Trigger edit modal
  const handleEditClick = (item: BirthdayItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Sync offline to Supabase
  const handleManualSync = async () => {
    if (!supabaseConfig.isConfigured) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await db.syncLocalToSupabase();
      if (res.success) {
        setSyncResult({ count: res.count, success: true });
        // Reload data from supabase
        setTimeout(async () => {
          await fetchData();
        }, 500);
      } else {
        setSyncResult({ count: 0, success: false });
      }
    } catch {
      setSyncResult({ count: 0, success: false });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 4000);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedMonth('all');
  };

  // Enriched items calculations (adding days remaining and date objects metadata)
  const enrichedItems = items.map(item => {
    const meta = getBirthdayMetadata(item.date);
    return {
      ...item,
      meta
    };
  });

  // Sort birthdays by upcoming days
  const sortedItems = enrichedItems.sort((a, b) => {
    // Pin today first, tomorrow second, then sort by days remaining
    return a.meta.daysRemaining - b.meta.daysRemaining;
  });

  // Apply filters in Memory
  const filteredItems = sortedItems.filter(item => {
    // 1. Text search
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    // 3. Month filter
    const [, monthStr] = item.date.split('-');
    const matchesMonth = selectedMonth === 'all' || parseInt(monthStr, 10) === selectedMonth;

    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Statistics summaries
  const todayBirthdays = sortedItems.filter(item => item.meta.isToday);
  const tomorrowBirthdays = sortedItems.filter(item => item.meta.isTomorrow);
  
  const countByCategory = {
    family: items.filter(i => i.category === 'family').length,
    friend: items.filter(i => i.category === 'friend').length,
    famous: items.filter(i => i.category === 'famous').length,
    reminder: items.filter(i => i.category === 'reminder').length,
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] font-sans text-black pb-16">
      
      {/* Top Banner / Hero with bright solid styling */}
      <header className="relative bg-white border-b-8 border-black overflow-hidden py-10 px-4">
        {/* Retro graphics decoration */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#00C2FF]/10 rounded-full blur-2xl" />
        <div className="absolute bottom-5 right-20 w-48 h-48 bg-[#FF70A6]/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="p-4 bg-[#FF70A6] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <Gift className="w-12 h-12 text-black stroke-[2.5] animate-bounce" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase text-black leading-none font-sans">
                B-DAY RADAR 🎂
              </h1>
              <p className="text-slate-800 text-xs font-bold uppercase tracking-wider mt-2.5 max-w-md">
                Gerencie todos os aniversários de forma prática, colorida e interativa. Cadastre e sincronize tudo no seu Supabase!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Supabase Status Pill */}
            <div 
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-2 px-4 py-3 border-4 border-black rounded-lg cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                supabaseConfig.isConfigured 
                  ? 'bg-[#00C2FF] text-black font-black' 
                  : 'bg-[#FF9770] text-black font-black'
              }`}
              title="Clique para ver o status da integração com o Supabase"
            >
              <Database className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-tight">
                {supabaseConfig.isConfigured ? 'Supabase Ligado' : 'Offline (Local)'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse ml-0.5" />
            </div>

            <button
              id="add-entry-btn"
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto bg-[#FF70A6] text-black font-black hover:bg-white uppercase tracking-wider text-sm border-4 border-black px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3px]" />
              <span>CADASTRAR DATA</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main body Container */}
      <main className="max-w-6xl mx-auto px-4 space-y-8 mt-8">

        {/* Sync Prompt Banner for Local/Connected Users */}
        {supabaseConfig.isConfigured && items.length > 0 && (
          <div className="bg-black text-white p-5 rounded-lg border-4 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FFDE59] text-black border-2 border-black rounded-lg">
                <RefreshCw className={`w-5 h-5 stroke-[2.5] ${syncing ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-[#FFDE59]">Sincronização com o Supabase disponível</p>
                <p className="text-xs text-slate-300">Quer salvar todos os aniversários cadastrados localmente na nuvem agora?</p>
              </div>
            </div>
            
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="bg-[#00C2FF] text-black border-2 border-black hover:bg-white disabled:opacity-50 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>{syncing ? 'Sincronizando...' : 'SINCRONIZAR AGORA'}</span>
            </button>
          </div>
        )}

        {/* Alert result status */}
        {syncResult && (
          <div className={`p-4 border-4 border-black rounded-lg text-sm font-black uppercase tracking-wide flex items-center gap-3 animate-fade-in shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            syncResult.success ? 'bg-emerald-300 text-black' : 'bg-[#FF9770] text-black'
          }`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-black stroke-[2.5]" />
            <span>
              {syncResult.success 
                ? `Sucesso! Sincronizados ${syncResult.count} aniversários locais com o seu banco Supabase.`
                : 'Erro ao sincronizar. Certifique-se de preencher os Secrets corretos e criar a tabela!'}
            </span>
          </div>
        )}

        {/* Simple Navigation menu for Calendar and Setup */}
        <div className="flex border-b-4 border-black gap-2 mb-4">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-5 py-3 font-black text-xs uppercase tracking-wider transition-all border-t-4 border-x-4 border-black rounded-t-lg cursor-pointer -mb-[4px] z-10 ${
              activeTab === 'calendar' 
                ? 'bg-white text-black shadow-[0px_4px_0px_0px_#FFF]' 
                : 'bg-black/10 border-black/20 text-slate-700 hover:text-black hover:bg-white/40'
            }`}
          >
            📅 Calendário Radar
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-5 py-3 font-black text-xs uppercase tracking-wider transition-all border-t-4 border-x-4 border-black rounded-t-lg cursor-pointer flex items-center gap-1.5 -mb-[4px] z-10 ${
              activeTab === 'supabase' 
                ? 'bg-white text-black shadow-[0px_4px_0px_0px_#FFF]' 
                : 'bg-black/10 border-black/20 text-slate-700 hover:text-black hover:bg-white/40'
            }`}
          >
            <Database className="w-4 h-4 stroke-[2.5]" />
            <span>Integrar Supabase</span>
            {!supabaseConfig.isConfigured && (
              <span className="w-2 h-2 rounded-full bg-[#FF9770] border border-black animate-ping" />
            )}
          </button>
        </div>

        {/* Tab Toggle Render */}
        {activeTab === 'supabase' ? (
          <SupabaseInfoTab />
        ) : (
          <>
            {/* Quick Birthday Alerts today / tomorrow */}
            {(todayBirthdays.length > 0 || tomorrowBirthdays.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {todayBirthdays.length > 0 && (
                  <div className="bg-[#FF70A6] text-black border-4 border-black rounded-lg p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                    <div className="p-3 bg-white border-2 border-black rounded-lg animate-bounce">
                      <Sparkles className="w-8 h-8 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-black bg-white border border-black px-1.5 py-0.5 rounded">
                        ATENÇÃO!
                      </span>
                      <h3 className="text-xl font-black uppercase tracking-tight mt-1.5">
                        HOJE É DIA DE FESTA! 🥳
                      </h3>
                      <p className="text-xs font-bold leading-relaxed text-black/95 mt-1">
                        {todayBirthdays.map(b => b.name).join(', ')} {todayBirthdays.length === 1 ? 'está' : 'estão'} completando ano hoje! Toque em mensagem de festa para copiar o parabéns!
                      </p>
                    </div>
                  </div>
                )}

                {tomorrowBirthdays.length > 0 && (
                  <div className="bg-[#00C2FF] text-black border-4 border-black rounded-lg p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                    <div className="p-3 bg-white border-2 border-black rounded-lg animate-pulse">
                      <CalendarDays className="w-8 h-8 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-black bg-white border border-black px-1.5 py-0.5 rounded">
                        AMANHÃ TEM BOLO
                      </span>
                      <h3 className="text-xl font-black uppercase tracking-tight mt-1.5">
                        PREPARAR OS DOCES! 🎂
                      </h3>
                      <p className="text-xs font-bold leading-relaxed text-black/95 mt-1">
                        Amanhã é aniversário de {tomorrowBirthdays.map(b => b.name).join(', ')}! Já deixe o recado planejado.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Quick colorful Statistics indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="bg-white border-4 border-black rounded-lg p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black">Família</p>
                  <p className="text-3xl font-black text-black mt-1">{countByCategory.family}</p>
                </div>
                <div className="p-2.5 bg-[#FF70A6] border-2 border-black rounded-lg text-black">
                  <Heart className="w-6 h-6 fill-black text-black" />
                </div>
              </div>

              <div className="bg-white border-4 border-black rounded-lg p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black">Amigos</p>
                  <p className="text-3xl font-black text-black mt-1">{countByCategory.friend}</p>
                </div>
                <div className="p-2.5 bg-[#00C2FF] border-2 border-black rounded-lg text-black">
                  <Smile className="w-6 h-6 text-black" />
                </div>
              </div>

              <div className="bg-white border-4 border-black rounded-lg p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black">Famosos</p>
                  <p className="text-3xl font-black text-black mt-1">{countByCategory.famous}</p>
                </div>
                <div className="p-2.5 bg-[#70D6FF] border-2 border-black rounded-lg text-black">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
              </div>

              <div className="bg-white border-4 border-black rounded-lg p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black">Lembretes</p>
                  <p className="text-3xl font-black text-black mt-1">{countByCategory.reminder}</p>
                </div>
                <div className="p-2.5 bg-[#FF9770] border-2 border-black rounded-lg text-black">
                  <CalendarDays className="w-6 h-6 text-black" />
                </div>
              </div>

            </div>

            {/* Filter and Search Bar Section */}
            <div className="bg-white rounded-lg p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-black space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black">
                    <Search className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou anotação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-3 border-black text-black focus:outline-none focus:bg-[#FFDE59]/10 rounded-lg pl-12 pr-4 py-3 text-sm font-bold placeholder-slate-500 transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-red-500"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}
                </div>

                {/* Filters Active Display */}
                {(searchTerm || selectedCategory !== 'all' || selectedMonth !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1.5 text-xs font-black bg-[#FF70A6] hover:bg-black hover:text-white border-2 border-black px-4 py-3 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                  >
                    <span>LIMPAR FILTROS</span>
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

              </div>

              {/* Filtering Tags */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                
                {/* Categories filtering bar */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-black tracking-wider flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 stroke-[2.5]" /> Categoria
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                        selectedCategory === 'all' 
                          ? 'bg-black text-white shadow-none' 
                          : 'bg-white text-black hover:bg-slate-50'
                      }`}
                    >
                      Todos
                    </button>
                    {(Object.keys(CATEGORIES) as BirthDayCategory[]).map((catKey) => {
                      const info = CATEGORIES[catKey];
                      const isSelected = selectedCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          onClick={() => setSelectedCategory(catKey)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? `${info.colorClass} text-black shadow-none` 
                              : 'bg-white text-black hover:bg-slate-50'
                          }`}
                        >
                          <span>{info.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Months filtering row */}
                <div className="flex flex-col gap-1.5 flex-grow">
                  <span className="text-[10px] font-black uppercase text-black tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 stroke-[2.5]" /> Filtrar por Mês
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedMonth('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                        selectedMonth === 'all' 
                          ? 'bg-black text-white shadow-none' 
                          : 'bg-white text-black hover:bg-slate-50 border-black'
                      }`}
                    >
                      Todos Meses
                    </button>
                    {MONTHS_BR.map((monthName, idx) => {
                      const isSelected = selectedMonth === idx + 1;
                      return (
                        <button
                          key={monthName}
                          onClick={() => setSelectedMonth(idx + 1)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-black text-white shadow-none' 
                              : 'bg-white text-black hover:bg-slate-50 border-black'
                          }`}
                        >
                          {monthName.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* List Result Section */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <RefreshCw className="w-12 h-12 text-black animate-spin stroke-[2.5]" />
                <p className="text-black font-black uppercase text-sm tracking-wider">Carregando calendários de aniversário...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-lg p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center space-y-4 max-w-xl mx-auto">
                <span className="text-5xl inline-block animate-pulse">📅</span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-black">Nenhum aniversário cadastrado</h3>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  Não existem registros salvos para os filtros selecionados ou nenhuma data foi cadastrada ainda. Adicione uma nova data abaixo para iniciar!
                </p>
                <div className="pt-2 flex flex-wrap gap-3 justify-center">
                  {(searchTerm || selectedCategory !== 'all' || selectedMonth !== 'all') ? (
                    <button
                      onClick={handleClearFilters}
                      className="bg-white hover:bg-black hover:text-white text-black border-2 border-black font-black uppercase text-xs px-5 py-2.5 rounded-lg transition"
                    >
                      Limpar Filtros de Busca
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsModalOpen(true);
                    }}
                    className="bg-black hover:bg-white text-white hover:text-black border-2 border-black font-black uppercase text-xs px-5 py-2.5 rounded-lg transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Cadastrar Data Agora
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-black stroke-[2.5]" />
                    <span>Próximas Datas Ordenadas ({filteredItems.length})</span>
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-800 bg-white border-2 border-black px-2 py-1 rounded">
                    💡 Clique em "Mensagem Festa" para copiar o parabéns adaptado!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <BirthdayCard 
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteBirthday}
                      onEdit={handleEditClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Action Registration Drawer Modal */}
      <AddBirthdayModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveBirthday}
        editItem={editingItem}
      />

    </div>
  );
}
