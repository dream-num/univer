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

import type { ICellData, IMutationInfo, Workbook } from '@univerjs/core';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    isFormulaId,
    isFormulaString,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { COPY_TYPE, ISheetClipboardService, PREDEFINED_HOOK_NAME } from '@univerjs/sheets-ui';
import type { ICellDataWithSpanInfo, ICopyPastePayload, IDiscreteRange, ISheetClipboardHook, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import type { IAccessor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

export const DEFAULT_PASTE_FORMULA = 'default-paste-formula';

@OnLifecycle(LifecycleStages.Ready, FormulaClipboardController)
export class FormulaClipboardController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverSheet: IUniverInstanceService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
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
        return {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
            priority: 10,
            specialPasteInfo: { label: 'specialPaste.formula' },
            onPasteCells: (pasteFrom, pasteTo, data, payload) => this._onPasteCells(pasteFrom, pasteTo, data, payload, true),
        };
    }

    private _pasteWithFormulaHook(): ISheetClipboardHook {
        return {
            id: DEFAULT_PASTE_FORMULA,
            priority: 10,
            onPasteCells: (pasteFrom, pasteTo, data, payload) => this._onPasteCells(pasteFrom, pasteTo, data, payload, false),
        };
    }

    private _onPasteCells(
        pasteFrom: ISheetDiscreteRangeLocation | null,
        pasteTo: ISheetDiscreteRangeLocation,
        data: ObjectMatrix<ICellDataWithSpanInfo>,
        payload: ICopyPastePayload,
        isSpecialPaste: boolean
    ) {
        const pasteType = payload.pasteType;

        // Intercept scenarios where formulas do not need to be processed, and only process default paste and paste formulas only
        if (pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE || pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT || pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH) {
            return {
                undos: [],
                redos: [],
            };
        }

        const copyInfo = {
            copyType: payload.copyType || COPY_TYPE.COPY,
            copyRange: pasteFrom?.range,
            pasteType: payload.pasteType,
        };
        const pastedRange = pasteTo.range;
        const matrix = data;
        const workbook = this._currentUniverSheet.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = pasteTo.unitId || workbook.getUnitId();
        const subUnitId = pasteTo.subUnitId || workbook.getActiveSheet()?.getSheetId();
        if (!unitId || !subUnitId) {
            return {
                undos: [],
                redos: [],
            };
        }

        return this._injector.invoke((accessor) => getSetCellFormulaMutations(
            unitId,
            subUnitId,
            pastedRange,
            matrix,
            accessor,
            copyInfo,
            this._lexerTreeBuilder,
            this._formulaDataModel,
            isSpecialPaste,
            pasteFrom
        ));
    }
}

// eslint-disable-next-line max-lines-per-function
export function getSetCellFormulaMutations(
    unitId: string,
    subUnitId: string,
    range: IDiscreteRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor,
    copyInfo: {
        copyType: COPY_TYPE;
        copyRange?: IDiscreteRange;
        pasteType: string;
    },
    lexerTreeBuilder: LexerTreeBuilder,
    formulaDataModel: FormulaDataModel,
    isSpecialPaste = false,
    pasteFrom: ISheetDiscreteRangeLocation | null
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];

    const valueMatrix = new ObjectMatrix<ICellData>();
    const formulaIdMap = new Map<string, string>();

    let copyRowLength = 0;
    let copyColumnLength = 0;

    if (copyInfo && copyInfo.copyRange) {
        const { copyType, copyRange } = copyInfo;
        if (copyType === COPY_TYPE.COPY && copyRange) {
            copyRowLength = copyRange.rows.length;
            copyColumnLength = copyRange.cols.length;
        }
    }

    // eslint-disable-next-line complexity
    matrix.forValue((row, col, value) => {
        const originalFormula = value.f || '';
        const originalFormulaId = value.si || '';

        let valueObject: ICellDataWithSpanInfo = {};
        // Paste the formula only, you also need to process some regular values, but style information is not needed
        if (isSpecialPaste) {
            valueObject = Tools.deepClone(value);
            valueObject.s = null;
        }

        if (!copyRowLength || !copyColumnLength) {
            return;
        }

        // Directly reuse when there is a formula id
        if (isFormulaId(originalFormulaId)) {
            const { unitId: pasteFromUnitId = '', subUnitId: pasteFromSubUnitId = '', range: pasteFromRange } = pasteFrom || {};

            if (((pasteFromUnitId && unitId !== pasteFromUnitId) || (pasteFromSubUnitId && subUnitId !== pasteFromSubUnitId)) && pasteFromRange?.rows && pasteFromRange?.cols) {
                const formulaString = formulaDataModel.getFormulaStringByCell(pasteFromRange.rows[row], pasteFromRange.cols[col], pasteFromSubUnitId, pasteFromUnitId);

                const rowIndex = row % copyRowLength;
                const colIndex = col % copyColumnLength;

                const copyX = copyInfo?.copyRange ? copyInfo?.copyRange?.cols[colIndex] : colIndex;
                const copyY = copyInfo?.copyRange ? copyInfo?.copyRange?.rows[rowIndex] : rowIndex;
                const offsetX = range.cols[col] - copyX;
                const offsetY = range.rows[row] - copyY;
                const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(formulaString || '', offsetX, offsetY);

                valueObject.si = null;
                valueObject.f = shiftedFormula;
                valueObject.v = null;
                valueObject.p = null;
            } else {
                valueObject.si = originalFormulaId;
                valueObject.f = null;
                valueObject.v = null;
                valueObject.p = null;
            }
        } else if (isFormulaString(originalFormula)) {
            const rowIndex = row % copyRowLength;
            const colIndex = col % copyColumnLength;

            const index = `${rowIndex}_${colIndex}`;
            let formulaId = formulaIdMap.get(index);

            if (!formulaId) {
                formulaId = Tools.generateRandomId(6);
                formulaIdMap.set(index, formulaId);

                const copyX = copyInfo?.copyRange ? copyInfo?.copyRange?.cols[colIndex] : colIndex;
                const copyY = copyInfo?.copyRange ? copyInfo?.copyRange?.rows[rowIndex] : rowIndex;
                const offsetX = range.cols[col] - copyX;
                const offsetY = range.rows[row] - copyY;
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

        // If there is rich text, remove the style
        if (copyInfo.pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA && value.p) {
            const richText = getCellRichText(value);
            if (richText) {
                valueObject.p = null;
                valueObject.v = richText;
            }
        }

        valueMatrix.setValue(range.rows[row], range.cols[col], valueObject);
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

function getCellRichText(cell: ICellData) {
    if (cell?.p) {
        const body = cell?.p.body;

        if (body == null) {
            return;
        }

        const data = body.dataStream;
        const lastString = data.substring(data.length - 2, data.length);
        const newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;

        return newDataStream;
    }
}
