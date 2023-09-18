import { Disposable, ICommandService, ICurrentUniverService } from '@univerjs/core';

import { SheetCopyCommand, SheetCutCommand, SheetPasteCommand } from '../../commands/commands/clipboard.command';
import { ISheetClipboardHook, ISheetClipboardService } from '../../services/clipboard/sheet-clipboard.service';

export class SheetClipboardController extends Disposable {
    constructor(
        @ICurrentUniverService private readonly _currentUniverSheet: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService
    ) {
        super();
    }

    initialize() {
        [SheetCopyCommand, SheetCutCommand, SheetPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );

        const hook: ISheetClipboardHook = {
            onGetContent(row: number, col: number) {},
            onBeforeCopy() {},
            // copy
            onCopy: (row: number, col: number) => ({
                'data-row': row.toString(),
                'data-col': col.toString(),
            }),
            onCopyColumn(col: number) {
                //
            },
            onCopyRow(row: number) {
                //
            },
        };

        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(hook));
    }
}
