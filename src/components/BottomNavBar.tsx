import React, { useState, useEffect } from 'react';
import { Timer, Heart } from 'lucide-react';

type Tab = 'timer' | 'history' | 'bond';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-muted/10 bg-background">
      {isDesktop ? (
        /* ==========================================
           PC用レイアウト: 2タブ構成
           ========================================== */
        <>
          <button
            onClick={() => setActiveTab('timer')}
            className={`btn-nav relative flex flex-col items-center justify-center ${
              activeTab === 'timer' || activeTab === 'history' ? 'active' : ''
            }`}
          >
            <div className="relative flex flex-col items-center">
              <Timer size={30} />
              <div className={`btn-nav-bar absolute rounded-full ${
                activeTab === 'timer' || activeTab === 'history' ? 'active' : ''
              }`}/>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('bond')}
            className={`btn-nav relative flex flex-col items-center justify-center ${
              activeTab === 'bond' ? 'active' : ''
            }`}
          >
            <div className="relative flex flex-col items-center">
              <Heart size={30} />
              <div className={`btn-nav-bar absolute rounded-full ${
                activeTab === 'bond' ? 'active' : ''
              }`}/>
            </div>
          </button>
        </>
      ) : (
        /* ==========================================
           スマホ用レイアウト: 3タブ構成
           ========================================== */
        <>
          <button
            onClick={() => setActiveTab('timer')}
            className={`btn-nav relative flex flex-col items-center justify-center ${activeTab === 'timer' ? 'active' : ''}`}
          >
            <div className="relative flex flex-col items-center">
              <Timer size={30} />
              <div className={`btn-nav-bar absolute rounded-full ${activeTab === 'timer' ? 'active' : ''}`}/>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`btn-nav relative flex flex-col items-center justify-center ${activeTab === 'history' ? 'active' : ''}`}
          >
            <div className="relative flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              <div className={`btn-nav-bar absolute rounded-full ${activeTab === 'history' ? 'active' : ''}`}/>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('bond')}
            className={`btn-nav relative flex flex-col items-center justify-center ${activeTab === 'bond' ? 'active' : ''}`}
          >
            <div className="relative flex flex-col items-center">
              <Heart size={30} />
              <div className={`btn-nav-bar absolute rounded-full ${activeTab === 'bond' ? 'active' : ''}`}/>
            </div>
          </button>
        </>
      )}
    </div>
  );
};

export default BottomNavBar;