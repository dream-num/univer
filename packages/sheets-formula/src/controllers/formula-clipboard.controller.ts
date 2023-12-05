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
import { FormulaEngineService } from '@univerjs/engine-formula';
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
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
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
            hookName: SPECIAL_PASTE_FORMULA,
            specialPasteInfo: {
                label: 'specialPaste.formula',
            },
            onPasteCells: (pastedRange, matrix, pasteType, copyInfo) => {
                const workbook = this._currentUniverSheet.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();

                return this._injector.invoke((accessor) =>
                    getSetCellFormulaMutations(
                        workbookId,
                        worksheetId,
                        pastedRange,
                        matrix,
                        accessor,
                        copyInfo,
                        this._formulaEngineService,
                        true
                    )
                );
            },
        };

        return specialPasteFormulaHook;
    }

    private _pasteWithFormulaHook(): ISheetClipboardHook {
        const specialPasteFormulaHook: ISheetClipboardHook = {
            hookName: DEFAULT_PASTE_FORMULA,
            onPasteCells: (pastedRange, matrix, pasteType, copyInfo) => {
                const workbook = this._currentUniverSheet.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();

                const a = this._injector.invoke((accessor) => {
                    console.info(
                        'a======22',
                        workbookId,
                        worksheetId,
                        pastedRange,
                        matrix,
                        accessor,
                        copyInfo,
                        this._formulaEngineService
                    );
                    return getSetCellFormulaMutations(
                        workbookId,
                        worksheetId,
                        pastedRange,
                        matrix,
                        accessor,
                        copyInfo,
                        this._formulaEngineService
                    );
                });

                console.info('a======11', a);
                return a;
            },
        };

        return specialPasteFormulaHook;
    }
}

export function getSetCellFormulaMutations(
    workbookId: string,
    worksheetId: string,
    range: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor,
    copyInfo: {
        copyType: COPY_TYPE;
        copyRange?: IRange;
    },
    formulaEngineService: FormulaEngineService,
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
                const shiftedFormula = formulaEngineService.moveFormulaRefOffset(originalFormula, offsetX, offsetY);

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
        workbookId,
        worksheetId,
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
