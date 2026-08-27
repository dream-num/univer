import type { Theme } from '@univerjs/themes';
import type { RibbonType } from '@univerjs/ui';
import {
    blueTheme,
    darkBlueTheme,
    greenTheme,
    orangeTheme,
    purpleTheme,
    redTheme,
    yellowTheme,
} from '@univerjs/themes';

export const WORKBENCH_LOCALES = [
    'enUS',
    'frFR',
    'zhCN',
    'ruRU',
    'zhTW',
    'zhHK',
    'viVN',
    'faIR',
    'jaJP',
    'koKR',
    'esES',
    'caES',
    'skSK',
    'ptBR',
    'deDE',
    'itIT',
    'idID',
    'plPL',
    'arSA',
] as const;
export const WORKBENCH_DIRECTIONS = ['ltr', 'rtl'] as const;
export const WORKBENCH_THEMES = ['blue', 'green', 'orange', 'purple', 'red', 'yellow', 'dark-blue'] as const;
export const WORKBENCH_RIBBON_TYPES = ['grid', 'classic', 'collapsed', 'simple'] as const satisfies readonly RibbonType[];
export const WORKBENCH_REGIONS = ['auto', ...WORKBENCH_LOCALES] as const;
export const WORKBENCH_UI_CHROME_MODES = ['full', 'no-ribbon', 'canvas-only'] as const;
export const WORKBENCH_ZOOM_RATIOS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4] as const;
export const WORKBENCH_SETTINGS_STORAGE_KEY = 'univer.examples.workbench.settings';

export type WorkbenchLocale = (typeof WORKBENCH_LOCALES)[number];
export type WorkbenchDirection = (typeof WORKBENCH_DIRECTIONS)[number];
export type WorkbenchTheme = (typeof WORKBENCH_THEMES)[number];
export type WorkbenchRibbonType = (typeof WORKBENCH_RIBBON_TYPES)[number];
export type WorkbenchRegion = (typeof WORKBENCH_REGIONS)[number];
export type WorkbenchUIChromeMode = (typeof WORKBENCH_UI_CHROME_MODES)[number];
export type WorkbenchZoomRatio = (typeof WORKBENCH_ZOOM_RATIOS)[number];

export interface IWorkbenchSettings {
    locale: WorkbenchLocale;
    region: WorkbenchRegion;
    direction: WorkbenchDirection;
    theme: WorkbenchTheme;
    darkMode: boolean;
    ribbonType: WorkbenchRibbonType;
    uiChrome: WorkbenchUIChromeMode;
    zoomRatio: WorkbenchZoomRatio;
}

export interface IWorkbenchMountOptions extends Omit<IWorkbenchSettings, 'theme'> {
    theme: Theme;
}

export interface IWorkbenchUIChromeVisibility {
    footer: boolean;
    header: boolean;
    leftSidebar: boolean;
    toolbar: boolean;
}

export const WORKBENCH_LOCALE_META: Record<WorkbenchLocale, { direction: WorkbenchDirection; tag: string }> = {
    arSA: { direction: 'rtl', tag: 'ar-SA' },
    caES: { direction: 'ltr', tag: 'ca-ES' },
    deDE: { direction: 'ltr', tag: 'de-DE' },
    enUS: { direction: 'ltr', tag: 'en-US' },
    esES: { direction: 'ltr', tag: 'es-ES' },
    faIR: { direction: 'rtl', tag: 'fa-IR' },
    frFR: { direction: 'ltr', tag: 'fr-FR' },
    idID: { direction: 'ltr', tag: 'id-ID' },
    itIT: { direction: 'ltr', tag: 'it-IT' },
    jaJP: { direction: 'ltr', tag: 'ja-JP' },
    koKR: { direction: 'ltr', tag: 'ko-KR' },
    plPL: { direction: 'ltr', tag: 'pl-PL' },
    ptBR: { direction: 'ltr', tag: 'pt-BR' },
    ruRU: { direction: 'ltr', tag: 'ru-RU' },
    skSK: { direction: 'ltr', tag: 'sk-SK' },
    viVN: { direction: 'ltr', tag: 'vi-VN' },
    zhCN: { direction: 'ltr', tag: 'zh-CN' },
    zhHK: { direction: 'ltr', tag: 'zh-HK' },
    zhTW: { direction: 'ltr', tag: 'zh-TW' },
};

const THEMES = {
    blue: blueTheme,
    green: greenTheme,
    orange: orangeTheme,
    purple: purpleTheme,
    red: redTheme,
    yellow: yellowTheme,
    'dark-blue': darkBlueTheme,
} satisfies Record<WorkbenchTheme, Theme>;

const UI_CHROME_VISIBILITY = {
    'canvas-only': {
        footer: false,
        header: false,
        leftSidebar: false,
        toolbar: false,
    },
    full: {
        footer: true,
        header: true,
        leftSidebar: true,
        toolbar: true,
    },
    'no-ribbon': {
        footer: true,
        header: true,
        leftSidebar: true,
        toolbar: false,
    },
} satisfies Record<WorkbenchUIChromeMode, IWorkbenchUIChromeVisibility>;

function getAllowedValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
    return typeof value === 'string' && allowed.includes(value as T) ? value as T : fallback;
}

function getAllowedNumber<T extends number>(value: unknown, allowed: readonly T[], fallback: T): T {
    return typeof value === 'number' && allowed.includes(value as T) ? value as T : fallback;
}

export function readWorkbenchSettings(storage: Pick<Storage, 'getItem'>): IWorkbenchSettings {
    const defaults = getDefaultWorkbenchSettings();
    let value: Record<string, unknown> = {};

    try {
        const storedValue = storage.getItem(WORKBENCH_SETTINGS_STORAGE_KEY);
        const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : {};
        if (parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
            value = parsedValue as Record<string, unknown>;
        }
    } catch {
        // Ignore invalid development preferences and fall back to defaults.
    }

    const locale = getAllowedValue(value.locale, WORKBENCH_LOCALES, defaults.locale);

    return {
        locale,
        region: getAllowedValue(value.region, WORKBENCH_REGIONS, defaults.region),
        direction: getAllowedValue(value.direction, WORKBENCH_DIRECTIONS, WORKBENCH_LOCALE_META[locale].direction),
        theme: getAllowedValue(value.theme, WORKBENCH_THEMES, defaults.theme),
        darkMode: value.darkMode === true,
        ribbonType: getAllowedValue(value.ribbonType, WORKBENCH_RIBBON_TYPES, defaults.ribbonType),
        uiChrome: getAllowedValue(value.uiChrome, WORKBENCH_UI_CHROME_MODES, defaults.uiChrome),
        zoomRatio: getAllowedNumber(value.zoomRatio, WORKBENCH_ZOOM_RATIOS, defaults.zoomRatio),
    };
}

export function getDefaultWorkbenchSettings(): IWorkbenchSettings {
    return {
        locale: 'zhCN',
        region: 'auto',
        direction: 'ltr',
        theme: 'blue',
        darkMode: false,
        ribbonType: 'grid',
        uiChrome: 'full',
        zoomRatio: 1,
    };
}

export function getEffectiveWorkbenchRegion(
    settings: Pick<IWorkbenchSettings, 'locale' | 'region'>
): WorkbenchLocale {
    return settings.region === 'auto' ? settings.locale : settings.region;
}

export function getWorkbenchUIChromeVisibility(
    mode: WorkbenchUIChromeMode
): IWorkbenchUIChromeVisibility {
    return UI_CHROME_VISIBILITY[mode];
}

export function writeWorkbenchSettings(storage: Pick<Storage, 'setItem'>, settings: IWorkbenchSettings): void {
    storage.setItem(WORKBENCH_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function clearWorkbenchSettings(storage: Pick<Storage, 'removeItem'>): void {
    storage.removeItem(WORKBENCH_SETTINGS_STORAGE_KEY);
}

export function getWorkbenchTheme(theme: WorkbenchTheme): Theme {
    return THEMES[theme];
}
