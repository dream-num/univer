import { Direction, handleJsonToDom, ICellData, ICurrentUniverService, IDocumentData, IRangeData, IStyleData, Nullable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SelectionManagerService } from '../Services/selection-manager.service';

/**
 * Cell Editor
 */
export class CellEditorController {
    isEditMode: boolean;

    // current edit cell
    currentEditRangeData: IRangeData;

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {}

    setEditMode(value: boolean) {
        this.isEditMode = value;
    }

    getEditMode() {
        return this.isEditMode;
    }

    setCurrentEditRangeData() {
        const currentCell = this._selectionManagerService.getLast()?.cellRange;
        if (!currentCell) return;

        let row;
        let column;

        if (currentCell.isMerged) {
            row = currentCell.startRow;
            column = currentCell.startColumn;
        } else {
            row = currentCell.row;
            column = currentCell.column;
        }

        this.currentEditRangeData = {
            startRow: row,
            startColumn: column,
            endRow: row,
            endColumn: column,
        };
    }

    getCurrentEditRangeData() {
        return this.currentEditRangeData;
    }

    setCurrentEditRangeValue(cell: ICellData) {
        // only one selection
        if (this.currentEditRangeData == null) {
            return;
        }
        const { startRow, startColumn, endRow, endColumn } = this.currentEditRangeData;
        const range = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getRange(startRow, startColumn, endRow, endColumn);

        // range.setRangeData(cell);
    }

    getSelectionValue(): string {
        const range = this.getActiveRange();

        const value = range && range.getDisplayValue();
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            return handleJsonToDom(value);
        }
        return '';
    }

    getSelectionStyle(): Nullable<IStyleData> {
        return this.getActiveRange()?.getTextStyle();
    }

    setSelectionValue(value: IDocumentData | string) {
        const range = this.getActiveRange();
        if (!range) return;

        if (typeof value === 'string') {
            // range.setValue(value);
        }
        if (typeof value === 'object') {
            // range.setRangeData({ p: value });
        }
    }

    getActiveRange() {
        const cellRange = this._selectionManagerService.getLast()?.cellRange;
        if (!cellRange) return;

        return this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getRange(cellRange.row, cellRange.column);
    }

    handleBackSpace() {}

    handleDirection(direction: Direction) {
        // todo
    }
}
