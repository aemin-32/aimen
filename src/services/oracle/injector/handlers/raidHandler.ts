
import { HandlerContext } from '../types';
import { hydrateSubtasks, hydrateReminders } from '../utils';

export const handleRaids = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    if (payload.raids && Array.isArray(payload.raids)) {
        payload.raids.forEach((r: any) => {
            const steps = (r.steps || []).map((s: any, idx: number) => ({
                id: s.id || `rs_ai_${Date.now()}_${idx}`, // Preserve step ID if updating
                title: typeof s === 'string' ? s : s.title,
                notes: s.notes || '',
                isCompleted: s.isCompleted || false, // Preserve completion
                isLocked: s.isLocked !== undefined ? s.isLocked : idx > 0,
                
                // ⏰ Time & Alerts
                scheduledTime: s.scheduledTime, 
                deadline: s.deadline, // 👈 NEW
                reminders: hydrateReminders(s.reminders),
                
                // ⏱️ Timer Logic
                isTimed: !!s.durationMinutes, // Auto-detect
                durationMinutes: s.durationMinutes,

                // 🟢 Granular Overrides
                difficulty: s.difficulty, // Can override parent
                stat: s.stat,             // Can override parent
                // skillId is IGNORED here to enforce inheritance

                subtasks: hydrateSubtasks(s.subtasks) 
            }));

            // 🟢 SMART APPEND: Find existing raid by ID or Title
            let targetRaidId = r.id && r.id.startsWith('rd_') ? r.id : null;
            if (!targetRaidId && ctx.raidState?.raids) {
                const existingRaid = ctx.raidState.raids.find((raid: any) => 
                    raid.title.toLowerCase() === r.title.toLowerCase() && raid.status === 'active'
                );
                if (existingRaid) {
                    targetRaidId = existingRaid.id;
                }
            }

            // 🟢 UPDATE LOGIC
            if (targetRaidId) {
                // 1. Update Metadata (only if provided)
                dispatchers.raidDispatch.updateRaid(targetRaidId, {
                    ...(r.title && { title: r.title }),
                    ...(r.description && { description: r.description }),
                    ...(r.difficulty && { difficulty: r.difficulty }),
                    ...(r.stats && { stats: r.stats }),
                    ...(r.skillId && { skillId: r.skillId }),
                    ...(r.deadline && { deadline: r.deadline }),
                    ...(r.isCampaign !== undefined && { isCampaign: r.isCampaign })
                });

                // 2. Merge Steps (Smart Update / Append)
                if (steps.length > 0) {
                    dispatchers.raidDispatch.mergeRaidSteps(targetRaidId, steps);
                }
            } else {
                // CREATE NEW
                dispatchers.raidDispatch.addRaid({
                    title: r.title,
                    description: r.description,
                    difficulty: r.difficulty || 'hard',
                    stats: r.stats || ['STR'],
                    skillId: r.skillId, // 👈 Added skillId
                    deadline: r.deadline,
                    steps,
                    isCampaign: r.isCampaign || undefined
                });
            }
        });
        summary.push(`${payload.raids.length} Ops`);
    }
};
