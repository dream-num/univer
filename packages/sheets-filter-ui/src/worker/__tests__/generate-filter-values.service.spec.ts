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

import { LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import { SheetsGenerateFilterValuesService } from '../generate-filter-values.service';

describe('SheetsGenerateFilterValuesService', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        const injector = univer.__getInjector();
        injector.get(LocaleService).setDirection('ltr');
        injector.add([SheetsGenerateFilterValuesService]);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('returns no filter value tree when the workbook or worksheet is unavailable', async () => {
        const service = univer.__getInjector().get(SheetsGenerateFilterValuesService);

        await expect(service.getFilterValues({
            unitId: 'missing-book',
            subUnitId: 'sheet-1',
            filteredOutRowsByOtherColumns: [],
            filterColumn: null,
            filters: false,
            blankChecked: true,
            iterateRange: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 0 },
            alreadyChecked: [],
        })).resolves.toEqual([]);
    });

    it('counts matching values while excluding rows filtered by another column', async () => {
        const service = univer.__getInjector().get(SheetsGenerateFilterValuesService);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'workbook',
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sales',
                    rowCount: 4,
                    columnCount: 1,
                    cellData: {
                        1: { 0: { v: 'A' } },
                        2: { 0: { v: 'B' } },
                        3: { 0: { v: 'A' } },
                    },
                },
            },
        });

        const result = await service.getFilterValues({
            unitId: 'workbook',
            subUnitId: 'sheet',
            filteredOutRowsByOtherColumns: [2],
            filterColumn: null,
            filters: false,
            blankChecked: true,
            iterateRange: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 0 },
            alreadyChecked: [],
        });

        expect(result).toMatchObject({ filterTreeItems: [{ title: 'A', count: 2 }] });
    });
});
