/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConfigService, IConfigService, Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IUniverUIConfig } from '../../config/config';
import { UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { FontCategory, FontService, IFontService } from '../font.service';

class CustomFontConfigService extends ConfigService {
    override getConfig<T>(key: string): T {
        if (key === UI_PLUGIN_CONFIG_KEY) {
            return {
                customFontFamily: {
                    override: true,
                    list: [{ value: 'OnlyCustom', label: 'Only Custom', category: FontCategory.DISPLAY }],
                },
            } as IUniverUIConfig as T;
        }

        return super.getConfig<T>(key);
    }
}

const injectors: Injector[] = [];

function createService(configService: typeof ConfigService = ConfigService): IFontService {
    const injector = new Injector();
    injectors.push(injector);
    injector.add([IConfigService, { useClass: configService }]);
    injector.add([IFontService, { useClass: FontService }]);
    return injector.get(IFontService);
}

describe('FontService', () => {
    afterEach(() => {
        injectors.splice(0).forEach((injector) => injector.dispose());
        vi.unstubAllGlobals();
    });

    it('maintains the font catalog used by font family pickers', () => {
        const service = createService();

        service.addFont({ value: 'Inter', label: 'Inter', category: FontCategory.SANS_SERIF });
        service.updateFont('Inter', { label: 'Inter UI' });

        expect(service.getFontByValue('Inter')).toMatchObject({ label: 'Inter UI' });
        expect(service.removeFont('Inter')).toBe(true);
        expect(service.getFontByValue('Inter')).toBeUndefined();
    });

    it('exposes monospaced catalog fonts and custom fonts through the same category', () => {
        const service = createService();
        service.addFont({ value: 'Custom Mono', label: 'Custom Mono', category: FontCategory.MONOSPACE });
        const fonts = service.getFonts().filter((font) => font.category === FontCategory.MONOSPACE);

        expect(fonts.map((font) => font.value)).toEqual([
            'Courier New',
            'Courier',
            'BIZ UDGothic',
            'BIZ UDMincho',
            'Andale Mono',
            'Menlo',
            'Monaco',
            'PCMyungjo',
            'PT Mono',
            'Custom Mono',
        ]);
        expect(service.getFontByValue('Arial')?.category).not.toBe(FontCategory.MONOSPACE);
        service.resetToDefaults();
        expect(service.getFontByValue('Custom Mono')).toBeUndefined();
        expect(service.getFontByValue('Menlo')?.category).toBe(FontCategory.MONOSPACE);
    });

    it('classifies every built-in font so consumers can filter the shared catalog', () => {
        const service = createService();
        expect(service.getFonts().every((font) => font.category != null)).toBe(true);
        expect(service.getFontByValue('宋体')?.category).toBe(FontCategory.SERIF);
        expect(service.getFontByValue('Arial')?.category).toBe(FontCategory.SANS_SERIF);
        expect(service.getFontByValue('楷体-简')?.category).toBe(FontCategory.HANDWRITING);
        expect(service.getFontByValue('Bauhaus 93')?.category).toBe(FontCategory.DISPLAY);
        expect(service.getFontByValue('Courier New')?.category).toBe(FontCategory.MONOSPACE);

        service.updateFont('Arial', { category: FontCategory.DISPLAY });
        expect(service.fonts$.getValue().filter((font) => font.category === FontCategory.DISPLAY).map((font) => font.value)).toContain('Arial');
        service.resetToDefaults();
        expect(service.getFontByValue('Arial')?.category).toBe(FontCategory.SANS_SERIF);
    });

    it('rejects duplicate font values to keep font selection stable', () => {
        const service = createService();
        const arial = service.getFontByValue('Arial')!;

        expect(() => service.addFont(arial)).toThrow('[FontService]: Font with value "Arial" already exists.');
    });

    it('loads override font configuration and rejects updates to missing fonts', () => {
        const service = createService(CustomFontConfigService);

        expect(service.getFonts()).toEqual([{ value: 'OnlyCustom', label: 'Only Custom', category: FontCategory.DISPLAY }]);
        expect(() => service.updateFont('Arial', { label: 'Missing' })).toThrow('Font with value "Arial" not found.');
        expect(service.removeFont('Arial')).toBe(false);
    });

    it('checks font support by comparing measured text widths', () => {
        const measured: string[] = [];
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    measureText() {
                        measured.push(this.font);
                        return { width: this.font.includes('"CustomFont"') ? 120 : 100 };
                    },
                }),
            }),
        });
        const service = createService();

        expect(service.isFontSupported('CustomFont')).toBe(true);
        expect(measured).toContain('72px "CustomFont", monospace');
    });

    it('returns false when the canvas context is unavailable', () => {
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => null,
            }),
        });
        const service = createService();

        expect(service.isFontSupported('MissingFont')).toBe(false);
    });
});
