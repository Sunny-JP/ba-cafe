import React from 'react';
import { Timer, CalendarDays, Heart } from 'lucide-react';

type Tab = 'timer' | 'history' | 'bond';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'timer' as const, icon: Timer },
    { id: 'history' as const, icon: CalendarDays },
    { id: 'bond' as const, icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 desktop-hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-nav relative flex flex-col items-center justify-center ${isActive ? 'active' : ''}`}
          >
            <div className="relative flex flex-col items-center">
              <Icon size={30} />
              <div className={`btn-nav-bar absolute rounded-full ${isActive ? 'active' : ''}`}/>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavBar;