import { ThemeService } from '@univerjs/core';
import { defaultTheme, greenTheme, orangeTheme, purpleTheme, redTheme } from '@univerjs/themes';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

const themes = [
    {
        label: '🟢',
        value: greenTheme,
    },
    {
        label: '🔵',
        value: defaultTheme,
    },
    {
        label: '🟠',
        value: orangeTheme,
    },
    {
        label: '🔴',
        value: redTheme,
    },
    {
        label: '🟣',
        value: purpleTheme,
    },
];

export function useTheme() {
    const themeService = useDependency(ThemeService);

    useEffect(() => {
        const themeKey = localStorage.getItem('local.theme');

        const theme = themes.find((theme) => theme.label === themeKey);

        if (theme) {
            themeService.setTheme(theme.value);
        }
    }, [themeService]);

    const onSelect = (value: string) => {
        localStorage.setItem('local.theme', value);

        const theme = themes.find((theme) => theme.label === value);

        if (theme) {
            themeService.setTheme(theme.value);
        }
    };

    return {
        type: 'subItem' as const,
        children: '🎨 Themes',
        options: themes.map((theme) => ({
            type: 'item' as const,
            children: theme.label,
            onSelect: () => onSelect(theme.label),
        })),
    };
}
