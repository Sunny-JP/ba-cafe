"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format } from 'date-fns';
import { 
  CHARACTER_LIST, GIFT_LIST, 
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
  const [isDesktop, setIsDesktop] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChar = useMemo(() => 
    CHARACTER_LIST.find(c => c.id === selectedCharId) || CHARACTER_LIST[0], 
  [selectedCharId]);

  const sortedGifts = useMemo(() => {
    const ratingOrder: Record<string, number> = {
      'ss': 1,
      'sa': 2,
      'ns': 3,
      'na': 4,
      'nb': 5
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

  // レスポンシブ幅を動的取得してグラフ表示ロジックを切り替える
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

  const handleEdit = (record: BondRecord) => {
    setInputLevel(record.bond_level);
    setInputDate(record.recorded_at);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // グラフコンポーネントを共通化
  const RenderGraph = () => (
    <div className="graph-container">
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
          <YAxis hide domain={[0, 100]} />
          <Area type="monotone" dataKey="bond_level" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="bond-container">
      <div className="bond-split-layout">
        
        {/* 左側パネル (スマホ時はこれが全画面シーケンスになります) */}
        <div className="bond-left-panel">
          
          {/* 1. キャラクター生徒選択 */}
          <div className="char-selector" ref={dropdownRef}>
            <button 
              className="char-selector-trigger"
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <span className="char-selector-label">Current Student</span>
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

          {/* 2. ランク・日付記録入力エリア */}
          <div className="record-input-area">
            <div className="input-group-container">
              <div className="input-field-wrapper">
                <label className="input-label">Rank</label>
                <div className="input-content">
                  <span className="rank-prefix">LV.</span>
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

          {/* 3. 贈り物画像部分 (Favorite Gifts) */}
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

          {/* 4. 絆上げ履歴部分 (History Log) */}
          <div className="section-wrapper">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
              className="section-toggle-btn"
            >
              <span>History Log</span>
              <span className={`section-toggle-arrow ${isHistoryOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isHistoryOpen && (
              <div className="history-list-container animate-in fade-in slide-in-from-top-2">
                {bondHistory
                  .filter(h => h.char_key === selectedCharId)
                  .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
                  .map((record) => (
                    <div key={record.recorded_at} className="history-item">
                      <div className="history-meta">
                        <span className="history-date">{record.recorded_at}</span>
                        <span className="history-rank">RANK {record.bond_level}</span>
                      </div>
                      <button 
                        onClick={() => handleEdit(record)} 
                        className="edit-btn"
                      >
                        EDIT
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 5. スマホ表示時のみここに配置されるグラフ表示（アコーディオン式） */}
          {!isDesktop && (
            <div className="section-wrapper">
              <button 
                onClick={() => setIsGraphOpen(!isGraphOpen)} 
                className="section-toggle-btn"
              >
                <span>Progress Graph</span>
                <span className={`section-toggle-arrow ${isGraphOpen ? 'open' : ''}`}>▼</span>
              </button>
              {isGraphOpen && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <RenderGraph />
                </div>
              )}
            </div>
          )}

        </div>

        {/* 右側パネル (PC表示時のみ出現し、グラフを大きく常時表示) */}
        {isDesktop && (
          <div className="bond-right-panel animate-in fade-in duration-300">
            <h3 className="section-toggle-btn" style={{ cursor: 'default' }}>Progress Graph</h3>
            <RenderGraph />
          </div>
        )}

      </div>
    </div>
  );
}