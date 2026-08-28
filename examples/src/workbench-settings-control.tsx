import type { IDropdownMenuProps } from '@univerjs/design';
import type {
    IWorkbenchSettings,
    WorkbenchDirection,
    WorkbenchLocale,
    WorkbenchRegion,
    WorkbenchRibbonType,
    WorkbenchTheme,
    WorkbenchUIChromeMode,
    WorkbenchZoomRatio,
} from './workbench-settings';
import { Button, ConfigProvider, DropdownMenu, render, unmount } from '@univerjs/design';

import { MoreDownIcon } from '@univerjs/icons';
import {
    WORKBENCH_DIRECTIONS,
    WORKBENCH_LOCALE_META,
    WORKBENCH_LOCALES,
    WORKBENCH_REGIONS,
    WORKBENCH_RIBBON_TYPES,
    WORKBENCH_THEMES,
    WORKBENCH_UI_CHROME_MODES,
    WORKBENCH_ZOOM_RATIOS,
} from './workbench-settings';

const LOCALE_LABELS = {
    arSA: 'العربية',
    caES: 'Català',
    deDE: 'Deutsch',
    enUS: 'English',
    esES: 'Español',
    faIR: 'فارسی',
    frFR: 'Français',
    idID: 'Bahasa Indonesia',
    itIT: 'Italiano',
    jaJP: '日本語',
    koKR: '한국어',
    plPL: 'Polski',
    ptBR: 'Português (Brasil)',
    ruRU: 'Русский',
    skSK: 'Slovenčina',
    viVN: 'Tiếng Việt',
    zhCN: '简体中文',
    zhHK: '繁體中文（香港）',
    zhTW: '繁體中文',
} satisfies Record<WorkbenchLocale, string>;

const THEME_LABELS = {
    blue: 'Blue',
    'dark-blue': 'Dark blue',
    green: 'Green',
    orange: 'Orange',
    purple: 'Purple',
    red: 'Red',
    yellow: 'Yellow',
} satisfies Record<WorkbenchTheme, string>;

const RIBBON_TYPE_LABELS = {
    classic: 'Classic',
    collapsed: 'Collapsed',
    grid: 'Grid',
    simple: 'Simple',
} satisfies Record<WorkbenchRibbonType, string>;

const REGION_LABELS = {
    arSA: 'Saudi Arabia',
    auto: 'Follow language',
    caES: 'Catalonia (Spain)',
    deDE: 'Germany',
    enUS: 'United States',
    esES: 'Spain',
    faIR: 'Iran',
    frFR: 'France',
    idID: 'Indonesia',
    itIT: 'Italy',
    jaJP: 'Japan',
    koKR: 'South Korea',
    plPL: 'Poland',
    ptBR: 'Brazil',
    ruRU: 'Russia',
    skSK: 'Slovakia',
    viVN: 'Vietnam',
    zhCN: 'China',
    zhHK: 'Hong Kong',
    zhTW: 'Taiwan',
} satisfies Record<WorkbenchRegion, string>;

const UI_CHROME_LABELS = {
    'canvas-only': 'Canvas only',
    full: 'Full',
    'no-ribbon': 'No ribbon',
} satisfies Record<WorkbenchUIChromeMode, string>;

interface IWorkbenchSettingsControlProps {
    settings: IWorkbenchSettings;
    onLocaleChange: (locale: WorkbenchLocale) => Promise<void>;
    onRegionChange: (region: WorkbenchRegion) => Promise<void>;
    onDirectionChange: (direction: WorkbenchDirection) => Promise<void>;
    onThemeChange: (theme: WorkbenchTheme) => Promise<void>;
    onDarkModeChange: (darkMode: boolean) => Promise<void>;
    onRibbonTypeChange: (ribbonType: WorkbenchRibbonType) => Promise<void>;
    onUIChromeChange: (uiChrome: WorkbenchUIChromeMode) => Promise<void>;
    onZoomRatioChange: (zoomRatio: WorkbenchZoomRatio) => Promise<void>;
    onResetPreferences: () => Promise<void>;
}

function WorkbenchSettingsControl(props: IWorkbenchSettingsControlProps) {
    const {
        settings,
        onDarkModeChange,
        onDirectionChange,
        onLocaleChange,
        onRegionChange,
        onResetPreferences,
        onRibbonTypeChange,
        onThemeChange,
        onUIChromeChange,
        onZoomRatioChange,
    } = props;

    function renderSettingLabel(label: string, value: string) {
        return (
            <span className="workbench-setting-label">
                <span>{label}</span>
                <span className="workbench-setting-value">{value}</span>
            </span>
        );
    }

    const items: IDropdownMenuProps['items'] = [
        {
            type: 'subItem',
            children: renderSettingLabel('Language', LOCALE_LABELS[settings.locale]),
            options: [{
                type: 'radio',
                value: settings.locale,
                options: WORKBENCH_LOCALES.map((value) => ({
                    value,
                    label: (
                        <span
                            dir={WORKBENCH_LOCALE_META[value].direction}
                            lang={WORKBENCH_LOCALE_META[value].tag}
                        >
                            {LOCALE_LABELS[value]}
                        </span>
                    ),
                })),
                onSelect: (value) => onLocaleChange(value as WorkbenchLocale),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('Region', REGION_LABELS[settings.region]),
            options: [{
                type: 'radio',
                value: settings.region,
                options: WORKBENCH_REGIONS.map((value) => ({
                    value,
                    label: REGION_LABELS[value],
                })),
                onSelect: (value) => onRegionChange(value as WorkbenchRegion),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('Direction', settings.direction.toUpperCase()),
            options: [{
                type: 'radio',
                value: settings.direction,
                options: WORKBENCH_DIRECTIONS.map((value) => ({ value, label: value.toUpperCase() })),
                onSelect: (value) => onDirectionChange(value as WorkbenchDirection),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('Theme', THEME_LABELS[settings.theme]),
            options: [{
                type: 'radio',
                value: settings.theme,
                options: WORKBENCH_THEMES.map((value) => ({ value, label: THEME_LABELS[value] })),
                onSelect: (value) => onThemeChange(value as WorkbenchTheme),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('Appearance', settings.darkMode ? 'Dark' : 'Light'),
            options: [{
                type: 'radio',
                value: settings.darkMode ? 'dark' : 'light',
                options: [
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                ],
                onSelect: (value) => onDarkModeChange(value === 'dark'),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('Ribbon', RIBBON_TYPE_LABELS[settings.ribbonType]),
            options: [{
                type: 'radio',
                value: settings.ribbonType,
                options: WORKBENCH_RIBBON_TYPES.map((value) => ({ value, label: RIBBON_TYPE_LABELS[value] })),
                onSelect: (value) => onRibbonTypeChange(value as WorkbenchRibbonType),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('UI chrome', UI_CHROME_LABELS[settings.uiChrome]),
            options: [{
                type: 'radio',
                value: settings.uiChrome,
                options: WORKBENCH_UI_CHROME_MODES.map((value) => ({
                    value,
                    label: UI_CHROME_LABELS[value],
                })),
                onSelect: (value) => onUIChromeChange(value as WorkbenchUIChromeMode),
            }],
        },
        {
            type: 'subItem',
            children: renderSettingLabel('Zoom', `${settings.zoomRatio * 100}%`),
            options: [{
                type: 'radio',
                value: String(settings.zoomRatio),
                options: WORKBENCH_ZOOM_RATIOS.map((value) => ({
                    value: String(value),
                    label: `${value * 100}%`,
                })),
                onSelect: (value) => {
                    const zoomRatio = WORKBENCH_ZOOM_RATIOS.find((item) => String(item) === value);
                    return zoomRatio == null ? Promise.resolve() : onZoomRatioChange(zoomRatio);
                },
            }],
        },
        { type: 'separator' },
        {
            type: 'item',
            children: 'Reset preferences',
            onSelect: onResetPreferences,
        },
    ];

    return (
        <ConfigProvider direction={settings.direction} mountContainer={document.body}>
            <DropdownMenu align="end" className="workbench-settings-menu" items={items} side="bottom">
                <Button className="workbench-settings-trigger" size="middle" type="button" variant="text">
                    Settings
                    <MoreDownIcon aria-hidden="true" />
                </Button>
            </DropdownMenu>
        </ConfigProvider>
    );
}

export function renderWorkbenchSettingsControl(
    container: HTMLElement,
    props: IWorkbenchSettingsControlProps
) {
    render(<WorkbenchSettingsControl {...props} />, container);
}

export function unmountWorkbenchSettingsControl(container: HTMLElement) {
    unmount(container);
}
