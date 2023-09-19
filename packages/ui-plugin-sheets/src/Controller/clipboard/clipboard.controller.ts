import { Disposable, ICommandService, ICurrentUniverService, Worksheet } from '@univerjs/core';

import { SheetCopyCommand, SheetCutCommand, SheetPasteCommand } from '../../commands/commands/clipboard.command';
import {
    IClipboardPropertyItem,
    ISheetClipboardHook,
    ISheetClipboardService,
} from '../../services/clipboard/clipboard.service';

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
            onGetContent(row: number, col: number): string {
                const v = currentSheet!.getCellMatrix().getValue(row, col);
                return v?.m || '';
            },
            onCopy: (row: number, col: number, rowSpan?: number, colSpan?: number) => {
                // TODO: get cell style and write it into clipboard property item
                if (!rowSpan && !colSpan) {
                    return null;
                }

                const properties: IClipboardPropertyItem = {};
                if (rowSpan) {
                    properties.rowspan = `${rowSpan}`;
                }
                if (colSpan) {
                    properties.colspan = `${colSpan}`;
                }

                return properties;
            },
            onCopyColumn(col: number) {
                const sheet = currentSheet!;
                const width = sheet.getColumnWidth(col);
                return {
                    style: `width: ${width}px;`,
                };
            },
            onCopyRow(row: number) {
                const sheet = currentSheet!;
                const height = sheet.getRowHeight(row);
                return {
                    style: `height: ${height}px;`,
                };
            },
            onAfterCopy() {
                currentSheet = null;
            },
        };

        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(hook));
    }
}
