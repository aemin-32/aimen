
import { Difficulty, Stat, Reminder } from './types';
import { Subtask } from './taskTypes'; // 👈 Import Subtask definition

// 🏛️ MODULE 04: RAID ENTITIES
export interface PendingRaidStep extends Omit<RaidStep, 'id' | 'isCompleted'> {
    id: string; // We need ID for list management
    isLocked: boolean;
    difficulty?: Difficulty;
    stat?: Stat;
    scheduledTime?: string;
    deadline?: string;
    isTimed?: boolean;
    durationMinutes?: number;
}

export interface RaidStep {
  id: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  notes?: string; // The Intel
  isArchived?: boolean; // For archiving steps
  scheduledDate?: string; // Legacy date
  
  // ⏰ UPDATED SCHEDULING
  scheduledTime?: string; // ISO String for exact timing
  deadline?: string; // 👈 NEW: Deadline for step
  reminders?: Reminder[];

  // ⏱️ TIMING (New Feature)
  isTimed?: boolean;
  durationMinutes?: number;

  // 🆕 SUBTASKS (Granular Steps)
  subtasks?: Subtask[]; 
  
  // 🟢 NEW: GRANULAR CONTROL (Overrides Parent Raid)
  difficulty?: Difficulty; 
  stat?: Stat;
  // skillId removed to enforce inheritance from parent Raid
}

export interface RaidRequirement {
    skillId: string;
    minLevel: number;
}

export interface Raid {
  id: string;
  title: string; // Strategic Title
  description?: string; // 👈 NEW: Operation Briefing
  deadline?: string;
  difficulty: Difficulty; // Determines loot for ALL steps
  stats: Stat[]; 
  skillId?: string; 
  requirements?: RaidRequirement;
  steps: RaidStep[];
  status: 'active' | 'completed' | 'archived';
  progress: number; // 0-100
  
  // 🆕 G12 MARKER
  isCampaign?: boolean; // True if part of 12 Week Year
}
