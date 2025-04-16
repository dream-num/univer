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

import type { ICellData, Injector, Nullable, Univer } from '@univerjs/core';
import type { ICellDataWithSpanInfo } from '@univerjs/sheets-ui';
import { ICommandService, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import { type ISetRangeValuesMutationParams, SetRangeValuesMutation } from '@univerjs/sheets';
import { COPY_TYPE, ISheetSelectionRenderService, PREDEFINED_HOOK_NAME, SheetSelectionRenderService } from '@univerjs/sheets-ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getSetCellFormulaMutations } from '../formula-clipboard.controller';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test paste with formula', () => {
    let univer: Univer;
    let get: Injector['get'];
    let has: Injector['has'];
    let commandService: ICommandService;
    let lexerTreeBuilder: LexerTreeBuilder;
    let formulaDataModel: FormulaDataModel;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        has = testBed.has;
        commandService = get(ICommandService);
        lexerTreeBuilder = get(LexerTreeBuilder);
        formulaDataModel = get(FormulaDataModel);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('correct situations', () => {
        it('Copy two cells, one of which is the formula', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const range = {
                rows: [12],
                cols: [2, 3],
            };
            const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
                0: {
                    0: {
                        v: 3,
                    },
                    1: {
                        v: 2,
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                    },
                },
            });

            const accessor = {
                get,
                has,
            };

            const copyInfo = {
                copyRange: {
                    rows: [0],
                    cols: [2, 3],
                },
                copyType: COPY_TYPE.COPY,
                pasteType: PREDEFINED_HOOK_NAME.DEFAULT_PASTE,
            };

            const pasteFrom = {
                unitId,
                subUnitId,
                range: {
                    rows: [0],
                    cols: [2, 3],
                },
            };

            const result = {
                undos: [
                    {
                        id: SetRangeValuesMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                12: {
                                    3: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                            },
                            options: {},
                        },
                    },
                ],
                redos: [
                    {
                        id: SetRangeValuesMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                12: {
                                    3: {
                                        f: null,
                                        si: '3e4r5t',
                                        v: null,
                                        p: null,
                                    },
                                },
                            },
                        },
                    },
                ],
            };

            const redoUndoList = getSetCellFormulaMutations(
                unitId,
                subUnitId,
                range,
                matrix,
                accessor,
                copyInfo,
                lexerTreeBuilder,
                formulaDataModel,
                false,
                pasteFrom
            );

            expect(redoUndoList).toStrictEqual(result);
        });

        it('Copy range with formulas', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const range = {
                rows: [5, 6, 7, 8],
                cols: [5, 6, 7, 8],
            };
            const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
                0: {
                    0: {
                        p: null,
                        v: 1,
                        s: null,
                        f: '=SUM(A1)',
                        si: null,
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 2,
                        s: null,
                        f: '=SUM(B1)',
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 3,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
                1: {
                    0: {
                        p: null,
                        v: 2,
                        s: null,
                        f: '=SUM(A2)',
                        si: 'jcozeE',
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 3,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
                2: {
                    0: {
                        p: null,
                        v: 3,
                        s: null,
                        f: null,
                        si: 'jcozeE',
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 6,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
                3: {
                    0: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'jcozeE',
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 6,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 7,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
            });

            const accessor = {
                get,
                has,
            };

            const copyInfo = {
                copyType: COPY_TYPE.COPY,
                copyRange: {
                    rows: [0, 1, 2, 3],
                    cols: [5, 6, 7, 8],
                },
                pasteType: PREDEFINED_HOOK_NAME.DEFAULT_PASTE,
            };

            const pasteFrom = {
                unitId,
                subUnitId,
                range: {
                    rows: [0, 1, 2, 3],
                    cols: [5, 6, 7, 8],
                },
            };

            const result = {
                undos: [
                    {
                        id: 'sheet.mutation.set-range-values',
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                5: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                                6: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                                7: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                                8: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                            },
                            options: {},
                        },
                    },
                ],
                redos: [
                    {
                        id: 'sheet.mutation.set-range-values',
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                5: {
                                    5: {
                                        si: 'bBSIMi',
                                        f: '=SUM(A6)',
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                                6: {
                                    5: {
                                        si: 'jcozeE',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                                7: {
                                    5: {
                                        si: 'jcozeE',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                                8: {
                                    5: {
                                        si: 'jcozeE',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                            },
                        },
                    },
                ],
            };

            const redoUndoList = getSetCellFormulaMutations(
                unitId,
                subUnitId,
                range,
                matrix,
                accessor,
                copyInfo,
                lexerTreeBuilder,
                formulaDataModel,
                false,
                pasteFrom
            );

            // Randomly generated id, no comparison is made
            const resultFormulaId = result.redos[0].params.cellValue['5'][5].si;
            const originRedoParams = redoUndoList.redos[0].params as ISetRangeValuesMutationParams;

            if (!originRedoParams.cellValue || !originRedoParams.cellValue['5'] || !originRedoParams.cellValue['5'][5]) {
                throw new Error('cellValue is undefined');
            }

            originRedoParams.cellValue['5'][5].si = resultFormulaId;

            expect(redoUndoList).toStrictEqual(result);
        });
    });
});
