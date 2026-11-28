import type { IDropdownMenuProps } from '@univerjs/design';
import { LOCALE_META } from '@univerjs/core';
import { Button, ConfigProvider, DropdownMenu, render, unmount } from '@univerjs/design';
import { MoreDownIcon } from '@univerjs/icons';
import type {
    IWorkbenchSettings,
    WorkbenchDevice,
    WorkbenchDirection,
    WorkbenchLocale,
    WorkbenchRegion,
    WorkbenchRibbonType,
    WorkbenchTheme,
    WorkbenchUIChromeMode,
    WorkbenchZoomRatio,
} from './workbench-settings';
import {
    WORKBENCH_DEVICES,
    WORKBENCH_DIRECTIONS,
    WORKBENCH_LOCALES,
    WORKBENCH_REGIONS,
    WORKBENCH_RIBBON_TYPES,
    WORKBENCH_THEMES,
    WORKBENCH_UI_CHROME_MODES,
    WORKBENCH_ZOOM_RATIOS,
} from './workbench-settings';

const DEVICE_LABELS = { desktop: 'Desktop', mobile: 'Mobile' } satisfies Record<WorkbenchDevice, string>;

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
    'ar-SA': 'Saudi Arabia',
    auto: 'Follow language',
    'ca-ES': 'Catalonia (Spain)',
    'de-DE': 'Germany',
    'en-US': 'United States',
    'es-419': 'Latin America',
    'es-ES': 'Spain',
    'fa-IR': 'Iran',
    'fr-FR': 'France',
    'id-ID': 'Indonesia',
    'it-IT': 'Italy',
    'ja-JP': 'Japan',
    'ko-KR': 'South Korea',
    'pl-PL': 'Poland',
    'pt-BR': 'Brazil',
    'ru-RU': 'Russia',
    'sk-SK': 'Slovakia',
    'sr-Latn-RS': 'Serbia (Latin script)',
    'vi-VN': 'Vietnam',
    'zh-CN': 'China',
    'zh-HK': 'Hong Kong',
    'zh-TW': 'Taiwan',
} satisfies Record<WorkbenchRegion, string>;

const UI_CHROME_LABELS = {
    'canvas-only': 'Canvas only',
    full: 'Full',
    'no-ribbon': 'No ribbon',
} satisfies Record<WorkbenchUIChromeMode, string>;

interface IWorkbenchSettingsControlProps {
    settings: IWorkbenchSettings;
    onDeviceChange: (device: WorkbenchDevice) => Promise<void>;
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
        onDeviceChange,
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
            type: 'item',
            children: renderSettingLabel('Device', 'Restarts example'),
            disabled: true,
        },
        {
            type: 'radio',
            value: settings.device,
            options: WORKBENCH_DEVICES.map((value) => ({
                value,
                label: DEVICE_LABELS[value],
            })),
            onSelect: (value) => onDeviceChange(value as WorkbenchDevice),
        },
        { type: 'separator' },
        {
            type: 'subItem',
            children: renderSettingLabel('Language', LOCALE_META[settings.locale].name),
            options: [{
                type: 'radio',
                value: settings.locale,
                options: WORKBENCH_LOCALES.map((value) => ({
                    value,
                    label: (
                        <span
                            dir={LOCALE_META[value].direction}
                            lang={LOCALE_META[value].tag}
                        >
                            {LOCALE_META[value].name}
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
                    label: value === 'auto' ? REGION_LABELS[value] : `${REGION_LABELS[value]} (${value})`,
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
