
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, TaskCategory, Law } from '../types/taskTypes';
import { Difficulty, Stat, LootPayload, Reminder } from '../types/types';
import { useLifeOS } from './LifeOSContext'; // نفس المجلد (صحيح)
import { useSkills } from './SkillContext';   // نفس المجلد (صحيح)
import { playSound } from '../utils/audio';   // مجلد خارجي
import { REWARDS, PENALTIES } from '../types/constants'; // مجلد خارجي
import { parseTimeCode, parseCalendarCode, calculateCampaignDate, getActiveCampaignData } from '../utils/campaignEngine';
import { calculateTaskReward } from '../utils/economyEngine';
// 🟢 Updated Import
import { calculateMonthlyAverage, calculateDailyHonorPenalty } from '../utils/honorSystem'; 
import { usePersistence } from '../hooks/usePersistence';
import { useTaskActions } from './hooks/useTaskActions';

interface TaskState {
    tasks: Task[];
    categories: TaskCategory[];
    laws: Law[]; 
}

interface TaskContextType {
    taskState: TaskState;
    taskDispatch: {
        addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
        updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void; 
        toggleTask: (taskId: string) => void;
        deleteTask: (taskId: string) => void;
        addCategory: (title: string) => void;
        deleteCategory: (id: string) => void;
        renameCategory: (id: string, newTitle: string) => void;
        toggleCategory: (id: string) => void;
        moveTask: (taskId: string, categoryId: string | undefined) => void;
        archiveTask: (taskId: string) => void;
        restoreTask: (taskId: string) => void;
        toggleSubtask: (taskId: string, subtaskId: string) => void;
        // ⚖️ LAW FUNCTIONS
        addLaw: (title: string, type: 'gold' | 'xp' | 'stat' | 'honor', value: number, stat?: Stat) => void;
        updateLaw: (id: string, updates: Partial<Omit<Law, 'id'>>) => void; 
        deleteLaw: (id: string) => void;
        enforceLaw: (id: string) => void;
        // 🔄 RESTORE
        restoreData: (tasks: Task[], categories: TaskCategory[], laws: Law[]) => void;
    };
}

const STORAGE_KEY_TASKS = 'LIFE_OS_TASKS_DATA';
const STORAGE_KEY_TASK_CATS = 'LIFE_OS_TASK_CATEGORIES';
const STORAGE_KEY_LAWS = 'LIFE_OS_LAWS_DATA'; 

const INITIAL_TASKS: Task[] = [
    {
      id: 't_01',
      title: 'Initialize LifeOS Protocol',
      description: 'System calibration complete.',
      difficulty: Difficulty.HARD,
      stat: Stat.INT,
      isCompleted: false,
      isTimed: false,
      deadline: '2024-12-31',
      subtasks: [
          { id: 'st_1', title: 'Check Audio Systems', isCompleted: true },
          { id: 'st_2', title: 'Verify Data Persistence', isCompleted: false }
      ]
    }
];

const INITIAL_CATS: TaskCategory[] = [
    { id: 'cat_work', title: '💼 Work Operations', isCollapsed: false },
    { id: 'cat_personal', title: '🏠 Personal Logs', isCollapsed: false }
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Migration Logic
const migrateTask = (t: any): Task => {
    let reminders: Reminder[] = t.reminders || [];
    if (!t.reminders && t.reminderMinutes && t.reminderMinutes > 0) {
        reminders = [{ id: `mig_${Date.now()}_${Math.random()}`, minutesBefore: t.reminderMinutes, isSent: !!t.isReminderSent }];
    }
    return {
        difficulty: Difficulty.NORMAL,
        stat: Stat.STR,
        subtasks: [],
        isTimed: false,
        isArchived: false,
        isCompleted: false,
        isCampaign: false,
        reminders: reminders,
        ...t,
    };
};

const migrateTaskState = (data: any): TaskState => {
    return {
        tasks: (data.tasks || []).map(migrateTask),
        categories: data.categories || INITIAL_CATS,
        laws: data.laws || []
    };
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🟢 USE PERSISTENCE HOOK
    const [state, setState] = usePersistence<TaskState>(
        'LIFE_OS_TASKS_COMBINED',
        { tasks: INITIAL_TASKS, categories: INITIAL_CATS, laws: [] },
        'tasks_data',
        migrateTaskState
    );
    
    const taskActions = useTaskActions(state, setState, soundEnabled);

    return (
        <TaskContext.Provider value={{ 
            taskState: state, 
            taskDispatch: taskActions 
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
