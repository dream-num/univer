import { Inject } from '@wendellhu/redi';

import { SheetBarUIController } from '../Controller/SheetBarUIController';

export class SheetBarService {
    constructor(@Inject(SheetBarUIController) private _sheetBarUIController: SheetBarUIController) {}

    showMenuList(show: boolean) {
        this._sheetBarUIController.showMenuList(show);
    }

    getSheetBarUIController() {
        return this._sheetBarUIController;
    }
}
