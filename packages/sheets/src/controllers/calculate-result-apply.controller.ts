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

import type { ICellData, ICommandInfo, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { Disposable, ICommandService, Inject, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { handleNumfmtInCell, SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';

import { SetRangeValuesMutation } from '../commands/mutations/set-range-values.mutation';

export class CalculateResultApplyController extends Disposable {
    constructor(
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetFormulaCalculationResultMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaCalculationResultMutation;

                const { unitData } = params;

                const unitIds = Object.keys(unitData);

                // Update each calculated value, possibly involving all cells
                const redoMutationsInfo: ICommandInfo[] = [];

                for (let i = 0; i < unitIds.length; i++) {
                    const unitId = unitIds[i];
                    const sheetData = unitData[unitId];

                    if (sheetData == null) {
                        continue;
                    }

                    const sheetIds = Object.keys(sheetData);

                    for (let j = 0; j < sheetIds.length; j++) {
                        const sheetId = sheetIds[j];
                        const cellData = sheetData[sheetId];

                        if (cellData == null) {
                            continue;
                        }

                        const cellValue = this._getMergedCellData(unitId, sheetId, cellData);

                        const setRangeValuesMutation = {
                            subUnitId: sheetId,
                            unitId,
                            cellValue,
                        };

                        redoMutationsInfo.push({
                            id: SetRangeValuesMutation.id,
                            params: setRangeValuesMutation,
                        });
                    }
                }

                const result = redoMutationsInfo.every((m) =>
                    this._commandService.executeCommand(m.id, m.params, {
                        onlyLocal: true,
                    })
                );
                return result;
            })
        );
    }

    /**
     * Priority that mainly deals with number format in unitData
     * @param unitId
     * @param sheetId
     * @param cellData
     * @returns
     */
    private _getMergedCellData(unitId: string, sheetId: string, cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const styles = workbook?.getStyles();

        const worksheet = workbook?.getSheetBySheetId(sheetId);
        const oldCellDataMatrix = worksheet?.getCellMatrix();
        const cellDataMatrix = new ObjectMatrix(cellData);

        cellDataMatrix.forValue((row, col, cell) => {
            const oldCell = oldCellDataMatrix?.getValue(row, col);
            const newCell = handleNumfmtInCell(oldCell, cell, styles);
            cellDataMatrix.setValue(row, col, newCell);
        });

        return cellDataMatrix.getMatrix();
    }
}
