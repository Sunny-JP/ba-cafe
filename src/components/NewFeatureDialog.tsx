"use client";

import React, { useState, useEffect } from 'react';

export default function NewFeatureDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isNotified = localStorage.getItem('new_feature_notified');
      if (!isNotified) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleClose = () => {
    if (isChecked) {
      localStorage.setItem('new_feature_notified', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-100 flex justify-center items-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl shadow-xl border border-dashed bg-(--card) border-(--muted) flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="border-b border-dashed flex justify-between items-center p-5">
          <h2 className="text-xl font-bold text-(--foreground) tracking-wide flex items-center gap-2">
            <span>✨</span> 新機能追加のお知らせ
          </h2>
        </div>

        <div className="p-6 flex flex-col gap-4 text-sm font-medium leading-relaxed text-(--secondary-foreground)">
          <p>いつもご利用いただきありがとうございます！</p>
          
          <div className="bg-(--background) p-4 rounded-xl border border-dashed border-(--muted)/60 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <span className="text-base">▶</span>
              <div>
                <strong className="text-(--foreground) block font-bold">絆上げ記録機能</strong>
                <span className="text-xs">生徒さんごとに絆上げの記録をつけられるようになりました。日付とランクを入力して登録できます。</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">▶</span>
              <div>
                <strong className="text-(--foreground) block font-bold">絆ランク100の未来予想線</strong>
                <span className="text-xs">現在の進捗ペースから絆ランク100に到達する日付を予測して、グラフに破線で描画します。</span>
              </div>
            </div>
          </div>
        </div>

        {/* 下部アクションエリア（チェックボックスとボタン） */}
        <div className="p-4 bg-(--background)/50 border-t border-dashed border-(--muted)/40 flex flex-col gap-3">
          <label className="flex items-center gap-2 px-1 cursor-pointer select-none text-xs text-(--secondary-foreground) font-bold">
            <input 
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded border-(--muted) text-(--primary) focus:ring-(--primary) cursor-pointer"
            />
            <span>今後このお知らせを表示しない</span>
          </label>

          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl font-bold bg-(--primary) text-(--primary-foreground) transition-all active:scale-98 cursor-pointer shadow-sm hover:brightness-105"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
}