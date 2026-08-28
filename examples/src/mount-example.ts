import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';

import type { IWorkbenchMountOptions, WorkbenchLocale, WorkbenchUIChromeMode } from './workbench-settings';
import { getEffectiveWorkbenchRegion, getWorkbenchUIChromeVisibility } from './workbench-settings';

export type DisposeExample = () => void;
export type LoadExampleLocale = (
    locale: WorkbenchLocale
) => Promise<Parameters<FUniver['loadLocales']>[1]>;
export type ApplyExampleProductSettings = (options: IWorkbenchMountOptions) => void | Promise<void>;

export interface IMountedExample {
    dispose: DisposeExample;
    updateSettings: (options: IWorkbenchMountOptions) => Promise<void>;
}

export type MountExample = (
    host: HTMLElement,
    options: IWorkbenchMountOptions
) => IMountedExample | Promise<IMountedExample>;
export type ExampleLoader = () => Promise<{ mount: MountExample }>;

interface IWorkbenchWindow {
    univer?: Univer;
    univerAPI?: FUniver;
}

interface IAppliedWorkbenchSettings {
    locale: WorkbenchLocale;
    region: WorkbenchLocale;
    ribbonType: IWorkbenchMountOptions['ribbonType'];
    uiChrome: WorkbenchUIChromeMode;
    zoomRatio: IWorkbenchMountOptions['zoomRatio'];
}

interface IPendingExampleLocale {
    locale: WorkbenchLocale;
    pack: Awaited<ReturnType<LoadExampleLocale>>;
}

export function createUniverDisposer(host: HTMLElement, univer: Univer, univerAPI?: FUniver): DisposeExample {
    let disposed = false;
    const workbenchWindow = window as typeof window & IWorkbenchWindow;

    workbenchWindow.univer = univer;
    workbenchWindow.univerAPI = univerAPI;

    return () => {
        if (disposed) {
            return;
        }

        disposed = true;
        univer.dispose();
        host.replaceChildren();

        if (workbenchWindow.univer === univer) {
            Reflect.deleteProperty(workbenchWindow, 'univer');
        }
        if (workbenchWindow.univerAPI === univerAPI) {
            Reflect.deleteProperty(workbenchWindow, 'univerAPI');
        }
    };
}

export function applyWorkbenchUIChrome(univerAPI: FUniver, mode: WorkbenchUIChromeMode): void {
    const visibility = getWorkbenchUIChromeVisibility(mode);
    const { FOOTER, HEADER, LEFT_SIDEBAR, TOOLBAR } = univerAPI.Enum.BuiltInUIPart;

    univerAPI.setUIVisible(HEADER, visibility.header);
    univerAPI.setUIVisible(TOOLBAR, visibility.toolbar);
    univerAPI.setUIVisible(FOOTER, visibility.footer);
    univerAPI.setUIVisible(LEFT_SIDEBAR, visibility.leftSidebar);
}

function commitWorkbenchSettings(
    univerAPI: FUniver,
    applied: IAppliedWorkbenchSettings,
    options: IWorkbenchMountOptions,
    pendingLocale?: IPendingExampleLocale
): void {
    if (pendingLocale) {
        univerAPI.loadLocales(pendingLocale.locale, pendingLocale.pack);
        univerAPI.setLocale(pendingLocale.locale);
        applied.locale = pendingLocale.locale;
    }

    const nextRegion = getEffectiveWorkbenchRegion(options);
    if (nextRegion !== applied.region) {
        univerAPI.setRegion(nextRegion);
        applied.region = nextRegion;
    }

    if (options.ribbonType !== applied.ribbonType) {
        univerAPI.setRibbonType(options.ribbonType);
        applied.ribbonType = options.ribbonType;
    }

    if (options.uiChrome !== applied.uiChrome) {
        applyWorkbenchUIChrome(univerAPI, options.uiChrome);
        applied.uiChrome = options.uiChrome;
    }

    univerAPI.setDirection(options.direction);
    univerAPI.setTheme(options.theme);
    univerAPI.toggleDarkMode(options.darkMode);
}

export function createMountedUniver(
    host: HTMLElement,
    univer: Univer,
    univerAPI: FUniver,
    initialSettings: IWorkbenchMountOptions,
    loadLocale: LoadExampleLocale,
    applyProductSettings?: ApplyExampleProductSettings
): IMountedExample {
    let disposed = false;
    const appliedSettings: IAppliedWorkbenchSettings = {
        locale: initialSettings.locale,
        region: getEffectiveWorkbenchRegion(initialSettings),
        ribbonType: initialSettings.ribbonType,
        uiChrome: initialSettings.uiChrome,
        zoomRatio: initialSettings.zoomRatio,
    };
    const disposeUniver = createUniverDisposer(host, univer, univerAPI);

    return {
        dispose() {
            disposed = true;
            disposeUniver();
        },
        async updateSettings(options) {
            if (disposed) {
                return;
            }
            let pendingLocale: IPendingExampleLocale | undefined;
            if (options.locale !== appliedSettings.locale) {
                let localePack: Awaited<ReturnType<LoadExampleLocale>>;
                try {
                    localePack = await loadLocale(options.locale);
                } catch (error) {
                    if (disposed) {
                        return;
                    }
                    throw error;
                }

                if (disposed) {
                    return;
                }
                pendingLocale = { locale: options.locale, pack: localePack };
            }

            if (disposed) {
                return;
            }

            if (options.zoomRatio !== appliedSettings.zoomRatio) {
                try {
                    await applyProductSettings?.(options);
                } catch (error) {
                    if (disposed) {
                        return;
                    }
                    throw error;
                }
                if (disposed) {
                    return;
                }
                appliedSettings.zoomRatio = options.zoomRatio;
            }

            commitWorkbenchSettings(univerAPI, appliedSettings, options, pendingLocale);
        },
    };
}

export function createExampleSwitcher<T extends string>(host: HTMLElement, loaders: Record<T, ExampleLoader>) {
    let generation = 0;
    let current: IMountedExample | undefined;
    let latestSettings: IWorkbenchMountOptions | undefined;
    let mountQueue = Promise.resolve();
    let pendingOpen: Promise<void> | undefined;
    let updateQueue = Promise.resolve();

    function enqueueSettingsUpdate(mounted: IMountedExample, options: IWorkbenchMountOptions) {
        const updateTask = updateQueue.then(() => mounted.updateSettings(options));
        updateQueue = updateTask.catch(() => undefined);
        return updateTask;
    }

    return {
        async open(target: T, options: IWorkbenchMountOptions) {
            const request = ++generation;
            latestSettings = options;
            const previous = current;
            current = undefined;
            previous?.dispose();

            const openTask = (async () => {
                try {
                    const { mount } = await loaders[target]();
                    if (request !== generation) {
                        return;
                    }

                    const mountTask = mountQueue.then(async () => {
                        if (request !== generation) {
                            return;
                        }

                        const mounted = await mount(host, options);
                        if (request === generation) {
                            current = mounted;
                            if (latestSettings && latestSettings !== options) {
                                await enqueueSettingsUpdate(mounted, latestSettings);
                            }
                        } else {
                            mounted.dispose();
                        }
                    });
                    mountQueue = mountTask.catch(() => undefined);
                    await mountTask;
                } catch (error) {
                    if (request === generation) {
                        throw error;
                    }
                }
            })();
            pendingOpen = openTask;

            try {
                await openTask;
            } finally {
                if (pendingOpen === openTask) {
                    pendingOpen = undefined;
                }
            }
        },
        async updateSettings(options: IWorkbenchMountOptions) {
            latestSettings = options;
            const mounted = current;
            if (!mounted) {
                await pendingOpen;
                return;
            }

            await enqueueSettingsUpdate(mounted, options);
        },
        dispose() {
            generation += 1;
            const mounted = current;
            current = undefined;
            mounted?.dispose();
        },
    };
}
