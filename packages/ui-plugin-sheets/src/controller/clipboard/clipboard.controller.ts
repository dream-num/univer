import { Disposable, ICommandService, ICurrentUniverService, Worksheet, WrapStrategy } from '@univerjs/core';

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
                const properties: IClipboardPropertyItem = {};

                if (rowSpan) {
                    properties.rowspan = `${rowSpan}`;
                }
                if (colSpan) {
                    properties.colspan = `${colSpan}`;
                }

                const range = currentSheet!.getRange(row, col);
                const textStyle = range.getTextStyle();
                const color = range.getFontColor();
                const backgroundColor = range.getBackground();

                let style = '';
                if (color) {
                    style += `color: ${color};`;
                }
                if (backgroundColor) {
                    style += `background-color: ${backgroundColor};`;
                }
                if (textStyle?.bl) {
                    style += 'font-weight: bold;';
                }
                if (textStyle?.fs) {
                    style += `font-size: ${textStyle.fs}px;`;
                }
                if (textStyle?.tb === WrapStrategy.WRAP) {
                    style += 'word-wrap: break-word;';
                }
                if (textStyle?.it) {
                    style += 'font-style: italic;';
                }
                if (textStyle?.ff) {
                    style += `font-family: ${textStyle.ff};`;
                }
                if (textStyle?.st) {
                    style += 'text-decoration: line-through;';
                }
                if (textStyle?.ul) {
                    style += 'text-decoration: underline';
                }

                if (style) {
                    properties.style = style;
                }

                return properties;
            },
            onCopyColumn(col: number) {
                const sheet = currentSheet!;
                const width = sheet.getColumnWidth(col);
                return {
                    width: `${width}`,
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
