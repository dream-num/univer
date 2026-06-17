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

import { Injector, ThemeService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { CanvasColorService, DumbCanvasColorService, ICanvasColorService } from '../canvas-color.service';

describe('CanvasColorService', () => {
    it('keeps render colors unchanged in light mode', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);

        expect(injector.get(ICanvasColorService).getRenderColor('#17212b')).toBe('#17212b');
    });

    it('maps render colors for dark mode rendering', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.get(ThemeService).setDarkMode(true);

        expect(injector.get(ICanvasColorService).getRenderColor('#17212b')).toBe('#e2e8f0');
        expect(injector.get(ICanvasColorService).getRenderColor('rgba(37, 99, 235, 0.08)')).toBe('rgba(96,165,250,0.22)');
    });

    it('provides a dumb color service for render contexts that should not transform colors', () => {
        const injector = new Injector();
        injector.add([ICanvasColorService, { useClass: DumbCanvasColorService }]);

        expect(injector.get(ICanvasColorService).getRenderColor('primary.600')).toBe('primary.600');
    });
});
