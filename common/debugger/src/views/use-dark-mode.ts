import { ThemeService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

export function useDarkMode() {
    const themeService = useDependency(ThemeService);

    useEffect(() => {
        const darkMode = localStorage.getItem('local.darkMode');

        if (darkMode === 'dark') {
            document.documentElement.classList.add('univer-dark');
            themeService.setDarkMode(true);
        } else if (darkMode === 'system') {
            themeService.setDarkMode(false);
        }
    }, []);

    const onSelect = () => {
        const darkMode = themeService.darkMode ? 'light' : 'dark';

        themeService.setDarkMode(darkMode === 'dark');
        localStorage.setItem('local.darkMode', darkMode);
    };

    return {
        type: 'item' as const,
        children: '🌓 Toggle dark mode',
        onSelect,
    };
}
