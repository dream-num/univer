import { IUniverInstanceService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FWorkbook } from './sheet/f-workbook';

export class FUniver {
    static newInstance(injector: Injector): FUniver {
        return injector.createInstance(FUniver);
    }

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {}

    getCurrentSheet(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }
}
