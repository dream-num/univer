import type { IRange } from '@univerjs/core';
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
import { ISheetClipboardService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Rendered, NumfmtCopyPasteController)
export class NumfmtCopyPasteController extends Disposable {
    private _numfmtMatrix: ObjectMatrix<{ pattern: string; type: FormatType }>;

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
                onPasteCells: (pastedRange) => this._generateNumfmtMutations(pastedRange),
            })
        );
    }

    private _collectNumfmt(workbookId: string, worksheetId: string, range: IRange) {
        this._numfmtMatrix = new ObjectMatrix();
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
            this._numfmtMatrix.setValue(relativeRange.startRow, relativeRange.startColumn, {
                pattern: numfmtValue.pattern,
                type: numfmtValue.type,
            });
        });
    }

    private _generateNumfmtMutations(pastedRange: IRange) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();
        if (!this._numfmtMatrix || !this._numfmtMatrix.getSizeOf()) {
            return { redos: [], undos: [] };
        }
        const redos: ISetNumfmtMutationParams = { workbookId, worksheetId, values: [] };
        this._numfmtMatrix.forValue((row, col, value) => {
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
        const undos: ISetNumfmtMutationParams = factorySetNumfmtUndoMutation(this._injector, redos);

        return {
            redos: [{ id: SetNumfmtMutation.id, params: redos }],
            undos: [{ id: SetNumfmtMutation.id, params: undos }],
        };
    }
}
