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
import { describe, expect, it } from 'vitest';
import { FontService, IFontService } from './font.service';

function createService(): IFontService {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IFontService, { useClass: FontService }]);
    return injector.get(IFontService);
}

describe('FontService', () => {
    it('maintains the font catalog used by font family pickers', () => {
        const service = createService();

        service.addFont({ value: 'Inter', label: 'Inter', category: 'sans-serif' });
        service.updateFont('Inter', { label: 'Inter UI' });

        expect(service.getFontByValue('Inter')).toMatchObject({ label: 'Inter UI' });
        expect(service.removeFont('Inter')).toBe(true);
        expect(service.getFontByValue('Inter')).toBeUndefined();
    });

    it('rejects duplicate font values to keep font selection stable', () => {
        const service = createService();
        const arial = service.getFontByValue('Arial')!;

        expect(() => service.addFont(arial)).toThrow('[FontService]: Font with value "Arial" already exists.');
    });
});
