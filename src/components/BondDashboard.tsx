"use client";

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, Tooltip, Line
} from 'recharts';
import { format } from 'date-fns';
import { 
  CHARACTER_LIST, GIFT_LIST, 
  SPRITE_CONFIG, CharacterId,
  BOND_EXP_TABLE
} from '@/lib/bondData';

interface BondRecord {
  id: string; 
  char_key: string;
  bond_level: number;
  recorded_at: string;
}

const MIN_CHART_DIMENSION = 32;

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

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CustomTooltip = ({ active, payload, label, allData }: any) => {
  if (!active || !payload || !payload.length) return null;

  const sameDayPoints = allData.filter((d: any) => d.timestamp === label);
  if (sameDayPoints.length === 0) return null;

  const dateStr = sameDayPoints[0].recorded_at;
  
  const hasActual = sameDayPoints.some((p: any) => !p.isPrediction);
  const filteredPoints = sameDayPoints.filter((p: any) => {
    if (hasActual && p.isPrediction) return false;
    return true;
  });

  const sortedPoints = filteredPoints.sort((a: any, b: any) => b.bond_level - a.bond_level);
  const isAllPrediction = sortedPoints.every((p: any) => p.isPrediction);

  return (
    <div 
      className="recharts-default-tooltip"
      style={{
        margin: 0,
        padding: '10px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--muted)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap'
      }}
    >
      <p 
        className="recharts-tooltip-label"
        style={{
          margin: '0px 0px 4px',
          color: 'var(--foreground)',
          fontWeight: 700
        }}
      >
        {isAllPrediction ? `Estimated Date: ${dateStr}` : `Date: ${dateStr}`}
      </p>

      <ul className="recharts-tooltip-item-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {sortedPoints.map((p: any, idx: number) => (
          <li 
            key={idx} 
            className="recharts-tooltip-item" 
            style={{ display: 'block', paddingTop: '4px', paddingBottom: '4px' }}
          >
            <span style={{ fontWeight: 700 }}>
              Rank {p.bond_level} {p.isPrediction ? '' : `(${p.actual_exp} exp)`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
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
  const [isMounted, setIsMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCharId = localStorage.getItem('last_selected_char_id') as CharacterId | null;
      if (savedCharId && CHARACTER_LIST.some(c => c.id === savedCharId)) {
        setSelectedCharId(savedCharId);
      }
      setIsMounted(true);
    }
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = (rect = el.getBoundingClientRect()) => {
      if (rect.width >= MIN_CHART_DIMENSION && rect.height >= MIN_CHART_DIMENSION) {
        setIsChartReady(true);
      }
    };

    update();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) update(entry.contentRect);
      }
    });
    observer.observe(el);
    
    return () => observer.disconnect();
  }, []);

  const [inputLevel, setInputLevel] = useState(1);
  const [inputDate, setInputDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectOpen && dropdownRef.current) {
      setTimeout(() => {
        const activeItem = dropdownRef.current?.querySelector('.char-dropdown-item.active');
        if (activeItem) {
          activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 20);
    }
  }, [isSelectOpen]);

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
      .sort((a, b) => {
        const dateCompare = b.recorded_at.localeCompare(a.recorded_at);
        if (dateCompare !== 0) return dateCompare;
        return b.bond_level - a.bond_level;
      });
  }, [bondHistory, selectedCharId]);

  const displayHistoryRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 6; i++) {
      rows.push(filteredHistory[i] || null);
    }
    return rows;
  }, [filteredHistory]);

  const chartDataCombined = useMemo(() => {
    if (filteredHistory.length === 0) return { data: [], hasPrediction: false };

    const actualPoints = [...bondHistory]
      .filter(h => h.char_key === selectedCharId)
      .sort((a, b) => {
        const dateCompare = a.recorded_at.localeCompare(b.recorded_at);
        if (dateCompare !== 0) return dateCompare;
        return a.bond_level - b.bond_level;
      })
      .map(h => ({
        recorded_at: h.recorded_at,
        timestamp: new Date(h.recorded_at).getTime(),
        cumulative_exp: BOND_EXP_TABLE[h.bond_level] || 0,
        bond_level: h.bond_level,
        isPrediction: false,
        actual_exp: BOND_EXP_TABLE[h.bond_level] || 0,
        predicted_exp: null as number | null,
      }));

    const lastActual = actualPoints[actualPoints.length - 1];
    const targetExp = 240225;

    if (lastActual.cumulative_exp >= targetExp || actualPoints.length < 2) {
      return { data: actualPoints, hasPrediction: false, xDomain: ['dataMin', 'dataMax'] as const };
    }

    const n = actualPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const p of actualPoints) {
      sumX += p.timestamp;
      sumY += p.cumulative_exp;
      sumXY += p.timestamp * p.cumulative_exp;
      sumXX += p.timestamp * p.timestamp;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      return { data: actualPoints, hasPrediction: false, xDomain: ['dataMin', 'dataMax'] as const };
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    if (slope <= 0) {
      return { data: actualPoints, hasPrediction: false, xDomain: ['dataMin', 'dataMax'] as const };
    }

    const predictionPoints: any[] = [];
    
    predictionPoints.push({
      recorded_at: lastActual.recorded_at,
      timestamp: lastActual.timestamp,
      cumulative_exp: lastActual.cumulative_exp,
      bond_level: lastActual.bond_level,
      isPrediction: true,
      actual_exp: null,
      predicted_exp: lastActual.cumulative_exp
    });

    let nextTargetLevel = Math.floor((lastActual.bond_level / 5) + 1) * 5;
    if (nextTargetLevel === lastActual.bond_level) {
      nextTargetLevel += 5;
    }

    for (let lv = nextTargetLevel; lv <= 100; lv += 5) {
      const expAtLv = BOND_EXP_TABLE[lv];
      if (expAtLv === undefined) continue;

      const ts = Math.round((expAtLv - intercept) / slope);
      
      predictionPoints.push({
        recorded_at: format(new Date(ts), 'yyyy-MM-dd'),
        timestamp: ts,
        cumulative_exp: expAtLv,
        bond_level: lv,
        isPrediction: true,
        actual_exp: null,
        predicted_exp: expAtLv
      });
    }

    const finalPoint = predictionPoints[predictionPoints.length - 1];
    if (!finalPoint || finalPoint.bond_level !== 100) {
      const ts100 = Math.round((targetExp - intercept) / slope);
      predictionPoints.push({
        recorded_at: format(new Date(ts100), 'yyyy-MM-dd'),
        timestamp: ts100,
        cumulative_exp: targetExp,
        bond_level: 100,
        isPrediction: true,
        actual_exp: null,
        predicted_exp: targetExp
      });
    }

    return {
      data: [...actualPoints, ...predictionPoints.slice(0)],
      hasPrediction: true,
      xDomain: [actualPoints[0].timestamp, predictionPoints[predictionPoints.length - 1].timestamp] as const
    };
  }, [filteredHistory]);

  const graphData = chartDataCombined.data;

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('last_selected_char_id', selectedCharId);
    const charHistory = bondHistory
      .filter(h => h.char_key === selectedCharId)
      .sort((a, b) => {
        const dateCompare = b.recorded_at.localeCompare(a.recorded_at);
        if (dateCompare !== 0) return dateCompare;
        return b.bond_level - a.bond_level;
      });

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

  const handleDelete = async (recordId: string) => {
    if (!window.confirm("この記録を削除してもよろしいですか？")) return;

    try {
      let token = '';
      if (typeof window !== 'undefined') {
        const authKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (authKey) {
          const authDataString = localStorage.getItem(authKey);
          if (authDataString) {
            const authData = JSON.parse(authDataString);
            token = authData?.access_token || '';
          }
        }
      }

      const res = await fetch('/api/relationship', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: recordId }),
      });

      if (!res.ok) throw new Error('Failed to delete');

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました。");
    }
  };

  const renderGraph = (
    <div 
      ref={containerRef}
      className={`graph-container ${!isChartReady ? 'opacity-0 pointer-events-none' : ''}`}
      data-chart-ready={isChartReady ? "true" : "false"}
    >
      {isChartReady && (
        graphData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 5, right: 5, left: -35, bottom: -10 }}>
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
                domain={chartDataCombined.xDomain || ['dataMin', 'dataMax']}
                tickLine={true}
                axisLine={true}
                stroke="var(--secondary-foreground)"
                fontSize={10}
                tickCount={14}
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
                tickFormatter={(exp) => `${getLevelFromExp(exp)}`}
                stroke="var(--secondary-foreground)"
                fontSize={10}
                tickLine={true}
                axisLine={true}
              />
              <Tooltip 
                content={<CustomTooltip allData={graphData} />}
                trigger="hover"
                shared={true}
              />
              <Area 
                type="monotone"
                dataKey="actual_exp" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorExp)" 
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted_exp"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-dashed border-(--muted) rounded-2xl bg-(--card)/30">
            <span className="text-lg font-bold text-(--muted-foreground) tracking-wider opacity-60">
              No Data
            </span>
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="bond-container">
      <div className="bond-split-layout">
        <div className="bond-left-panel">
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

          <div className="record-input-area">
            <div className="input-group-container">
              {/* Rank フィールド */}
              <div className="input-field-wrapper rank-field">
                <label className="input-label">Rank</label>
                <div className="input-content">
                  <span className="rank-value">{inputLevel}</span>
                  <div className="spin-buttons">
                    <button 
                      onClick={() => setInputLevel(prev => Math.min(100, prev + 1))} 
                      className="spin-btn"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => setInputLevel(prev => Math.max(1, prev - 1))} 
                      className="spin-btn"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Date フィールド */}
              <div className="input-field-wrapper date-field">
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

              {/* Record ボタンを同じコンテナ内に並列で配置 */}
              <button onClick={handleSave} disabled={isSyncing} className="btn-bond-record">
                <span>Record</span>
                <div>＋</div>
              </button>
            </div>
          </div>

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

          <div className="section-wrapper">
            <h3 className="section-toggle-btn" style={{ cursor: 'default' }}>
              <span>History Log</span>
            </h3>
            <div className="history-grid-container">
              {displayHistoryRows.map((record, index) => (
                <div key={record ? record.id : `empty-${index}`} className="history-item">
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
                      onClick={() => handleDelete(record.id)} 
                      className="edit-icon-btn text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                      aria-label="Delete record"
                    >
                      <TrashIcon />
                    </button>
                  ) : (
                    <span className="edit-btn-placeholder" />
                  )}
                </div>
              ))}
            </div>
          </div>

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

if (typeof window !== "undefined") {
  const filterWarning = (args: any[], originalFn: (...args: any[]) => void) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("should be greater than 0")
    ) {
      return;
    }
    originalFn(...args);
  };

  const originalConsoleError = console.error;
  console.error = (...args: any[]) => filterWarning(args, originalConsoleError);
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => filterWarning(args, originalConsoleWarn);
}