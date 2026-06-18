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

import { Injector, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShortcutExperienceService } from '../shortcut-experience.service';

describe('ShortcutExperienceService', () => {
    let service: ShortcutExperienceService;

    beforeEach(() => {
        const injector = new Injector();
        class TestUniverInstanceService {}

        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([LocaleService]);
        injector.add([ShortcutExperienceService]);
        service = injector.get(ShortcutExperienceService);
    });

    it('updates shortcut context for the same workbook, sheet and key combination', () => {
        const original = { unitId: 'book-1', sheetId: 'sheet-1', keycode: 13, selection: { startRow: 0 } };
        const next = { unitId: 'book-1', sheetId: 'sheet-1', keycode: 13, selection: { startRow: 1 } };

        expect(service.addOrUpdate(original as never)).toBeUndefined();
        expect(service.addOrUpdate(next as never)).toBe(original);
        expect(service.getCurrentBySearch({ unitId: 'book-1', sheetId: 'sheet-1', keycode: 13 as never })).toBe(next);
    });

    it('removes stale shortcut context after the optimized action is consumed', () => {
        const param = { unitId: 'book-1', sheetId: 'sheet-1', keycode: 9, selection: { startRow: 0 } };
        service.addOrUpdate(param as never);

        expect(service.remove({ unitId: 'book-1', sheetId: 'sheet-1', keycode: 9 as never })).toBe(param);
        expect(service.getCurrentBySearch({ unitId: 'book-1', sheetId: 'sheet-1', keycode: 9 as never })).toBeUndefined();
    });
});
