import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- استيراد المزودات (Providers) يدوياً ---
import { LifeOSProvider } from './contexts/LifeOSContext';
import { SkillProvider } from './contexts/SkillContext';
import { TaskProvider } from './contexts/TaskContext';
import { HabitProvider } from './contexts/HabitContext';
import { RaidProvider } from './contexts/RaidContext';
import { ShopProvider } from './contexts/ShopContext';
import { CampaignProvider } from './contexts/CampaignContext';
import { BadgeProvider } from './contexts/BadgeContext';
import { CalendarProvider } from './contexts/CalendarContext'; // 👈 IMPORT
import ErrorBoundary from './components/ErrorBoundary'; // 👈 IMPORT

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* ترتيب المزودات مهم: LifeOS هو الأساس */}
      <LifeOSProvider>
        <SkillProvider>
          <TaskProvider>
            <HabitProvider>
              <RaidProvider>
                <ShopProvider>
                  <CampaignProvider>
                    <BadgeProvider>
                      <CalendarProvider> {/* 👈 WRAP */}
                        <App />
                      </CalendarProvider>
                    </BadgeProvider>
                  </CampaignProvider>
                </ShopProvider>
              </RaidProvider>
            </HabitProvider>
          </TaskProvider>
        </SkillProvider>
      </LifeOSProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// 🟢 SERVICE WORKER REGISTRATION (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}