import { SelectionManagerService } from '@univerjs/sheets';
import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FRange } from './f-range';
import { FSelection } from './f-selection';

export class FWorksheet {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {}

    getSelection(): FSelection | null {
        const selections = this._selectionManagerService.getSelections();
        if (!selections) {
            return null;
        }

        return this._injector.createInstance(FSelection, this._workbook, this._worksheet, selections);
    }

    getRange(row: number, col: number): FRange | null {
        const range: IRange = {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        };

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }
}
