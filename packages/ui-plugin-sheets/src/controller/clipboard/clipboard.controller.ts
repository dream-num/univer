import {
    InsertColMutation,
    InsertRowMutation,
    ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
} from '@univerjs/base-sheets';
import {
    IInsertColMutationParams,
    IInsertRowMutationParams,
} from '@univerjs/base-sheets/Basics/Interfaces/MutationInterface.js';
import {
    ISetWorksheetColWidthMutationParams,
    SetWorksheetColWidthMutation,
} from '@univerjs/base-sheets/commands/mutations/set-worksheet-col-width.mutation.js';
import {
    ISetWorksheetRowHeightMutationParams,
    SetWorksheetRowHeightMutation,
} from '@univerjs/base-sheets/commands/mutations/set-worksheet-row-height.mutation.js';
import { IMessageService } from '@univerjs/base-ui';
import {
    BooleanNumber,
    Disposable,
    ICellData,
    ICommandInfo,
    ICommandService,
    IConfigService,
    ICurrentUniverService,
    ISelectionRange,
    LifecycleStages,
    LocaleService,
    ObjectArray,
    ObjectMatrix,
    OnLifecycle,
    Worksheet,
    WrapStrategy,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SheetCopyCommand, SheetCutCommand, SheetPasteCommand } from '../../commands/commands/clipboard.command';
import {
    IClipboardPropertyItem,
    IParsedCellValue,
    ISheetClipboardHook,
    ISheetClipboardService,
} from '../../services/clipboard/clipboard.service';

// TODO: default row height from config?
const DEFAULT_HEIGHT = 20;

/**
 * This controller add basic clipboard logic for basic features such as text color / BISU / row widths to the clipboard
 * service. You can create a similar clipboard controller to add logic for your own features.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetClipboardController)
export class SheetClipboardController extends Disposable {
    constructor(
        @ICurrentUniverService private readonly _currentUniverSheet: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localService: LocaleService
    ) {
        super();

        this._init();
    }

    private _init() {
        // register sheet clipboard commands
        [SheetCopyCommand, SheetCutCommand, SheetPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );

        // register basic sheet clipboard hooks
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                ...this._initCopyingHooks(),
                ...this._initPastingHook(),
            })
        );
    }

    private _initCopyingHooks(): ISheetClipboardHook {
        const self = this;
        let currentSheet: Worksheet | null = null;
        return {
            onBeforeCopy(workbookId, worksheetId) {
                currentSheet = self._getWorksheet(workbookId, worksheetId);
            },
            onCopyCellContent(row: number, col: number): string {
                const v = currentSheet!.getCellMatrix().getValue(row, col);
                return v?.m || '';
            },
            onCopyCellStyle: (row: number, col: number, rowSpan?: number, colSpan?: number) => {
                const properties: IClipboardPropertyItem = {};

                if (rowSpan || colSpan) {
                    properties.rowspan = `${rowSpan || 1}`;
                    properties.colspan = `${colSpan || 1}`;
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
    }

    private _initPastingHook(): ISheetClipboardHook {
        const self = this;

        let workbookId: string | null = null;
        let worksheetId: string | null = null;
        let currentSheet: Worksheet | null = null;

        return {
            onBeforePaste(workbookId_, worksheetId_, range) {
                currentSheet = self._getWorksheet(workbookId_, worksheetId_);
                workbookId = workbookId_;
                worksheetId = worksheetId_;

                // examine if pasting would cause number of cells to exceed the upper limit
                // this is not implemented yet
                const maxConfig = self._configService.getConfig<number>('maxCellsPerSheet');
                const { endRow, endColumn } = range;
                if (maxConfig && endRow * endColumn > maxConfig) {
                    self._messageService.show(); // TODO: show error info
                    return false;
                }

                return true;
            },

            onPasteRows(range, rowProperties) {
                const redoMutations: ICommandInfo[] = [];
                const undoMutations: ICommandInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxRow = currentSheet!.getMaxRows();
                const addingRowsCount = range.endRow - maxRow;
                const existingRowsCount = rowProperties.length - addingRowsCount;
                if (addingRowsCount > 0) {
                    const addRowMutation: IInsertRowMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, startRow: maxRow }],
                        rowInfo: new ObjectArray(
                            rowProperties.slice(existingRowsCount).map((property) => ({
                                h: property.height ? +property.height : DEFAULT_HEIGHT,
                                hd: BooleanNumber.FALSE,
                            }))
                        ),
                    };
                    redoMutations.push({
                        id: InsertRowMutation.id,
                        params: addRowMutation,
                    });
                }

                // apply row properties to the existing rows
                const setRowPropertyMutation: ISetWorksheetRowHeightMutationParams = {
                    workbookId: workbookId!,
                    worksheetId: worksheetId!,
                    ranges: [{ ...range, endRow: Math.min(range.endRow, maxRow) }],
                    rowHeight: new ObjectArray(
                        rowProperties
                            .slice(0, existingRowsCount)
                            .map((property) => (property.height ? +property.height : DEFAULT_HEIGHT))
                    ),
                };
                redoMutations.push({
                    id: SetWorksheetRowHeightMutation.id,
                    params: setRowPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: [] || redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPasteColumns(range, colProperties) {
                const redoMutations: ICommandInfo[] = [];
                const undoMutations: ICommandInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const addingColsCount = range.endColumn - maxColumn;
                const existingColsCount = colProperties.length - addingColsCount;
                if (addingColsCount > 0) {
                    const addColMutation: IInsertColMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, startColumn: maxColumn }],
                        colInfo: new ObjectArray(
                            colProperties.slice(existingColsCount).map((property) => ({
                                w: property.width ? +property.width : DEFAULT_HEIGHT,
                                hd: BooleanNumber.FALSE,
                            }))
                        ),
                    };
                    redoMutations.push({
                        id: InsertColMutation.id,
                        params: addColMutation,
                    });
                }

                // apply row properties to the existing rows
                const setRowPropertyMutation: ISetWorksheetColWidthMutationParams = {
                    workbookId: workbookId!,
                    worksheetId: worksheetId!,
                    ranges: [{ ...range, endRow: Math.min(range.endColumn, maxColumn) }],
                    colWidth: new ObjectArray(
                        colProperties
                            .slice(0, existingColsCount)
                            .map((property) => (property.width ? +property.width : DEFAULT_HEIGHT))
                    ),
                };
                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setRowPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: [] || redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPasteCells(range, matrix) {
                return self._onPasteCells(range, matrix, workbookId!, worksheetId!);
            },

            onAfterPaste(success) {
                currentSheet = null;
            },
        };
    }

    private _onPasteCells(
        range: ISelectionRange,
        matrix: ObjectMatrix<IParsedCellValue>,
        workbookId: string,
        worksheetId: string
    ): {
        redos: ICommandInfo[];
        undos: ICommandInfo[];
    } {
        // insert cell style, insert cell content and insert merged cell info
        // 1. merged cell (TODO)
        // 2. raw content
        // 3. cell style (TODO)

        const { startColumn, startRow } = range;
        const valueMatrix = new ObjectMatrix<ICellData>();
        const redoMutationsInfo: ICommandInfo[] = [];
        const undoMutationsInfo: ICommandInfo[] = [];

        matrix.forValue((row, col, value) => {
            valueMatrix.setValue(row + startRow, col + startColumn, {
                v: value.content,
            });
        });

        const setContentMutation: ISetRangeValuesMutationParams = {
            workbookId,
            worksheetId,
            rangeData: [range],
            cellValue: valueMatrix.getData(),
        };

        redoMutationsInfo.push({
            id: SetRangeValuesMutation.id,
            params: setContentMutation,
        });

        return {
            redos: redoMutationsInfo,
            undos: undoMutationsInfo,
        };
    }

    private _getWorksheet(workbookId: string, worksheetId: string): Worksheet {
        const worksheet = this._currentUniverSheet
            .getUniverSheetInstance(workbookId)
            ?.getWorkBook()
            .getSheetBySheetId(worksheetId);

        if (!worksheet) {
            throw new Error(
                `[SheetClipboardController]: cannot find a worksheet with workbookId ${workbookId} and worksheetId ${worksheetId}.`
            );
        }

        return worksheet;
    }
}
