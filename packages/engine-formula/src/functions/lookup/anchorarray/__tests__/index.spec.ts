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

import type { ICellData } from '@univerjs/core';
import type { BaseReferenceObject } from '../../../../engine/reference-object/base-reference-object';
import { ObjectMatrix } from '@univerjs/core';
import { expect, it } from 'vitest';
import { CellReferenceObject } from '../../../../engine/reference-object/cell-reference-object';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { Anchorarray } from '../index';

it('keeps spill runtime values without applying a shared-reference offset twice', () => {
    const bed = createFunctionTestBed();
    const injector = bed.univer.__getInjector();
    try {
        const reference = injector.createInstance(CellReferenceObject, 'A1');
        reference.setDefaultUnitId(bed.unitId);
        reference.setDefaultSheetId(bed.sheetId);
        reference.setUnitData({ [bed.unitId]: bed.sheetData });
        reference.setRefOffset(0, 4);
        const values = injector.createInstance(ObjectMatrix<ICellData>, { 4: { 0: { v: 30 } }, 5: { 0: { v: 40 } }, 6: { 0: { v: 50 } } });
        reference.setRuntimeData({ [bed.unitId]: { [bed.sheetId]: injector.createInstance(ObjectMatrix<ICellData>, { 4: { 0: { v: 30 } } }) } });
        reference.setRuntimeArrayFormulaCellData({ [bed.unitId]: { [bed.sheetId]: values } });
        reference.setRuntimeArrayFormulaRange({ [bed.unitId]: { [bed.sheetId]: { 4: { 0: { startRow: 4, endRow: 6, startColumn: 0, endColumn: 0 } } } } });
        const executor = injector.createInstance(Anchorarray, 'ANCHORARRAY');
        executor.setRefInfo(bed.unitId, bed.sheetId, 0, 2);
        const result = executor.calculate(reference);
        expect(result.isReferenceObject()).toBe(true);
        const spill = result as BaseReferenceObject;
        expect(spill.getRangePosition()).toMatchObject({ startRow: 4, endRow: 6, startColumn: 0, endColumn: 0 });
        expect(spill.toArrayValueObject().toValue()).toEqual([[30], [40], [50]]);
        expect(reference.getRangePosition()).toMatchObject({ startRow: 4, endRow: 4 });
    } finally {
        bed.univer.dispose();
    }
});
