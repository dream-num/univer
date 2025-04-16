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

import type { ICellData, IMutationInfo, Nullable } from '@univerjs/core';
import type { IReorderRangeMutationParams } from '@univerjs/sheets';
import {
    Disposable,
    Inject,
    IUniverInstanceService,
    ObjectMatrix,
    Range,
    Tools,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import { ReorderRangeCommand, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';

export class FormulaReorderController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                if (command.id === ReorderRangeCommand.id) {
                    return this._reorderFormula(command.params as IReorderRangeMutationParams);
                }

                return {
                    redos: [],
                    undos: [],
                };
            },
        }));
    }

    private _reorderFormula(params: IReorderRangeMutationParams) {
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const { unitId, subUnitId, range, order } = params;
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);

        if (!worksheet) {
            return {
                redos,
                undos,
            };
        }

        const cellMatrix = worksheet.getCellMatrix();
        const redoFormulaMatrix = new ObjectMatrix<Nullable<ICellData>>();
        const undoFormulaMatrix = new ObjectMatrix<Nullable<ICellData>>();

        let hasFormula = false;

        Range.foreach(range, (row, col) => {
            let targetRow = row;

            if (order.hasOwnProperty(row)) {
                targetRow = order[row];
            }

            const targetCell = cellMatrix.getValue(targetRow, col);

            if (targetCell?.f || targetCell?.si) {
                hasFormula = true;

                const formulaString = this._formulaDataModel.getFormulaStringByCell(targetRow, col, subUnitId, unitId) as string;
                const shiftedFormula = this._lexerTreeBuilder.moveFormulaRefOffset(
                    formulaString,
                    0,
                    row - targetRow
                );
                const newCell = Tools.deepClone(targetCell);
                newCell.f = shiftedFormula;
                newCell.si = null;

                redoFormulaMatrix.setValue(row, col, newCell);
            } else {
                redoFormulaMatrix.setValue(row, col, targetCell);
            }

            undoFormulaMatrix.setValue(row, col, cellMatrix.getValue(row, col));
        });

        if (!hasFormula) {
            return {
                redos,
                undos,
            };
        }

        redos.push({
            id: SetRangeValuesMutation.id,
            params: {
                unitId,
                subUnitId,
                cellValue: redoFormulaMatrix.getMatrix(),
            },
        });

        undos.push({
            id: SetRangeValuesMutation.id,
            params: {
                unitId,
                subUnitId,
                cellValue: undoFormulaMatrix.getMatrix(),
            },
        });

        return {
            redos,
            undos,
        };
    }
}
