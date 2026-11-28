import { describe, expect, it } from 'vitest';
import {
    clearWorkbenchSettings,
    getDefaultWorkbenchSettings,
    getEffectiveWorkbenchRegion,
    getWorkbenchUIChromeVisibility,
    readWorkbenchSettings,
    writeWorkbenchSettings,
} from '../workbench-settings';

function readStoredSettings(value: unknown) {
    return readWorkbenchSettings({
        getItem: () => JSON.stringify(value),
    });
}

describe('readWorkbenchSettings', () => {
    it('keeps supported settings and rejects unknown stored values', () => {
        expect(readStoredSettings({
            device: 'mobile',
            locale: 'arSA',
            region: 'frFR',
            direction: 'rtl',
            theme: 'green',
            darkMode: true,
            ribbonType: 'simple',
            uiChrome: 'no-ribbon',
            zoomRatio: 1.25,
        })).toEqual({
            device: 'mobile',
            locale: 'ar-SA',
            region: 'fr-FR',
            direction: 'rtl',
            theme: 'green',
            darkMode: true,
            ribbonType: 'simple',
            uiChrome: 'no-ribbon',
            zoomRatio: 1.25,
        });
        expect(readStoredSettings({
            device: 'tablet',
            locale: 'unknown',
            region: 'moon',
            direction: 'sideways',
            theme: 'custom',
            darkMode: 'yes',
            ribbonType: 'compact',
            uiChrome: 'minimal',
            zoomRatio: 1.1,
        })).toEqual(getDefaultWorkbenchSettings());
        expect(readWorkbenchSettings({ getItem: () => '{invalid-json' })).toEqual(getDefaultWorkbenchSettings());
    });

    it('supports every built-in locale and follows its default direction', () => {
        expect(readStoredSettings({ locale: 'fa-IR' }).direction).toBe('rtl');
        expect(readStoredSettings({ locale: 'fr-FR' }).direction).toBe('ltr');
        expect(readStoredSettings({ locale: 'ar-SA', direction: 'ltr' }).direction).toBe('ltr');
    });

    it('persists settings through local storage', () => {
        let storedValue: string | null = null;
        const storage = {
            getItem: () => storedValue,
            setItem: (_key: string, value: string) => {
                storedValue = value;
            },
        };
        const settings = {
            device: 'mobile',
            locale: 'en-US',
            region: 'fr-FR',
            direction: 'rtl',
            theme: 'purple',
            darkMode: true,
            ribbonType: 'collapsed',
            uiChrome: 'canvas-only',
            zoomRatio: 1.75,
        } as const;

        writeWorkbenchSettings(storage, settings);

        expect(readWorkbenchSettings(storage)).toEqual(settings);

        clearWorkbenchSettings({
            removeItem: () => {
                storedValue = null;
            },
        });
        expect(readWorkbenchSettings(storage)).toEqual(getDefaultWorkbenchSettings());
    });

    it('resolves automatic regions from language while preserving explicit regions', () => {
        expect(getEffectiveWorkbenchRegion({ locale: 'en-US', region: 'auto' })).toBe('en-US');
        expect(getEffectiveWorkbenchRegion({ locale: 'en-US', region: 'fr-FR' })).toBe('fr-FR');
    });

    it('maps UI chrome modes to the parts developers expect to keep visible', () => {
        expect(getWorkbenchUIChromeVisibility('full')).toEqual({
            footer: true,
            header: true,
            leftSidebar: true,
            toolbar: true,
        });
        expect(getWorkbenchUIChromeVisibility('no-ribbon')).toEqual({
            footer: true,
            header: true,
            leftSidebar: true,
            toolbar: false,
        });
        expect(getWorkbenchUIChromeVisibility('canvas-only')).toEqual({
            footer: false,
            header: false,
            leftSidebar: false,
            toolbar: false,
        });
    });
});
