import { Disposable, ICommandService, ICurrentUniverService, Worksheet } from '@univerjs/core';

import { SheetCopyCommand, SheetCutCommand, SheetPasteCommand } from '../../commands/commands/clipboard.command';
import { ISheetClipboardHook, ISheetClipboardService } from '../../services/clipboard/clipboard.service';

/**
 * This controller add basic clipboard logic for basic features such as text color / BISU / row widths to the clipboard
 * service. You can create a similar clipboard controller to add logic for your own features.
 */
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

        let currentSheet: Worksheet | null = null;

        const self = this;
        const hook: ISheetClipboardHook = {
            onBeforeCopy() {
                // before copy, we should update the current sheet
                // and create necessary cache if needed
                currentSheet = self._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
            },
            onGetContent(row: number, col: number) {},
            // copy
            onCopy: (row: number, col: number) => ({
                'data-row': row.toString(),
                'data-col': col.toString(),
            }),
            onCopyColumn(col: number) {
                return null;
            },
            onCopyRow(row: number) {
                return null;
            },
            onAfterCopy() {
                currentSheet = null;
            },
        };

        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(hook));
    }
}
