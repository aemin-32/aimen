
import { Habit, DailyStatus, HabitCategory } from '../../types/habitTypes';
import { Difficulty, Stat, Reminder } from '../../types/types';
import { useLifeOS } from '../LifeOSContext';
import { useSkills } from '../SkillContext';
import { checkHabitActive, calculateFall } from '../../utils/habitEngine';
import { playSound } from '../../utils/audio';
import { calculateTaskReward } from '../../utils/economyEngine';
import { calculateMonthlyAverage, calculateDailyHonorPenalty } from '../../utils/honorSystem';

export const useHabitActions = (
    state: { habits: Habit[], categories: HabitCategory[] },
    setState: React.Dispatch<React.SetStateAction<{ habits: Habit[], categories: HabitCategory[] }>>,
    soundEnabled: boolean
) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills();

    const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'status' | 'history' | 'checkpoint' | 'bestStreak' | 'createdAt'>) => {
        const newHabit: Habit = {
            id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...habitData,
            streak: 0,
            status: 'pending',
            history: [],
            checkpoint: 0,
            bestStreak: 0,
            createdAt: new Date().toISOString(),
            dailyProgress: 0
        };
        playSound('click', soundEnabled);
        setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
        lifeDispatch.setModal('none');
    };

    const updateHabit = (habitId: string, updates: Partial<Habit>) => {
        setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { ...h, ...updates } : h) }));
        playSound('click', soundEnabled);
    };

    const toggleSubtask = (habitId: string, subtaskId: string) => {
        setState(prev => ({ ...prev, habits: prev.habits.map(h => {
            if (h.id !== habitId) return h;
            const updatedSubtasks = h.subtasks.map(st => 
                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            );
            return { ...h, subtasks: updatedSubtasks };
        })}));
        playSound('click', soundEnabled);
    };

    const processHabit = (habitId: string, status: DailyStatus) => {
        const habit = state.habits.find(h => h.id === habitId);
        if (!habit) return;

        if (status === 'completed' && habit.dailyTarget && habit.dailyTarget > 1) {
            const currentReps = habit.dailyProgress || 0;
            const newReps = currentReps + 1;
            if (newReps < habit.dailyTarget) {
                setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { ...h, dailyProgress: newReps } : h) }));
                playSound('click', soundEnabled);
                lifeDispatch.addToast(`${habit.title}: Rep ${newReps}/${habit.dailyTarget}`, 'info');
                return;
            }
        }

        let newStreak = habit.streak;
        let newHistory = habit.history;
        let soundToPlay: 'success' | 'level-up' | 'crit' | 'error' = 'success';
        
        if (status === 'completed') {
            newStreak += 1;
            const todayIso = new Date().toISOString().split('T')[0];
            if (!newHistory.some(d => d.startsWith(todayIso))) {
                newHistory = [...newHistory, new Date().toISOString()];
            }

            // 🔢 LIMITED REPETITIONS LOGIC
            let isArchived = habit.isArchived || false;
            let currentRepetitions = habit.currentRepetitions || 0;
            
            if (habit.totalRepetitions && habit.totalRepetitions > 0) {
                currentRepetitions += 1;
                if (currentRepetitions >= habit.totalRepetitions) {
                    isArchived = true;
                    lifeDispatch.addToast(`Protocol Finished: ${habit.title} moved to Archive`, 'info');
                }
            }

            let rewards = calculateTaskReward(habit.difficulty, lifeState.user.currentMode);
            const roll = Math.random();
            if (roll > 0.95) {
                rewards.xp *= 2;
                rewards.gold *= 2;
                soundToPlay = 'crit';
                lifeDispatch.setModal('loot', {
                    title: habit.title, xp: rewards.xp, gold: rewards.gold, multiplier: 2, message: "Consistency is Power."
                });
            } else {
                lifeDispatch.addToast(`${habit.title} Complete`, 'success');
            }

            const statReward = habit.difficulty === Difficulty.HARD ? 2 : habit.difficulty === Difficulty.NORMAL ? 1 : 0.5;
            const linkedSkill = skillState.skills.find(s => s.id === habit.skillId);
            const targetStats = linkedSkill?.relatedStats?.length ? linkedSkill.relatedStats : [habit.stat];
            const rewardPerStat = statReward / targetStats.length;

            const newStats = { ...lifeState.user.stats };
            targetStats.forEach(stat => { newStats[stat] = (newStats[stat] || 0) + rewardPerStat; });

            lifeDispatch.updateUser({
                currentXP: lifeState.user.currentXP + rewards.xp,
                dailyXP: lifeState.user.dailyXP + rewards.xp,
                gold: lifeState.user.gold + rewards.gold,
                stats: newStats,
                metrics: { ...lifeState.user.metrics, habitsFixed: lifeState.user.metrics.habitsFixed + 1 }
            });

            if (habit.skillId) skillDispatch.addSkillXP(habit.skillId, Math.ceil(rewards.xp * 0.5));

            setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { 
                ...h, status, streak: newStreak, history: newHistory,
                bestStreak: Math.max(h.bestStreak, newStreak),
                dailyProgress: status === 'completed' ? h.dailyTarget : h.dailyProgress,
                currentRepetitions: currentRepetitions, // 👈 Update Reps
                isArchived: isArchived // 👈 Update Archive Status
            } : h) }));

        } else if (status === 'failed') {
            newStreak = calculateFall(habit.streak);
            soundToPlay = 'error';
            const penaltyPercent = calculateDailyHonorPenalty(habit.difficulty);
            const todayIso = lifeState.ui.debugDate ? new Date(lifeState.ui.debugDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const currentDailyHonor = lifeState.user.honorDailyLog[todayIso] !== undefined ? lifeState.user.honorDailyLog[todayIso] : 100;
            const newDailyHonor = Math.max(0, currentDailyHonor - penaltyPercent); 
            const updatedLog = { ...lifeState.user.honorDailyLog, [todayIso]: newDailyHonor };
            const newAverage = calculateMonthlyAverage(updatedLog, lifeState.ui.debugDate);
            lifeDispatch.updateUser({ honorDailyLog: updatedLog, honor: newAverage });
            lifeDispatch.addToast(`${habit.title} Failed`, 'error');
            
            setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { 
                ...h, status, streak: newStreak, history: newHistory,
                bestStreak: Math.max(h.bestStreak, newStreak),
                dailyProgress: h.dailyProgress // Keep progress on fail? Or reset? Usually keep until daily reset.
            } : h) }));
        }

        playSound(soundToPlay, soundEnabled);
    };

    const deleteHabit = (habitId: string) => {
        setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== habitId) }));
        playSound('delete', soundEnabled);
        lifeDispatch.addToast('Protocol Deleted', 'info');
    };

    const addCategory = (title: string) => {
        const newCat: HabitCategory = { id: `cat_h_${Date.now()}`, title, isCollapsed: false };
        setState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
        playSound('click', soundEnabled);
    };

    const deleteCategory = (id: string) => {
        setState(prev => ({ 
            ...prev, 
            categories: prev.categories.filter(c => c.id !== id),
            habits: prev.habits.map(h => h.categoryId === id ? { ...h, categoryId: undefined } : h)
        }));
        playSound('delete', soundEnabled);
    };

    const renameCategory = (id: string, newTitle: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, title: newTitle } : c) }));
    };

    const toggleCategory = (id: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c) }));
    };

    const moveHabit = (habitId: string, categoryId: string | undefined) => {
        setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { ...h, categoryId } : h) }));
        playSound('click', soundEnabled);
    };

    const restoreData = (newHabits: Habit[], newCategories: HabitCategory[]) => {
        setState({ habits: newHabits, categories: newCategories });
        lifeDispatch.addToast('Habits Restored', 'success');
    };

    return {
        addHabit, updateHabit, processHabit, deleteHabit, 
        addCategory, deleteCategory, renameCategory, toggleCategory, moveHabit,
        toggleSubtask, restoreData
    };
};
