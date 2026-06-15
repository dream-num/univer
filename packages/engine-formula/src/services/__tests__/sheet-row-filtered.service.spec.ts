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

import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ISheetRowFilteredService, SheetRowFilteredService } from '../sheet-row-filtered.service';

describe('SheetRowFilteredService', () => {
    let service: ISheetRowFilteredService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);
        service = injector.get(ISheetRowFilteredService);
    });

    it('delegates row visibility checks to the active filter feature', () => {
        service.register((unitId, subUnitId, row) => unitId === 'book-1' && subUnitId === 'sheet-1' && row === 3);

        expect(service.getRowFiltered('book-1', 'sheet-1', 3)).toBe(true);
        expect(service.getRowFiltered('book-1', 'sheet-1', 4)).toBe(false);
        expect(service.getRowFiltered('book-1', 'sheet-2', 3)).toBe(false);
    });
});
