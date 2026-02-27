import { useEffect } from 'react';
import { LifeOSState } from '../../types/types';
import { setSoundPack, setCustomSounds } from '../../utils/audio';

export const useThemeManager = (state: LifeOSState) => {
    useEffect(() => {
        const currentThemeId = state.user.preferences.theme;
        const themeData = state.user.unlockedThemes.find(t => t.id === currentThemeId) || state.user.unlockedThemes[0];
        const root = document.documentElement;
        if (themeData && themeData.colors) {
            Object.entries(themeData.colors).forEach(([k, v]) => root.style.setProperty(k, v as string));
        }
        document.body.setAttribute('data-theme', currentThemeId);
        
        // Apply animation style
        if (themeData?.animationStyle) {
            document.body.setAttribute('data-animation', themeData.animationStyle);
        } else {
            document.body.removeAttribute('data-animation');
        }

        // Apply sound pack and custom sounds
        if (themeData?.soundPack) {
            setSoundPack(themeData.soundPack);
        } else {
            setSoundPack('default');
        }
        
        setCustomSounds(themeData?.customSounds || {});
        
        const styleId = 'theme-custom-structural-css';
        let styleTag = document.getElementById(styleId);
        if (themeData?.customCss) {
            if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = styleId; document.head.appendChild(styleTag); }
            styleTag.innerHTML = themeData.customCss;
        } else if (styleTag) styleTag.innerHTML = '';
    }, [state.user.preferences.theme, state.user.unlockedThemes]);
};