
import React, { useEffect, useState } from 'react';
// --- تصحيح مسارات الـ Contexts (داخل مجلد contexts) ---
import { useLifeOS } from './contexts/LifeOSContext';
// --- المكونات الأساسية ---
import Navigation from './components/Navigation';
import Header from './components/Header';
import FocusMode from './components/focus/FocusMode';
import OnboardingSequence from './components/OnboardingSequence';
import NotificationManager from './components/NotificationManager'; // 👈 NEW

// --- تصحيح مسارات الـ Views (داخل مجلد views) ---
import TasksView from './components/views/TasksView';
import HabitsView from './components/views/HabitsView';
import RaidsView from './components/views/RaidsView';
import ShopView from './components/views/ShopView';
import ProfileView from './components/views/ProfileView';
import CampaignView from './components/views/CampaignView';
import SkillsView from './components/views/SkillsView';

// --- تصحيح مسارات الـ Modals (داخل مجلد modals) ---
import SkillDetails from './components/modals/SkillDetails';
import HabitDetails from './components/modals/HabitDetails';
import AddTaskModal from './components/modals/AddTaskModal';
import LevelUpModal from './components/modals/LevelUpModal';
import StreakModal from './components/modals/StreakModal';
import DeveloperConsole from './components/modals/DeveloperConsole';
import ItemDetailsModal from './components/modals/ItemDetailsModal';
import ResetConfirmModal from './components/modals/ResetConfirmModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import LootModal from './components/modals/LootModal';
import QuickSubtaskModal from './components/modals/QuickSubtaskModal'; // 👈 NEW
import DataExchangeModal from './components/modals/DataExchangeModal'; // 👈 NEW
import HonorBreakdownModal from './components/modals/HonorBreakdownModal'; // 👈 NEW IMPORT
import QuestForgeModal from './components/modals/QuestForgeModal'; // 👈 NEW IMPORT
import HabitProtocolModal from './components/modals/HabitProtocolModal'; // 👈 NEW IMPORT
import EconomyProtocolModal from './components/modals/EconomyProtocolModal'; // 👈 NEW IMPORT
import RaidProtocolModal from './components/modals/RaidProtocolModal'; // 👈 NEW IMPORT
import SkillProtocolModal from './components/modals/SkillProtocolModal'; // 👈 NEW IMPORT
import ShopProtocolModal from './components/modals/ShopProtocolModal'; // 👈 NEW IMPORT
import CodexArbiterModal from './components/modals/CodexArbiterModal'; // 👈 NEW IMPORT
import BadgeProtocolModal from './components/modals/BadgeProtocolModal'; // 👈 NEW IMPORT
import GuidesMenuModal from './components/modals/GuidesMenuModal'; // 👈 NEW IMPORT

// --- شارات (Badges) ---
import HallOfFame from './components/badges/HallOfFame';
import BadgeUnlockModal from './components/badges/BadgeUnlockModal';
import ToastContainer from './components/ToastContainer'; // 👈 Add Toast Container

const MainContent: React.FC = () => {
  const { state, dispatch } = useLifeOS();
  const { ui, user } = state;
  const [shake, setShake] = useState(false);

  // 🌍 GLOBAL SHAKE LISTENER
  useEffect(() => {
      const handleShake = () => {
          setShake(true);
          setTimeout(() => setShake(false), 500);
      };
      window.addEventListener('trigger-shake', handleShake);
      return () => window.removeEventListener('trigger-shake', handleShake);
  }, []);

  // 🛡️ CHECK ONBOARDING STATUS
  if (!user.hasOnboarded) {
      return <OnboardingSequence />;
  }

  const renderContent = () => {
    switch (ui.currentView) {
      case 'profile': return <ProfileView />;
      case 'shop': return <ShopView />;
      case 'tasks': return <TasksView />;
      case 'habits': return <HabitsView />;
      case 'raids': return <RaidsView />;
      case 'campaign': return <CampaignView />;
      case 'skills': return <SkillsView />; 
      case 'hall_of_fame': return <HallOfFame />;
      default: return null;
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] bg-life-black text-life-text overflow-hidden select-none font-sans ${shake ? 'animate-shake' : ''} pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}>
        
        {/* 🔔 NOTIFICATION DAEMON */}
        <NotificationManager />
        
        {/* 🍞 TOAST CONTAINER */}
        <ToastContainer />

        {/* 🟢 HEADER */}
        <Header />

        {/* 🟢 MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative p-4 scroll-smooth">
            {/* Background Grid Decoration */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            <div className="max-w-md mx-auto h-full">
                {renderContent()}
            </div>
        </main>

        {/* 🟢 UI LAYERS */}
        {ui.activeModal === 'addTask' && <AddTaskModal />}
        {ui.activeModal === 'levelUp' && <LevelUpModal />} 
        {ui.activeModal === 'badgeUnlock' && <BadgeUnlockModal />}
        {ui.activeModal === 'streak' && <StreakModal />} 
        {ui.activeModal === 'devConsole' && <DeveloperConsole />} 
        {ui.activeModal === 'itemDetails' && <ItemDetailsModal />}
        {ui.activeModal === 'resetConfirm' && <ResetConfirmModal />} 
        {ui.activeModal === 'confirmation' && <ConfirmationModal />} 
        {ui.activeModal === 'loot' && <LootModal />} 
        {ui.activeModal === 'quickSubtask' && <QuickSubtaskModal />} 
        {ui.activeModal === 'dataExchange' && <DataExchangeModal />} 
        {ui.activeModal === 'honorBreakdown' && <HonorBreakdownModal />} {/* 👈 NEW */}
        {ui.activeModal === 'questForge' && <QuestForgeModal />} {/* 👈 NEW */}
        {ui.activeModal === 'habitProtocol' && <HabitProtocolModal />} {/* 👈 NEW */}
        {ui.activeModal === 'economyProtocol' && <EconomyProtocolModal />} {/* 👈 NEW */}
        {ui.activeModal === 'raidProtocol' && <RaidProtocolModal />} {/* 👈 NEW */}
        {ui.activeModal === 'skillProtocol' && <SkillProtocolModal />} {/* 👈 NEW */}
        {ui.activeModal === 'shopProtocol' && <ShopProtocolModal />} {/* 👈 NEW */}
        {ui.activeModal === 'codexArbiter' && <CodexArbiterModal />} {/* 👈 NEW */}
        {ui.activeModal === 'badgeProtocol' && <BadgeProtocolModal />} {/* 👈 NEW */}
        {ui.activeModal === 'guidesMenu' && <GuidesMenuModal />} {/* 👈 NEW */}
        
        {/* 🧘 FOCUS OVERLAY */}
        <FocusMode /> 

        {/* 🔍 DETAILS OVERLAYS */}
        <SkillDetails />
        <HabitDetails /> 

        {/* 🟢 NAVIGATION BAR */}
        <Navigation />
    </div>
  );
};

const App: React.FC = () => {
  return <MainContent />;
};

export default App;
