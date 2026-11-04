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

import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { createCommandTestBed } from '../../../../engine/analysis/__tests__/create-command-test-bed';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { CubeValueObject } from '../../../../engine/value-object/cube-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ICalculateFormulaService } from '../../../../services/calculate-formula.service';
import { IFunctionService } from '../../../../services/function.service';
import { Sumproduct } from '../../../math/sumproduct';
import { Countif } from '../../../statistical/countif';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_META } from '../../function-names';
import { Cube } from '../index';

describe('Cube function', () => {
    it.each([
        ['=SUMPRODUCT((A1:A2,B1:B2))', ErrorType.VALUE],
        ['=COUNTIF((A1:A2,B1:B2),">0")', ErrorType.VALUE],
    ] as const)('preserves value semantics for %s while retaining reference areas', async (formula, expected) => {
        const bed = createCommandTestBed();
        try {
            bed.get(IFunctionService).registerExecutors(
                new Cube('CUBE'),
                new Sumproduct('SUMPRODUCT'),
                new Countif('COUNTIF')
            );
            const service = bed.get(ICalculateFormulaService);
            let actual: unknown;
            service.executionCompleteListener$.subscribe((data) => {
                actual = data.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 5)?.v;
            });
            await service.execute({
                formulaData: { [bed.unitId]: { [bed.sheetId]: { 0: { 5: { f: formula } } } } },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: true,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtySuperTableMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                clearDependencyTreeCache: {},
                excludedCell: {},
                allUnitData: { [bed.unitId]: bed.sheetData },
            });
            expect(actual).toBe(expected);
        } finally {
            bed.univer.dispose();
        }
    });
    const testFunction = new Cube(FUNCTION_NAMES_META.CUBE);

    it('combines multiple array references into a cube value object', () => {
        const first = ArrayValueObject.create('{1,2;3,4}');
        const second = ArrayValueObject.create('{5;6}');

        const result = testFunction.calculate(first, second);

        expect(result.isCube()).toBe(true);
        expect(result).toBeInstanceOf(CubeValueObject);
        expect((result as CubeValueObject).getCubeCount()).toBe(2);
        expect((result as CubeValueObject).getCubeValues()).toEqual([first, second]);
    });

    it('propagates input errors before validating array arguments', () => {
        const result = testFunction.calculate(ErrorValueObject.create(ErrorType.NAME), NumberValueObject.create(1));

        expect(getObjectValue(result)).toBe(ErrorType.NAME);
    });

    it('rejects scalar values because cube aggregation requires array inputs', () => {
        const result = testFunction.calculate(ArrayValueObject.create('{1,2}'), NumberValueObject.create(1));

        expect(getObjectValue(result)).toBe(ErrorType.VALUE);
    });
});
