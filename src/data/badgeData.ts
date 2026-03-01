
import { BadgeDefinition } from '../types/badgeTypes';
import { Difficulty, Stat } from '../types/types';

// 🩸 THE CRIMSON LEGACY DATABASE
// // The Constitution of Glory

export const BADGE_DATABASE: BadgeDefinition[] = [
    // 1. PROGRESSION ------------------------------------------------
    {
        id: 'bdg_ascendant',
        name: 'The Ascendant',
        icon: '👑',
        description: 'Rise through the ranks of existence.',
        category: 'progression',
        triggerType: 'metric',
        metricKey: 'level', // Reads UserProfile.level
        levels: [
            { tier: 'silver', target: 5, quote: "You have awakened.", rewards: { xp: 100, gold: 50 } },
            { tier: 'gold', target: 10, quote: "Power is not given, it is taken.", rewards: { xp: 500, gold: 200 } },
            { tier: 'diamond', target: 25, quote: "You are no longer a spectator.", rewards: { xp: 2000, gold: 1000 } },
            { tier: 'crimson', target: 50, quote: "Godhood is a lonely path.", rewards: { xp: 10000, gold: 5000 } },
        ]
    },

    // 2. COMBAT (TASKS) ---------------------------------------------
    {
        id: 'bdg_grunt',
        name: 'The Grunt',
        icon: '🪖',
        description: 'Complete missions of Easy difficulty.',
        category: 'raids',
        triggerType: 'metric',
        metricKey: `tasksByDifficulty.${Difficulty.EASY}`,
        levels: [
            { tier: 'silver', target: 10, quote: "Do the work. Don't complain.", rewards: { xp: 50, gold: 20 } },
            { tier: 'gold', target: 50, quote: "Discipline is the bridge between goals and accomplishment.", rewards: { xp: 200, gold: 100 } },
            { tier: 'diamond', target: 200, quote: "Routine is the weapon of the disciplined.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'crimson', target: 500, quote: "The mundane has become your masterpiece.", rewards: { xp: 5000, gold: 2000 } },
        ]
    },
    {
        id: 'bdg_warlord',
        name: 'The Warlord',
        icon: '⚔️',
        description: 'Complete missions of Hard difficulty.',
        category: 'raids',
        triggerType: 'metric',
        metricKey: `tasksByDifficulty.${Difficulty.HARD}`,
        levels: [
            { tier: 'silver', target: 5, quote: "Pain is weakness leaving the body.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Hardship is the forge of character.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 100, quote: "You do not survive the storm. You are the storm.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 250, quote: "Impossible is just an opinion.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_soldier',
        name: 'The Soldier',
        icon: '🎖️',
        description: 'Complete missions of Normal difficulty.',
        category: 'raids',
        triggerType: 'metric',
        metricKey: `tasksByDifficulty.${Difficulty.NORMAL}`,
        levels: [
            { tier: 'silver', target: 10, quote: "Steady as she goes.", rewards: { xp: 100, gold: 50 } },
            { tier: 'gold', target: 50, quote: "Consistency is the key to mastery.", rewards: { xp: 500, gold: 250 } },
            { tier: 'diamond', target: 200, quote: "The backbone of the operation.", rewards: { xp: 2000, gold: 1000 } },
            { tier: 'crimson', target: 500, quote: "A master of the standard.", rewards: { xp: 10000, gold: 5000 } },
        ]
    },

    // 3. WARFARE (RAIDS) --------------------------------------------
    {
        id: 'bdg_conqueror',
        name: 'The Conqueror',
        icon: '🏴‍☠️',
        description: 'Total Operations (Raids) Conquered.',
        category: 'raids',
        triggerType: 'metric',
        metricKey: 'totalRaidsWon',
        levels: [
            { tier: 'silver', target: 1, quote: "First blood.", rewards: { xp: 150, gold: 100 } },
            { tier: 'gold', target: 5, quote: "Strategy requires sacrifice.", rewards: { xp: 750, gold: 500 } },
            { tier: 'diamond', target: 20, quote: "Kings play chess on a map of the world.", rewards: { xp: 3000, gold: 2000 } },
            { tier: 'crimson', target: 50, quote: "History is written by the victors.", rewards: { xp: 15000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_veteran',
        name: 'The Veteran',
        icon: '🛡️',
        description: 'Complete Raids of Normal difficulty.',
        category: 'raids',
        triggerType: 'metric',
        metricKey: `raidsByDifficulty.${Difficulty.NORMAL}`,
        levels: [
            { tier: 'silver', target: 1, quote: "I've seen things you wouldn't believe.", rewards: { xp: 300, gold: 150 } },
            { tier: 'gold', target: 5, quote: "Experience is the best teacher.", rewards: { xp: 1500, gold: 750 } },
            { tier: 'diamond', target: 15, quote: "A seasoned warrior.", rewards: { xp: 5000, gold: 2500 } },
            { tier: 'crimson', target: 30, quote: "Legend of the battlefield.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_general',
        name: 'The General',
        icon: '⭐',
        description: 'Complete Raids of Hard difficulty.',
        category: 'raids',
        triggerType: 'metric',
        metricKey: `raidsByDifficulty.${Difficulty.HARD}`,
        levels: [
            { tier: 'silver', target: 1, quote: "Command is a heavy burden.", rewards: { xp: 500, gold: 250 } },
            { tier: 'gold', target: 3, quote: "Victory at any cost.", rewards: { xp: 2500, gold: 1250 } },
            { tier: 'diamond', target: 10, quote: "Master of the grand strategy.", rewards: { xp: 10000, gold: 5000 } },
            { tier: 'crimson', target: 25, quote: "The architect of war.", rewards: { xp: 50000, gold: 25000 } },
        ]
    },

    // 4. CONSISTENCY ------------------------------------------------
    {
        id: 'bdg_immortal',
        name: 'The Immortal',
        icon: '🔥',
        description: 'Maintain a daily login streak.',
        category: 'habits',
        triggerType: 'metric',
        metricKey: 'highestStreak', // Reads user.streak or metric.highestStreak
        levels: [
            { tier: 'silver', target: 7, quote: "Momentum is building.", rewards: { xp: 100, gold: 50 } },
            { tier: 'gold', target: 30, quote: "Consistency is the only currency that matters.", rewards: { xp: 500, gold: 250 } },
            { tier: 'diamond', target: 90, quote: "You have transcended motivation.", rewards: { xp: 2000, gold: 1000 } },
            { tier: 'crimson', target: 365, quote: "Time bows to your will.", rewards: { xp: 10000, gold: 5000 } },
        ]
    },
    {
        id: 'bdg_phoenix',
        name: 'The Phoenix',
        icon: '🦅',
        description: 'Reset the system and start over.',
        category: 'habits',
        triggerType: 'metric',
        metricKey: 'resetsCount',
        levels: [
            { tier: 'silver', target: 1, quote: "From the ashes, we rise.", rewards: { xp: 0, gold: 500 } }, // Compensation
            { tier: 'gold', target: 3, quote: "Failure is not the end.", rewards: { xp: 0, gold: 1000 } },
            { tier: 'diamond', target: 5, quote: "Destruction is a form of creation.", rewards: { xp: 0, gold: 3000 } },
            { tier: 'crimson', target: 10, quote: "You are eternal.", rewards: { xp: 0, gold: 10000 } },
        ]
    },

    // 5. HABIT SPECIFIC (SPECIAL) -----------------------------------
    {
        id: 'bdg_deep_focus',
        name: 'Deep Worker',
        icon: '🧠',
        description: 'Maintain a streak on any "Deep Work" habit.',
        category: 'habits',
        triggerType: 'habit',
        metricKey: 'Deep Work', // Searches for habit with "Deep Work" in title
        levels: [
            { tier: 'silver', target: 7, quote: "Focus is the new oil.", rewards: { xp: 300, gold: 150 } },
            { tier: 'gold', target: 21, quote: "Distraction is the enemy of greatness.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 66, quote: "The mind is a laser.", rewards: { xp: 5000, gold: 2500 } },
            { tier: 'crimson', target: 100, quote: "Flow state is your home.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_specialist',
        name: 'The Specialist',
        icon: '🧪',
        description: 'Complete habits of Normal difficulty.',
        category: 'habits',
        triggerType: 'metric',
        metricKey: `habitsByDifficulty.${Difficulty.NORMAL}`,
        levels: [
            { tier: 'silver', target: 10, quote: "Practice makes perfect.", rewards: { xp: 150, gold: 75 } },
            { tier: 'gold', target: 50, quote: "The expert in anything was once a beginner.", rewards: { xp: 750, gold: 375 } },
            { tier: 'diamond', target: 200, quote: "Mastery is a journey, not a destination.", rewards: { xp: 3000, gold: 1500 } },
            { tier: 'crimson', target: 500, quote: "The standard is your baseline.", rewards: { xp: 15000, gold: 7500 } },
        ]
    },
    {
        id: 'bdg_elite',
        name: 'The Elite',
        icon: '💎',
        description: 'Complete habits of Hard difficulty.',
        category: 'habits',
        triggerType: 'metric',
        metricKey: `habitsByDifficulty.${Difficulty.HARD}`,
        levels: [
            { tier: 'silver', target: 5, quote: "Only the strong survive.", rewards: { xp: 300, gold: 150 } },
            { tier: 'gold', target: 25, quote: "Excellence is not an act, but a habit.", rewards: { xp: 1500, gold: 750 } },
            { tier: 'diamond', target: 100, quote: "The pinnacle of discipline.", rewards: { xp: 7500, gold: 3750 } },
            { tier: 'crimson', target: 250, quote: "You are the 1%.", rewards: { xp: 30000, gold: 15000 } },
        ]
    },

    // 6. ECONOMY ----------------------------------------------------
    {
        id: 'bdg_gold_hoarder',
        name: 'Gold Hoarder',
        icon: '💰',
        description: 'Total lifetime gold earned.',
        category: 'shop',
        triggerType: 'metric',
        metricKey: 'totalGoldEarned',
        levels: [
            { tier: 'silver', target: 1000, quote: "The first coin is the heaviest.", rewards: { xp: 100, gold: 100 } },
            { tier: 'gold', target: 10000, quote: "Wealth is a tool, not a master.", rewards: { xp: 500, gold: 500 } },
            { tier: 'diamond', target: 100000, quote: "You can buy armies.", rewards: { xp: 2000, gold: 2000 } },
            { tier: 'crimson', target: 1000000, quote: "Midas touches you.", rewards: { xp: 10000, gold: 10000 } },
        ]
    },

    // 7. STATS MASTERY ----------------------------------------------
    {
        id: 'bdg_stoic',
        name: 'The Stoic',
        icon: '⚡',
        description: 'Reach high Discipline (DIS).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.DIS,
        levels: [
            { tier: 'silver', target: 10, quote: "Control your mind.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Emotion is a choice.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Stone does not bleed.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "You are the mountain.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_titan',
        name: 'The Titan',
        icon: '💪',
        description: 'Reach high Strength (STR).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.STR,
        levels: [
            { tier: 'silver', target: 10, quote: "Lift the weight.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "The body obeys the will.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Force of nature.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "Atlas shrugs.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_scholar',
        name: 'The Scholar',
        icon: '🧩',
        description: 'Reach high Intelligence (INT).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.INT,
        levels: [
            { tier: 'silver', target: 10, quote: "Knowledge is power.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "The mind is a sharp blade.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Enlightenment achieved.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "Omniscience is the goal.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_healer',
        name: 'The Healer',
        icon: '🌿',
        description: 'Reach high Health (HEA).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.HEA,
        levels: [
            { tier: 'silver', target: 10, quote: "A healthy body is a temple.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Vitality is the source of life.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Indestructible health.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "Eternal youth.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_creator',
        name: 'Da Vinci',
        icon: '🎨',
        description: 'Reach high Creativity (CRT).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.CRT,
        levels: [
            { tier: 'silver', target: 10, quote: "Imagine the impossible.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Art is the signature of the soul.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "A fountain of ideas.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "The world is your canvas.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_monk',
        name: 'The Monk',
        icon: '🧘',
        description: 'Reach high Spirit (SPR).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.SPR,
        levels: [
            { tier: 'silver', target: 10, quote: "Find your inner peace.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "The soul is infinite.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Spiritual awakening.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "One with the universe.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_diplomat',
        name: 'The Diplomat',
        icon: '🤝',
        description: 'Reach high Relation (REL).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.REL,
        levels: [
            { tier: 'silver', target: 10, quote: "Unity is strength.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Trust is the foundation.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Master of social intelligence.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "The world is your family.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_merchant',
        name: 'The Merchant',
        icon: '📈',
        description: 'Reach high Finance (FIN).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.FIN,
        levels: [
            { tier: 'silver', target: 10, quote: "Invest in yourself.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Financial freedom is the goal.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Wealth flows to you.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "Economic titan.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    // 7.5 SKILLS (LINKED TO SPECIFIC SKILLS) -------------------------
    {
        id: 'bdg_polymath',
        name: 'The Polymath',
        icon: '📚',
        description: 'Reach Level 10 in any specific skill.',
        category: 'skills',
        triggerType: 'skill',
        metricKey: 'any', // Special key handled in BadgeContext
        levels: [
            { tier: 'silver', target: 10, quote: "Knowledge is the only true power.", rewards: { xp: 500, gold: 250 } },
        ]
    },
    {
        id: 'bdg_skill_adept',
        name: 'The Adept Collective',
        icon: '🎓',
        description: 'Number of skills at Level 10 (Adept) or higher.',
        category: 'skills',
        triggerType: 'skill_count',
        metricKey: '10',
        levels: [
            { tier: 'silver', target: 1, quote: "The first step to mastery.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 3, quote: "A versatile mind.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 5, quote: "Jack of all trades, master of some.", rewards: { xp: 3000, gold: 1500 } },
            { tier: 'crimson', target: 10, quote: "The polymath's foundation.", rewards: { xp: 10000, gold: 5000 } },
        ]
    },
    {
        id: 'bdg_skill_expert',
        name: 'The Expert Circle',
        icon: '🔬',
        description: 'Number of skills at Level 25 (Expert) or higher.',
        category: 'skills',
        triggerType: 'skill_count',
        metricKey: '25',
        levels: [
            { tier: 'silver', target: 1, quote: "Depth over breadth.", rewards: { xp: 500, gold: 250 } },
            { tier: 'gold', target: 3, quote: "Specialization is for insects, but you are human.", rewards: { xp: 2500, gold: 1250 } },
            { tier: 'diamond', target: 5, quote: "A true professional.", rewards: { xp: 7500, gold: 3750 } },
            { tier: 'crimson', target: 10, quote: "The elite specialist.", rewards: { xp: 25000, gold: 12500 } },
        ]
    },
    {
        id: 'bdg_skill_master',
        name: 'The Master\'s Hall',
        icon: '🏛️',
        description: 'Number of skills at Level 50 (Master) or higher.',
        category: 'skills',
        triggerType: 'skill_count',
        metricKey: '50',
        levels: [
            { tier: 'silver', target: 1, quote: "One with the craft.", rewards: { xp: 2000, gold: 1000 } },
            { tier: 'gold', target: 3, quote: "The master of many.", rewards: { xp: 10000, gold: 5000 } },
            { tier: 'diamond', target: 5, quote: "A living legend.", rewards: { xp: 30000, gold: 15000 } },
            { tier: 'crimson', target: 10, quote: "The architect of excellence.", rewards: { xp: 100000, gold: 50000 } },
        ]
    },
    {
        id: 'bdg_skill_grandmaster',
        name: 'The Grandmaster\'s Legacy',
        icon: '🌌',
        description: 'Number of skills at Level 100 (Grandmaster) or higher.',
        category: 'skills',
        triggerType: 'skill_count',
        metricKey: '100',
        levels: [
            { tier: 'silver', target: 1, quote: "Beyond human limits.", rewards: { xp: 10000, gold: 5000 } },
            { tier: 'gold', target: 3, quote: "The god of skills.", rewards: { xp: 50000, gold: 25000 } },
            { tier: 'diamond', target: 5, quote: "Universal mastery.", rewards: { xp: 150000, gold: 75000 } },
            { tier: 'crimson', target: 10, quote: "The absolute zenith.", rewards: { xp: 500000, gold: 250000 } },
        ]
    },
    // 8. CONSEQUENCES -----------------------------------------------
    {
        id: 'bdg_debt_collector',
        name: 'Debt Collector',
        icon: '⚖️',
        description: 'Survive multiple consequences.',
        category: 'consequences',
        triggerType: 'manual',
        levels: [
            { tier: 'silver', target: 1, quote: "The price must be paid.", rewards: { xp: 100, gold: 0 } },
            { tier: 'gold', target: 5, quote: "Justice is blind.", rewards: { xp: 500, gold: 0 } },
        ]
    },
    {
        id: 'bdg_rebel',
        name: 'The Rebel',
        icon: '🏴',
        description: 'Break the laws of the Codex.',
        category: 'consequences',
        triggerType: 'metric',
        metricKey: 'lawsBroken',
        levels: [
            { tier: 'silver', target: 1, quote: "Rules are made to be broken.", rewards: { xp: 0, gold: 0 } },
            { tier: 'gold', target: 10, quote: "A true outlaw.", rewards: { xp: 0, gold: 0 } },
            { tier: 'diamond', target: 50, quote: "The system cannot contain you.", rewards: { xp: 0, gold: 0 } },
            { tier: 'crimson', target: 100, quote: "Chaos is your middle name.", rewards: { xp: 0, gold: 0 } },
        ]
    },
    // 9. CAMPAIGN (12 WEEKS) ----------------------------------------
    {
        id: 'bdg_quartermaster',
        name: 'Quartermaster',
        icon: '📅',
        description: 'Complete a 12-week campaign.',
        category: 'campaign',
        triggerType: 'metric',
        metricKey: 'campaignsCompleted',
        levels: [
            { tier: 'silver', target: 1, quote: "A quarter of a year, a lifetime of progress.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'gold', target: 4, quote: "A full year of strategic execution.", rewards: { xp: 5000, gold: 2500 } },
        ]
    }
];
