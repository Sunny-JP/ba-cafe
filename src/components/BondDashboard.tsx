"use client";

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from 'recharts';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { 
  CHARACTER_LIST, GIFT_LIST, GIFT_EXP, 
  BOND_EXP_TABLE, SPRITE_CONFIG, CharacterId
} from '@/lib/bondData';

interface BondRecord {
  char_key: string;
  bond_level: number;
  recorded_at: string;
}

export default function BondDashboard({ 
  bondHistory, 
  onSave 
}: { 
  bondHistory: BondRecord[], 
  onSave: (level: number, date: string, charKey: string) => Promise<void> 
}) {
  const [selectedCharId, setSelectedCharId] = useState(CHARACTER_LIST[0].id);
  const [inputLevel, setInputLevel] = useState(1);
  const [inputDate, setInputDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const selectedChar = useMemo(() => 
    CHARACTER_LIST.find(c => c.id === selectedCharId), [selectedCharId]);

  const sortedGifts = useMemo(() => {
    if (!selectedChar) return [];
    return GIFT_LIST.filter(gift => selectedChar.giftRatings[gift.name])
      .sort((a, b) => {
        const ratingA = selectedChar.giftRatings[a.name] || 'nb';
        const ratingB = selectedChar.giftRatings[b.name] || 'nb';
        const expA = a.baseExp * GIFT_EXP[ratingA];
        const expB = b.baseExp * GIFT_EXP[ratingB];

        if (expB !== expA) {
          return expB - expA;
        }
        return a.spriteIdx - b.spriteIdx;
      });
  }, [selectedChar]);

  // 選択中のキャラの履歴をソートして抽出
  const charHistory = useMemo(() => 
    bondHistory
      .filter(h => h.char_key === selectedCharId)
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .map(h => ({
        date: h.recorded_at,
        level: h.bond_level,
        exp: BOND_EXP_TABLE[h.bond_level] || 0,
        displayDate: format(parseISO(h.recorded_at), 'MM/dd')
      }))
  , [bondHistory, selectedCharId]);

  // 予測と統計の計算
  const stats = useMemo(() => {
    if (charHistory.length < 2) return null;
    const first = charHistory[0];
    const last = charHistory[charHistory.length - 1];
    
    const days = Math.max(1, differenceInDays(parseISO(last.date), parseISO(first.date)));
    const expGained = last.exp - first.exp;
    const dailyVelocity = expGained / days;
    
    const remainingExp = BOND_EXP_TABLE[100] - last.exp;
    const daysToGoal = dailyVelocity > 0 ? Math.ceil(remainingExp / dailyVelocity) : Infinity;
    const goalDate = isFinite(daysToGoal) ? addDays(new Date(), daysToGoal) : null;

    return {
      dailyVelocity: dailyVelocity.toFixed(1),
      goalDate: goalDate ? format(goalDate, 'yyyy/MM/dd') : '---',
      progressPercent: ((last.exp / BOND_EXP_TABLE[100]) * 100).toFixed(1)
    };
  }, [charHistory]);

  const adjustLevel = (diff: number) => {
    setInputLevel(prev => Math.min(100, Math.max(1, prev + diff)));
  };

  return (
    <div className="bond-container pb-20">
      {/* 1. キャラクター選択 & 入力 */}
      <div className="bond-card space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground ml-1">STUDENT</label>
          <div className="relative">
            <select 
              className="bond-select appearance-none cursor-pointer"
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value as any)}
            >
              {CHARACTER_LIST.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 絆ランク（上下ボタン付き） */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground ml-1">BOND LEVEL</label>
            <div className="flex items-center bg-background rounded-lg border border-muted overflow-hidden">
              <button onClick={() => adjustLevel(-1)} className="px-3 py-2 hover:bg-muted/30 active:bg-muted/50 transition-colors">-</button>
              <input 
                type="number" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full text-center bg-transparent border-none focus:ring-0 text-sm font-bold"
                value={inputLevel}
                onChange={(e) => setInputLevel(Number(e.target.value))}
              />
              <button onClick={() => adjustLevel(1)} className="px-3 py-2 hover:bg-muted/30 active:bg-muted/50 transition-colors">+</button>
            </div>
          </div>

          {/* 日付（フローティングカレンダー呼び出し） */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground ml-1">DATE</label>
            <input 
              type="date"
              className="bond-select text-sm cursor-pointer"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onClick={(e) => (e.target as any).showPicker?.()} // モダンブラウザでカレンダーを直接開く
            />
          </div>
        </div>

        {/* <button onClick={() => onSave(inputLevel, inputDate, selectedCharId)} disabled={isSyncing} className="btn-timer mt-2">
          <span>{'記録する'}</span>
        </button> */}
        <button 
          onClick={() => onSave(inputLevel, inputDate, selectedCharId)}
          className="btn-timer w-full mt-2"
        >
          <span>記録する</span>
        </button>
      </div>

      {/* 2. 贈り物効率 */}
      <div className="bond-card"> {/* カードの余白を最小限に */}
        <h3 className="timer-card-title uppercase text-[10px] mb-1.5 ml-1">Favorite Gifts</h3>
        
        {/* grid-cols-5 を維持しつつ gap を最小の 1px に。padding も削る */}
        <div className="flex flex-wrap justify-center gap-x-0.5 gap-y-4 px-0.5 py-1">
          {selectedChar && sortedGifts.map((gift) => {
            const rating = selectedChar.giftRatings[gift.name];
            const totalExp = gift.baseExp * GIFT_EXP[rating];
            const row = Math.floor(gift.spriteIdx / SPRITE_CONFIG.cols);
            const col = gift.spriteIdx % SPRITE_CONFIG.cols;

            return (
              <div key={gift.name} className="relative w-[56.8px] h-[44.8px] shrink-0">
                <div className="gift-sprite-container w-full h-full border-none!">
                  <div 
                    className="gift-sprite"
                    style={{ 
                      '--col': col, 
                      '--row': row,
                      transform: 'scale(0.5)',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    } as React.CSSProperties}
                  />
                </div>
                
                {/* 経験値バッジ：左上に密着、paddingを最小化して文字を強調 */}
                <div className={`multiplier-badge rating-${rating.slice(-1)}`}>
                  {totalExp}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. プログレス統計 */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bond-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase">達成予定日</div>
            <div className="text-lg font-bold text-primary">{stats.goalDate}</div>
          </div>
          <div className="bond-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase">進行度</div>
            <div className="text-lg font-bold">{stats.progressPercent}%</div>
          </div>
        </div>
      )}

      {/* 4. グラフ表示 */}
      <div className="bond-card">
        <h3 className="timer-card-title">EXP PROGRESS</h3>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charHistory}>
              <defs>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
              <XAxis dataKey="displayDate" fontSize={10} tickMargin={10} />
              <YAxis hide domain={[0, 240225]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--muted)' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="exp" 
                stroke="var(--primary)" 
                fillOpacity={1} 
                fill="url(#colorExp)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}