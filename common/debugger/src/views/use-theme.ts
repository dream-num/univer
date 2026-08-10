import { ThemeService } from '@univerjs/core';
import {
    blueTheme,
    darkBlueTheme,
    greenTheme,
    orangeTheme,
    purpleTheme,
    redTheme,
    yellowTheme,
} from '@univerjs/themes';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

const themes = [
    {
        label: '🟢',
        value: greenTheme,
    },
    {
        label: '🔵',
        value: blueTheme,
    },
    {
        label: '🔵🌑',
        value: darkBlueTheme,
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
    {
        label: '🟡',
        value: yellowTheme,
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
