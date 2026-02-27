
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
// --- تصحيح المسارات (الرجوع خطوة واحدة ../ للوصول للمجلدات المجاورة) ---
import { Habit, DailyStatus, HabitCategory } from '../types/habitTypes';
import { Difficulty, Stat, Toast, Reminder } from '../types/types';
import { useLifeOS } from './LifeOSContext'; // ملف مجاور (نفس المجلد)
import { useSkills } from './SkillContext';   // ملف مجاور (نفس المجلد)
import { checkHabitActive, calculateFall } from '../utils/habitEngine'; // في مجلد utils
import { playSound } from '../utils/audio';
import { calculateTaskReward } from '../utils/economyEngine';
// 🟢 Updated Import
import { calculateMonthlyAverage, calculateDailyHonorPenalty } from '../utils/honorSystem'; 
import { usePersistence } from '../hooks/usePersistence';
import { useHabitActions } from './hooks/useHabitActions';

// 🏗️ Define Shape of Habit Store
interface HabitState {
    habits: Habit[];
    categories: HabitCategory[];
    activeHabitId: string | null;
}

interface HabitContextType {
    habitState: HabitState;
    habitDispatch: {
        addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'status' | 'history' | 'checkpoint' | 'bestStreak' | 'createdAt'>) => void;
        updateHabit: (habitId: string, updates: Partial<Habit>) => void; 
        processHabit: (habitId: string, status: DailyStatus) => void;
        deleteHabit: (habitId: string) => void;
        setActiveHabit: (id: string | null) => void;
        addCategory: (title: string) => void;
        deleteCategory: (id: string) => void;
        renameCategory: (id: string, newTitle: string) => void;
        toggleCategory: (id: string) => void;
        moveHabit: (habitId: string, categoryId: string | undefined) => void;
        toggleSubtask: (habitId: string, subtaskId: string) => void; 
        restoreData: (habits: Habit[], categories: HabitCategory[]) => void;
    };
}

const STORAGE_KEY_HABITS = 'LIFE_OS_HABITS_DATA';
const STORAGE_KEY_CATEGORIES = 'LIFE_OS_HABIT_CATEGORIES';

// 🧹 CLEARED MOCK DATA (Empty Array for Clean Slate)
const INITIAL_HABITS: Habit[] = [
    {
      "id": "h_1771593541489_o581bvlg5",
      "title": "Clean room ",
      "description": "",
      "difficulty": Difficulty.NORMAL,
      "stat": Stat.DIS,
      "type": "specific_days",
      "specificDays": [
        1,
        4,
        5,
        6
      ],
      "isTimed": false,
      "reminders": [],
      "subtasks": [],
      "dailyTarget": 1,
      "streak": 0,
      "status": "pending",
      "history": [],
      "checkpoint": 0,
      "bestStreak": 0,
      "createdAt": "2026-02-20T13:19:01.489Z",
      "dailyProgress": 0
    }
];

const INITIAL_CATEGORIES: HabitCategory[] = [
    { id: 'cat_morning', title: '☀️ Morning Protocol', isCollapsed: false },
    { id: 'cat_health', title: '💪 Health & Body', isCollapsed: false },
    { id: 'cat_night', title: '🌙 Night Routine', isCollapsed: false },
];

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Migration Logic
const migrateHabit = (h: any): Habit => {
    let reminders: Reminder[] = h.reminders || [];
    if (!h.reminders && h.reminderMinutes && h.reminderMinutes > 0) {
        reminders = [{ id: `mig_${Date.now()}_${Math.random()}`, minutesBefore: h.reminderMinutes, isSent: !!h.isReminderSent }];
    }

    return {
        difficulty: Difficulty.NORMAL,
        stat: Stat.DIS,
        type: 'daily',
        history: [],
        streak: 0,
        checkpoint: 0,
        bestStreak: 0,
        status: 'pending',
        isTimed: false, 
        durationMinutes: 0,
        reminders: reminders,
        subtasks: [], 
        dailyTarget: h.dailyTarget || 1, 
        dailyProgress: h.dailyProgress || 0, 
        ...h
    }
};

const migrateHabitState = (data: any): { habits: Habit[], categories: HabitCategory[], lastHabitResetDate: string } => {
    return {
        habits: (data.habits || []).map(migrateHabit),
        categories: data.categories || INITIAL_CATEGORIES,
        lastHabitResetDate: data.lastHabitResetDate || new Date(0).toISOString() // Default to old date so it triggers on first load if needed
    };
};

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills(); 
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🟢 USE PERSISTENCE HOOK
    const [state, setState] = usePersistence<{ habits: Habit[], categories: HabitCategory[], lastHabitResetDate: string }>(
        'LIFE_OS_HABITS_COMBINED',
        { habits: INITIAL_HABITS, categories: INITIAL_CATEGORIES, lastHabitResetDate: new Date().toISOString() },
        'habits_data',
        migrateHabitState
    );
    const { habits, categories, lastHabitResetDate } = state;
    const [activeHabitId, setActiveHabitId] = useState<string | null>(null); 
    const habitActions = useHabitActions(state, setState, soundEnabled);
    const lastProcessedRef = useRef<string | null>(null);

    // 🟢 CHECK DAILY RESET (REFACTORED TO AVOID SIDE EFFECTS IN SETTER)
    useEffect(() => {
        const checkDailyReset = () => {
            const now = new Date();
            const lastOnline = new Date(lastHabitResetDate);
            
            // 🕰️ VIRTUAL TIME MACHINE
            const startHour = lifeState.user.preferences.dayStartHour ?? 4;
            const getVirtualDate = (d: Date) => {
                const shifted = new Date(d);
                shifted.setHours(d.getHours() - startHour);
                return shifted;
            };

            const vNow = getVirtualDate(now);
            const vLast = getVirtualDate(lastOnline);
            const isNewDay = vNow.getDate() !== vLast.getDate() || vNow.getMonth() !== vLast.getMonth() || vNow.getFullYear() !== vLast.getFullYear();
            const todayStr = vNow.toISOString().split('T')[0];

            if (isNewDay && lastProcessedRef.current !== todayStr) {
                lastProcessedRef.current = todayStr;
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayIso = yesterday.toISOString();
                
                let remainingShields = lifeState.user.shields; 
                let shieldsConsumed = 0;
                let statPenalties: Partial<Record<Stat, number>> = {};
                let disPenaltyTotal = 0;
                let partialRestCount = 0;

                const updatedHabits = habits.map(habit => {
                        // 🟢 0. SKIP ARCHIVED HABITS (Frozen in Time)
                        if (habit.isArchived) return habit;

                        // 🔔 RESET REMINDERS FOR NEW DAY
                        const reminders = habit.reminders ? habit.reminders.map(r => ({ ...r, isSent: false })) : [];
                        
                        // 🔄 RESET SUBTASKS & PROGRESS FOR NEW DAY
                        const subtasks = habit.subtasks ? habit.subtasks.map(s => ({ ...s, isCompleted: false })) : [];
                        
                        // Base reset object
                        const baseReset = { reminders, subtasks, dailyProgress: 0 }; // 👈 Reset Progress

                        if (habit.status === 'completed') {
                        return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false, history: [...habit.history, yesterdayIso] };
                    }
                    if (habit.status === 'failed') {
                        return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false };
                    }

                    const wasActiveYesterday = checkHabitActive(habit, yesterdayIso);
                    
                    if (wasActiveYesterday && habit.status === 'pending') {
                        // 🟢 PARTIAL PROGRESS CHECK
                        if ((habit.dailyProgress || 0) > 0) {
                            partialRestCount++;
                            return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false };
                        }

                        if (remainingShields > 0) {
                            remainingShields--;
                            shieldsConsumed++;
                            lifeDispatch.addToast(`🛡️ Shield protected: ${habit.title}`, 'info');
                            return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: true };
                        }

                        const safeFallStreak = calculateFall(habit.streak);
                        statPenalties[habit.stat] = (statPenalties[habit.stat] || 0) + 1;
                        disPenaltyTotal += 1;
                        
                        lifeDispatch.addToast(`⚠️ Missed ${habit.title}: -1 ${habit.stat} & -1 DIS`, 'error');

                        return { ...habit, ...baseReset, streak: safeFallStreak, status: 'pending' as DailyStatus, shieldUsed: false };
                    }
                    return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false };
                });

                // Apply Updates & Side Effects
                setState(prev => ({ ...prev, habits: updatedHabits, lastHabitResetDate: now.toISOString() }));

                if (shieldsConsumed > 0) {
                    lifeDispatch.updateUser({ shields: remainingShields });
                    playSound('success', soundEnabled);
                } 
                if (partialRestCount > 0) {
                    lifeDispatch.addToast(`${partialRestCount} habits partially completed (Rest Day recorded)`, 'info');
                }
                if (disPenaltyTotal > 0) {
                    playSound('error', soundEnabled);
                    const currentStats = { ...lifeState.user.stats };
                    Object.entries(statPenalties).forEach(([statKey, count]) => {
                        const key = statKey as Stat;
                        currentStats[key] = Math.max(0, currentStats[key] - (count as number));
                    });
                    currentStats[Stat.DIS] = Math.max(0, currentStats[Stat.DIS] - disPenaltyTotal);
                    
                    lifeDispatch.updateUser({ stats: currentStats });
                }
            }
        };

        checkDailyReset();
        const interval = setInterval(checkDailyReset, 60000);
        return () => clearInterval(interval);
    }, [lifeState.user.lastOnline, habits, lifeState.user.preferences.dayStartHour]); 

    
    const setActiveHabit = (id: string | null) => {
        if(id) playSound('click', soundEnabled);
        setActiveHabitId(id);
    };

    return (
        <HabitContext.Provider value={{ 
            habitState: { ...state, activeHabitId }, 
            habitDispatch: { 
                ...habitActions,
                setActiveHabit
            } 
        }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
};
