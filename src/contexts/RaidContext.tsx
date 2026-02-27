
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Raid, RaidStep } from '../types/raidTypes';
import { Difficulty, Stat, LootPayload } from '../types/types';
import { useLifeOS } from './LifeOSContext';
import { useSkills } from './SkillContext';
import { playSound } from '../utils/audio';
import { REWARDS } from '../types/constants';
import { calculateTaskReward } from '../utils/economyEngine';
import { usePersistence } from '../hooks/usePersistence';
import { useRaidActions } from './hooks/useRaidActions';

interface RaidState {
    raids: Raid[];
}

interface RaidContextType {
    raidState: RaidState;
    raidDispatch: {
        addRaid: (raid: Omit<Raid, 'id' | 'status' | 'progress'>) => void;
        updateRaid: (raidId: string, updates: Partial<Raid>) => void; 
        deleteRaid: (raidId: string) => void;
        toggleRaidStep: (raidId: string, stepId: string) => void;
        updateRaidStep: (raidId: string, stepId: string, updates: Partial<RaidStep>) => void;
        mergeRaidSteps: (raidId: string, newSteps: Partial<RaidStep>[]) => void;
        toggleRaidStepSubtask: (raidId: string, stepId: string, subtaskId: string) => void;
        archiveRaid: (raidId: string) => void;
        archiveRaidStep: (raidId: string, stepId: string) => void;
        deleteRaidStep: (raidId: string, stepId: string) => void;
        restoreRaid: (raidId: string) => void;
        restoreData: (raids: Raid[]) => void;
    };
}

const STORAGE_KEY_RAIDS = 'LIFE_OS_RAIDS_DATA';

const RaidContext = createContext<RaidContextType | undefined>(undefined);

// Migration Logic
const migrateRaid = (r: any): Raid => {
    return {
        ...r,
        status: r.status || 'active',
        progress: r.progress || 0,
        isCampaign: r.isCampaign || false,
        steps: (r.steps || []).map((s: any) => ({
            ...s,
            isCompleted: !!s.isCompleted,
            isLocked: !!s.isLocked,
            subtasks: s.subtasks || []
        }))
    };
};

const migrateRaidState = (data: any): { raids: Raid[] } => {
    const rawRaids = Array.isArray(data) ? data : (data.raids || []);
    return {
        raids: rawRaids.map(migrateRaid)
    };
};

export const RaidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🟢 USE PERSISTENCE HOOK
    const [state, setState] = usePersistence<{ raids: Raid[] }>(
        'LIFE_OS_RAIDS_DATA',
        { raids: [] },
        'raids_data',
        migrateRaidState
    );
    
    const raidActions = useRaidActions(state, setState, soundEnabled);

    return (
        <RaidContext.Provider value={{ 
            raidState: state, 
            raidDispatch: raidActions 
        }}>
            {children}
        </RaidContext.Provider>
    );
};

export const useRaids = () => {
    const context = useContext(RaidContext);
    if (context === undefined) {
        throw new Error('useRaids must be used within a RaidProvider');
    }
    return context;
};
