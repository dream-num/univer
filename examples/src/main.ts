import type { ExampleLoader } from './mount-example';
import type {
    WorkbenchDirection,
    WorkbenchLocale,
    WorkbenchRegion,
    WorkbenchRibbonType,
    WorkbenchTheme,
    WorkbenchUIChromeMode,
    WorkbenchZoomRatio,
} from './workbench-settings';
import { createExampleSwitcher } from './mount-example';
import {
    clearWorkbenchSettings,
    getDefaultWorkbenchSettings,
    getWorkbenchTheme,
    readWorkbenchSettings,
    WORKBENCH_LOCALE_META,
    writeWorkbenchSettings,
} from './workbench-settings';
import { renderWorkbenchSettingsControl, unmountWorkbenchSettingsControl } from './workbench-settings-control';
import './global.css';

const loaders = {
    docs: () => import('./docs/mount'),
    sheets: () => import('./sheets/mount'),
    slides: () => import('./slides/mount'),
} satisfies Record<string, ExampleLoader>;

type ExampleName = keyof typeof loaders;

function getRequiredElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Workbench element ${selector} was not found.`);
    }

    return element;
}

const host = getRequiredElement<HTMLElement>('#app');
const status = getRequiredElement<HTMLElement>('#workbench-status');
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-example]')];
const settingsContainer = getRequiredElement<HTMLElement>('#workbench-settings');
const switcher = createExampleSwitcher(host, loaders);
let navigation = 0;
let settings = readWorkbenchSettings(localStorage);
let appliedSettings = settings;
let settingsUpdate = 0;
let appliedSettingsUpdate = 0;
let disposed = false;

if (location.search) {
    const url = new URL(location.href);
    url.search = '';
    history.replaceState(null, '', url);
}

function getExampleName(): ExampleName {
    const name = location.hash.slice(1);
    if (Object.hasOwn(loaders, name)) {
        return name as ExampleName;
    }

    history.replaceState(null, '', '#sheets');
    return 'sheets';
}

function showError(error: unknown) {
    status.hidden = false;
    status.dataset.error = 'true';
    status.textContent = error instanceof Error ? error.message : String(error);
}

function getMountOptions(currentSettings = settings) {
    return {
        ...currentSettings,
        theme: getWorkbenchTheme(currentSettings.theme),
    };
}

function renderWorkbenchSettings(currentSettings = settings) {
    const theme = getWorkbenchTheme(currentSettings.theme);

    document.documentElement.lang = WORKBENCH_LOCALE_META[currentSettings.locale].tag;
    document.documentElement.dir = currentSettings.direction;
    document.documentElement.dataset.theme = currentSettings.theme;
    document.documentElement.classList.toggle('univer-dark', currentSettings.darkMode);
    document.documentElement.style.setProperty('--workbench-accent', theme.primary[600]);
    renderWorkbenchSettingsControl(settingsContainer, {
        settings: currentSettings,
        onLocaleChange,
        onRegionChange,
        onDirectionChange,
        onThemeChange,
        onDarkModeChange,
        onRibbonTypeChange,
        onUIChromeChange,
        onZoomRatioChange,
        onResetPreferences,
    });
}

async function openCurrentExample() {
    const request = ++navigation;
    const name = getExampleName();
    renderWorkbenchSettings();

    for (const link of links) {
        if (link.dataset.example === name) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    }

    document.title = `Univer ${name[0].toUpperCase()}${name.slice(1)} Workbench`;
    host.setAttribute('aria-busy', 'true');
    status.hidden = false;
    delete status.dataset.error;
    status.textContent = `Loading ${name}…`;

    try {
        await switcher.open(name, getMountOptions());
    } catch (error) {
        if (request === navigation) {
            host.removeAttribute('aria-busy');
            showError(error);
        }
        return;
    }

    if (request === navigation) {
        host.removeAttribute('aria-busy');
        status.hidden = true;
    }
}

const onLocationChange = () => {
    openCurrentExample().catch((error) => {
        host.removeAttribute('aria-busy');
        showError(error);
    });
};

async function updateWorkbenchSettings(
    nextSettings: typeof settings,
    persistSettings: (settings: typeof appliedSettings) => void = (settings) => {
        writeWorkbenchSettings(localStorage, settings);
    }
) {
    const request = ++settingsUpdate;
    settings = nextSettings;

    try {
        await switcher.updateSettings(getMountOptions(nextSettings));
    } catch (error) {
        if (!disposed && request === settingsUpdate) {
            settings = appliedSettings;
            renderWorkbenchSettings(appliedSettings);
            showError(error);
        }
        return;
    }

    if (!disposed && request > appliedSettingsUpdate) {
        appliedSettingsUpdate = request;
        appliedSettings = nextSettings;
        let persistenceError: unknown;
        try {
            persistSettings(appliedSettings);
        } catch (error) {
            persistenceError = error;
        }
        if (request === settingsUpdate) {
            renderWorkbenchSettings(appliedSettings);
            if (persistenceError) {
                const detail = persistenceError instanceof Error ? ` ${persistenceError.message}` : '';
                showError(new Error(`Preferences were applied, but could not be saved.${detail}`));
            }
        }
    }
}

async function onLocaleChange(locale: WorkbenchLocale) {
    await updateWorkbenchSettings({
        ...settings,
        locale,
        direction: WORKBENCH_LOCALE_META[locale].direction,
    });
}

async function onDirectionChange(direction: WorkbenchDirection) {
    await updateWorkbenchSettings({ ...settings, direction });
}

async function onRegionChange(region: WorkbenchRegion) {
    await updateWorkbenchSettings({ ...settings, region });
}

async function onThemeChange(theme: WorkbenchTheme) {
    await updateWorkbenchSettings({ ...settings, theme });
}

async function onDarkModeChange(darkMode: boolean) {
    await updateWorkbenchSettings({ ...settings, darkMode });
}

async function onRibbonTypeChange(ribbonType: WorkbenchRibbonType) {
    await updateWorkbenchSettings({ ...settings, ribbonType });
}

async function onUIChromeChange(uiChrome: WorkbenchUIChromeMode) {
    await updateWorkbenchSettings({ ...settings, uiChrome });
}

async function onZoomRatioChange(zoomRatio: WorkbenchZoomRatio) {
    await updateWorkbenchSettings({ ...settings, zoomRatio });
}

async function onResetPreferences() {
    await updateWorkbenchSettings(getDefaultWorkbenchSettings(), () => {
        clearWorkbenchSettings(localStorage);
    });
}

window.addEventListener('hashchange', onLocationChange);
onLocationChange();

import.meta.hot?.dispose(() => {
    disposed = true;
    navigation += 1;
    settingsUpdate += 1;
    appliedSettingsUpdate = settingsUpdate;
    settings = appliedSettings;
    window.removeEventListener('hashchange', onLocationChange);
    unmountWorkbenchSettingsControl(settingsContainer);
    switcher.dispose();
});
