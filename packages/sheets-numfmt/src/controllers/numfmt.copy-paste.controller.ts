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
import { COPY_TYPE, ISheetClipboardService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';

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

        if (!this._copyInfo || !this._copyInfo.matrix.getSizeOf()) {
            return { redos: [], undos: [] };
        }

        const redos: ISetNumfmtMutationParams = { workbookId, worksheetId, values: [] };

        // Clears the destination area data format
        Range.foreach(pastedRange, (row, col) => {
            redos.values.push({ row, col });
        });

        // Set up according to the data collected. This will overlap with the cleanup, but that's okay
        this._copyInfo.matrix.forValue((row, col, value) => {
            const range = Rectangle.getPositionRange(
                {
                    startRow: row,
                    endRow: row,
                    startColumn: col,
                    endColumn: col,
                },
                pastedRange
            );
            redos.values.push({
                row: range.startRow,
                col: range.startColumn,
                pattern: value.pattern,
                type: value.type,
            });
        });

        // If is clipping,  need to clear the data format of the original area
        if (copyInfo.copyType === COPY_TYPE.CUT && copyInfo.copyRange) {
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
