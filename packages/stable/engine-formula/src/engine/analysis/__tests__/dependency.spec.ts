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

import type { Injector } from '@univerjs/core';

import type { FormulaDependencyTreeVirtual } from '../../dependency/dependency-tree';
import { beforeEach, describe, expect, it } from 'vitest';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IOtherFormulaManagerService } from '../../../services/other-formula-manager.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { FormulaDependencyTree } from '../../dependency/dependency-tree';
import { IFormulaDependencyGenerator } from '../../dependency/formula-dependency';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test dependency', () => {
    let get: Injector['get'];
    let formulaDependencyGenerator: IFormulaDependencyGenerator;
    let formulaCurrentConfigService: IFormulaCurrentConfigService;
    let otherFormulaManagerService: IOtherFormulaManagerService;
    let testUnitId = 'test';
    let testSheetId = 'sheet1';
    let testSheetData = {};
    beforeEach(() => {
        const testBed = createCommandTestBed();

        get = testBed.get;

        formulaDependencyGenerator = get(IFormulaDependencyGenerator);

        formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        otherFormulaManagerService = get(IOtherFormulaManagerService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

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
            const testOtherFormulaId = 'sheet.cf_workbook-01_Q2oij1uNg7HLUT7aT2ikk_yhq9VWH_';
            const testOtherFormulaId2 = 'sheet.cf_workbook-01_Q2oij1uNg7HLUT7aT2ikk_idjs46G_';
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
                dirtyUnitOtherFormulaMap: {
                    [testUnitId]: {
                        [testSheetId]: {
                            [testOtherFormulaId]: true,
                            [testOtherFormulaId2]: true,
                        },
                    },
                },
                excludedCell: {},
                allUnitData: {
                    [testUnitId]: testSheetData,
                },
            });

            otherFormulaManagerService.batchRegister({
                [testUnitId]: {
                    [testSheetId]: {
                        [testOtherFormulaId]: {
                            f: '=A1>1',
                            ranges: [
                                {
                                    startRow: 0,
                                    startColumn: 0,
                                    endRow: 2,
                                    endColumn: 0,
                                    startAbsoluteRefType: 0,
                                    endAbsoluteRefType: 0,
                                    rangeType: 0,
                                },
                            ],
                        },
                        [testOtherFormulaId2]: {
                            f: '=A1>1',
                            ranges: [
                                {
                                    startRow: 0,
                                    startColumn: 0,
                                    endRow: 0,
                                    endColumn: 0,
                                },
                            ],
                        },
                    },
                },
            });

            const treeList = await formulaDependencyGenerator.generate();
            const treeJson = treeList.map((tree) => tree instanceof FormulaDependencyTree ? tree.formula : tree.refTree?.formula).reverse();

            expect(treeJson).toEqual(
                [
                    '=A1:C4',
                    '=SUM(E10:G13)',
                    '=SUM(E10:I17)',
                    '=E10:I23',
                    '=SUM(F27:J34)',
                    '=A1>1',
                    '=A1>1',
                    '=A1>1',
                    '=A1>1',
                ]
            );

            // Check the offset position of other formula
            // Note that the order is reversed
            const tree = treeList[2] as FormulaDependencyTreeVirtual;
            expect(tree.refOffsetX).toEqual(0);
            expect(tree.refOffsetY).toEqual(1);

            const tree2 = treeList[1] as FormulaDependencyTreeVirtual;
            expect(tree2.refOffsetX).toEqual(0);
            expect(tree2.refOffsetY).toEqual(2);
        });
    });
});
