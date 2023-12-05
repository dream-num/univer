import type { IRange, Nullable } from '@univerjs/core';
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Range,
    Rectangle,
} from '@univerjs/core';
import type { FormatType, ISetNumfmtMutationParams } from '@univerjs/sheets';
import { factorySetNumfmtUndoMutation, INumfmtService, SetNumfmtMutation } from '@univerjs/sheets';
import { COPY_TYPE, getAutoFillRepeatRange, ISheetClipboardService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';

const repeat = (sourceRange: IRange, targetRang: IRange) => {
    const getRowLength = (range: IRange) => range.endRow - range.startRow + 1;
    const getColLength = (range: IRange) => range.endColumn - range.startColumn + 1;
    const rowMod = getRowLength(targetRang) % getRowLength(sourceRange);
    const colMod = getColLength(targetRang) % getColLength(sourceRange);
    const repeatRelativeRange: IRange = {
        startRow: 0,
        endRow: getRowLength(sourceRange) - 1,
        startColumn: 0,
        endColumn: getColLength(sourceRange) - 1,
    };
    const repeatList: Array<{ startRange: IRange; repeatRelativeRange: IRange }> = [];
    if (!rowMod && !colMod) {
        const repeatRow = Math.floor(getRowLength(targetRang) / getRowLength(sourceRange));
        const repeatCol = Math.floor(getColLength(targetRang) / getColLength(sourceRange));
        for (let countRow = 1; countRow <= repeatRow; countRow++) {
            for (let countCol = 1; countCol <= repeatCol; countCol++) {
                const row = getRowLength(sourceRange) * (countRow - 1);
                const col = getColLength(sourceRange) * (repeatCol - 1);
                const startRange: IRange = {
                    startRow: row,
                    endRow: row,
                    startColumn: col,
                    endColumn: col,
                };

                repeatList.push({ repeatRelativeRange, startRange });
            }
        }
    } else {
        const startRange: IRange = {
            startRow: targetRang.startRow,
            endRow: targetRang.startRow,
            startColumn: targetRang.startColumn,
            endColumn: targetRang.startColumn,
        };
        repeatList.push({ startRange, repeatRelativeRange });
    }
    return repeatList;
};

@OnLifecycle(LifecycleStages.Rendered, NumfmtCopyPasteController)
export class NumfmtCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        matrix: ObjectMatrix<{ pattern: string; type: FormatType }>;
        info: {
            workbookId: string;
            worksheetId: string;
        };
    }>;

    constructor(
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(Injector) private _injector: Injector,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initClipboardHook();
    }

    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                hookName: 'numfmt',
                onBeforeCopy: (workbookId, worksheetId, range) => this._collectNumfmt(workbookId, worksheetId, range),
                onPasteCells: (pastedRange, _m, _p, _copyInfo) => this._generateNumfmtMutations(pastedRange, _copyInfo),
            })
        );
    }

    private _collectNumfmt(workbookId: string, worksheetId: string, range: IRange) {
        const matrix = new ObjectMatrix<{ pattern: string; type: FormatType }>();
        this._copyInfo = {
            matrix,
            info: {
                workbookId,
                worksheetId,
            },
        };
        const model = this._numfmtService.getModel(workbookId, worksheetId);
        if (!model) {
            return;
        }
        Range.foreach(range, (row, col) => {
            const numfmtValue = this._numfmtService.getValue(workbookId, worksheetId, row, col, model);
            if (!numfmtValue) {
                return;
            }
            const relativeRange = Rectangle.getRelativeRange(
                {
                    startRow: row,
                    endRow: row,
                    startColumn: col,
                    endColumn: col,
                },
                range
            );
            matrix.setValue(relativeRange.startRow, relativeRange.startColumn, {
                pattern: numfmtValue.pattern,
                type: numfmtValue.type,
            });
        });
    }

    private _generateNumfmtMutations(
        pastedRange: IRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IRange;
        }
    ) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();

        if (!this._copyInfo || !this._copyInfo.matrix.getSizeOf() || !copyInfo.copyRange) {
            return { redos: [], undos: [] };
        }
        const repeatRange = getAutoFillRepeatRange(copyInfo.copyRange, pastedRange);
        const redos: ISetNumfmtMutationParams = { workbookId, worksheetId, values: [] };

        // Clears the destination area data format
        Range.foreach(pastedRange, (row, col) => {
            redos.values.push({ row, col });
        });

        // Set up according to the data collected. This will overlap with the cleanup, but that's okay
        repeatRange.forEach((item) => {
            this._copyInfo &&
                this._copyInfo.matrix.forValue((row, col, value) => {
                    const range = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            endRow: row,
                            startColumn: col,
                            endColumn: col,
                        },
                        {
                            startRow: item.repeatStartCell.row,
                            endRow: item.repeatStartCell.row,

                            startColumn: item.repeatStartCell.col,
                            endColumn: item.repeatStartCell.col,
                        }
                    );
                    redos.values.push({
                        row: range.startRow,
                        col: range.startColumn,
                        pattern: value.pattern,
                        type: value.type,
                    });
                });
        });

        // If is clipping,  need to clear the data format of the original area
        if (copyInfo.copyType === COPY_TYPE.CUT) {
            this._copyInfo.matrix.forValue((row, col) => {
                const range = Rectangle.getPositionRange(
                    {
                        startRow: row,
                        endRow: row,
                        startColumn: col,
                        endColumn: col,
                    },
                    copyInfo.copyRange!
                );
                redos.values.unshift({
                    row: range.startRow,
                    col: range.startColumn,
                });
            });
            this._copyInfo = null;
        }

        const undos: ISetNumfmtMutationParams = factorySetNumfmtUndoMutation(this._injector, redos);

        return {
            redos: [{ id: SetNumfmtMutation.id, params: redos }],
            undos: [{ id: SetNumfmtMutation.id, params: undos }],
        };
    }
}
