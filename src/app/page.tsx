"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/hooks/useAuth"; 
import OneSignalInit from "@/components/OneSignalInit";
import Header from "@/components/Header";
import TimerDashboard from "@/components/TimerDashboard";
import BottomNavBar from "@/components/BottomNavBar";
import HistoryCalendar from "@/components/HistoryCalendar";
import BondDashboard from "@/components/BondDashboard";
import Settings from "@/components/Settings";
import SidePanel from "@/components/SidePanel";
import { CALENDAR_LIMITS } from "@/lib/timeUtils";
import { OVERLAY_CONTENTS } from "@/components/pages";

type Tab = 'timer' | 'history' | 'bond';

const Overlay = ({ contentKey, onClose }: { contentKey: string; onClose: () => void }) => {
  const content = OVERLAY_CONTENTS[contentKey];
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-(--background) z-100 flex justify-center items-start p-6">
      <div className="w-full max-w-4xl max-h-[93svh] mt-2 rounded-2xl shadow-xl border flex flex-col overflow-hidden">
        <div className="border-b border-dashed flex justify-between items-center z-20">
          <h1 className="text-2xl px-6 py-4 font-bold truncate mr-4">
            {content.title}
          </h1>
          <button 
            onClick={onClose}
            className="btn-close px-6 py-4 cursor-pointer"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 font-normal">
          {content.body}
        </div>
        <div className="h-2" />
      </div>
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [session, setSession] = useState<any>(null);
  const [timerHistory, setTimerHistory] = useState<number[]>([]);
  const [calendarHistory, setCalendarHistory] = useState<number[]>([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [ticket1Time, setTicket1Time] = useState<Date | null>(null);
  const [ticket2Time, setTicket2Time] = useState<Date | null>(null);
  const [bondHistory, setBondHistory] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [overlayKey, setOverlayKey] = useState<string | null>(null);

  const isInitialFetched = useRef(false);

  const fetchBondHistory = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return;
    try {
      const res = await fetch('/api/bond', {
        headers: { 'Authorization': `Bearer ${s.access_token}` }
      });
      const data = await res.json();
      setBondHistory(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, []);

  const handleSaveBond = async (level: number, date: string, charKey: string) => {
    if (!session || isSyncing) return;
    setIsSyncing(true);
    try {
      await fetch('/api/bond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ char_key: charKey, bond_level: level, recorded_at: date })
      });
      await fetchBondHistory();
    } finally { setIsSyncing(false); }
  };

  const fetchMonthlyData = useCallback(async (year: number, month: number) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.user?.id) return [];
    try {
      const { data, error } = await supabase.rpc('get_taps_by_logical_month', {
        target_user_id: s.user.id, target_year: year, target_month: month
      });
      if (error) throw error;
      return (data || []).map((t: any) => new Date(t.tap_time).getTime());
    } catch (e) {
      console.error("RPC Error:", e);
      return [];
    }
  }, []);

  const handleMonthChange = useCallback(async (year: number, month: number) => {
    const targetDate = new Date(year, month - 1, 1);
    const minLimit = new Date(CALENDAR_LIMITS.MIN.getFullYear(), CALENDAR_LIMITS.MIN.getMonth(), 1);
    const maxLimit = new Date(CALENDAR_LIMITS.MAX.getFullYear(), CALENDAR_LIMITS.MAX.getMonth(), 1);
    if (targetDate < minLimit || targetDate > maxLimit) return;
    setCalendarDate(targetDate);
    const data = await fetchMonthlyData(year, month);
    setCalendarHistory(data);
  }, [fetchMonthlyData]);

  const loadInitialData = useCallback(async () => {
    if (isInitialFetched.current) return;
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.user?.id) { setIsAuthChecking(false); return; }
    isInitialFetched.current = true;
    try {
      const now = new Date();
      const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      let year = jstNow.getUTCFullYear();
      let month = jstNow.getUTCMonth() + 1;
      if (jstNow.getUTCDate() === 1 && jstNow.getUTCHours() < 4) {
        const prev = new Date(jstNow); prev.setUTCDate(0);
        year = prev.getUTCFullYear(); month = prev.getUTCMonth() + 1;
      }
      setCalendarDate(new Date(year, month - 1, 1));
      const [profileRes, monthlyData] = await Promise.all([
        supabase.from('profiles').select('ticket1_time, ticket2_time').eq('id', s.user.id).single(),
        fetchMonthlyData(year, month)
      ]);
      if (profileRes.data) {
        if (profileRes.data.ticket1_time) setTicket1Time(new Date(profileRes.data.ticket1_time));
        if (profileRes.data.ticket2_time) setTicket2Time(new Date(profileRes.data.ticket2_time));
      }
      setCalendarHistory(monthlyData);
      setTimerHistory(monthlyData);
      setIsDataLoaded(true);
    } finally { setIsAuthChecking(false); }
  }, [fetchMonthlyData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) loadInitialData(); else setIsAuthChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) loadInitialData(); else { setIsAuthChecking(false); setIsDataLoaded(false); isInitialFetched.current = false; }
    });
    return () => subscription.unsubscribe();
  }, [loadInitialData]);

  useEffect(() => {
    const RELOAD_THRESHOLD = 3;
    const RELOAD_INTERVAL = 5000;
    const now = Date.now();
    const lastReload = sessionStorage.getItem('last_reload_time');
    const reloadCount = parseInt(sessionStorage.getItem('reload_count') || '0');
    if (lastReload && now - parseInt(lastReload) < RELOAD_INTERVAL) {
      const newCount = reloadCount + 1;
      sessionStorage.setItem('reload_count', newCount.toString());
      if (newCount >= RELOAD_THRESHOLD) {
        alert("短時間に連続してリロードされています。サーバ負荷軽減のため、しばらく時間を置いてから操作してください。");
        sessionStorage.setItem('reload_count', '0');
      }
    } else {
      sessionStorage.setItem('reload_count', '1');
    }
    sessionStorage.setItem('last_reload_time', now.toString());
  }, []);

  const handleTap = async () => { 
    if (!session || isSyncing) return;
    setIsSyncing(true);
    const now = new Date(); now.setMilliseconds(0);
    const ms = now.getTime();
    setTimerHistory(prev => [...prev, ms]);
    const tapJST = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    if (tapJST.getUTCFullYear() === calendarDate.getFullYear() && (tapJST.getUTCMonth() + 1) === (calendarDate.getMonth() + 1)) {
      setCalendarHistory(prev => [...prev, ms]);
    }
    try {
      const { data: { session: curS } } = await supabase.auth.getSession();
      if (curS) {
        await fetch('/api/tap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${curS.access_token}` },
          body: JSON.stringify({ tapTime: now.toISOString() })
        });
      }
    } finally { setIsSyncing(false); }
  };

  const handleInvite = async (num: 1 | 2) => {
    if (!session || isSyncing) return;
    setIsSyncing(true);
    const now = new Date(); now.setMilliseconds(0);
    if (num === 1) setTicket1Time(now); else setTicket2Time(now);
    try {
      const { data: { session: curS } } = await supabase.auth.getSession();
      if (curS) {
        await fetch('/api/tap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${curS.access_token}` },
          body: JSON.stringify({ [num === 1 ? 'ticket1Time' : 'ticket2Time']: now.toISOString() })
        });
      }
    } finally { setIsSyncing(false); }
  };

  if (isAuthChecking || (session && !isDataLoaded)) {
    return <div className="flex justify-center items-center h-screen bg-background font-bold">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <div className="timer-card text-center p-8 rounded-2xl shadow-lg max-w-sm w-full border border-muted">
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="mb-8 text-muted-foreground text-sm">利用するにはログインしてください</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: window.location.origin } })}
            className="w-full py-4 rounded-xl text-lg font-bold bg-[#5865F2] text-white shadow-md transition-all active:scale-95"
          >
            Discord Login
          </button>
        </div>
      </div>
    );
  }

  const lastTapTime = timerHistory.length ? new Date(timerHistory[timerHistory.length-1]) : null;

  return (
    <div className="bg-background h-screen flex flex-col">
      <OneSignalInit />
      <Header isLoggedIn={!!session} onMenuClick={() => setIsSidePanelOpen(true)} />
      
      {overlayKey && <Overlay contentKey={overlayKey} onClose={() => setOverlayKey(null)} />}

      <main className="flex-1 flex flex-col pt-16 pb-16 min-[1000px]:pb-0">
        <div className="min-[1000px]:hidden flex-1">
          {activeTab === 'timer' && (
            <TimerDashboard tapHistory={timerHistory} lastTapTime={lastTapTime} ticket1Time={ticket1Time} ticket2Time={ticket2Time} onTap={handleTap} onInvite={handleInvite} isSyncing={isSyncing} isDataLoaded={isDataLoaded} />
          )}
          {activeTab === 'history' && (
            <div className="p-4">
              <HistoryCalendar tapHistory={calendarHistory} currentDate={calendarDate} onMonthChange={handleMonthChange} />
            </div>
          )}
          {activeTab === 'bond' && (
            <BondDashboard bondHistory={bondHistory} onSave={handleSaveBond} />
          )}
        </div>
        <div className="hidden min-[1000px]:flex flex-1 justify-center p-6 h-[calc(100vh-64px)] overflow-hidden">
          <div className="grid grid-cols-3 gap-6 w-full max-w-[160svh] items-stretch mx-auto">
            <TimerDashboard tapHistory={timerHistory} lastTapTime={lastTapTime} ticket1Time={ticket1Time} ticket2Time={ticket2Time} onTap={handleTap} onInvite={handleInvite} isSyncing={isSyncing} isDataLoaded={isDataLoaded} />
            <HistoryCalendar tapHistory={calendarHistory} currentDate={calendarDate} onMonthChange={handleMonthChange} />
            <BondDashboard bondHistory={bondHistory} onSave={handleSaveBond} />
          </div>
        </div>
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)}>
          <Settings onOpenContent={(key) => { setOverlayKey(key); setIsSidePanelOpen(false); }} />
        </SidePanel>
      </main>
    </div>
  );
}