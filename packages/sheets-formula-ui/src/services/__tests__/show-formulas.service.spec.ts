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

import type { IUniverInstanceService } from '@univerjs/core';
import type { IShowFormulasChange } from '../show-formulas.service';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetsShowFormulasService } from '../show-formulas.service';

function createService() {
    const unitDisposed$ = new Subject<{ getUnitId: () => string }>();
    const univerInstanceService = {
        getTypeOfUnitDisposed$: () => unitDisposed$.asObservable(),
    } as unknown as IUniverInstanceService;
    const service = new SheetsShowFormulasService(univerInstanceService);
    const changes: IShowFormulasChange[] = [];
    service.changed$.subscribe((change) => changes.push(change));

    return { service, changes, unitDisposed$ };
}

describe('SheetsShowFormulasService', () => {
    it('is disabled by default and tracks state per worksheet', () => {
        const { service, changes } = createService();

        expect(service.isEnabled('unit', 'sheet1')).toBe(false);

        expect(service.setEnabled('unit', 'sheet1', true)).toBe(true);
        expect(service.isEnabled('unit', 'sheet1')).toBe(true);
        expect(service.isEnabled('unit', 'sheet2')).toBe(false);
        expect(service.isEnabled('other-unit', 'sheet1')).toBe(false);
        expect(changes).toEqual([{ unitId: 'unit', subUnitId: 'sheet1', enabled: true }]);

        service.dispose();
    });

    it('does not emit when the requested state is already applied', () => {
        const { service, changes } = createService();

        expect(service.setEnabled('unit', 'sheet1', false)).toBe(false);
        service.setEnabled('unit', 'sheet1', true);
        expect(service.setEnabled('unit', 'sheet1', true)).toBe(false);
        expect(changes).toHaveLength(1);

        service.dispose();
    });

    it('toggles and reports the new state', () => {
        const { service, changes } = createService();

        expect(service.toggle('unit', 'sheet1')).toBe(true);
        expect(service.toggle('unit', 'sheet1')).toBe(false);
        expect(service.isEnabled('unit', 'sheet1')).toBe(false);
        expect(changes.map((change) => change.enabled)).toEqual([true, false]);

        service.dispose();
    });

    it('forgets worksheets of a disposed workbook', () => {
        const { service, unitDisposed$ } = createService();

        service.setEnabled('unit', 'sheet1', true);
        unitDisposed$.next({ getUnitId: () => 'unit' });

        expect(service.isEnabled('unit', 'sheet1')).toBe(false);

        service.dispose();
    });
});
