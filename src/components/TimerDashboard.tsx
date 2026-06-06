"use client";

import { useState, useEffect, useMemo } from 'react';
import { addHours, differenceInMilliseconds } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import CountdownDisplay from './CountdownDisplay';
import { getSessionEndTime } from '@/lib/timeUtils';

const JST_TZ = 'Asia/Tokyo';

interface TimerDashboardProps {
  tapHistory: number[];
  lastTapTime: Date | null;
  ticket1Time: Date | null;
  ticket2Time: Date | null;
  onTap: () => void;
  onInvite: (ticketNumber: 1 | 2) => void;
  isSyncing: boolean;
  isDataLoaded: boolean;
}

export default function TimerDashboard({
  tapHistory,
  lastTapTime,
  ticket1Time,
  ticket2Time,
  onTap,
  onInvite,
  isSyncing,
  isDataLoaded,
}: TimerDashboardProps) {
  const [now, setNow] = useState(new Date());
  
  // デバイスのタイムゾーンを取得
  const userTimeZone = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        return JST_TZ;
      }
    }
    return JST_TZ;
  }, []);

  // 日本時間（JST）設定かどうかを判定
  const isJst = userTimeZone === JST_TZ;

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 次回タップまでの残り時間計算
  const cafeTapRemaining = useMemo(() => {
    if (!lastTapTime) return 0;
    const endTime = getSessionEndTime(lastTapTime);
    if (!endTime) return 0;
    return Math.max(0, differenceInMilliseconds(endTime, now));
  }, [now, lastTapTime]);

  const canTapCafe = useMemo(() => {
    if (!isDataLoaded) return false;
    if (!lastTapTime) return true;
    return cafeTapRemaining <= 0;
  }, [isDataLoaded, lastTapTime, cafeTapRemaining]);

  // チケットの残り時間計算
  const ticket1Remaining = useMemo(() => {
    if (!ticket1Time) return 0;
    return differenceInMilliseconds(addHours(ticket1Time, 20), now);
  }, [now, ticket1Time]);

  const ticket2Remaining = useMemo(() => {
    if (!ticket2Time) return 0;
    return differenceInMilliseconds(addHours(ticket2Time, 20), now);
  }, [now, ticket2Time]);

  // 8スロットの生成ロジック
  const dailySlots = useMemo(() => {
    // 1. 日本時間での現在時刻をベースにサイクルの起点(04:00)を算出
    const nowJstStr = formatInTimeZone(now, JST_TZ, "yyyy-MM-dd'T'HH:mm:ss");
    const jstNow = new Date(nowJstStr);
    
    let cycleStartDate = new Date(jstNow);
    if (jstNow.getHours() < 4) {
      cycleStartDate.setDate(cycleStartDate.getDate() - 1);
    }
    
    const cycleStartJstStr = `${formatInTimeZone(cycleStartDate, JST_TZ, "yyyy-MM-dd")}T04:00:00`;
    const cycleStartUtc = fromZonedTime(cycleStartJstStr, JST_TZ);

    return Array.from({ length: 8 }, (_, i) => {
      const startUtc = addHours(cycleStartUtc, i * 3);
      const endUtc = addHours(startUtc, 3);
      
      // 履歴からこの枠に収まるタップを探す
      const tapEntry = (tapHistory || []).find((t) => {
        const tapMs = new Date(t).getTime();
        return tapMs >= startUtc.getTime() && tapMs < endUtc.getTime();
      });

      const tapMs = tapEntry ? new Date(tapEntry).getTime() : null;

      // 表示用ラベルの決定 タップ済みの場合は実測時間、未タップの場合は枠の開始時間を採用
      const mainLabel = tapMs 
        ? formatInTimeZone(tapMs, userTimeZone, 'HH:mm')
        : formatInTimeZone(startUtc, userTimeZone, 'HH:mm');

      const subLabelJst = tapMs 
        ? formatInTimeZone(tapMs, JST_TZ, 'HH:mm')
        : formatInTimeZone(startUtc, JST_TZ, 'HH:mm');

      return {
        mainLabel,
        subLabelJst,
        isCurrent: now >= startUtc && now < endUtc,
        hasTapped: !!tapEntry
      };
    });
  }, [tapHistory, now, userTimeZone]);

  return (
    <div className="dashboard-container">
      <div className="timer-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="timer-card-title">Next Tap</h2>
        </div>

        <div className="countdown-text-l mb-6">
          <CountdownDisplay milliseconds={cafeTapRemaining} />
        </div>

        <div className="slot-grid">
          {dailySlots.map((slot, i) => (
            <div 
              key={i}
              className={`slot-item ${
                  slot.hasTapped 
                      ? 'slot-tapped' 
                      : slot.isCurrent
                          ? 'slot-current'
                          : 'slot-default'
              }`}
            >
              <div className="flex flex-col items-center leading-tight">
                <span 
                  className="slot-text-main"
                  style={!isJst ? { marginTop: '-0.5cqw' } : {}}
                >
                  {slot.mainLabel}
                </span>
                {!isJst && (
                  <span className="slot-text-sub whitespace-nowrap">
                    {slot.subLabelJst} JST
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => onTap()} 
          disabled={!canTapCafe || isSyncing}
          className="btn-timer btn-timer-tap"
        >
          <span>{ !isDataLoaded ? 'Wait...' : isSyncing ? 'Wait...' : 'Tap' }</span>
        </button>
      </div>

      <div className="timer-card">
        <h2 className="timer-card-title mb-4">Next Call</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="countdown-text-s bg-background/50 pt-1 pl-1 rounded">
              <CountdownDisplay milliseconds={ticket1Remaining} />
            </div>
            <button 
              onClick={() => onInvite(1)}
              disabled={!isDataLoaded || ticket1Remaining > 0 || isSyncing}
              className="btn-timer btn-timer-tap"
            ><span>{ isSyncing ? 'Wait...' : 'Ticket 1' }</span></button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="countdown-text-s bg-background/50 pt-1 pl-1 rounded">
              <CountdownDisplay milliseconds={ticket2Remaining} />
            </div>
            <button 
              onClick={() => onInvite(2)}
              disabled={!isDataLoaded || ticket2Remaining > 0 || isSyncing}
              className="btn-timer btn-timer-tap"
            ><span>{ isSyncing ? 'Wait...' : 'Ticket 2' }</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}