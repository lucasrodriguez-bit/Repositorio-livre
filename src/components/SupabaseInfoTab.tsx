import React, { useState } from 'react';
import { db } from '../supabaseClient';
import { Database, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export default function SupabaseInfoTab() {
  const [copied, setCopied] = useState(false);
  const config = db.getSupabaseConfig();

  const sqlCode = `-- Executar no SQL Editor do seu projeto Supabase:

CREATE TABLE birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL, -- 'family' | 'friend' | 'famous' | 'reminder'
  notes TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ativar segurança RLS (opcional para testes)
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;

-- Criar política pública de leitura/escrita para testes rápidos
CREATE POLICY "Acesso Livre" ON birthdays 
  FOR ALL USING (true) WITH CHECK (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black max-w-4xl mx-auto overflow-hidden text-black">
      <div className="flex items-center gap-4 mb-6 bg-[#FFDE59]/20 p-4 border-4 border-black rounded-xl">
        <div className={`p-3.5 border-2 border-black rounded-lg ${config.isConfigured ? 'bg-[#00C2FF] text-black' : 'bg-[#FF9770] text-black'}`}>
          <Database className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-2xl font-black font-sans uppercase tracking-tight text-black">Conexão do Supabase</h3>
          <p className="text-sm font-bold text-slate-700">
            {config.isConfigured 
              ? 'CONECTADO COM SUCESSO AO BANCO DE DADOS NA NUVEM!' 
              : 'EXECUTANDO EM MODO LOCAL STORAGE OFFLINE. DADOS SALVOS NO SEU NAVEGADOR.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <div className="space-y-4">
          <h4 className="font-black uppercase text-sm tracking-wider text-black">Status do Banco</h4>
          <div className="bg-[#70D6FF]/15 rounded-lg p-5 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-3 font-mono text-xs leading-relaxed">
              <div className="flex justify-between items-center pb-2 border-b-2 border-black">
                <span className="text-black font-black uppercase">STATUS:</span>
                {config.isConfigured ? (
                  <span className="px-3 py-1 rounded border-2 border-black text-xs font-black bg-[#00C2FF] text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">CONECTADO</span>
                ) : (
                  <span className="px-3 py-1 rounded border-2 border-black text-xs font-black bg-[#FF9770] text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">LOCAL (FALLBACK)</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b-2 border-black overflow-hidden">
                <span className="text-black font-black uppercase">VITE_SUPABASE_URL:</span>
                <span className="text-slate-800 font-bold text-xs truncate max-w-[150px] font-sans" title={config.url || 'Não configurado'}>
                  {config.url ? `${config.url.slice(0, 15)}...` : 'NULO / VAZIO'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-black uppercase">CHAVE ANONKEY:</span>
                {config.hasKey ? (
                  <span className="bg-[#FF70A6] text-black border-2 border-black px-2 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">PREENCHIDO ✔</span>
                ) : (
                  <span className="bg-[#FF9770] text-black border-2 border-black px-2 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">NÃO PREENCHIDO ❌</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black uppercase text-sm tracking-wider text-black">Conecte o seu Supabase:</h4>
            <ol className="list-decimal list-inside text-xs font-bold text-slate-800 space-y-2 leading-relaxed">
              <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-black underline bg-[#FFDE59] px-1 font-black inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3 text-black" /></a></li>
              <li>Acesse <span className="font-black text-black">Settings &gt; API</span> e copie a <span className="font-black text-black">Project URL</span> e a <span className="font-black text-black">anon public key</span></li>
              <li>Nas configurações do seu editor, adicione as variáveis de ambiente com os nomes correspondentes:
                <div className="mt-1.5 ml-4 bg-[#FF70A6]/20 border-2 border-black px-2.5 py-1 text-black font-mono select-all w-fit">VITE_SUPABASE_URL</div>
                <div className="mt-1 ml-4 bg-[#00C2FF]/20 border-2 border-black px-2.5 py-1 text-black font-mono select-all w-fit">VITE_SUPABASE_ANON_KEY</div>
              </li>
              <li>Execute o código SQL ao lado no prompt e crie a tabela <code className="bg-black text-yellow-300 px-1.5 py-0.5 rounded font-mono text-xs font-black">birthdays</code>!</li>
            </ol>
          </div>
        </div>

        <div className="flex flex-col h-full min-h-[350px]">
          <div className="flex items-center justify-between bg-black text-white px-4 py-2.5 border-t-2 border-x-2 border-black rounded-t-lg">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00C2FF]" />
              <span className="text-xs font-mono font-black uppercase">SQL Editor Script</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-black bg-[#FFDE59] border-2 border-black hover:bg-white hover:text-black px-3 py-1 rounded font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="flex-grow bg-[#1A1A1A] text-emerald-400 border-4 border-black p-4 rounded-b-lg text-[11px] font-mono overflow-auto leading-relaxed max-h-[320px] select-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {sqlCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
