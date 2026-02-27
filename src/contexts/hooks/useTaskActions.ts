
import { Task, TaskCategory, Law } from '../../types/taskTypes';
import { Difficulty, Stat, LootPayload } from '../../types/types';
import { useLifeOS } from '../LifeOSContext';
import { useSkills } from '../SkillContext';
import { playSound } from '../../utils/audio';
import { calculateTaskReward } from '../../utils/economyEngine';
import { calculateMonthlyAverage, calculateDailyHonorPenalty } from '../../utils/honorSystem';
import { parseTimeCode, parseCalendarCode, calculateCampaignDate, getActiveCampaignData } from '../../utils/campaignEngine';
import { PENALTIES } from '../../types/constants';

export const useTaskActions = (
    state: { tasks: Task[], categories: TaskCategory[], laws: Law[] },
    setState: React.Dispatch<React.SetStateAction<{ tasks: Task[], categories: TaskCategory[], laws: Law[] }>>,
    soundEnabled: boolean
) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills();

    const addTask = (taskData: Omit<Task, 'id' | 'isCompleted'>) => {
        let { cleanedTitle, timeCode } = parseTimeCode(taskData.title);
        const calendarResult = parseCalendarCode(cleanedTitle);
        
        let finalDeadline = taskData.deadline;
        let scheduledTime = taskData.scheduledTime;
        let isCampaign = taskData.isCampaign || false;
        let isCalendarEvent = taskData.isCalendarEvent || false;

        if (timeCode) {
            isCampaign = true; 
            const campaignData = getActiveCampaignData();
            if (campaignData) {
                finalDeadline = calculateCampaignDate(campaignData.startDate, timeCode.week, timeCode.day);
                lifeDispatch.addToast(`G12: Scheduled for W${timeCode.week} D${timeCode.day}`, 'info');
            } else {
                 lifeDispatch.addToast(`No active G12 campaign found for [W${timeCode.week}D${timeCode.day}]`, 'error');
            }
        } 
        
        if (calendarResult.dateIso) {
            cleanedTitle = calendarResult.cleanedTitle;
            scheduledTime = calendarResult.dateIso;
            finalDeadline = calendarResult.dateIso;
            isCalendarEvent = true;
            lifeDispatch.addToast(`C30: Scheduled via Code`, 'info');
        }

        const newTask: Task = {
            ...taskData,
            title: cleanedTitle,
            deadline: finalDeadline,
            scheduledTime: scheduledTime,
            isCampaign: isCampaign, 
            isCalendarEvent: isCalendarEvent,
            id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isCompleted: false,
            isArchived: false
        };
        playSound('click', soundEnabled);
        setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
        lifeDispatch.setModal('none'); 
    };

    const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }));
        playSound('click', soundEnabled);
    };

    const toggleTask = (taskId: string) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        const isCompleting = !task.isCompleted;
        let soundToPlay: 'success' | 'level-up' | 'crit' | null = null;

        if (isCompleting) {
            let rewards = calculateTaskReward(task.difficulty, lifeState.user.currentMode);
            if (task.isCampaign) rewards.xp = Math.ceil(rewards.xp * 1.1);

            const roll = Math.random();
            const isCrit = (task.difficulty === Difficulty.HARD && roll > 0.85) || 
                           (task.difficulty === Difficulty.NORMAL && roll > 0.90);

            let lootPayload: LootPayload | null = null;

            if (isCrit) {
                rewards.xp *= 2;
                rewards.gold *= 2;
                soundToPlay = 'crit';
                lootPayload = {
                    title: task.title,
                    xp: rewards.xp,
                    gold: rewards.gold,
                    multiplier: 2,
                    message: "Luck favors the bold."
                };
            } else {
                soundToPlay = 'success';
            }

            const currentMetrics = lifeState.user.metrics;
            const newMetrics = {
                ...currentMetrics,
                totalTasksCompleted: currentMetrics.totalTasksCompleted + 1,
                tasksByDifficulty: {
                    ...currentMetrics.tasksByDifficulty,
                    [task.difficulty]: (currentMetrics.tasksByDifficulty[task.difficulty] || 0) + 1
                },
                totalGoldEarned: currentMetrics.totalGoldEarned + rewards.gold,
                totalXPEarned: currentMetrics.totalXPEarned + rewards.xp
            };

            const statReward = task.difficulty === Difficulty.HARD ? 2 : task.difficulty === Difficulty.NORMAL ? 1 : 0.5;
            const linkedSkill = skillState.skills.find(s => s.id === task.skillId);
            const targetStats = linkedSkill?.relatedStats?.length ? linkedSkill.relatedStats : [task.stat];
            const rewardPerStat = statReward / targetStats.length;

            const newStats = { ...lifeState.user.stats };
            targetStats.forEach(stat => {
                newStats[stat] = (newStats[stat] || 0) + rewardPerStat;
            });

            lifeDispatch.updateUser({
                currentXP: lifeState.user.currentXP + rewards.xp,
                dailyXP: lifeState.user.dailyXP + rewards.xp,
                gold: lifeState.user.gold + rewards.gold,
                stats: newStats,
                metrics: newMetrics 
            });

            if (task.skillId) {
                const skillXp = Math.ceil(rewards.xp * 0.5); 
                skillDispatch.addSkillXP(task.skillId, skillXp);
            }

            if (lootPayload) {
                setTimeout(() => lifeDispatch.setModal('loot', lootPayload), 200); 
            } else {
                lifeDispatch.addToast(`Mission Complete: ${task.title}`, 'success');
            }

        } else {
            const baseRewards = calculateTaskReward(task.difficulty, lifeState.user.currentMode);
            if (task.isCampaign) baseRewards.xp = Math.ceil(baseRewards.xp * 1.1);

            const currentMetrics = lifeState.user.metrics;
            const newMetrics = {
                ...currentMetrics,
                totalTasksCompleted: Math.max(0, currentMetrics.totalTasksCompleted - 1),
                tasksByDifficulty: {
                    ...currentMetrics.tasksByDifficulty,
                    [task.difficulty]: Math.max(0, (currentMetrics.tasksByDifficulty[task.difficulty] || 0) - 1)
                },
                totalGoldEarned: Math.max(0, currentMetrics.totalGoldEarned - baseRewards.gold),
                totalXPEarned: Math.max(0, currentMetrics.totalXPEarned - baseRewards.xp)
            };

            const statReward = task.difficulty === Difficulty.HARD ? 2 : task.difficulty === Difficulty.NORMAL ? 1 : 0.5;

             lifeDispatch.updateUser({
                currentXP: Math.max(0, lifeState.user.currentXP - baseRewards.xp),
                dailyXP: Math.max(0, lifeState.user.dailyXP - baseRewards.xp),
                gold: Math.max(0, lifeState.user.gold - baseRewards.gold),
                stats: {
                    ...lifeState.user.stats,
                    [task.stat]: Math.max(0, lifeState.user.stats[task.stat] - statReward)
                },
                metrics: newMetrics
            });
        }

        if (soundToPlay && soundEnabled) playSound(soundToPlay, soundEnabled);
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isCompleted: isCompleting } : t) }));
    };

    const toggleSubtask = (taskId: string, subtaskId: string) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => {
            if (t.id !== taskId) return t;
            const updatedSubtasks = t.subtasks.map(st => 
                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            );
            return { ...t, subtasks: updatedSubtasks };
        })}));
        playSound('click', soundEnabled);
    };

    const deleteTask = (taskId: string) => {
        const task = state.tasks.find(t => t.id === taskId);
        if(!task) return;

        if (!task.isCompleted && !task.isArchived) {
             const penalty = PENALTIES[task.difficulty];
             const penaltyPercent = calculateDailyHonorPenalty(task.difficulty);
             const todayIso = lifeState.ui.debugDate ? new Date(lifeState.ui.debugDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
             const currentDailyHonor = lifeState.user.honorDailyLog[todayIso] !== undefined ? lifeState.user.honorDailyLog[todayIso] : 100;
             const newDailyHonor = Math.max(0, currentDailyHonor - penaltyPercent); 
             const updatedLog = { ...lifeState.user.honorDailyLog, [todayIso]: newDailyHonor };
             const newAverage = calculateMonthlyAverage(updatedLog, lifeState.ui.debugDate);

             lifeDispatch.updateUser({
                currentXP: Math.max(0, lifeState.user.currentXP - penalty.xp),
                gold: Math.max(0, lifeState.user.gold - penalty.gold),
                stats: {
                    ...lifeState.user.stats,
                    [task.stat]: Math.max(0, lifeState.user.stats[task.stat] - penalty.stat)
                },
                honorDailyLog: updatedLog,
                honor: newAverage
            });
            lifeDispatch.addToast(`Mission Failed: -${penaltyPercent}% Honor`, 'error');
            playSound('error', soundEnabled);
        } else {
            playSound('delete', soundEnabled);
        }
        
        setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    };

    const addCategory = (title: string) => {
        const newCat: TaskCategory = { 
            id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
            title, 
            isCollapsed: false 
        };
        setState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
        playSound('click', soundEnabled);
    };

    const deleteCategory = (id: string) => {
        setState(prev => ({ 
            ...prev, 
            categories: prev.categories.filter(c => c.id !== id),
            tasks: prev.tasks.map(t => t.categoryId === id ? { ...t, categoryId: undefined } : t)
        }));
        playSound('delete', soundEnabled);
    };

    const renameCategory = (id: string, newTitle: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, title: newTitle } : c) }));
    };

    const toggleCategory = (id: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c) }));
    };

    const moveTask = (taskId: string, categoryId: string | undefined) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, categoryId } : t) }));
        playSound('click', soundEnabled);
    };

    const archiveTask = (taskId: string) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isArchived: true } : t) }));
        lifeDispatch.addToast('Mission moved to Backlog', 'info');
        playSound('click', soundEnabled);
    };

    const restoreTask = (taskId: string) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isArchived: false } : t) }));
        lifeDispatch.addToast('Mission Restored', 'success');
        playSound('click', soundEnabled);
    };

    const addLaw = (title: string, type: 'gold' | 'xp' | 'stat' | 'honor', value: number, stat?: Stat) => {
        const newLaw: Law = {
            id: `law_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title,
            penaltyType: type,
            penaltyValue: value,
            statTarget: stat,
            timesBroken: 0
        };
        setState(prev => ({ ...prev, laws: [...prev.laws, newLaw] }));
        playSound('click', soundEnabled);
        lifeDispatch.addToast('New Law Enacted', 'info');
    };

    const updateLaw = (id: string, updates: Partial<Omit<Law, 'id'>>) => {
        setState(prev => ({ ...prev, laws: prev.laws.map(l => l.id === id ? { ...l, ...updates } : l) }));
        playSound('click', soundEnabled);
    };

    const deleteLaw = (id: string) => {
        setState(prev => ({ ...prev, laws: prev.laws.filter(l => l.id !== id) }));
        playSound('delete', soundEnabled);
    };

    const enforceLaw = (id: string) => {
        const law = state.laws.find(l => l.id === id);
        if (!law) return;

        if (law.penaltyType === 'gold') {
            lifeDispatch.updateUser({ gold: lifeState.user.gold - law.penaltyValue });
        } else if (law.penaltyType === 'xp') {
            lifeDispatch.updateUser({ currentXP: lifeState.user.currentXP - law.penaltyValue });
        } else if (law.penaltyType === 'stat' && law.statTarget) {
            lifeDispatch.updateUser({
                stats: {
                    ...lifeState.user.stats,
                    [law.statTarget]: lifeState.user.stats[law.statTarget] - law.penaltyValue
                }
            });
        } else if (law.penaltyType === 'honor') {
            const todayIso = lifeState.ui.debugDate ? new Date(lifeState.ui.debugDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const currentDailyHonor = lifeState.user.honorDailyLog[todayIso] !== undefined ? lifeState.user.honorDailyLog[todayIso] : 100;
            const newDailyHonor = Math.max(0, currentDailyHonor - law.penaltyValue);
            const updatedLog = { ...lifeState.user.honorDailyLog, [todayIso]: newDailyHonor };
            const newAverage = calculateMonthlyAverage(updatedLog, lifeState.ui.debugDate);
            lifeDispatch.updateUser({ honorDailyLog: updatedLog, honor: newAverage });
        }

        setState(prev => ({ ...prev, laws: prev.laws.map(l => l.id === id ? { ...l, timesBroken: l.timesBroken + 1 } : l) }));
        playSound('error', soundEnabled);
        lifeDispatch.addToast(`Law Broken: ${law.title}`, 'error');
    };

    const restoreData = (newTasks: Task[], newCategories: TaskCategory[], newLaws: Law[]) => {
        setState({ tasks: newTasks, categories: newCategories, laws: newLaws });
        lifeDispatch.addToast('Tasks & Laws Restored', 'success');
    };

    return {
        addTask, updateTask, toggleTask, deleteTask, 
        addCategory, deleteCategory, renameCategory, toggleCategory, moveTask, archiveTask, restoreTask,
        toggleSubtask, addLaw, deleteLaw, enforceLaw, updateLaw, restoreData
    };
};
