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

import type { IWorkbookData, Worksheet } from '@univerjs/core';
import type { FFormula } from '@univerjs/engine-formula/facade';
import { ICommandService, LocaleType } from '@univerjs/core';
import {
    ErrorType,
    FormulaDataModel,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '@univerjs/engine-formula';
import { beforeEach, describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { createFunctionTestBed } from './create-function-test-bed';

import '@univerjs/engine-formula/facade';

const unitId = 'test';
const subUnitId = 'sheet1';

function createWorkbookData(): IWorkbookData {
    const sourceCellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {};

    for (let row = 2; row <= 9; row++) {
        sourceCellData[row] = {};
        for (let column = 2; column <= 6; column++) {
            sourceCellData[row]![column] = {
                v: row + column,
                t: 2,
            };
        }
    }

    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: [subUnitId],
        styles: {},
        sheets: {
            [subUnitId]: {
                id: subUnitId,
                name: 'Sheet1',
                rowCount: 30,
                columnCount: 20,
                cellData: {
                    ...sourceCellData,
                    12: {
                        6: {
                            f: '=C3:G10',
                        },
                    },
                },
            },
        },
    };
}

describe('Array formula SPILL with real formula calculation', () => {
    let commandService: ICommandService;
    let formulaEngine: FFormula;
    let formulaDataModel: FormulaDataModel;
    let worksheet: Worksheet;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(createWorkbookData());
        commandService = testBed.get(ICommandService);
        formulaEngine = testBed.api.getFormula() as FFormula;
        formulaDataModel = testBed.get(FormulaDataModel);
        worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;

        commandService.registerCommand(SetFormulaCalculationStartMutation);
        commandService.registerCommand(SetFormulaCalculationStopMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetFormulaCalculationNotificationMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);
        commandService.registerCommand(SetRangeValuesMutation);

        await calculate();
    });

    async function calculate() {
        commandService.syncExecuteCommand(SetFormulaCalculationStartMutation.id, { forceCalculation: true }, { onlyLocal: true });
        await formulaEngine.onCalculationEnd();
    }

    async function setCell(row: number, column: number, value: number) {
        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId,
            subUnitId,
            cellValue: {
                [row]: {
                    [column]: {
                        v: value,
                        t: 2,
                    },
                },
            },
        });
    }

    it('should preserve multiple real blockers inside a spilled array reference formula', async () => {
        expect(formulaDataModel.getArrayFormulaRange()[unitId]?.[subUnitId]?.[12]?.[6]).toEqual({
            startRow: 12,
            startColumn: 6,
            endRow: 19,
            endColumn: 10,
        });

        await setCell(14, 9, 333);
        await calculate();

        expect(worksheet.getCellRaw(12, 6)?.v).toBe(ErrorType.SPILL);
        expect(worksheet.getCellRaw(14, 9)?.v).toBe(333);
        expect(formulaDataModel.getArrayFormulaCellData()[unitId]?.[subUnitId]?.[14]?.[9]).toBeUndefined();

        await setCell(15, 9, 444);
        await calculate();

        expect(worksheet.getCellRaw(12, 6)?.v).toBe(ErrorType.SPILL);
        expect(worksheet.getCellRaw(14, 9)?.v).toBe(333);
        expect(worksheet.getCellRaw(15, 9)?.v).toBe(444);
        expect(formulaDataModel.getArrayFormulaCellData()[unitId]?.[subUnitId]?.[14]?.[9]).toBeUndefined();
        expect(formulaDataModel.getArrayFormulaCellData()[unitId]?.[subUnitId]?.[15]?.[9]).toBeUndefined();
    });
});
