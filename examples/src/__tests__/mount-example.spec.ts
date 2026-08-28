import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { IMountedExample, MountExample } from '../mount-example';

import type { IWorkbenchMountOptions } from '../workbench-settings';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createExampleSwitcher, createMountedUniver, createUniverDisposer } from '../mount-example';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('mounted Univer lifecycle', () => {
    it('releases an owned Univer mount exactly once', () => {
        const univer = { dispose: vi.fn() } as unknown as Univer;
        const univerAPI = {} as FUniver;
        const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
        vi.stubGlobal('window', { univer, univerAPI });

        const dispose = createUniverDisposer(host, univer, univerAPI);
        dispose();
        dispose();

        const workbenchWindow = window as typeof window & { univer?: Univer; univerAPI?: FUniver };
        expect(univer.dispose).toHaveBeenCalledOnce();
        expect(host.replaceChildren).toHaveBeenCalledOnce();
        expect(workbenchWindow.univer).toBeUndefined();
        expect(workbenchWindow.univerAPI).toBeUndefined();
    });

    it('ignores a locale load failure after the mounted example is disposed', async () => {
        const univer = { dispose: vi.fn() } as unknown as Univer;
        const univerAPI = {
            loadLocales: vi.fn(),
            setLocale: vi.fn(),
            setDirection: vi.fn(),
            setTheme: vi.fn(),
            toggleDarkMode: vi.fn(),
            setRibbonType: vi.fn(),
        } as unknown as FUniver;
        const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
        const initialSettings = {
            locale: 'zhCN',
            ribbonType: 'grid',
            zoomRatio: 1,
        } as IWorkbenchMountOptions;
        const nextSettings = {
            locale: 'enUS',
            ribbonType: 'simple',
            zoomRatio: 1.25,
        } as IWorkbenchMountOptions;
        let rejectLocale!: (error: Error) => void;
        const locale = new Promise<never>((_resolve, reject) => {
            rejectLocale = reject;
        });
        const applyProductSettings = vi.fn();
        vi.stubGlobal('window', {});
        const mounted = createMountedUniver(
            host,
            univer,
            univerAPI,
            initialSettings,
            () => locale,
            applyProductSettings
        );

        const update = mounted.updateSettings(nextSettings);
        mounted.dispose();
        rejectLocale(new Error('locale chunk failed'));

        await expect(update).resolves.toBeUndefined();
        expect(univerAPI.loadLocales).not.toHaveBeenCalled();
        expect(univerAPI.setRibbonType).not.toHaveBeenCalled();
        expect(applyProductSettings).not.toHaveBeenCalled();
    });

    it('ignores a product settings failure after the mounted example is disposed', async () => {
        const univer = { dispose: vi.fn() } as unknown as Univer;
        const univerAPI = {
            setDirection: vi.fn(),
            setTheme: vi.fn(),
            toggleDarkMode: vi.fn(),
            setRibbonType: vi.fn(),
        } as unknown as FUniver;
        const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
        const initialSettings = {
            locale: 'zhCN',
            ribbonType: 'grid',
            zoomRatio: 1,
        } as IWorkbenchMountOptions;
        const nextSettings = {
            ...initialSettings,
            zoomRatio: 1.25,
        } as IWorkbenchMountOptions;
        let rejectProductSettings!: (error: Error) => void;
        const productSettings = new Promise<never>((_resolve, reject) => {
            rejectProductSettings = reject;
        });
        vi.stubGlobal('window', {});
        const mounted = createMountedUniver(
            host,
            univer,
            univerAPI,
            initialSettings,
            vi.fn(),
            () => productSettings
        );

        const update = mounted.updateSettings(nextSettings);
        mounted.dispose();
        rejectProductSettings(new Error('render unit disposed'));

        await expect(update).resolves.toBeUndefined();
        expect(univerAPI.setRibbonType).not.toHaveBeenCalled();
    });

    it('applies ribbon and product view settings without recreating the Univer instance', async () => {
        const univer = { dispose: vi.fn() } as unknown as Univer;
        const univerAPI = {
            Enum: {
                BuiltInUIPart: {
                    FOOTER: 'footer',
                    HEADER: 'header',
                    LEFT_SIDEBAR: 'left-sidebar',
                    TOOLBAR: 'toolbar',
                },
            },
            setRegion: vi.fn(),
            setDirection: vi.fn(),
            setTheme: vi.fn(),
            toggleDarkMode: vi.fn(),
            setRibbonType: vi.fn(),
            setUIVisible: vi.fn(),
        } as unknown as FUniver;
        const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
        const initialSettings = {
            locale: 'zhCN',
            region: 'auto',
            ribbonType: 'grid',
            uiChrome: 'full',
            zoomRatio: 1,
        } as IWorkbenchMountOptions;
        const nextSettings = {
            ...initialSettings,
            region: 'frFR',
            ribbonType: 'simple',
            uiChrome: 'canvas-only',
            zoomRatio: 1.25,
        } as IWorkbenchMountOptions;
        const applyProductSettings = vi.fn();
        vi.stubGlobal('window', {});
        const mounted = createMountedUniver(
            host,
            univer,
            univerAPI,
            initialSettings,
            vi.fn(),
            applyProductSettings
        );

        await mounted.updateSettings(nextSettings);
        await mounted.updateSettings({ ...nextSettings, darkMode: true });

        expect(univerAPI.setRibbonType).toHaveBeenCalledOnce();
        expect(univerAPI.setRibbonType).toHaveBeenCalledWith('simple');
        expect(univerAPI.setRegion).toHaveBeenCalledOnce();
        expect(univerAPI.setRegion).toHaveBeenCalledWith('frFR');
        expect(univerAPI.setUIVisible).toHaveBeenCalledTimes(4);
        expect(univerAPI.setUIVisible).toHaveBeenNthCalledWith(1, 'header', false);
        expect(univerAPI.setUIVisible).toHaveBeenNthCalledWith(2, 'toolbar', false);
        expect(univerAPI.setUIVisible).toHaveBeenNthCalledWith(3, 'footer', false);
        expect(univerAPI.setUIVisible).toHaveBeenNthCalledWith(4, 'left-sidebar', false);
        expect(applyProductSettings).toHaveBeenCalledOnce();
        expect(applyProductSettings).toHaveBeenCalledWith(nextSettings);
        expect(univer.dispose).not.toHaveBeenCalled();

        mounted.dispose();
    });

    it('does not commit locale or ribbon changes when a combined view update fails', async () => {
        const univer = { dispose: vi.fn() } as unknown as Univer;
        const univerAPI = {
            Enum: {
                BuiltInUIPart: {
                    FOOTER: 'footer',
                    HEADER: 'header',
                    LEFT_SIDEBAR: 'left-sidebar',
                    TOOLBAR: 'toolbar',
                },
            },
            loadLocales: vi.fn(),
            setLocale: vi.fn(),
            setRegion: vi.fn(),
            setDirection: vi.fn(),
            setTheme: vi.fn(),
            toggleDarkMode: vi.fn(),
            setRibbonType: vi.fn(),
            setUIVisible: vi.fn(),
        } as unknown as FUniver;
        const host = { replaceChildren: vi.fn() } as unknown as HTMLElement;
        const initialSettings = {
            locale: 'zhCN',
            region: 'auto',
            ribbonType: 'grid',
            uiChrome: 'full',
            zoomRatio: 1,
        } as IWorkbenchMountOptions;
        const nextSettings = {
            ...initialSettings,
            locale: 'enUS',
            region: 'frFR',
            ribbonType: 'simple',
            uiChrome: 'canvas-only',
            zoomRatio: 1.25,
        } as IWorkbenchMountOptions;
        const updateError = new Error('zoom failed');
        vi.stubGlobal('window', {});
        const mounted = createMountedUniver(
            host,
            univer,
            univerAPI,
            initialSettings,
            () => Promise.resolve({} as Parameters<FUniver['loadLocales']>[1]),
            () => Promise.reject(updateError)
        );

        await expect(mounted.updateSettings(nextSettings)).rejects.toBe(updateError);
        expect(univerAPI.loadLocales).not.toHaveBeenCalled();
        expect(univerAPI.setLocale).not.toHaveBeenCalled();
        expect(univerAPI.setRegion).not.toHaveBeenCalled();
        expect(univerAPI.setRibbonType).not.toHaveBeenCalled();
        expect(univerAPI.setUIVisible).not.toHaveBeenCalled();

        mounted.dispose();
    });
});

describe('createExampleSwitcher', () => {
    it('mounts only the latest requested example', async () => {
        const host = {} as HTMLElement;
        const docsDispose = vi.fn();
        const docsMount = vi.fn(() => ({ dispose: docsDispose, updateSettings: vi.fn() }));
        const sheetsMount = vi.fn(() => ({ dispose: vi.fn(), updateSettings: vi.fn() }));
        const options = {} as IWorkbenchMountOptions;
        let resolveSheets!: (module: { mount: MountExample }) => void;
        const switcher = createExampleSwitcher(host, {
            docs: () => Promise.resolve({ mount: docsMount }),
            sheets: () => new Promise((resolve) => {
                resolveSheets = resolve;
            }),
        });

        const pendingSheets = switcher.open('sheets', options);
        await switcher.open('docs', options);
        resolveSheets({ mount: sheetsMount });
        await pendingSheets;

        expect(docsMount).toHaveBeenCalledOnce();
        expect(docsMount).toHaveBeenCalledWith(host, options);
        expect(sheetsMount).not.toHaveBeenCalled();

        switcher.dispose();
        switcher.dispose();
        expect(docsDispose).toHaveBeenCalledOnce();
    });

    it('cleans up a stale async mount before mounting the next example', async () => {
        const host = {} as HTMLElement;
        const options = {} as IWorkbenchMountOptions;
        const events: string[] = [];
        let resolveSheetsMount!: () => void;
        let reportSheetsMountStarted!: () => void;
        let reportDocsLoaded!: () => void;
        const sheetsMountStarted = new Promise<void>((resolve) => {
            reportSheetsMountStarted = resolve;
        });
        const docsLoaded = new Promise<void>((resolve) => {
            reportDocsLoaded = resolve;
        });
        const sheetsMount = vi.fn(() => new Promise<Awaited<ReturnType<MountExample>>>((resolve) => {
            reportSheetsMountStarted();
            resolveSheetsMount = () => resolve({
                dispose: () => events.push('sheets-dispose'),
                updateSettings: vi.fn(),
            });
        }));
        const docsMount = vi.fn(() => {
            events.push('docs-mount');
            return { dispose: vi.fn(), updateSettings: vi.fn() };
        });
        const switcher = createExampleSwitcher(host, {
            docs: () => {
                reportDocsLoaded();
                return Promise.resolve({ mount: docsMount });
            },
            sheets: () => Promise.resolve({ mount: sheetsMount }),
        });

        const pendingSheets = switcher.open('sheets', options);
        await sheetsMountStarted;
        const pendingDocs = switcher.open('docs', options);
        await docsLoaded;

        expect(docsMount).not.toHaveBeenCalled();

        resolveSheetsMount();
        await Promise.all([pendingSheets, pendingDocs]);

        expect(events).toEqual(['sheets-dispose', 'docs-mount']);
        switcher.dispose();
    });

    it('updates the active example without mounting or disposing it again', async () => {
        const host = {} as HTMLElement;
        const initialSettings = {} as IWorkbenchMountOptions;
        const nextSettings = { darkMode: true } as IWorkbenchMountOptions;
        const dispose = vi.fn();
        const updateSettings = vi.fn();
        const mount = vi.fn(() => ({ dispose, updateSettings }));
        const switcher = createExampleSwitcher(host, {
            sheets: () => Promise.resolve({ mount }),
        });

        await switcher.open('sheets', initialSettings);
        await switcher.updateSettings(nextSettings);

        expect(mount).toHaveBeenCalledOnce();
        expect(dispose).not.toHaveBeenCalled();
        expect(updateSettings).toHaveBeenCalledOnce();
        expect(updateSettings).toHaveBeenCalledWith(nextSettings);

        switcher.dispose();
        expect(dispose).toHaveBeenCalledOnce();
    });

    it('serializes settings selected while an example is finishing its mount', async () => {
        const host = {} as HTMLElement;
        const initialSettings = { locale: 'zhCN' } as IWorkbenchMountOptions;
        const pendingSettings = { locale: 'frFR' } as IWorkbenchMountOptions;
        const latestSettings = { locale: 'enUS' } as IWorkbenchMountOptions;
        const updates: IWorkbenchMountOptions[] = [];
        let resolveMount!: (mounted: IMountedExample) => void;
        let resolvePendingUpdate!: () => void;
        let reportMountStarted!: () => void;
        let reportPendingUpdateStarted!: () => void;
        const mountStarted = new Promise<void>((resolve) => {
            reportMountStarted = resolve;
        });
        const pendingUpdateStarted = new Promise<void>((resolve) => {
            reportPendingUpdateStarted = resolve;
        });
        const updateSettings = vi.fn((options: IWorkbenchMountOptions) => {
            updates.push(options);
            if (options === pendingSettings) {
                reportPendingUpdateStarted();
                return new Promise<void>((resolve) => {
                    resolvePendingUpdate = resolve;
                });
            }

            return Promise.resolve();
        });
        const mount = vi.fn(() => {
            reportMountStarted();
            return new Promise<IMountedExample>((resolve) => {
                resolveMount = resolve;
            });
        });
        const switcher = createExampleSwitcher(host, {
            sheets: () => Promise.resolve({ mount }),
        });

        const opening = switcher.open('sheets', initialSettings);
        await mountStarted;
        let pendingUpdateSettled = false;
        const pendingUpdate = switcher.updateSettings(pendingSettings);
        const trackedPendingUpdate = pendingUpdate.finally(() => {
            pendingUpdateSettled = true;
        });
        await Promise.resolve();
        expect(pendingUpdateSettled).toBe(false);

        resolveMount({ dispose: vi.fn(), updateSettings });
        await pendingUpdateStarted;

        const latestUpdate = switcher.updateSettings(latestSettings);
        await Promise.resolve();
        expect(updates).toEqual([pendingSettings]);

        resolvePendingUpdate();
        await Promise.all([opening, trackedPendingUpdate, latestUpdate]);
        expect(updates).toEqual([pendingSettings, latestSettings]);
        switcher.dispose();
    });
});
