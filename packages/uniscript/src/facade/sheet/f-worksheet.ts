import { SelectionManagerService } from '@univerjs/base-sheets';
import type { Workbook, Worksheet } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

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
}
