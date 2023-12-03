import type { ISelectionWithStyle } from '@univerjs/base-sheets';
import type { Workbook, Worksheet } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FRange } from './f-range';

export class FSelection {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _selections: Readonly<ISelectionWithStyle[]>,
        @Inject(Injector) private readonly _injector: Injector
    ) {}

    getActiveRange(): FRange | null {
        const active = this._selections.find((selection) => !!selection.primary);
        if (!active) {
            return null;
        }

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, active.range);
    }
}
