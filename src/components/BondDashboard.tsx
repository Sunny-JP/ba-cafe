"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, Tooltip
} from 'recharts';
import { format, subDays } from 'date-fns';
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

// 累計EXPから現在の絆ランクを逆引きするヘルパー関数
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

  // グラフ用データ：実データがあれば累計EXPに変換、無ければ「毎日100exp」のモックを生成
  const graphData = useMemo(() => {
    if (filteredHistory.length > 0) {
      // 過去の記録を古い順にソートし、それぞれのランクに応じた累計EXPをマッピング
      return [...filteredHistory]
        .reverse()
        .map(h => ({
          recorded_at: h.recorded_at,
          cumulative_exp: BOND_EXP_TABLE[h.bond_level] || 0,
          bond_level: h.bond_level
        }));
    }

    // モックデータ: 直近730日間、毎日100expずつ増える計算
    const mockData = [];
    for (let i = 730; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const cumulativeExp = (730 - i) * 330;
      mockData.push({
        recorded_at: dateStr,
        cumulative_exp: cumulativeExp,
        bond_level: getLevelFromExp(cumulativeExp)
      });
    }
    return mockData;
  }, [filteredHistory]);

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

  const renderGraph = (
    <div className="graph-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: -10 }}>
          <defs>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
              <stop offset="60%" stopColor="var(--primary)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          {/* 1. CartesianGrid から上下の境界線の描画をカットします */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="var(--secondary)" 
            opacity={0.2}
          />
          
          {/* 2. XAxis の hide を解除し、現在のUIに合わせてデザインを適用 */}
          <XAxis 
            dataKey="recorded_at" 
            tickLine={false}
            axisLine={false}
            stroke="var(--secondary-foreground)"
            fontSize={9}
            tickCount={4}
            tickFormatter={(dateStr) => {
              try {
                const parts = dateStr.split('-');
                if (parts.length === 3) return `${parts[0]}/${parts[1]}`;
              } catch (e) {}
              return dateStr;
            }}
          />
          
          {/* 3. YAxis の domain をキリ良く調整し、上下のグリッド線とテキストの被りを回避 */}
          <YAxis 
            dataKey="cumulative_exp" 
            domain={[0, 240225]} /* 下限を0にして目盛りの被りを抑制 */
            ticks={[0, 14790, 29175, 50835, 81270, 121980, 174465, 240225]}
            tickFormatter={(exp) => `Lv.${getLevelFromExp(exp)}`}
            stroke="var(--secondary-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip 
            labelFormatter={(label) => `Date: ${label}`}
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

          {/* 4. 絆上げ履歴部分 */}
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
                        -- <span className="history-divider">|</span> --/--/--
                      </span>
                    )}
                  </div>
                  
                  {record ? (
                    <button 
                      onClick={() => handleEdit(record)} 
                      className="edit-btn"
                    >
                      EDIT
                    </button>
                  ) : (
                    <span className="edit-btn-placeholder" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. スマホ表示時のみここに配置される Progress Graph */}
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

        {/* 右側パネル (PC表示時の Progress Graph) */}
        {isDesktop && (
          <div className="bond-right-panel animate-in fade-in duration-300">
            <h3 className="section-toggle-btn" style={{ cursor: 'default' }}>Progress Graph</h3>
            {renderGraph}
          </div>
        )}

      </div>
    </div>
  );
}