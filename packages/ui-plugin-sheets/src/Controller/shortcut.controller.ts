import { IShortcutItem, IShortcutService } from '@univerjs/base-ui';
import { Disposable } from '@univerjs/core';

const MoveSelectionDownShortcutItem: IShortcutItem = {

}

export class DesktopSheetShortcutController extends Disposable {
    constructor(@IShortcutService private readonly _shortuctService: IShortcutService) {
        super();
    }
}