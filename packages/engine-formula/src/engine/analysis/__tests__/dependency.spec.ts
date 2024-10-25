/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Injector } from '@univerjs/core';

import { beforeEach, describe, expect, it } from 'vitest';
import { FormulaCurrentConfigService } from '../../../services/current-data.service';
import { FormulaRuntimeService } from '../../../services/runtime.service';
import { FormulaDependencyGenerator } from '../../dependency/formula-dependency';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test indirect', () => {
    let get: Injector['get'];
    let formulaDependencyGenerator: FormulaDependencyGenerator;
    let formulaCurrentConfigService: FormulaCurrentConfigService;
    let testUnitId = 'test';
    let testSheetId = 'sheet1';
    let testSheetData = {};
    beforeEach(() => {
        const testBed = createCommandTestBed();

        get = testBed.get;

        formulaDependencyGenerator = get(FormulaDependencyGenerator);

        formulaCurrentConfigService = get(FormulaCurrentConfigService);

        const formulaRuntimeService = get(FormulaRuntimeService);

        const sheetItem = testBed.sheetData[testBed.sheetId];

        testUnitId = testBed.unitId;
        testSheetId = testBed.sheetId;
        testSheetData = testBed.sheetData;

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );
    });

    describe('dependency normal', () => {
        it('test formula dependency simple ref', async () => {
            formulaCurrentConfigService.load({
                formulaData: {
                    [testUnitId]: {
                        [testSheetId]: {
                            3: {
                                12: {
                                    f: '=SUM(F27:J34)',
                                },
                            },
                            9: {
                                4: {
                                    f: '=A1:C4',
                                },
                            },
                            16: {
                                8: {
                                    f: '=SUM(E10:G13)',
                                },
                            },
                            22: {
                                6: {
                                    f: '=SUM(E10:I17)',
                                },
                            },
                            26: {
                                5: {
                                    f: '=E10:I23',
                                },
                            },
                        },
                    },
                },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: false,
                dirtyRanges: [
                    {
                        range: {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 0,
                            endColumn: 0,
                        },
                        unitId: testUnitId,
                        sheetId: testSheetId,
                    },
                ],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });

            const treeList = await formulaDependencyGenerator.generate();
            const treeJson = treeList.map((tree) => tree.toJson().formula);
            expect(treeJson).toEqual(
                [
                    '=A1:C4',
                    '=SUM(E10:G13)',
                    '=SUM(E10:I17)',
                    '=E10:I23',
                    '=SUM(F27:J34)',
                ]
            );
        });
    });
});
