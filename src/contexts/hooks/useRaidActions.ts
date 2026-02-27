
import { Raid, RaidStep } from '../../types/raidTypes';
import { Difficulty, Stat, LootPayload } from '../../types/types';
import { useLifeOS } from '../LifeOSContext';
import { useSkills } from '../SkillContext';
import { playSound } from '../../utils/audio';
import { calculateTaskReward } from '../../utils/economyEngine';
import { parseTimeCode, getActiveCampaignData, calculateCampaignDate } from '../../utils/campaignEngine';

export const useRaidActions = (
    state: { raids: Raid[] },
    setState: React.Dispatch<React.SetStateAction<{ raids: Raid[] }>>,
    soundEnabled: boolean
) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills();

    const addRaid = (raidData: Omit<Raid, 'id' | 'status' | 'progress'>) => {
        setState(prev => {
            const existingRaidIndex = prev.raids.findIndex(r => r.title.trim().toLowerCase() === raidData.title.trim().toLowerCase());
            
            if (existingRaidIndex !== -1) {
                const existingRaid = prev.raids[existingRaidIndex];
                const existingStepTitles = new Set(existingRaid.steps.map(s => s.title.trim().toLowerCase()));
                const stepsToAdd = raidData.steps.filter(newStep => !existingStepTitles.has(newStep.title.trim().toLowerCase()));
                
                if (stepsToAdd.length === 0) return prev;

                const lastExistingStep = existingRaid.steps.length > 0 ? existingRaid.steps[existingRaid.steps.length - 1] : null;
                let shouldLockNext = lastExistingStep ? !lastExistingStep.isCompleted : false;

                const lockedStepsToAdd = stepsToAdd.map(s => {
                    const isLocked = s.isLocked !== undefined ? s.isLocked : shouldLockNext;
                    shouldLockNext = true;
                    return { ...s, isLocked };
                });

                const updatedRaid = {
                    ...existingRaid,
                    description: raidData.description || existingRaid.description,
                    difficulty: raidData.difficulty || existingRaid.difficulty,
                    stats: raidData.stats || existingRaid.stats,
                    skillId: raidData.skillId || existingRaid.skillId,
                    deadline: raidData.deadline || existingRaid.deadline,
                    steps: [...existingRaid.steps, ...lockedStepsToAdd]
                };
                
                const newRaids = [...prev.raids];
                newRaids[existingRaidIndex] = updatedRaid;
                return { ...prev, raids: newRaids };
            }

            let lockNext = false;
            const stepsWithLocking = raidData.steps.map((s, idx) => {
                const isLocked = s.isLocked !== undefined ? s.isLocked : lockNext;
                lockNext = true;
                return { ...s, isLocked };
            });

            const newRaid: Raid = {
                id: `rd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...raidData,
                steps: stepsWithLocking,
                status: 'active',
                progress: 0,
                isCampaign: raidData.isCampaign || false
            };
            return { ...prev, raids: [newRaid, ...prev.raids] };
        });
        playSound('click', soundEnabled);
        lifeDispatch.addToast('Operation Initialized', 'success');
    };

    const updateRaid = (raidId: string, updates: Partial<Raid>) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => r.id === raidId ? { ...r, ...updates } : r) }));
        playSound('click', soundEnabled);
    };

    const deleteRaid = (raidId: string) => {
        setState(prev => ({ ...prev, raids: prev.raids.filter(r => r.id !== raidId) }));
        playSound('delete', soundEnabled);
        lifeDispatch.addToast('Operation Deleted', 'info');
    };

    const archiveRaid = (raidId: string) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => r.id === raidId ? { ...r, status: 'archived' } : r) }));
        lifeDispatch.addToast('Operation Archived', 'info');
    };

    const restoreRaid = (raidId: string) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => r.id === raidId ? { ...r, status: 'active' } : r) }));
        lifeDispatch.addToast('Operation Restored', 'success');
    };

    const archiveRaidStep = (raidId: string, stepId: string) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.map(s => s.id === stepId ? { ...s, isArchived: true } : s);
            return { ...r, steps: updatedSteps };
        })}));
    };

    const deleteRaidStep = (raidId: string, stepId: string) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.filter(s => s.id !== stepId);
            return { ...r, steps: updatedSteps };
        })}));
        lifeDispatch.setModal('none');
    };

    const updateRaidStep = (raidId: string, stepId: string, updates: Partial<RaidStep>) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.map(s => s.id === stepId ? { ...s, ...updates } : s);
            return { ...r, steps: updatedSteps };
        })}));
    };

    const mergeRaidSteps = (raidId: string, newSteps: Partial<RaidStep>[]) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => {
            if (r.id !== raidId) return r;
            
            // 🟢 1. PREPARE CAMPAIGN DATA (For Date Injection)
            const campaignData = getActiveCampaignData();
            const campaignStartDate = campaignData?.startDate;

            const updatesMap = new Map(newSteps.map(s => [s.id, s]));
            const existingIds = new Set(r.steps.map(s => s.id));
            
            // 🟢 2. UPDATE EXISTING STEPS (With Date Injection Logic)
            const updatedSteps = r.steps.map(s => {
                if (updatesMap.has(s.id)) {
                    const updates = updatesMap.get(s.id)!;
                    
                    // 📅 Check for Time Code in Title Update
                    let newDeadline = updates.deadline || s.deadline;
                    let newScheduledTime = updates.scheduledTime || s.scheduledTime;
                    let finalTitle = updates.title || s.title;

                    if (updates.title && campaignStartDate) {
                        const { timeCode, cleanedTitle } = parseTimeCode(updates.title);
                        if (timeCode) {
                            finalTitle = cleanedTitle;
                            // Calculate Date: Start + (Week-1)*7 + (Day-1)
                            const calculatedDate = calculateCampaignDate(campaignStartDate, timeCode.week, timeCode.day);
                            newDeadline = calculatedDate;
                            newScheduledTime = calculatedDate; // Set both for now
                        }
                    }

                    return { 
                        ...s, 
                        ...updates, 
                        title: finalTitle,
                        deadline: newDeadline,
                        scheduledTime: newScheduledTime,
                        isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : s.isCompleted 
                    };
                }
                return s;
            });

            const existingTitles = new Set(r.steps.map(s => s.title.trim().toLowerCase()));
            const lastExistingStep = updatedSteps.length > 0 ? updatedSteps[updatedSteps.length - 1] : null;
            let shouldLockNext = lastExistingStep ? !lastExistingStep.isCompleted : false;
            
            // 🟢 3. ADD NEW STEPS (With Date Injection Logic)
            const stepsToAdd = newSteps
                .filter(s => s.id && !existingIds.has(s.id) && s.title && !existingTitles.has(s.title.trim().toLowerCase()))
                .map((s, index) => {
                    let newDeadline = s.deadline;
                    let newScheduledTime = s.scheduledTime;
                    let finalTitle = s.title || '';

                    // 📅 Check for Time Code
                    if (s.title && campaignStartDate) {
                        const { timeCode, cleanedTitle } = parseTimeCode(s.title);
                        if (timeCode) {
                            finalTitle = cleanedTitle;
                            const calculatedDate = calculateCampaignDate(campaignStartDate, timeCode.week, timeCode.day);
                            newDeadline = calculatedDate;
                            newScheduledTime = calculatedDate;
                        }
                    }

                    const isLocked = s.isLocked !== undefined ? s.isLocked : shouldLockNext;
                    shouldLockNext = true; 
                    return { 
                        ...s, 
                        title: finalTitle,
                        deadline: newDeadline,
                        scheduledTime: newScheduledTime,
                        isCompleted: s.isCompleted || false, 
                        isLocked: isLocked 
                    };
                }) as RaidStep[];
                
            return { ...r, steps: [...updatedSteps, ...stepsToAdd] };
        })}));
        lifeDispatch.addToast('Raid Steps Updated', 'success');
    };

    const toggleRaidStepSubtask = (raidId: string, stepId: string, subtaskId: string) => {
        setState(prev => ({ ...prev, raids: prev.raids.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.map(s => {
                if (s.id !== stepId) return s;
                const newSubtasks = s.subtasks?.map(sub => sub.id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub) || [];
                return { ...s, subtasks: newSubtasks };
            });
            return { ...r, steps: updatedSteps };
        })}));
        playSound('click', soundEnabled);
    };

    const toggleRaidStep = (raidId: string, stepId: string) => {
        const raid = state.raids.find(r => r.id === raidId);
        if (!raid) return;
        const stepIndex = raid.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return;
        const step = raid.steps[stepIndex];
        const isCompleting = !step.isCompleted;
        const stepDifficulty = step.difficulty || raid.difficulty;
        
        // Legacy support: previously, step.stat was always saved as raid.stats[0].
        // We consider it an "override" only if it's explicitly different from the raid's primary stat.
        const isStatOverridden = step.stat && (!raid.stats || step.stat !== raid.stats[0]);
        const stepStat = step.stat || (raid.stats && raid.stats.length > 0 ? raid.stats[0] : Stat.STR);
        const stepSkillId = isStatOverridden ? undefined : raid.skillId; 
        
        const rewards = calculateTaskReward(stepDifficulty, lifeState.user.currentMode);
        const xp = rewards.xp;
        const gold = rewards.gold;
        const statReward = stepDifficulty === Difficulty.HARD ? 2 : stepDifficulty === Difficulty.NORMAL ? 1 : 0.5;
        const linkedSkill = stepSkillId ? skillState.skills.find(s => s.id === stepSkillId) : undefined;
        const targetStats = isStatOverridden ? [step.stat!] : (linkedSkill?.relatedStats?.length ? linkedSkill.relatedStats : [stepStat]);
        const rewardPerStat = statReward / targetStats.length;
        const newStats = { ...lifeState.user.stats };
        targetStats.forEach(stat => { newStats[stat] = (newStats[stat] || 0) + rewardPerStat; });
        const tempSteps = [...raid.steps];
        tempSteps[stepIndex] = { ...step, isCompleted: isCompleting };
        const completedCount = tempSteps.filter(s => s.isCompleted).length;
        const newProgress = Math.round((completedCount / tempSteps.length) * 100);
        const isRaidComplete = newProgress === 100;
        let lootPayload: LootPayload | null = null;
        if (isCompleting) {
            lifeDispatch.updateUser({ currentXP: lifeState.user.currentXP + xp, dailyXP: lifeState.user.dailyXP + xp, gold: lifeState.user.gold + gold, stats: newStats });
            if (stepSkillId) skillDispatch.addSkillXP(stepSkillId, Math.ceil(xp * 0.5));
            if (isRaidComplete) {
                playSound('crit', soundEnabled);
                lootPayload = { title: `Operation Conquered: ${raid.title}`, xp: xp * 5, gold: gold * 5, multiplier: 5, message: "Sector Secured. Tactical Superiority Achieved." };
                lifeDispatch.updateUser({ currentXP: lifeState.user.currentXP + (xp * 5), gold: lifeState.user.gold + (gold * 5), metrics: { ...lifeState.user.metrics, totalRaidsWon: lifeState.user.metrics.totalRaidsWon + 1 } });
            } else {
                playSound('success', soundEnabled);
                lifeDispatch.addToast(`Step Secured | +${xp} XP`, 'success');
            }
        } else {
            const undoStats = { ...lifeState.user.stats };
            targetStats.forEach(stat => { undoStats[stat] = Math.max(0, (undoStats[stat] || 0) - rewardPerStat); });
            lifeDispatch.updateUser({ currentXP: Math.max(0, lifeState.user.currentXP - xp), dailyXP: Math.max(0, lifeState.user.dailyXP - xp), gold: Math.max(0, lifeState.user.gold - gold), stats: undoStats });
            if (raid.status === 'completed') {
                lifeDispatch.updateUser({ currentXP: Math.max(0, lifeState.user.currentXP - (xp * 5)), gold: Math.max(0, lifeState.user.gold - (gold * 5)), metrics: { ...lifeState.user.metrics, totalRaidsWon: Math.max(0, lifeState.user.metrics.totalRaidsWon - 1) } });
                lifeDispatch.addToast(`Step Revoked | Completion Bonus Removed`, 'info');
            } else {
                lifeDispatch.addToast(`Step Revoked`, 'info');
            }
            playSound('delete', soundEnabled);
        }
        setState(prev => ({ ...prev, raids: prev.raids.map(r => {
            if (r.id !== raidId) return r;
            const newSteps = [...r.steps];
            newSteps[stepIndex] = { ...step, isCompleted: isCompleting };
            if (isCompleting && stepIndex + 1 < newSteps.length) { newSteps[stepIndex + 1] = { ...newSteps[stepIndex + 1], isLocked: false }; }
            return { ...r, steps: newSteps, progress: newProgress, status: isRaidComplete ? 'completed' : (r.status === 'completed' ? 'active' : r.status) };
        })}));
        if (lootPayload) { setTimeout(() => lifeDispatch.setModal('loot', lootPayload), 300); }
    };

    const restoreData = (newRaids: Raid[]) => {
        setState({ raids: newRaids });
        lifeDispatch.addToast('Raids Restored', 'success');
    };

    return {
        addRaid, updateRaid, deleteRaid, archiveRaid, restoreRaid, 
        toggleRaidStep, updateRaidStep, mergeRaidSteps, toggleRaidStepSubtask, 
        archiveRaidStep, deleteRaidStep, restoreData 
    };
};
