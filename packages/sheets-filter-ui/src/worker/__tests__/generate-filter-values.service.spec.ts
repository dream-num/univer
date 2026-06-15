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

import { DesktopLogService, ILogService, Injector, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { SheetsGenerateFilterValuesService } from '../generate-filter-values.service';

describe('SheetsGenerateFilterValuesService', () => {
    let service: SheetsGenerateFilterValuesService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([LocaleService]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IUniverInstanceService, { useValue: { getUnit: () => null } as unknown as IUniverInstanceService }]);
        injector.add([SheetsGenerateFilterValuesService]);
        service = injector.get(SheetsGenerateFilterValuesService);
    });

    it('returns no filter value tree when the workbook or worksheet is unavailable', async () => {
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
});
