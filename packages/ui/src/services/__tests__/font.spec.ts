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

import { IConfigService, Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FontService } from '../font.service';

describe('FontService', () => {
    let injector: Injector;
    let fontService: FontService;
    let configService: IConfigService;

    beforeEach(() => {
        injector = new Injector();
        configService = {
            getConfig: vi.fn(),
        } as unknown as IConfigService;

        injector.add([IConfigService, { useValue: configService }]);
        injector.add([FontService]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with default fonts when no config is provided', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        const fonts = fontService.getFonts();
        expect(fonts.length).toBe(13);
        expect(fonts.find((f) => f.value === 'Arial')).toBeDefined();
    });

    it('should initialize with custom fonts (array)', () => {
        const customFonts = [{ value: 'Custom', label: 'Custom Font' }];
        vi.mocked(configService.getConfig).mockReturnValue({
            customFontFamily: customFonts,
        });
        fontService = injector.get(FontService);
        const fonts = fontService.getFonts();
        expect(fonts).toHaveLength(14); // Default (13) + Custom (1)
        expect(fonts.find((f) => f.value === 'Custom')).toBeDefined();
    });

    it('should initialize with custom fonts (override)', () => {
        const customFonts = {
            override: true,
            list: [{ value: 'Custom', label: 'Custom Font' }],
        };
        vi.mocked(configService.getConfig).mockReturnValue({
            customFontFamily: customFonts,
        });
        fontService = injector.get(FontService);
        const fonts = fontService.getFonts();
        expect(fonts).toHaveLength(1);
        expect(fonts[0].value).toBe('Custom');
    });

    it('should initialize with custom fonts (append)', () => {
        const customFonts = {
            override: false,
            list: [{ value: 'Custom', label: 'Custom Font' }],
        };
        vi.mocked(configService.getConfig).mockReturnValue({
            customFontFamily: customFonts,
        });
        fontService = injector.get(FontService);
        const fonts = fontService.getFonts();
        expect(fonts).toHaveLength(14);
        expect(fonts.find((f) => f.value === 'Custom')).toBeDefined();
        expect(fonts.find((f) => f.value === 'Arial')).toBeDefined();
    });

    it('should add a font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        const newFont = { value: 'New', label: 'New Font' };
        fontService.addFont(newFont);
        expect(fontService.getFontByValue('New')).toEqual(newFont);
    });

    it('should throw error when adding existing font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        expect(() => fontService.addFont({ value: 'Arial', label: 'Arial' })).toThrow();
    });

    it('should update a font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        fontService.updateFont('Arial', { label: 'New Arial' });
        expect(fontService.getFontByValue('Arial')?.label).toBe('New Arial');
    });

    it('should throw error when updating non-existing font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        expect(() => fontService.updateFont('NotExist', { label: 'New' })).toThrow();
    });

    it('should remove a font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        expect(fontService.removeFont('Arial')).toBe(true);
        expect(fontService.getFontByValue('Arial')).toBeUndefined();
    });

    it('should return false when removing non-existing font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        expect(fontService.removeFont('NotExist')).toBe(false);
    });

    it('should reset to defaults', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        fontService.removeFont('Arial');
        fontService.resetToDefaults();
        expect(fontService.getFontByValue('Arial')).toBeDefined();
        expect(fontService.getFonts()).toHaveLength(13);
    });

    it('should reset and complete subject when disposed', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);
        fontService.addFont({ value: 'Disposable', label: 'Disposable Font' });

        expect(fontService.getFontByValue('Disposable')).toBeDefined();
        fontService.dispose();

        expect(fontService.getFontByValue('Disposable')).toBeUndefined();
        expect(fontService.getFonts()).toHaveLength(13);
        expect(fontService.fonts$.isStopped).toBe(true);
    });

    it('should return false when canvas context is unavailable', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);

        const canvas = {
            getContext: vi.fn(() => null),
        } as unknown as HTMLCanvasElement;
        vi.spyOn(document, 'createElement').mockReturnValue(canvas as never);

        expect(fontService.isFontSupported('Any Font')).toBe(false);
    });

    it('should return true when measured width changes for candidate font', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);

        const context = {
            font: '',
            measureText: vi.fn(() => ({
                width: context.font.includes('"Supported Font"') ? 120 : 100,
            })),
        } as unknown as CanvasRenderingContext2D;
        const canvas = {
            getContext: vi.fn(() => context),
        } as unknown as HTMLCanvasElement;
        vi.spyOn(document, 'createElement').mockReturnValue(canvas as never);

        expect(fontService.isFontSupported('Supported Font')).toBe(true);
    });

    it('should return false when candidate font keeps the same width', () => {
        vi.mocked(configService.getConfig).mockReturnValue(undefined);
        fontService = injector.get(FontService);

        const context = {
            font: '',
            measureText: vi.fn(() => ({
                width: 100,
            })),
        } as unknown as CanvasRenderingContext2D;
        const canvas = {
            getContext: vi.fn(() => context),
        } as unknown as HTMLCanvasElement;
        vi.spyOn(document, 'createElement').mockReturnValue(canvas as never);

        expect(fontService.isFontSupported('Unsupported Font')).toBe(false);
    });
});
