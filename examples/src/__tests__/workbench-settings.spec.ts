import { LOCALE_META, LocaleType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import {
    clearWorkbenchSettings,
    getDefaultWorkbenchSettings,
    getEffectiveWorkbenchRegion,
    getWorkbenchUIChromeVisibility,
    readWorkbenchSettings,
    WORKBENCH_LOCALE_META,
    WORKBENCH_LOCALES,
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
            locale: 'arSA',
            region: 'frFR',
            direction: 'rtl',
            theme: 'green',
            darkMode: true,
            ribbonType: 'simple',
            uiChrome: 'no-ribbon',
            zoomRatio: 1.25,
        })).toEqual({
            locale: 'arSA',
            region: 'frFR',
            direction: 'rtl',
            theme: 'green',
            darkMode: true,
            ribbonType: 'simple',
            uiChrome: 'no-ribbon',
            zoomRatio: 1.25,
        });
        expect(readStoredSettings({
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
        expect(WORKBENCH_LOCALES).toEqual(Object.values(LocaleType));
        expect(WORKBENCH_LOCALE_META).toEqual(Object.fromEntries(Object.values(LocaleType).map((locale) => [
            locale,
            { direction: LOCALE_META[locale].direction, tag: LOCALE_META[locale].tag },
        ])));
        expect(readStoredSettings({ locale: 'faIR' }).direction).toBe('rtl');
        expect(readStoredSettings({ locale: 'frFR' }).direction).toBe('ltr');
        expect(readStoredSettings({ locale: 'arSA', direction: 'ltr' }).direction).toBe('ltr');
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
            locale: 'enUS',
            region: 'frFR',
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
        expect(getEffectiveWorkbenchRegion({ locale: 'enUS', region: 'auto' })).toBe('enUS');
        expect(getEffectiveWorkbenchRegion({ locale: 'enUS', region: 'frFR' })).toBe('frFR');
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
