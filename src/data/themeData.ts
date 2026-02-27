
import { Theme } from '../types/types';

export const DEFAULT_THEMES: Theme[] = [
    {
        id: 'standard',
        name: 'Shadow Protocol',
        colors: {
            '--color-life-black': '#0a0a0a',
            '--color-life-paper': '#121212',
            '--color-life-gold': '#fbbf24',
            '--color-life-text': '#e5e5e5'
        }
    },
    {
        id: 'zayn',
        name: 'Zayn Protocol',
        colors: {
            '--color-life-black': '#0a0a0a',
            '--color-life-paper': '#121212',
            '--color-life-gold': '#fbbf24',
            '--color-life-text': '#e5e5e5',
            '--color-life-muted': '#525252',
            '--color-life-crimson': '#dc2626',
            '--color-life-diamond': '#60a5fa',
            '--color-life-hard': '#ef4444'
        }
    },
    {
        id: 'grey',
        name: 'Zenith Grey',
        colors: {
            '--color-life-black': '#18181b',
            '--color-life-paper': '#27272a',
            '--color-life-gold': '#a1a1aa',
            '--color-life-text': '#f4f4f5'
        }
    },
    {
        id: 'gold',
        name: 'Midas Touch',
        colors: {
            '--color-life-black': '#1a1200',
            '--color-life-paper': '#261a00',
            '--color-life-gold': '#ffd700',
            '--color-life-text': '#fffae6'
        },
        soundPack: 'fantasy',
        animationStyle: 'default',
        customCss: `
            /* Royal Fonts & Shapes */
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
            
            body { 
                font-family: 'Cinzel', serif !important; 
            }
            .rounded-xl, .rounded-lg, .rounded-2xl {
                border-radius: 2px !important;
                border: 1px double #ffd700 !important;
            }
            .bg-life-gold {
                background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%) !important;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
            }
        `
    },
    {
        id: 'light',
        name: 'Light Protocol',
        colors: {
            '--color-life-black': '#f3f4f6', 
            '--color-life-paper': '#ffffff', 
            '--color-life-gold': '#d97706',  
            '--color-life-text': '#111827'   
        }
    },
    {
        id: 'crimson',
        name: 'Crimson Ops',
        colors: {
            '--color-life-black': '#1a0505',
            '--color-life-paper': '#2b0a0a',
            '--color-life-gold': '#ef4444',
            '--color-life-text': '#fecaca'
        }
    },
    {
        id: 'sunset',
        name: 'Sunset Drive',
        colors: {
            '--color-life-black': '#2e1065',
            '--color-life-paper': '#4c1d95',
            '--color-life-gold': '#f472b6',
            '--color-life-text': '#fae8ff'
        }
    },
    {
        id: 'mint',
        name: 'Mint Protocol',
        colors: {
            '--color-life-black': '#f0fdf4',
            '--color-life-paper': '#dcfce7',
            '--color-life-gold': '#16a34a',
            '--color-life-text': '#064e3b'
        }
    },
    {
        id: 'azure',
        name: 'Azure Citadel',
        colors: {
            '--color-life-black': '#082f49',
            '--color-life-paper': '#0c4a6e',
            '--color-life-gold': '#38bdf8',
            '--color-life-text': '#f0f9ff'
        }
    },
    {
        id: 'toxic',
        name: 'Toxic Grid',
        colors: {
            '--color-life-black': '#052e16',
            '--color-life-paper': '#064e3b',
            '--color-life-gold': '#a3e635',
            '--color-life-text': '#ecfccb'
        }
    },
    {
        id: 'cyberpunk',
        name: 'Neon City',
        colors: {
            '--color-life-black': '#020617', 
            '--color-life-paper': '#0f172a', 
            '--color-life-gold': '#22d3ee',  
            '--color-life-text': '#e0f2fe'   
        },
        soundPack: 'cyberpunk',
        animationStyle: 'fast',
        customCss: `
            /* Cyberpunk Aesthetics */
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
            
            body { 
                font-family: 'Share Tech Mono', monospace !important; 
                letter-spacing: 0.5px;
            }
            
            /* Hard Corners */
            .rounded-xl, .rounded-lg, .rounded-2xl, .rounded-full, .rounded-md, button {
                border-radius: 0px !important;
                clip-path: polygon(
                    0 0, 
                    100% 0, 
                    100% calc(100% - 10px), 
                    calc(100% - 10px) 100%, 
                    0 100%
                );
            }
            
            /* Neon Borders */
            .border {
                border-color: rgba(34, 211, 238, 0.4) !important;
            }
            
            /* Icons Glow */
            svg {
                filter: drop-shadow(0 0 2px currentColor);
            }
            
            .bg-life-gold {
                box-shadow: 0 0 15px #22d3ee, inset 0 0 10px rgba(0,0,0,0.5);
            }
        `
    },
    {
        id: 'gamify',
        name: 'Super Duo',
        colors: {
            '--color-life-black': '#ffffff',   
            '--color-life-paper': '#f3f4f6',   
            '--color-life-gold': '#58cc02',    
            '--color-life-text': '#3c3c3c'     
        },
        soundPack: 'retro',
        animationStyle: 'bouncy',
        customCss: `
            /* Bubbly UI */
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
            
            body { font-family: 'Nunito', sans-serif !important; }
            
            .rounded-xl, .rounded-lg {
                border-radius: 20px !important;
            }
            
            /* 3D Buttons */
            button, .bg-life-paper {
                border-bottom-width: 4px !important;
                border-color: rgba(0,0,0,0.1) !important;
                transition: transform 0.1s;
            }
            
            button:active {
                transform: translateY(4px);
                border-bottom-width: 0px !important;
            }
            
            .bg-life-gold {
                border-color: #46a302 !important; /* Darker Green Border */
            }
        `
    },
    {
        id: 'gamify_purple',
        name: 'Super Duo Dark',
        colors: {
            '--color-life-black': '#13111C',   
            '--color-life-paper': '#1F1C2E',   
            '--color-life-gold': '#9333ea',    
            '--color-life-text': '#E9D5FF'     
        },
        soundPack: 'retro',
        animationStyle: 'bouncy',
        customCss: `
            /* Bubbly Dark UI */
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
            
            body { font-family: 'Nunito', sans-serif !important; }
            
            .rounded-xl, .rounded-lg {
                border-radius: 20px !important;
            }
            
            /* 3D Buttons */
            button, .bg-life-paper {
                border-bottom-width: 4px !important;
                border-color: rgba(0,0,0,0.4) !important;
                transition: transform 0.1s;
            }
            
            button:active {
                transform: translateY(4px);
                border-bottom-width: 0px !important;
            }
        `
    },
    {
        id: 'pubg_survival',
        name: 'PUBG Survival',
        colors: {
            '--color-life-black': '#1c1c1c',
            '--color-life-paper': '#2b2b2b',
            '--color-life-gold': '#f59e0b',
            '--color-life-text': '#e5e7eb',
            '--color-life-muted': '#9ca3af',
            '--color-life-easy': '#10b981',
            '--color-life-hard': '#ef4444'
        },
        soundPack: 'pubg',
        animationStyle: 'fast',
        customCss: `
            /* PUBG Military Aesthetics */
            @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&display=swap');
            
            body { 
                font-family: 'Teko', sans-serif !important; 
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            /* Sharp Edges & Military Borders */
            .rounded-xl, .rounded-lg, .rounded-2xl, .rounded-full, .rounded-md, button {
                border-radius: 2px !important;
            }
            
            /* Button Interactions */
            button {
                border: 1px solid rgba(245, 158, 11, 0.3) !important;
                box-shadow: 0 0 5px rgba(0,0,0,0.5);
                transition: all 0.1s ease-in-out;
            }
            
            button:active {
                transform: scale(0.95);
                box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
                border-color: #f59e0b !important;
            }
            
            /* Gold Accent */
            .bg-life-gold {
                background-color: rgba(245, 158, 11, 0.9) !important;
                color: #1c1c1c !important;
                font-weight: 900 !important;
                border: 2px solid #f59e0b !important;
                box-shadow: inset 0 0 10px rgba(255,255,255,0.3);
            }
        `,
        customSounds: {
            'click': 'https://actions.google.com/sounds/v1/weapons/gun_cocking.ogg',
            'success': 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
            'level-up': 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
            'crit': 'https://actions.google.com/sounds/v1/weapons/explosion_large.ogg'
        }
    }
];
