import { Disposable, ICommandService } from '@univerjs/core';

import { SheetCopyCommand, SheetCutCommand, SheetPasteCommand } from '../../commands/commands/clipboard.command';

export class SheetClipboardController extends Disposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();
    }

    initialize() {
        [SheetCopyCommand, SheetCutCommand, SheetPasteCommand].forEach((command) => this.disposeWithMe(this._commandService.registerAsMultipleCommand(command)));
    }
}
