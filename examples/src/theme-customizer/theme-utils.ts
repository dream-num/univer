import type { Theme } from '@univerjs/themes';
import type { LoopColorKey, ThemeScaleKey, ThemeShadeKey } from './types';
import { COLOR_SCALE_KEYS, COLOR_SHADE_KEYS, LOOP_COLOR_KEYS } from './constants';

export function cloneTheme(theme: Theme): Theme {
    return JSON.parse(JSON.stringify(theme)) as Theme;
}

export function normalizeHexColor(value: string): string | null {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return null;
    }

    const prefixedValue = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
    const shortHexMatch = prefixedValue.match(/^#([0-9a-fA-F]{3})$/);

    if (shortHexMatch) {
        const [r, g, b] = shortHexMatch[1].split('');
        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    if (/^#([0-9a-fA-F]{6})$/.test(prefixedValue)) {
        return prefixedValue.toUpperCase();
    }

    return null;
}

export function formatTheme(theme: Theme): string {
    return JSON.stringify(theme, null, 4);
}

export function mergeThemePatch(baseTheme: Theme, patch: unknown): Theme | null {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
        return null;
    }

    const nextTheme = cloneTheme(baseTheme);
    const record = patch as Record<string, unknown>;

    if (typeof record.white === 'string') {
        nextTheme.white = record.white;
    }

    if (typeof record.black === 'string') {
        nextTheme.black = record.black;
    }

    for (const scale of COLOR_SCALE_KEYS) {
        const scalePatch = record[scale];

        if (!scalePatch || typeof scalePatch !== 'object' || Array.isArray(scalePatch)) {
            continue;
        }

        const scaleRecord = scalePatch as Record<string, unknown>;
        const mergedScale = { ...nextTheme[scale] } as Record<string, string>;

        for (const shade of COLOR_SHADE_KEYS) {
            if (typeof scaleRecord[shade] === 'string') {
                mergedScale[shade] = scaleRecord[shade] as string;
            }
        }

        nextTheme[scale] = mergedScale as Theme[ThemeScaleKey];
    }

    const loopColorPatch = record['loop-color'];

    if (loopColorPatch && typeof loopColorPatch === 'object' && !Array.isArray(loopColorPatch)) {
        const loopRecord = loopColorPatch as Record<string, unknown>;
        const mergedLoopColor = { ...(nextTheme['loop-color'] as Record<string, string>) };

        for (const key of LOOP_COLOR_KEYS) {
            if (typeof loopRecord[key] === 'string') {
                mergedLoopColor[key] = loopRecord[key] as string;
            }
        }

        nextTheme['loop-color'] = mergedLoopColor as Theme['loop-color'];
    }

    return nextTheme;
}

export function updateScaleColor(theme: Theme, scale: ThemeScaleKey, shade: ThemeShadeKey, value: string): Theme {
    return {
        ...theme,
        [scale]: {
            ...theme[scale],
            [shade]: value,
        },
    } as Theme;
}

export function updateThemeRootColor(theme: Theme, key: 'white' | 'black', value: string): Theme {
    return {
        ...theme,
        [key]: value,
    };
}

export function updateLoopColor(theme: Theme, key: LoopColorKey, value: string): Theme {
    return {
        ...theme,
        'loop-color': {
            ...theme['loop-color'],
            [key]: value,
        },
    } as Theme;
}
