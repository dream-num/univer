import type { Workbook } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FWorksheet } from './f-worksheet';

export class FWorkbook {
    constructor(
        private readonly _workbook: Workbook,
        @Inject(Injector) private readonly _injector: Injector
    ) {}

    getActiveSheet(): FWorksheet | null {
        const activeSheet = this._workbook.getActiveSheet();
        if (!activeSheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this._workbook, activeSheet);
    }
}
