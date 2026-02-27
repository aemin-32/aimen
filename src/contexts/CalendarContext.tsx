
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initGapiClient, initGisClient, handleAuthClick, handleSignoutClick, findLifeOSCalendar, createLifeOSCalendar, syncEventToCalendar } from '../services/googleCalendarService';
import { useTasks } from './TaskContext';
import { useHabits } from './HabitContext';
import { useRaids } from './RaidContext';
import { useLifeOS } from './LifeOSContext';

interface CalendarContextType {
    isAuthorized: boolean;
    isSyncing: boolean;
    connectCalendar: () => Promise<void>;
    disconnectCalendar: () => void;
    syncNow: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const { taskState } = useTasks();
    const { habitState } = useHabits();
    const { raidState } = useRaids();
    const { dispatch } = useLifeOS();

    useEffect(() => {
        const init = async () => {
            try {
                await initGapiClient();
                await initGisClient();
                // Check if already authorized? GAPI doesn't persist well without token storage, 
                // but for this demo we assume session-based.
            } catch (err) {
                console.error("GAPI Init Error (Expected if no keys set):", err);
            }
        };
        init();
    }, []);

    const connectCalendar = async () => {
        try {
            await handleAuthClick();
            setIsAuthorized(true);
            dispatch.addToast('Google Calendar Connected', 'success');
        } catch (err) {
            dispatch.addToast('Connection Failed. Check Console/Keys.', 'error');
            console.error(err);
        }
    };

    const disconnectCalendar = () => {
        handleSignoutClick();
        setIsAuthorized(false);
        dispatch.addToast('Disconnected from Calendar', 'info');
    };

    const syncNow = async () => {
        if (!isAuthorized) return;
        setIsSyncing(true);
        dispatch.addToast('Syncing with Google Calendar...', 'info');

        try {
            // 1. Find or Create Calendar
            let calId = await findLifeOSCalendar();
            if (!calId) {
                calId = await createLifeOSCalendar();
            }

            if (!calId) throw new Error("Could not create/find calendar.");

            // 2. Sync Tasks
            const tasksToSync = taskState.tasks.filter(t => !t.isCompleted && !t.isArchived && (t.deadline || t.scheduledTime));
            for (const task of tasksToSync) {
                const start = task.scheduledTime || task.deadline;
                // Default 1 hour duration
                const end = new Date(new Date(start!).getTime() + 60 * 60 * 1000).toISOString();
                
                const event = {
                    summary: `[Task] ${task.title}`,
                    description: task.description || '',
                    start: { dateTime: start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                    end: { dateTime: end, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                };
                await syncEventToCalendar(calId, event);
            }

            // 3. Sync Habits (As Recurring Events)
            // Only sync active habits
            for (const habit of habitState.habits) {
                if (habit.isArchived) continue;

                let rrule = 'RRULE:FREQ=DAILY';
                if (habit.type === 'specific_days' && habit.specificDays) {
                    const daysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
                    const byDay = habit.specificDays.map(d => daysMap[d]).join(',');
                    rrule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
                } else if (habit.type === 'interval' && habit.intervalValue) {
                    rrule = `RRULE:FREQ=DAILY;INTERVAL=${habit.intervalValue}`;
                }

                const event = {
                    summary: `[Habit] ${habit.title}`,
                    start: { dateTime: new Date().toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                    end: { dateTime: new Date(Date.now() + 30*60000).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }, // 30 mins
                    recurrence: [rrule],
                };
                // Note: This creates duplicates if run multiple times. 
                // In a real app, we'd store the 'googleEventId' in the Habit object to update it.
                // For this MVP, we just push.
                await syncEventToCalendar(calId, event);
            }

            dispatch.addToast('Sync Complete!', 'success');

        } catch (err) {
            console.error(err);
            dispatch.addToast('Sync Failed', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <CalendarContext.Provider value={{ isAuthorized, isSyncing, connectCalendar, disconnectCalendar, syncNow }}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};
