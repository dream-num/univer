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

import type { ICellData, ICommandInfo, IObjectMatrixPrimitiveType, Nullable, Workbook } from '@univerjs/core';
import type { ErrorType, ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { Disposable, ICommandService, Inject, IUniverInstanceService, ObjectMatrix, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { ERROR_TYPE_SET, handleNumfmtInCell, SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '../commands/mutations/set-range-values.mutation';

function isLegacyArrayFormulaOrigin(cell: Nullable<ICellData>): boolean {
    const xlsx = cell?.custom?._xlsx as { legacyArrayFormula?: boolean } | undefined;
    return xlsx?.legacyArrayFormula === true;
}

function isLegacyArrayFormulaCell(cell: Nullable<ICellData>, legacyArrayRefs: Set<string>): boolean {
    return isLegacyArrayFormulaOrigin(cell) || (typeof cell?.ref === 'string' && legacyArrayRefs.has(cell.ref));
}

function shouldKeepLegacyArrayCachedValue(oldCell: Nullable<ICellData>, calculatedValue: unknown, legacyArrayRefs: Set<string>): boolean {
    const cachedValue = oldCell?.v;
    return isLegacyArrayFormulaCell(oldCell, legacyArrayRefs) &&
        typeof calculatedValue === 'string' &&
        ERROR_TYPE_SET.has(calculatedValue as ErrorType) &&
        cachedValue != null &&
        !(typeof cachedValue === 'string' && ERROR_TYPE_SET.has(cachedValue as ErrorType));
}

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
                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                    if (!workbook) {
                        continue;
                    }
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

                        if (!workbook.getSheetBySheetId(sheetId)) {
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

                const result = sequenceExecute(
                    redoMutationsInfo,
                    this._commandService,
                    {
                        onlyLocal: true,
                        fromFormula: true,
                        applyFormulaCalculationResult: true,
                    }
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
     * @returns Cell data merged with number formats and compatible cached values.
     */
    private _getMergedCellData(unitId: string, sheetId: string, cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const styles = workbook?.getStyles();

        const worksheet = workbook?.getSheetBySheetId(sheetId);
        const oldCellDataMatrix = worksheet?.getCellMatrix();
        const cellDataMatrix = new ObjectMatrix(cellData);
        const legacyArrayRefs = new Set<string>();
        oldCellDataMatrix?.forValue((_row, _col, cell) => {
            if (isLegacyArrayFormulaOrigin(cell) && typeof cell?.ref === 'string') {
                legacyArrayRefs.add(cell.ref);
            }
        });

        cellDataMatrix.forValue((row, col, cell) => {
            const oldCell = oldCellDataMatrix?.getValue(row, col);
            if (cell == null && isLegacyArrayFormulaCell(oldCell, legacyArrayRefs)) {
                cellDataMatrix.setValue(row, col, oldCell);
                return;
            }
            const newCell = handleNumfmtInCell(oldCell, cell, styles);
            if (newCell && shouldKeepLegacyArrayCachedValue(oldCell, newCell.v, legacyArrayRefs)) {
                newCell.v = oldCell?.v;
                newCell.t = oldCell?.t;
            }
            cellDataMatrix.setValue(row, col, newCell);
        });

        return cellDataMatrix.getMatrix();
    }
}
