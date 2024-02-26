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

import type { ICellData, IMutationInfo, IRange } from '@univerjs/core';
import {
    Disposable,
    isFormulaString,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import type { ICellDataWithSpanInfo, ISheetClipboardHook } from '@univerjs/sheets-ui';
import { COPY_TYPE, ISheetClipboardService } from '@univerjs/sheets-ui';
import type { IAccessor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { SPECIAL_PASTE_FORMULA } from '../commands/commands/formula-clipboard.command';

export const DEFAULT_PASTE_FORMULA = 'default-paste-formula';

@OnLifecycle(LifecycleStages.Ready, FormulaClipboardController)
export class FormulaClipboardController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverSheet: IUniverInstanceService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerClipboardHook();
    }

    private _registerClipboardHook() {
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._pasteFormulaHook()));
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._pasteWithFormulaHook()));
    }

    private _pasteFormulaHook(): ISheetClipboardHook {
        const specialPasteFormulaHook: ISheetClipboardHook = {
            id: SPECIAL_PASTE_FORMULA,
            priority: 10,
            specialPasteInfo: {
                label: 'specialPaste.formula',
            },
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                const copyInfo = {
                    copyType: payload.copyType || COPY_TYPE.COPY,
                    copyRange: pasteFrom?.range,
                };
                const pastedRange = pasteTo.range;
                const matrix = data;
                const workbook = this._currentUniverSheet.getCurrentUniverSheetInstance();
                const unitId = workbook.getUnitId();
                const subUnitId = workbook.getActiveSheet().getSheetId();

                return this._injector.invoke((accessor) =>
                    getSetCellFormulaMutations(
                        unitId,
                        subUnitId,
                        pastedRange,
                        matrix,
                        accessor,
                        copyInfo,
                        this._lexerTreeBuilder,
                        true
                    )
                );
            },
        };

        return specialPasteFormulaHook;
    }

    private _pasteWithFormulaHook(): ISheetClipboardHook {
        const specialPasteFormulaHook: ISheetClipboardHook = {
            id: DEFAULT_PASTE_FORMULA,
            priority: 10,
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                const copyInfo = {
                    copyType: payload.copyType || COPY_TYPE.COPY,
                    copyRange: pasteFrom?.range,
                };
                const pastedRange = pasteTo.range;
                const matrix = data;
                const workbook = this._currentUniverSheet.getCurrentUniverSheetInstance();
                const unitId = workbook.getUnitId();
                const subUnitId = workbook.getActiveSheet().getSheetId();

                return this._injector.invoke((accessor) =>
                    getSetCellFormulaMutations(
                        unitId,
                        subUnitId,
                        pastedRange,
                        matrix,
                        accessor,
                        copyInfo,
                        this._lexerTreeBuilder
                    )
                );
            },
        };

        return specialPasteFormulaHook;
    }
}

export function getSetCellFormulaMutations(
    unitId: string,
    subUnitId: string,
    range: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor,
    copyInfo: {
        copyType: COPY_TYPE;
        copyRange?: IRange;
    },
    lexerTreeBuilder: LexerTreeBuilder,
    isSpecialPaste = false
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { startColumn, startRow } = range;

    const valueMatrix = new ObjectMatrix<ICellData>();
    const formulaIdMap = new Map<string, string>();

    let copyRowLength = 0;
    let copyColumnLength = 0;

    let copyRangeStartRow = 0;
    let copyRangeStartColumn = 0;

    if (copyInfo) {
        const { copyType, copyRange } = copyInfo;
        if (copyType === COPY_TYPE.COPY && copyRange) {
            copyRangeStartRow = copyRange.startRow;
            copyRangeStartColumn = copyRange.startColumn;
            copyRowLength = copyRange.endRow - copyRangeStartRow + 1;
            copyColumnLength = copyRange.endColumn - copyRangeStartColumn + 1;
        }
    }

    matrix.forValue((row, col, value) => {
        const originalFormula = value.f || '';
        const valueObject: ICellDataWithSpanInfo = {};

        // Paste the formula only, you also need to process some regular values
        if (isSpecialPaste) {
            valueObject.v = value.v;
        }

        if (isFormulaString(originalFormula) && copyRowLength && copyColumnLength) {
            const rowIndex = row % copyRowLength;
            const colIndex = col % copyColumnLength;

            const index = `${rowIndex}_${colIndex}`;
            let formulaId = formulaIdMap.get(index);

            if (!formulaId) {
                formulaId = Tools.generateRandomId(6);
                formulaIdMap.set(index, formulaId);

                const offsetX = col + startColumn - (copyRangeStartColumn + colIndex);
                const offsetY = row + startRow - (copyRangeStartRow + rowIndex);
                const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(originalFormula, offsetX, offsetY);

                valueObject.si = formulaId;
                valueObject.f = shiftedFormula;
                valueObject.v = null;
                valueObject.p = null;
            } else {
                // At the beginning of the second formula, set formulaId only
                valueObject.si = formulaId;
                valueObject.f = null;
                valueObject.v = null;
                valueObject.p = null;
            }
        }

        valueMatrix.setValue(row + startRow, col + startColumn, valueObject);
    });
    // set cell value and style
    const setValuesMutation: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: valueMatrix.getData(),
    };

    redoMutationsInfo.push({
        id: SetRangeValuesMutation.id,
        params: setValuesMutation,
    });

    // undo
    const undoSetValuesMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
        accessor,
        setValuesMutation
    );

    undoMutationsInfo.push({
        id: SetRangeValuesMutation.id,
        params: undoSetValuesMutation,
    });
    return {
        undos: undoMutationsInfo,
        redos: redoMutationsInfo,
    };
}
