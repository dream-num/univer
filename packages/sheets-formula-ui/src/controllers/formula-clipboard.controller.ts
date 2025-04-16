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

import type { IAccessor, ICellData, IMutationInfo, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { ICellDataWithSpanInfo, ICopyPastePayload, IDiscreteRange, IPasteHookValueType, ISheetClipboardHook, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    Inject,
    Injector,
    isFormulaId,
    isFormulaString,
    IUniverInstanceService,
    ObjectMatrix,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { COPY_TYPE, ISheetClipboardService, PREDEFINED_HOOK_NAME } from '@univerjs/sheets-ui';

export const DEFAULT_PASTE_FORMULA = 'default-paste-formula';

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
        // Intercept scenarios where formulas do not need to be processed, and only process default paste and paste formulas only
        const specialPastes: IPasteHookValueType[] = [
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
        ];
        if (specialPastes.includes(payload.pasteType)) {
            return {
                undos: [],
                redos: [],
            };
        }

        const workbook = this._currentUniverSheet.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = pasteTo.unitId || workbook.getUnitId();
        const subUnitId = pasteTo.subUnitId || workbook.getActiveSheet()?.getSheetId();

        if (!unitId || !subUnitId) {
            return {
                undos: [],
                redos: [],
            };
        }

        const pastedRange = pasteTo.range;
        const matrix = data;
        const copyInfo = {
            copyType: payload.copyType || COPY_TYPE.COPY,
            copyRange: pasteFrom?.range,
            pasteType: payload.pasteType,
        };

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

    const valueMatrix = getValueMatrix(unitId, subUnitId, range, matrix, copyInfo, lexerTreeBuilder, formulaDataModel, pasteFrom);

    if (!valueMatrix.hasValue()) {
        return {
            undos: [],
            redos: [],
        };
    }

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

function getValueMatrix(
    unitId: string,
    subUnitId: string,
    range: IDiscreteRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    copyInfo: {
        copyType: COPY_TYPE;
        copyRange?: IDiscreteRange;
        pasteType: string;
    },
    lexerTreeBuilder: LexerTreeBuilder,
    formulaDataModel: FormulaDataModel,
    pasteFrom: ISheetDiscreteRangeLocation | null
): ObjectMatrix<ICellData> {
    if (!pasteFrom) {
        return getValueMatrixOfPasteFromIsNull(unitId, subUnitId, range, matrix, formulaDataModel);
    }

    if (copyInfo.pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE) {
        return getSpecialPasteValueValueMatrix(unitId, subUnitId, range, matrix, formulaDataModel, pasteFrom);
    }

    if (copyInfo.pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA) {
        return getSpecialPasteFormulaValueMatrix(unitId, subUnitId, range, matrix, lexerTreeBuilder, formulaDataModel, pasteFrom);
    }

    return getDefaultPasteValueMatrix(unitId, subUnitId, range, matrix, copyInfo.copyType, lexerTreeBuilder, formulaDataModel, pasteFrom);
}

function getValueMatrixOfPasteFromIsNull(
    unitId: string,
    subUnitId: string,
    range: IDiscreteRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    formulaDataModel: FormulaDataModel
): ObjectMatrix<ICellData> {
    const valueMatrix = new ObjectMatrix<ICellData>();
    const formulaData = formulaDataModel.getSheetFormulaData(unitId, subUnitId);

    matrix.forValue((row, col, value) => {
        const toRow = range.rows[row];
        const toCol = range.cols[col];
        const valueObject: ICellDataWithSpanInfo = {};

        if (isFormulaString(value.v)) {
            // If the copy value is a formula
            valueObject.v = null;
            valueObject.f = `${value.v}`;
            valueObject.si = null;
            valueObject.p = null;

            valueMatrix.setValue(toRow, toCol, valueObject);
        } else if (formulaData?.[toRow]?.[toCol]) {
            // If the paste location is a formula
            valueObject.v = value.v;
            valueObject.f = null;
            valueObject.si = null;
            valueObject.p = null;

            valueMatrix.setValue(toRow, toCol, valueObject);
        }
    });

    return valueMatrix;
}

function getSpecialPasteValueValueMatrix(
    unitId: string,
    subUnitId: string,
    range: IDiscreteRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    formulaDataModel: FormulaDataModel,
    pasteFrom: ISheetDiscreteRangeLocation
): ObjectMatrix<ICellData> {
    const valueMatrix = new ObjectMatrix<ICellData>();
    const arrayFormulaCellData = formulaDataModel.getArrayFormulaCellData()?.[pasteFrom.unitId]?.[pasteFrom.subUnitId];
    const formulaData = formulaDataModel.getSheetFormulaData(unitId, subUnitId);

    matrix.forValue((row, col, value) => {
        const fromRow = pasteFrom.range.rows[row % pasteFrom.range.rows.length];
        const fromCol = pasteFrom.range.cols[col % pasteFrom.range.cols.length];
        const toRow = range.rows[row];
        const toCol = range.cols[col];
        const valueObject: ICellDataWithSpanInfo = {};

        if (isFormulaString(value.f) || isFormulaId(value.si)) {
            // If the copy value is a formula
            valueObject.v = value.v;
            valueObject.f = null;
            valueObject.si = null;
            valueObject.p = null;

            valueMatrix.setValue(toRow, toCol, valueObject);
        } else if (arrayFormulaCellData?.[fromRow]?.[fromCol]) {
            // If the copy value is an array formula
            const cell = arrayFormulaCellData[fromRow][fromCol];
            valueObject.v = cell.v;
            valueObject.f = null;
            valueObject.si = null;
            valueObject.p = null;

            valueMatrix.setValue(toRow, toCol, valueObject);
        } else if (formulaData?.[toRow]?.[toCol]) {
            // If the paste location is a formula
            valueObject.v = value.v;
            valueObject.f = null;
            valueObject.si = null;
            valueObject.p = null;

            if (value.p) {
                const richText = getCellRichText(value);
                if (richText) {
                    valueObject.v = richText;
                }
            }

            valueMatrix.setValue(toRow, toCol, valueObject);
        }
    });

    return valueMatrix;
}

function getSpecialPasteFormulaValueMatrix(
    unitId: string,
    subUnitId: string,
    range: IDiscreteRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    lexerTreeBuilder: LexerTreeBuilder,
    formulaDataModel: FormulaDataModel,
    pasteFrom: ISheetDiscreteRangeLocation
): ObjectMatrix<ICellData> {
    const valueMatrix = new ObjectMatrix<ICellData>();
    const formulaIdMap = new Map<string, string>();

    matrix.forValue((row, col, value) => {
        const toRow = range.rows[row];
        const toCol = range.cols[col];
        const valueObject: ICellDataWithSpanInfo = {};

        if (isFormulaId(value.si)) {
            // If the copy value is a formula
            if (pasteFrom.unitId !== unitId || pasteFrom.subUnitId !== subUnitId) {
                const formulaString = formulaDataModel.getFormulaStringByCell(
                    pasteFrom.range.rows[row % pasteFrom.range.rows.length],
                    pasteFrom.range.cols[col % pasteFrom.range.cols.length],
                    pasteFrom.subUnitId,
                    pasteFrom.unitId
                );
                const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
                const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
                const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(formulaString || '', offsetX, offsetY);

                valueObject.si = null;
                valueObject.f = shiftedFormula;
            } else {
                valueObject.si = value.si;
                valueObject.f = null;
            }

            valueObject.v = null;
            valueObject.p = null;

            valueMatrix.setValue(toRow, toCol, valueObject);
        } else if (isFormulaString(value.f)) {
            // If the copy value is a formula
            const index = `${row % pasteFrom.range.rows.length}_${col % pasteFrom.range.cols.length}`;
            let formulaId = formulaIdMap.get(index);

            if (!formulaId) {
                formulaId = Tools.generateRandomId(6);
                formulaIdMap.set(index, formulaId);

                const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
                const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
                const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(value.f || '', offsetX, offsetY);

                valueObject.si = formulaId;
                valueObject.f = shiftedFormula;
            } else {
                // At the beginning of the second formula, set formulaId only
                valueObject.si = formulaId;
                valueObject.f = null;
            }

            valueObject.v = null;
            valueObject.p = null;

            valueMatrix.setValue(toRow, toCol, valueObject);
        } else {
            // If the paste location is a formula
            valueObject.v = value.v;
            valueObject.f = null;
            valueObject.si = null;
            valueObject.p = null;

            if (value.p) {
                const richText = getCellRichText(value);
                if (richText) {
                    valueObject.v = richText;
                }
            }

            valueMatrix.setValue(toRow, toCol, valueObject);
        }
    });

    return valueMatrix;
}

// eslint-disable-next-line
function getDefaultPasteValueMatrix(
    unitId: string,
    subUnitId: string,
    range: IDiscreteRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    copyType: COPY_TYPE,
    lexerTreeBuilder: LexerTreeBuilder,
    formulaDataModel: FormulaDataModel,
    pasteFrom: ISheetDiscreteRangeLocation
): ObjectMatrix<ICellData> {
    const valueMatrix = new ObjectMatrix<ICellData>();
    const formulaIdMap = new Map<string, string>();
    const formulaData = formulaDataModel.getSheetFormulaData(unitId, subUnitId);
    const cutFormulaIds: string[] = [];

    if (copyType === COPY_TYPE.CUT) {
        // If cut, the formula range should not be moved.
        matrix.forValue((row, col, value) => {
            const toRow = range.rows[row];
            const toCol = range.cols[col];
            const valueObject: ICellDataWithSpanInfo = {};

            if (isFormulaId(value.si)) {
                if (isFormulaString(value.f)) {
                    cutFormulaIds.push(value.si as string);

                    valueObject.f = value.f;
                    valueObject.si = value.si;
                } else if (cutFormulaIds.includes(value.si as string)) {
                    valueObject.f = null;
                    valueObject.si = value.si;
                } else {
                    const formulaString = formulaDataModel.getFormulaStringByCell(
                        pasteFrom.range.rows[row % pasteFrom.range.rows.length],
                        pasteFrom.range.cols[col % pasteFrom.range.cols.length],
                        pasteFrom.subUnitId,
                        pasteFrom.unitId
                    );

                    valueObject.f = formulaString;
                    valueObject.si = null;
                }

                valueObject.v = null;
                valueObject.p = null;

                valueMatrix.setValue(toRow, toCol, valueObject);
            } else if (isFormulaString(value.f)) {
                valueObject.f = value.f;
                valueObject.si = null;
                valueObject.v = null;
                valueObject.p = null;

                valueMatrix.setValue(toRow, toCol, valueObject);
            }
        });
    } else {
        // copy, the formula range should be moved.
        matrix.forValue((row, col, value) => {
            const toRow = range.rows[row];
            const toCol = range.cols[col];
            const valueObject: ICellDataWithSpanInfo = {};

            if (isFormulaId(value.si)) {
                // If the copy value is a formula
                if (pasteFrom.unitId !== unitId || pasteFrom.subUnitId !== subUnitId) {
                    const formulaString = formulaDataModel.getFormulaStringByCell(
                        pasteFrom.range.rows[row % pasteFrom.range.rows.length],
                        pasteFrom.range.cols[col % pasteFrom.range.cols.length],
                        pasteFrom.subUnitId,
                        pasteFrom.unitId
                    );
                    const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
                    const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
                    const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(formulaString || '', offsetX, offsetY);

                    valueObject.si = null;
                    valueObject.f = shiftedFormula;
                } else {
                    valueObject.si = value.si;
                    valueObject.f = null;
                }

                valueObject.v = null;
                valueObject.p = null;

                valueMatrix.setValue(toRow, toCol, valueObject);
            } else if (isFormulaString(value.f)) {
                // If the copy value is a formula
                const index = `${row % pasteFrom.range.rows.length}_${col % pasteFrom.range.cols.length}`;
                let formulaId = formulaIdMap.get(index);

                if (!formulaId) {
                    formulaId = Tools.generateRandomId(6);
                    formulaIdMap.set(index, formulaId);

                    const offsetX = range.cols[col] - pasteFrom.range.cols[col % pasteFrom.range.cols.length];
                    const offsetY = range.rows[row] - pasteFrom.range.rows[row % pasteFrom.range.rows.length];
                    const shiftedFormula = lexerTreeBuilder.moveFormulaRefOffset(value.f || '', offsetX, offsetY);

                    valueObject.si = formulaId;
                    valueObject.f = shiftedFormula;
                } else {
                    // At the beginning of the second formula, set formulaId only
                    valueObject.si = formulaId;
                    valueObject.f = null;
                }

                valueObject.v = null;
                valueObject.p = null;

                valueMatrix.setValue(toRow, toCol, valueObject);
            } else if (formulaData?.[toRow]?.[toCol]) {
                // If the paste location is a formula
                valueObject.v = value.v;
                valueObject.f = null;
                valueObject.si = null;
                valueObject.p = value.p;

                valueMatrix.setValue(toRow, toCol, valueObject);
            }
        });
    }

    // If cut range has the first formula id, remove the related formula ids and convert it to formula string.
    if (cutFormulaIds.length > 0) {
        new ObjectMatrix(formulaData!).forValue((row, col, value) => {
            if (
                !(pasteFrom.range.rows.includes(row) && pasteFrom.range.cols.includes(col)) &&
                !(range.rows.includes(row) && range.cols.includes(col)) &&
                cutFormulaIds.includes(value?.si as string)
            ) {
                const formulaString = formulaDataModel.getFormulaStringByCell(
                    row,
                    col,
                    pasteFrom.subUnitId,
                    pasteFrom.unitId
                );

                valueMatrix.setValue(row, col, {
                    f: formulaString,
                    si: null,
                    v: null,
                    p: null,
                });
            }
        });
    }

    return valueMatrix;
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
