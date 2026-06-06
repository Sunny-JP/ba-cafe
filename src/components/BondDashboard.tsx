"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, Tooltip
} from 'recharts';
import { format } from 'date-fns';
import { 
  CHARACTER_LIST, GIFT_LIST, 
  SPRITE_CONFIG, CharacterId,
  BOND_EXP_TABLE
} from '@/lib/bondData';

interface BondRecord {
  char_key: string;
  bond_level: number;
  recorded_at: string;
}

const getLevelFromExp = (exp: number): number => {
  let currentLevel = 1;
  for (let lv = 1; lv <= 100; lv++) {
    if (BOND_EXP_TABLE[lv] !== undefined && exp >= BOND_EXP_TABLE[lv]) {
      currentLevel = lv;
    } else {
      break;
    }
  }
  return currentLevel;
};

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

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
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCharId = localStorage.getItem('last_selected_char_id') as CharacterId | null;
      if (savedCharId && CHARACTER_LIST.some(c => c.id === savedCharId)) {
        setSelectedCharId(savedCharId);
      }
      setIsMounted(true);
    }
  }, []);
  const [inputLevel, setInputLevel] = useState(1);
  const [inputDate, setInputDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [editingRecord, setEditingRecord] = useState<BondRecord | null>(null);
  const [editLevel, setEditLevel] = useState(1);
  const [editDate, setEditDate] = useState('');

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChar = useMemo(() => 
    CHARACTER_LIST.find(c => c.id === selectedCharId) || CHARACTER_LIST[0], 
  [selectedCharId]);

  const sortedGifts = useMemo(() => {
    const ratingOrder: Record<string, number> = {
      'ss': 1, 'sa': 2, 'ns': 3, 'na': 4, 'nb': 5
    };

    return GIFT_LIST
      .filter(gift => selectedChar.giftRatings[gift.name])
      .sort((a, b) => {
        const ratingA = selectedChar.giftRatings[a.name]?.toLowerCase() || '';
        const ratingB = selectedChar.giftRatings[b.name]?.toLowerCase() || '';
        const orderA = ratingOrder[ratingA] || 99;
        const orderB = ratingOrder[ratingB] || 99;
        return orderA - orderB;
      });
  }, [selectedChar]);

  const filteredHistory = useMemo(() => {
    return bondHistory
      .filter(h => h.char_key === selectedCharId)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
  }, [bondHistory, selectedCharId]);

  const displayHistoryRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 10; i++) {
      rows.push(filteredHistory[i] || null);
    }
    return rows;
  }, [filteredHistory]);

  const graphData = useMemo(() => {
    if (filteredHistory.length > 0) {
      return [...filteredHistory]
        .reverse()
        .map(h => ({
          recorded_at: h.recorded_at,
          timestamp: new Date(h.recorded_at).getTime(),
          cumulative_exp: BOND_EXP_TABLE[h.bond_level] || 0,
          bond_level: h.bond_level
        }));
    }
    return [];
  }, [filteredHistory]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('last_selected_char_id', selectedCharId);
    const charHistory = bondHistory
      .filter(h => h.char_key === selectedCharId)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
    if (charHistory.length > 0) {
      setInputLevel(Math.min(100, charHistory[0].bond_level + 1));
    } else {
      setInputLevel(1);
    }
  }, [selectedCharId, bondHistory, isMounted]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleOpenEditDialog = (record: BondRecord) => {
    setEditingRecord(record);
    setEditLevel(record.bond_level);
    setEditDate(record.recorded_at);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    await onSave(editLevel, editDate, selectedCharId);
    setEditingRecord(null);
  };

  const renderGraph = (
    <div className="graph-container">
      {graphData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: -10 }}>
            <defs>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                <stop offset="60%" stopColor="var(--primary)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--secondary)" opacity={0.2} />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              stroke="var(--secondary-foreground)"
              fontSize={9}
              tickCount={4}
              tickFormatter={(ts) => {
                try {
                  const d = new Date(ts);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  return `${y}/${m}`;
                } catch (e) {}
                return '';
              }}
            />
            <YAxis 
              dataKey="cumulative_exp" 
              domain={[0, 240225]} 
              ticks={[0, 14790, 29175, 50835, 81270, 121980, 174465, 240225]}
              tickFormatter={(exp) => `Lv.${getLevelFromExp(exp)}`}
              stroke="var(--secondary-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  return `Date: ${payload[0].payload.recorded_at}`;
                }
                return '';
              }}
              formatter={(value: any, name: any, props: any) => [
                `RANK ${props.payload.bond_level} (${value} exp)`
              ]}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--muted)',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
              }}
              labelStyle={{
                color: 'var(--foreground)',
                fontWeight: 700
              }}
            />
            <Area 
              type="monotone"
              dataKey="cumulative_exp" 
              stroke="var(--primary)" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorExp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-(--muted) rounded-2xl bg-(--card)/30">
          <span className="text-lg font-bold text-(--muted-foreground) tracking-wider opacity-60">
            No Data
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bond-container">
      <div className="bond-split-layout">
        
        {/* 左側パネル */}
        <div className="bond-left-panel">
          
          {/* 1. キャラクター生徒選択 */}
          <div className="char-selector" ref={dropdownRef}>
            <button 
              className="char-selector-trigger"
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <span className="char-selector-label">Student</span>
              <h1 className="char-selector-name">
                {selectedChar.name}
                <span className={`char-selector-arrow ${isSelectOpen ? 'open' : ''}`}>
                  ▼
                </span>
              </h1>
            </button>

            {isSelectOpen && (
              <div className="char-dropdown scrollbar-hide animate-in fade-in zoom-in-95 duration-200">
                <div className="char-dropdown-container">
                  {CHARACTER_LIST.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => {
                        setSelectedCharId(char.id as CharacterId);
                        setIsSelectOpen(false);
                      }}
                      className={`char-dropdown-item ${selectedCharId === char.id ? 'active' : ''}`}
                    >
                      {char.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. ランク・日付記録入力 */}
          <div className="record-input-area">
            <div className="input-group-container">
              <div className="input-field-wrapper">
                <label className="input-label">Rank</label>
                <div className="input-content">
                  {/* <span className="rank-prefix">LV.</span> */}
                  <span className="rank-value">{inputLevel}</span>
                  <div className="spin-buttons-box">
                    <button 
                      onClick={() => setInputLevel(prev => Math.min(100, prev + 1))}
                      className="spin-btn up"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => setInputLevel(prev => Math.max(1, prev - 1))}
                      className="spin-btn down"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div className="input-field-wrapper">
                <label className="input-label">Date</label>
                <div className="input-content">
                  <input 
                    type="date" 
                    value={inputDate} 
                    onChange={(e) => setInputDate(e.target.value)} 
                    className="date-input-display"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSyncing}
              className="btn-bond-record"
            >
              <span>Record</span>
              <div>+</div>
            </button>
          </div>

          {/* 3. 贈り物画像 */}
          <div className="section-wrapper">
            <h3 className="gift-title">Favorite Gifts</h3>
            <div className="gift-scroll-container scrollbar-hide">
              {sortedGifts.map((gift) => {
                const rating = selectedChar.giftRatings[gift.name];
                const rankChar = rating?.slice(-1).toUpperCase();
                const row = Math.floor(gift.spriteIdx / SPRITE_CONFIG.cols);
                const col = gift.spriteIdx % SPRITE_CONFIG.cols;

                return (
                  <div key={gift.name} className="gift-item">
                    <div className="gift-image-box">
                      <div 
                        className="gift-sprite" 
                        style={{ '--col': col, '--row': row } as React.CSSProperties} 
                      />
                      <div className={`gift-rank-dot ${
                        rankChar === 'S' ? 's' : rankChar === 'A' ? 'a' : 'b'
                      }`} />
                    </div>
                    <span className="gift-category-text">
                      {gift.category || "GIFT"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. 絆上げ履歴 */}
          <div className="section-wrapper">
            <h3 className="section-toggle-btn" style={{ cursor: 'default' }}>
              <span>History Log</span>
            </h3>
            <div className="history-grid-container">
              {displayHistoryRows.map((record, index) => (
                <div key={record ? record.recorded_at : `empty-${index}`} className="history-item">
                  <div className="history-log-row">
                    {record ? (
                      <>
                        <span className="history-rank-num">
                          {record.bond_level}
                        </span>
                        <span className="history-divider">|</span>
                        <span className="history-date-text">
                          {record.recorded_at}
                        </span>
                      </>
                    ) : (
                      <span className="history-empty-text">
                        <span className="history-rank-num">
                          ---
                        </span>
                        <span className="history-divider">|</span>
                        <span className="history-date-text">
                          ---- -- --
                        </span>
                      </span>
                    )}
                  </div>
                  
                  {record ? (
                    <button 
                      onClick={() => handleOpenEditDialog(record)} 
                      className="edit-icon-btn"
                      aria-label="Edit record"
                    >
                      <PencilIcon />
                    </button>
                  ) : (
                    <span className="edit-btn-placeholder" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Progress Graph */}
          {!isDesktop && (
            <div className="section-wrapper">
              <h3 className="section-toggle-btn" style={{ cursor: 'default' }}>
                <span>Progress Graph</span>
              </h3>
              <div className="animate-in fade-in duration-200">
                {renderGraph}
              </div>
            </div>
          )}

        </div>

        {/* PC表示時の Progress Graph */}
        {isDesktop && (
          <div className="bond-right-panel animate-in fade-in duration-300">
            <h3 className="section-toggle-btn" style={{ cursor: 'default' }}>Progress Graph</h3>
            {renderGraph}
          </div>
        )}

      </div>

      {/* 編集ダイアログポップアップ */}
      {editingRecord && (
        <div className="fixed inset-0 bg-(--background) z-100 flex justify-center items-start p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md mt-12 rounded-2xl shadow-xl border bg-(--card) flex flex-col overflow-hidden border-dashed">
            
            <div className="border-b border-dashed flex justify-between items-center z-20">
              <h1 className="text-xl px-6 py-4 font-bold truncate">
                Edit Record
              </h1>
              <button 
                onClick={() => setEditingRecord(null)}
                className="btn-close px-6 py-4 cursor-pointer"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div>
                <span className="text-sm text-(--secondary-foreground) font-bold block mb-1">Student</span>
                <span className="text-lg font-black">{selectedChar.name}</span>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-(--secondary-foreground) font-bold block mb-1">Rank</label>
                  <div className="flex items-center bg-(--background) px-3 py-2 rounded-xl border border-dashed h-14">
                    <span className="font-black text-sm mr-1 opacity-60">LV.</span>
                    <span className="font-black text-xl flex-1">{editLevel}</span>
                    <div className="flex flex-col gap-0.5">
                      <button 
                        onClick={() => setEditLevel(prev => Math.min(100, prev + 1))}
                        className="text-xs px-1 hover:text-(--primary)"
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => setEditLevel(prev => Math.max(1, prev - 1))}
                        className="text-xs px-1 hover:text-(--primary)"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-sm text-(--secondary-foreground) font-bold block mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editDate} 
                    onChange={(e) => setEditDate(e.target.value)} 
                    className="w-full font-bold bg-(--background) px-3 py-2 rounded-xl border border-dashed outline-none h-14 text-xl"
                    style={{ colorScheme: 'var(--system-color-scheme)' }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={isSyncing}
                className="btn-bond-record-dialog"
              >
                {isSyncing ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}