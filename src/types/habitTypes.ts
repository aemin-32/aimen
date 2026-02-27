
import { Difficulty, Stat, Reminder } from './types';
import { Subtask } from './taskTypes'; // Reuse Subtask type

export type HabitType = 'daily' | 'specific_days' | 'interval' | 'custom';
export type DailyStatus = 'pending' | 'completed' | 'failed' | 'skipped';

export interface HabitCategory {
    id: string;
    title: string;
    isCollapsed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  skillId?: string; 
  difficulty: Difficulty;
  stat: Stat;
  createdAt: string; 
  
  // Taxonomy Logic
  type: HabitType;
  specificDays?: number[]; 
  intervalValue?: number; 
  pattern?: string; 
  
  // Organization
  categoryId?: string; 

  // The Golden Ladder Data
  streak: number;        
  checkpoint: number;    
  bestStreak: number;    
  
  status: DailyStatus;
  history: string[]; 
  shieldUsed?: boolean; 

  // 🆕 Sub-routines (Side Missions for Habits)
  subtasks: Subtask[]; 

  // Timer Logic
  isTimed?: boolean;
  durationMinutes?: number;

  // 🔄 Daily Iterations (New)
  dailyTarget?: number; // How many times per day (default 1)
  dailyProgress?: number; // 👈 NEW: Tracks reps today

  // 🔢 LIMITED REPETITIONS (New Feature)
  totalRepetitions?: number; // Total times this habit can be done before archiving
  currentRepetitions?: number; // Counter for total completions
  isArchived?: boolean; // 👈 NEW: Archive flag

  // ⏰ SCHEDULING & REMINDERS
  scheduledTime?: string; 
  reminders?: Reminder[]; 
}
