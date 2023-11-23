import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    getPrimaryForRange,
    IAddWorksheetMergeMutationParams,
    IInsertColMutationParams,
    IInsertRowMutationParams,
    InsertColMutation,
    InsertRowMutation,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
    ISetSelectionsOperationParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowHeightMutationParams,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/base-sheets';
import { IMessageService, textTrim } from '@univerjs/base-ui';
import {
    BooleanNumber,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    Disposable,
    handleStyleToString,
    ICellData,
    ICommandService,
    IConfigService,
    IMutationInfo,
    IRange,
    IRowData,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    ObjectArray,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    OnLifecycle,
    Rectangle,
    Worksheet,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { Inject, Injector } from '@wendellhu/redi';

import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { ISheetClipboardService } from '../../services/clipboard/clipboard.service';
import {
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    ISheetClipboardHook,
    PASTE_TYPE,
} from '../../services/clipboard/type';

/**
 * This controller add basic clipboard logic for basic features such as text color / BISU / row widths to the clipboard
 * service. You can create a similar clipboard controller to add logic for your own features.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetClipboardController)
export class SheetClipboardController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverSheet: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localService: LocaleService
    ) {
        super();
        // this._commandExecutedListener();
        this._init();
    }

    private _init() {
        // register sheet clipboard commands
        [SheetCopyCommand, SheetCutCommand, SheetPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );

        [
            SheetPasteValueCommand,
            SheetPasteFormatCommand,
            SheetPasteColWidthCommand,
            SheetPasteBesidesBorderCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
        // register basic sheet clipboard hooks
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                ...this._initCopyingHooks(),
                ...this._initPastingHook(),
            })
        );
    }

    // private _commandExecutedListener() {
    //     const updateCommandList = [SheetCopyCommand.id, SheetCutCommand.id, SheetPasteCommand.id];

    //     this.disposeWithMe(
    //         this._commandService.onCommandExecuted((command: ICommandInfo) => {
    //             if (!updateCommandList.includes(command.id)) {
    //                 return;
    //             }

    //             switch (command.id) {
    //                 case SheetPasteCommand.id: {
    //                     this._handlePaste();
    //                     break;
    //                 }

    //                 case SheetCopyCommand.id: {
    //                     this._handleCopy();
    //                     break;
    //                 }

    //                 case SheetCutCommand.id: {
    //                     this._handleCut();
    //                     break;
    //                 }

    //                 default:
    //                     throw new Error(`Unhandled command ${command.id}`);
    //             }
    //         })
    //     );
    // }

    // private async _handleCopy() {
    //     const { cli: clipboard } = this;
    //     const documentBodyList = this._getDocumentBodyInRanges();

    //     try {
    //         clipboard.setClipboardData(documentBodyList);
    //     } catch (_e) {
    //         this._logService.error('[DocClipboardController] set clipboard failed');
    //     }
    // }

    private _initCopyingHooks(): ISheetClipboardHook {
        const self = this;
        let currentSheet: Worksheet | null = null;
        return {
            onBeforeCopy(workbookId, worksheetId) {
                currentSheet = self._getWorksheet(workbookId, worksheetId);
            },
            onCopyCellContent(row: number, col: number): string {
                const v = currentSheet!.getCell(row, col);
                return v?.m || '';
            },
            onCopyCellStyle: (row: number, col: number, rowSpan?: number, colSpan?: number) => {
                const properties: IClipboardPropertyItem = {};

                if (rowSpan || colSpan) {
                    properties.rowspan = `${rowSpan || 1}`;
                    properties.colspan = `${colSpan || 1}`;
                }

                // TODO@wzhudev: should deprecate Range and
                // use worksheet.getStyle()
                const range = currentSheet!.getRange(row, col);
                const textStyle = range.getTextStyle();
                // const color = range.getFontColor();
                // const backgroundColor = range.getBackground();

                let style = '';
                // if (color) {
                //     style += `color: ${color};`;
                // }
                // if (backgroundColor) {
                //     style += `background-color: ${backgroundColor};`;
                // }
                // if (textStyle?.bl) {
                //     style += 'font-weight: bold;';
                // }
                // if (textStyle?.fs) {
                //     style += `font-size: ${textStyle.fs}px;`;
                // }
                // if (textStyle?.tb === WrapStrategy.WRAP) {
                //     style += 'word-wrap: break-word;';
                // }
                // if (textStyle?.it) {
                //     style += 'font-style: italic;';
                // }
                // if (textStyle?.ff) {
                //     style += `font-family: ${textStyle.ff};`;
                // }
                // if (textStyle?.st) {
                //     style += 'text-decoration: line-through;';
                // }
                // if (textStyle?.ul) {
                //     style += 'text-decoration: underline';
                // }

                if (textStyle) {
                    style = handleStyleToString(textStyle);
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
                const maxConfig = self._configService.getConfig<number>(workbookId_, 'maxCellsPerSheet');
                const { endRow, endColumn } = range;
                if (maxConfig && endRow * endColumn > maxConfig) {
                    self._messageService.show({
                        type: MessageType.Error,
                        content: self._localService.t('clipboard.paste.exceedMaxCells'),
                    }); // TODO: show error info
                    return false;
                }

                return true;
            },

            onPasteRows(range, rowProperties) {
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxRow = currentSheet!.getMaxRows();
                const addingRowsCount = range.endRow - maxRow;
                const existingRowsCount = rowProperties.length - addingRowsCount;
                if (addingRowsCount > 0) {
                    const rowInfo = new ObjectArray<IRowData>();
                    rowProperties.slice(existingRowsCount).forEach((property, index) => {
                        const style = property.style;
                        const cssTextArray = style.split(';');
                        let height = DEFAULT_WORKSHEET_ROW_HEIGHT;

                        cssTextArray.find((css) => {
                            css = css.toLowerCase();
                            const key = textTrim(css.substr(0, css.indexOf(':')));
                            const value = textTrim(css.substr(css.indexOf(':') + 1));
                            if (key === 'height') {
                                height = parseFloat(value);
                                return true;
                            }
                            return false;
                        });

                        rowInfo.set(index, {
                            h: height,
                            hd: BooleanNumber.FALSE,
                        });
                    });

                    const addRowMutation: IInsertRowMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, startRow: maxRow }],
                        rowInfo,
                    };
                    redoMutations.push({
                        id: InsertRowMutation.id,
                        params: addRowMutation,
                    });
                }

                // get row height of existing rows
                // TODO When Excel pasted, there was no width height, Do we still need to set the height?
                const rowHeight = new ObjectArray<number>();
                rowProperties.slice(0, existingRowsCount).forEach((property, index) => {
                    const style = property.style;
                    const cssTextArray = style.split(';');
                    let height = DEFAULT_WORKSHEET_ROW_HEIGHT;

                    cssTextArray.find((css) => {
                        css = css.toLowerCase();
                        const key = textTrim(css.substr(0, css.indexOf(':')));
                        const value = textTrim(css.substr(css.indexOf(':') + 1));
                        if (key === 'height') {
                            height = parseFloat(value);
                            return true;
                        }
                        return false;
                    });

                    rowHeight.set(index, height);
                });

                // apply row properties to the existing rows
                const setRowPropertyMutation: ISetWorksheetRowHeightMutationParams = {
                    workbookId: workbookId!,
                    worksheetId: worksheetId!,
                    ranges: [{ ...range, endRow: Math.min(range.endRow, maxRow) }],
                    rowHeight,
                };
                redoMutations.push({
                    id: SetWorksheetRowHeightMutation.id,
                    params: setRowPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPasteColumns(range, colProperties, pasteType) {
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const addingColsCount = range.endColumn - maxColumn;
                const existingColsCount = colProperties.length - addingColsCount;

                if (pasteType === PASTE_TYPE.COL_WIDTH) {
                    const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, endRow: Math.min(range.endColumn, maxColumn) }],
                        colWidth: new ObjectArray(
                            colProperties
                                .slice(0, existingColsCount)
                                .map((property) => (property.width ? +property.width : DEFAULT_WORKSHEET_COLUMN_WIDTH))
                        ),
                    };
                    redoMutations.push({
                        id: SetWorksheetColWidthMutation.id,
                        params: setColPropertyMutation,
                    });
                } else {
                    if (addingColsCount > 0) {
                        const addColMutation: IInsertColMutationParams = {
                            workbookId: workbookId!,
                            worksheetId: worksheetId!,
                            ranges: [{ ...range, startColumn: maxColumn }],
                            colInfo: new ObjectArray(
                                colProperties.slice(existingColsCount).map((property) => ({
                                    w: property.width ? +property.width : DEFAULT_WORKSHEET_COLUMN_WIDTH,
                                    hd: BooleanNumber.FALSE,
                                }))
                            ),
                        };
                        redoMutations.push({
                            id: InsertColMutation.id,
                            params: addColMutation,
                        });
                    }
                    // apply col properties to the existing rows
                    const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, endRow: Math.min(range.endColumn, maxColumn) }],
                        colWidth: new ObjectArray(
                            colProperties
                                .slice(0, existingColsCount)
                                .map((property) => (property.width ? +property.width : DEFAULT_WORKSHEET_COLUMN_WIDTH))
                        ),
                    };
                    redoMutations.push({
                        id: SetWorksheetColWidthMutation.id,
                        params: setColPropertyMutation,
                    });
                }

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPasteCells(range, matrix, pasteType) {
                return self._onPasteCells(range, matrix, workbookId!, worksheetId!, pasteType);
            },

            onRemoveCutCells(range, workbookId, worksheetId) {
                return self._onRemoveCutCells(range, workbookId, worksheetId);
            },

            onAfterPaste(success) {
                currentSheet = null;
            },
        };
    }

    private _onRemoveCutCells(
        range: IRange,
        workbookId: string,
        worksheetId: string
    ): {
        redos: IMutationInfo[];
        undos: IMutationInfo[];
    } {
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        const workbook = this._currentUniverSheet.getUniverSheetInstance(workbookId);
        const worksheet = workbook?.getSheetBySheetId(worksheetId);
        if (workbook && worksheet) {
            // clear style and content
            const clearMutationParams: ISetRangeValuesMutationParams = {
                worksheetId,
                workbookId,
                cellValue: generateNullCellValue([range]),
            };
            const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
                accessor,
                clearMutationParams
            );

            redos.push({
                id: SetRangeValuesMutation.id,
                params: clearMutationParams,
            });
            undos.push({
                id: SetRangeValuesMutation.id,
                params: undoClearMutationParams,
            });

            // remove merged cells
            let hasMerge = false;
            const mergeData = worksheet.getConfig().mergeData;
            mergeData.forEach((merge) => {
                if (Rectangle.intersects(range, merge)) {
                    hasMerge = true;
                }
            });

            if (hasMerge) {
                const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                    workbookId,
                    worksheetId,
                    ranges: [range],
                };
                const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                    accessor,
                    removeMergeParams
                );

                redos.push({
                    id: RemoveWorksheetMergeMutation.id,
                    params: removeMergeParams,
                });
                undos.push({
                    id: AddWorksheetMergeMutation.id,
                    params: undoRemoveMergeParams,
                });
            }
        }
        return {
            undos,
            redos,
        };
    }

    private _onPasteCells(
        range: IRange,
        matrix: ObjectMatrix<ICellDataWithSpanInfo>,
        workbookId: string,
        worksheetId: string,
        pasteType: PASTE_TYPE
    ): {
        redos: IMutationInfo[];
        undos: IMutationInfo[];
    } {
        // insert cell style, insert cell content and insert merged cell info
        // 1. merged cell
        // 2. raw content
        // 3. cell style

        const { startColumn, startRow, endColumn, endRow } = range;
        const valueMatrix = new ObjectMatrix<ICellData>();
        const clearStyleMatrix = new ObjectMatrix<ICellData>();
        const mergeRangeData: IRange[] = [];
        const redoMutationsInfo: IMutationInfo[] = [];
        const undoMutationsInfo: IMutationInfo[] = [];
        let hasMerge = false;
        if (pasteType === PASTE_TYPE.COL_WIDTH) {
            return { redos: [], undos: [] };
        }

        // TODO@Dushusir: undo selection
        matrix.forValue((row, col, value) => {
            // NOTE: When pasting, the original cell may contain a default style that is not explicitly carried, resulting in the failure to overwrite the style of the target cell.
            // If the original cell has a style (lack of other default styles) or is undefined (all default styles), we need to clear the existing styles in the target area
            // If the original cell style is "", it is to handle the situation where the target area contains merged cells. The style is not overwritten, only the value is overwritten. There is no need to clear the existing style of the target area.
            if (value.s) {
                clearStyleMatrix.setValue(row + startRow, col + startColumn, { s: null });
            }

            if (pasteType === PASTE_TYPE.VALUE) {
                valueMatrix.setValue(row + startRow, col + startColumn, {
                    v: value.v,
                });
            } else if (pasteType === PASTE_TYPE.FORMAT) {
                valueMatrix.setValue(row + startRow, col + startColumn, {
                    s: value.s,
                });
                // rowspan and colspan to merge data
                if (value.rowSpan) {
                    const colSpan = value.colSpan || 1;
                    const mergeRange = {
                        startRow: startRow + row,
                        endRow: startRow + row + value.rowSpan - 1,
                        startColumn: startColumn + col,
                        endColumn: startColumn + col + colSpan - 1,
                    };
                    mergeRangeData.push(mergeRange);
                    hasMerge = true;
                } else if (value.colSpan) {
                    const rowSpan = value.rowSpan || 1;
                    const mergeRange = {
                        startRow: startRow + row,
                        endRow: startRow + row + rowSpan - 1,
                        startColumn: startColumn + col,
                        endColumn: startColumn + col + value.colSpan - 1,
                    };
                    mergeRangeData.push(mergeRange);
                    hasMerge = true;
                }
            } else if (pasteType === PASTE_TYPE.BESIDES_BORDER) {
                const style = value.s;
                if (typeof style === 'object')
                    valueMatrix.setValue(row + startRow, col + startColumn, {
                        s: { ...style, bd: undefined },
                        v: value.v,
                    });
                // rowspan and colspan to merge data
                if (value.rowSpan) {
                    const colSpan = value.colSpan || 1;
                    const mergeRange = {
                        startRow: startRow + row,
                        endRow: startRow + row + value.rowSpan - 1,
                        startColumn: startColumn + col,
                        endColumn: startColumn + col + colSpan - 1,
                    };
                    mergeRangeData.push(mergeRange);
                    hasMerge = true;
                } else if (value.colSpan) {
                    const rowSpan = value.rowSpan || 1;
                    const mergeRange = {
                        startRow: startRow + row,
                        endRow: startRow + row + rowSpan - 1,
                        startColumn: startColumn + col,
                        endColumn: startColumn + col + value.colSpan - 1,
                    };
                    mergeRangeData.push(mergeRange);
                    hasMerge = true;
                }
            } else {
                valueMatrix.setValue(row + startRow, col + startColumn, {
                    v: value.v,
                    s: value.s,
                });

                // rowspan and colspan to merge data
                if (value.rowSpan) {
                    const colSpan = value.colSpan || 1;
                    const mergeRange = {
                        startRow: startRow + row,
                        endRow: startRow + row + value.rowSpan - 1,
                        startColumn: startColumn + col,
                        endColumn: startColumn + col + colSpan - 1,
                    };
                    mergeRangeData.push(mergeRange);
                    hasMerge = true;
                } else if (value.colSpan) {
                    const rowSpan = value.rowSpan || 1;
                    const mergeRange = {
                        startRow: startRow + row,
                        endRow: startRow + row + rowSpan - 1,
                        startColumn: startColumn + col,
                        endColumn: startColumn + col + value.colSpan - 1,
                    };
                    mergeRangeData.push(mergeRange);
                    hasMerge = true;
                }
            }
        });

        const accessor = {
            get: this._injector.get.bind(this._injector),
        };

        // clear style
        if (clearStyleMatrix.getLength() > 0) {
            const clearMutation: ISetRangeValuesMutationParams = {
                worksheetId,
                workbookId,
                cellValue: clearStyleMatrix.getData(),
            };
            redoMutationsInfo.push({
                id: SetRangeValuesMutation.id,
                params: clearMutation,
            });

            // undo
            const undoClearMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
                accessor,
                clearMutation
            );

            undoMutationsInfo.push({
                id: SetRangeValuesMutation.id,
                params: undoClearMutation,
            });
        }

        // set cell value and style
        const setValuesMutation: ISetRangeValuesMutationParams = {
            workbookId,
            worksheetId,
            cellValue: valueMatrix.getData(),
        };

        redoMutationsInfo.push({
            id: SetRangeValuesMutation.id,
            params: setValuesMutation,
        });

        // undo
        const undoSetValuesMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setValuesMutation
        );

        undoMutationsInfo.push({
            id: SetRangeValuesMutation.id,
            params: undoSetValuesMutation,
        });

        // remove current range's all merged Cell
        if (hasMerge) {
            // get all merged cells
            const mergeData = this._getWorksheet(workbookId, worksheetId).getMergeData();
            const mergedCellsInRange = mergeData.filter((rect) =>
                Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect)
            );

            const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
                workbookId,
                worksheetId,
                ranges: mergedCellsInRange,
            };
            redoMutationsInfo.push({
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeMutationParams,
            });

            const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                accessor,
                removeMergeMutationParams
            );

            undoMutationsInfo.push({
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeMutationParams,
            });
        }

        // set merged cell info
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergeRangeData,
        };
        redoMutationsInfo.push({
            id: AddWorksheetMergeMutation.id,
            params: addMergeMutationParams,
        });

        // undo
        const undoAddMergeMutation: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            accessor,
            addMergeMutationParams
        );

        undoMutationsInfo.push({
            id: RemoveWorksheetMergeMutation.id,
            params: undoAddMergeMutation,
        });

        // set selection
        const worksheet = this._getWorksheet(workbookId, worksheetId);
        // const destinationRange = {
        //     startRow,
        //     endRow: range.endRow - 1,
        //     startColumn,
        //     endColumn: range.endColumn - 1,
        // };
        const primaryCell = {
            startRow,
            endRow: startRow,
            startColumn,
            endColumn: startColumn,
        };

        const primary = getPrimaryForRange(primaryCell, worksheet);

        const mainCell = matrix.getValue(0, 0);
        const rowSpan = mainCell?.rowSpan || 1;
        const colSpan = mainCell?.colSpan || 1;

        if (rowSpan > 1 || colSpan > 1) {
            const mergeRange = {
                startRow,
                endRow: startRow + rowSpan - 1,
                startColumn,
                endColumn: startColumn + colSpan - 1,
            };

            primary.startRow = mergeRange.startRow;
            primary.endRow = mergeRange.endRow;
            primary.startColumn = mergeRange.startColumn;
            primary.endColumn = mergeRange.endColumn;

            primary.isMerged = true;
            primary.isMergedMainCell = true;
        }

        // selection does not require undo
        const setSelectionsParam: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range, primary, style: null }],
        };
        redoMutationsInfo.push({
            id: SetSelectionsOperation.id,
            params: setSelectionsParam,
        });

        return {
            redos: redoMutationsInfo,
            undos: undoMutationsInfo,
        };
    }

    private _getWorksheet(workbookId: string, worksheetId: string): Worksheet {
        const worksheet = this._currentUniverSheet.getUniverSheetInstance(workbookId)?.getSheetBySheetId(worksheetId);

        if (!worksheet) {
            throw new Error(
                `[SheetClipboardController]: cannot find a worksheet with workbookId ${workbookId} and worksheetId ${worksheetId}.`
            );
        }

        return worksheet;
    }
}

// Generate cellValue from range and set null
function generateNullCellValue(range: IRange[]): ObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, null);
            }
        }
    });

    return cellValue.getData();
}
