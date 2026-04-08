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

import type { Dependency, Direction, Nullable } from '@univerjs/core';
import type { IAutoFillLocation } from '@univerjs/sheets';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { AUTO_FILL_APPLY_TYPE, AUTO_FILL_DATA_TYPE, AutoFillService, IAutoFillService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { FormulaAutoFillController } from '../formula-auto-fill.controller';

function createControllerTestBed() {
    const dependencies: Dependency[] = [
        [IAutoFillService, { useClass: AutoFillService }],
        [FormulaAutoFillController],
    ];

    return createFacadeTestBed(undefined, dependencies);
}

function createLocation(sourceRows: number[], targetRows: number[]): IAutoFillLocation {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        source: {
            rows: sourceRows,
            cols: [0],
        },
        target: {
            rows: targetRows,
            cols: [0],
        },
    };
}

describe('FormulaAutoFillController', () => {
    const directions: Array<{ direction: Direction; expected: { offsetX: number; offsetY: number } }> = [
        { direction: 0, expected: { offsetX: 0, offsetY: -3 } },
        { direction: 1, expected: { offsetX: 2, offsetY: 0 } },
        { direction: 2, expected: { offsetX: 0, offsetY: 3 } },
        { direction: 3, expected: { offsetX: -4, offsetY: 0 } },
    ];

    let testBed: ReturnType<typeof createControllerTestBed>;

    beforeEach(() => {
        testBed = createControllerTestBed();
        testBed.injector.get(FormulaAutoFillController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
    });

    it('should register a formula auto-fill rule and recognize formula cells', () => {
        const autoFillService = testBed.injector.get(IAutoFillService);
        const formulaRule = autoFillService.getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA);

        expect(formulaRule).toBeDefined();
        expect(formulaRule?.match({ f: '=SUM(A1)' }, testBed.injector as never)).toBe(true);
        expect(formulaRule?.match({ si: 'shared-id' }, testBed.injector as never)).toBe(true);
        expect(formulaRule?.match({ v: 1 }, testBed.injector as never)).toBe(false);

        expect(formulaRule?.isContinue({ type: AUTO_FILL_DATA_TYPE.FORMULA, cellData: { f: '=A1' } }, null)).toBe(true);
        expect(formulaRule?.isContinue({ type: AUTO_FILL_DATA_TYPE.NUMBER, cellData: { v: 1 } }, null)).toBe(false);
    });

    it('should offset copied formulas by direction and reuse the generated formula id', () => {
        const autoFillService = testBed.injector.get(IAutoFillService);
        const lexerTreeBuilder = testBed.injector.get(LexerTreeBuilder);
        const formulaRule = autoFillService.getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA);

        expect(formulaRule).toBeDefined();
        if (!formulaRule || !formulaRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.COPY]) {
            throw new Error('Formula auto-fill copy rule is not registered');
        }

        const applyCopy = formulaRule.applyFunctions[AUTO_FILL_APPLY_TYPE.COPY];

        const moveFormulaRefOffsetSpy = vi
            .spyOn(lexerTreeBuilder, 'moveFormulaRefOffset')
            .mockImplementation((formula, offsetX, offsetY) => `${formula}|${offsetX},${offsetY}`);

        directions.forEach(({ direction, expected }) => {
            const result = applyCopy(
                {
                    data: [{ f: '=SUM(A1)' }],
                    index: [0],
                },
                2,
                direction,
                {
                    formula: [{
                        data: [{ f: '=SUM(A1)' }, { f: '=SUM(B1)' }],
                        index: [0, 1],
                    }],
                },
                createLocation([5], direction === 0 ? [2] : direction === 2 ? [8] : [5])
            );

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                f: `=SUM(A1)|${expected.offsetX},${expected.offsetY}`,
                si: expect.any(String),
                v: null,
                p: null,
                t: null,
            });
            expect(result[1]).toMatchObject({
                si: result[0]?.si,
                f: null,
                v: null,
                p: null,
                t: null,
            });
        });

        expect(moveFormulaRefOffsetSpy.mock.calls).toEqual([
            ['=SUM(A1)', 0, -3],
            ['=SUM(A1)', 2, 0],
            ['=SUM(A1)', 0, 3],
            ['=SUM(A1)', -4, 0],
        ]);
    });

    it('should preserve shared formula ids and skip non-formula or null cells', () => {
        const autoFillService = testBed.injector.get(IAutoFillService);
        const formulaRule = autoFillService.getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA);

        expect(formulaRule).toBeDefined();
        if (!formulaRule || !formulaRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.COPY]) {
            throw new Error('Formula auto-fill copy rule is not registered');
        }

        const applyCopy = formulaRule.applyFunctions[AUTO_FILL_APPLY_TYPE.COPY];

        const result = applyCopy(
            {
                data: [{ si: 'shared-id' }, { v: 1 }, null] as Array<Nullable<{ si?: string; v?: number }>>,
                index: [0, 1, 2],
            },
            3,
            2,
            {
                formula: [{
                    data: [{ si: 'shared-id' }],
                    index: [0],
                }],
            },
            createLocation([0, 1, 2], [3, 4, 5])
        );

        expect(result).toEqual([
            {
                si: 'shared-id',
                f: null,
                v: null,
                p: null,
                t: null,
            },
        ]);
    });
});
