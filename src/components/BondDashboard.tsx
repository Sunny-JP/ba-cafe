"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  CHARACTER_LIST, GIFT_LIST, GIFT_EXP, 
  SPRITE_CONFIG, CharacterId
} from '@/lib/bondData';

interface BondRecord {
  char_key: string;
  bond_level: number;
  recorded_at: string;
}

export default function BondDashboard({ 
  bondHistory, 
  onSave,
  isSyncing 
}: { 
  bondHistory: BondRecord[], 
  onSave: (level: number, date: string, charKey: string) => Promise<void>,
  isSyncing?: boolean 
}) {
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>(CHARACTER_LIST[0].id);
  const [inputLevel, setInputLevel] = useState(1);
  const [inputDate, setInputDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChar = useMemo(() => 
    CHARACTER_LIST.find(c => c.id === selectedCharId) || CHARACTER_LIST[0], 
  [selectedCharId]);

  const sortedGifts = useMemo(() => {
    return GIFT_LIST.filter(gift => selectedChar.giftRatings[gift.name]);
  }, [selectedChar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    await onSave(inputLevel, inputDate, selectedCharId);
  };

  const handleEdit = (record: BondRecord) => {
    setInputLevel(record.bond_level);
    setInputDate(record.recorded_at);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container px-6 py-6 bg-transparent">
      <section>
        {/* 1. キャラクター選択 */}
        <div className="relative mb-5" ref={dropdownRef}>
          <button 
            className="group flex flex-col items-start transition-all active:opacity-70"
            onClick={() => setIsSelectOpen(!isSelectOpen)}
          >
            <span className="text-[10px] uppercase tracking-[0.2em]  ml-1 mb-1.5">
              Current Student
            </span>
            <h1 className="text-4xl font-black tracking-tight flex items-end gap-2 leading-none">
              {selectedChar.name}
              <span className={`text-base text-primary transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </h1>
          </button>

          {isSelectOpen && (
            <div className="absolute top-full left-0 mt-4 w-64 max-h-80 overflow-y-auto z-50 
                            bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl 
                            shadow-2xl shadow-black/20 animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
              <div className="p-2 space-y-1">
                {CHARACTER_LIST.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedCharId(char.id as CharacterId);
                      setIsSelectOpen(false);
                    }}
                    className={`w-full text-left px-4 py-1 rounded-xl transition-all flex items-center justify-between
                      ${selectedCharId === char.id ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5 text-foreground'}`}
                  >
                    <span className="font-bold text-sm">{char.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. 記録入力エリア (中心線とラベルラインの完全同期) */}
        <div className="flex items-end justify-between gap-8 border-b border-muted/20 pb-6">
          {/* 左側：入力グループ */}
          <div className="flex gap-6 flex-1">
            
            {/* Rank セクション */}
            <div className="flex flex-col">
              {/* 1. ラベル行（高さを固定してDateと揃える） */}
              <label className="text-[9px] uppercase tracking-widest text-muted-foreground ml-1 h-4 flex items-center">
                Rank
              </label>
              
              {/* 2. コンテンツ行（高さを4xlに合わせる） */}
              <div className="flex items-center gap-2 h-10 mt-1">
                <div className="flex items-baseline">
                  <span className="text-xl font-black text-muted-foreground/30 ml-1 leading-none">
                    LV.
                  </span>
                  <span className="text-3xl font-black w-12 text-center leading-none">
                    {inputLevel}
                  </span>
                </div>
                {/* 上下ボタンをさらに数値へ密着 */}
                <div className="flex flex-col -space-y-px">
                  <button 
                    onClick={() => setInputLevel(prev => Math.min(100, prev + 1))}
                    className="w-5 h-6 flex items-center justify-center bg-muted/20 hover:bg-muted/40 rounded-t text-base transition-colors"
                  >
                    ▲
                  </button>
                  <button 
                    onClick={() => setInputLevel(prev => Math.max(1, prev - 1))}
                    className="w-5 h-6 flex items-center justify-center bg-muted/20 hover:bg-muted/40 rounded-b text-base transition-colors"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>

            {/* Date セクション */}
            <div className="flex flex-col">
              {/* 1. ラベル行（Rankと高さを統一） */}
              <label className="text-[9px] uppercase tracking-widest text-muted-foreground ml-1 h-4 flex items-center">
                Date
              </label>
              
              {/* 2. コンテンツ行（LV.と中心線を完全に一致させる） */}
              <div className="flex items-center h-10 mt-1">
                <input 
                  type="date" 
                  value={inputDate} 
                  onChange={(e) => setInputDate(e.target.value)} 
                  className="text-3xl font-bold bg-transparent border-none outline-none focus:text-primary p-0 leading-none h-auto m-0 w-50"
                  style={{ colorScheme: 'dark' }} 
                />
              </div>
            </div>
          </div>

          {/* Recordボタン (既存スタイル・細身) */}
          <button 
            onClick={handleSave}
            disabled={isSyncing}
            className={`btn-timer btn-timer-record rounded-2xl flex flex-col items-center justify-center transition-all min-w-15
              ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-[9px] font-black tracking-widest uppercase opacity-90 leading-none">Record</span>
            <div className="text-2xl font-light leading-none">+</div>
          </button>
        </div>

        {/* 3. グラフ (アコーディオン) */}
        <div className="space-y-4 mt-8">
          <button onClick={() => setIsGraphOpen(!isGraphOpen)} className="text-[10px] uppercase tracking-[0.2em]  ml-1 mb-1.5">
            <span>Progress Graph</span>
            <span className={`transition-transform duration-300 ${isGraphOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {isGraphOpen && (
            <div className="h-48 w-full animate-in fade-in slide-in-from-top-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bondHistory.filter(h => h.char_key === selectedCharId)}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" opacity={0.2} />
                  <XAxis dataKey="recorded_at" hide />
                  <YAxis hide domain={[0, 240225]} />
                  <Area type="monotone" dataKey="bond_level" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. 贈り物 (1行スクロール) */}
        <div className="space-y-4 mt-8">
          <h3 className="text-[10px] uppercase tracking-[0.2em]  ml-1 mb-1.5">Favorite Gifts</h3>
          <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide pb-2">
            {sortedGifts.map((gift) => {
              const rating = selectedChar.giftRatings[gift.name];
              const rankChar = rating?.slice(-1).toUpperCase();
              const row = Math.floor(gift.spriteIdx / SPRITE_CONFIG.cols);
              const col = gift.spriteIdx % SPRITE_CONFIG.cols;

              return (
                <div key={gift.name} className="flex flex-col items-center shrink-0 w-14">
                  <div className="relative w-full aspect-square mb-2 bg-muted/5 rounded-2xl overflow-hidden">
                    <div className="gift-sprite" style={{ '--col': col, '--row': row, transform: 'scale(0.45)', position: 'absolute', top: '10%', left: '-10%' } as React.CSSProperties} />
                    <div className={`absolute top-2 left-0.5 w-3 h-3 rounded-full border-2 border-background 
                      ${rankChar === 'S' ? 'bg-red-500' : rankChar === 'A' ? 'bg-orange-400' : 'bg-blue-500'}`} />
                  </div>
                  <span className="text-[9px] text-center font-medium w-full">{gift.category || "GIFT"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. 履歴リスト (アコーディオン) */}
        <div className="space-y-4 mt-8">
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="text-[10px] uppercase tracking-[0.2em]  ml-1 mb-1.5">
            <span>History Log</span>
            <span className={`transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {isHistoryOpen && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              {bondHistory.filter(h => h.char_key === selectedCharId).sort((a,b) => b.recorded_at.localeCompare(a.recorded_at)).map((record) => (
                <div key={record.recorded_at} className="flex justify-between items-center py-3 border-b border-muted/10">
                  <div className="flex flex-col">
                    <span className="text-[10px]  font-mono">{record.recorded_at}</span>
                    <span className="text-sm font-bold">RANK {record.bond_level}</span>
                  </div>
                  <button onClick={() => handleEdit(record)} className="text-[9px] font-black tracking-widest text-primary border border-primary/30 px-3 py-1 rounded-full active:bg-primary/10">EDIT</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}