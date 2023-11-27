import { IRenderManagerService } from '@univerjs/base-render';
import { ISetRangeValuesMutationParams, SelectionManagerService, SetRangeValuesMutation } from '@univerjs/base-sheets';
import {
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/base-ui';
import {
    Disposable,
    ICellData,
    ICommandService,
    ILogService,
    IMutationInfo,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Rectangle,
    ThemeService,
    toDisposable,
    Tools,
    Worksheet,
} from '@univerjs/core';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';

import { IMarkSelectionService } from '../mark-selection/mark-selection.service';
import { ISelectionRenderService } from '../selection/selection-render.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { copyContentCache, extractId, genId } from './copy-content-cache';
import { HtmlToUSMService } from './html-to-usm/converter';
import {
    COPY_TYPE,
    ICellDataWithSpanInfo,
    IPasteSource,
    IPasteTarget,
    ISheetClipboardHook,
    IUniverSheetCopyDataModel,
    PASTE_TYPE,
} from './type';
import { USMToHtmlService } from './usm-to-html/convertor';

/**
 * This service provide hooks for sheet features to supplement content or modify behavior of clipboard.
 */
export interface ISheetClipboardService {
    copy(): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(item: ClipboardItem, pasteType?: PASTE_TYPE): Promise<boolean>;

    addClipboardHook(hook: ISheetClipboardHook): IDisposable;
}

export const ISheetClipboardService = createIdentifier<ISheetClipboardService>('sheet.clipboard-service');

export class SheetClipboardService extends Disposable implements ISheetClipboardService {
    private _clipboardHooks: ISheetClipboardHook[] = [];
    private _htmlToUSM = new HtmlToUSMService();
    private _usmToHtml = new USMToHtmlService();
    private _copyMarkId: string | null = null;
    private _pasteType = PASTE_TYPE.DEFAULT;

    constructor(
        @ILogService private readonly _logService: ILogService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService
    ) {
        super();
    }

    async copy(copyType = COPY_TYPE.COPY): Promise<boolean> {
        // 1. get the selected range, the range should be the last one of selected ranges
        const selection = this._selectionManagerService.getLast();
        if (!selection) {
            return false; // maybe we should notify user that there is no selection
        }

        // 2. get filtered out rows those are filtered out by plugins (e.g. filter feature)
        const hooks = this._clipboardHooks;
        const filteredRows = hooks.reduce((acc, cur) => {
            const rows = cur.getFilteredOutRows?.();
            rows?.forEach((r) => acc.add(r));
            return acc;
        }, new Set<number>());

        // 3. calculate selection matrix, span cells would only - maybe warn uses that cells are too may in the future
        const { startColumn, startRow, endColumn, endRow } = selection.range;
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const matrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);
        const matrixFragment = matrix.getFragments(startRow, endRow, startColumn, endColumn);

        // 4. use filteredRows into to remove rows for the matrix
        // TODO: filtering

        // tell hooks to get ready for copying
        hooks.forEach((h) => h.onBeforeCopy?.(workbook.getUnitId(), worksheet.getSheetId(), selection.range));

        // 5. convert matrix to html
        let html = this._usmToHtml.convert(matrix, selection.range, hooks);

        const plain = getMatrixPlainText(matrixFragment);
        // 6. cache inner copy content
        const copyId = genId();
        html = html.replace(/(<[a-z]+)/, (_p0, p1) => `${p1} data-copy-id="${copyId}"`);

        // 7. cache the copy content for internal paste
        copyContentCache.set(copyId, {
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            range: selection.range,
            matrix: matrixFragment,
            copyType,
        });

        // 8. write html and get plain text info the clipboard interface
        await this._clipboardInterfaceService.write(plain, html);

        // 9. mark the copy range
        const style = this._selectionManagerService.createCopyPasteSelection();
        this._copyMarkId = this._markSelectionService.addShape({ ...selection, style });

        // tell hooks to clean up
        hooks.forEach((h) => h.onAfterCopy?.());

        return true;
    }

    async cut(): Promise<boolean> {
        return this.copy(COPY_TYPE.CUT);
    }

    async paste(item: ClipboardItem, pasteType: PASTE_TYPE): Promise<boolean> {
        const types = item.types;
        const text =
            types.indexOf(PLAIN_TEXT_CLIPBOARD_MIME_TYPE) !== -1
                ? await item.getType(PLAIN_TEXT_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                : '';
        const html =
            types.indexOf(HTML_CLIPBOARD_MIME_TYPE) !== -1
                ? await item.getType(HTML_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                : '';

        if (html && isLegalSpreadsheetHTMLContent(html)) {
            // Firstly see if the html content is in good format.
            // In another word, if it is copied from any spreadsheet apps (including Univer itself).
            return this._pasteHTML(html, pasteType);
        }

        if (text) {
            return this._pastePlainText(text);
        }

        this._logService.error('[SheetClipboardService]', 'No valid data on clipboard');

        return false;
    }

    addClipboardHook(hook: ISheetClipboardHook): IDisposable {
        this._clipboardHooks.push(hook);
        return toDisposable(() => {
            const index = this._clipboardHooks.indexOf(hook);
            if (index > -1) {
                this._clipboardHooks.splice(index, 1);
            }
        });
    }

    private async _pastePlainText(text: string): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting plain text content.', text);

        // TODO: maybe we should support pasting rich text values here? That is not supported yet.
        const target = this._getPastingTarget();
        if (!target.selection) {
            return false;
        }

        const range = target.selection.range;
        const cellValue: ObjectMatrixPrimitiveType<ICellData> = {
            [range.startRow]: {
                [range.endColumn]: {
                    v: text,
                },
            },
        };

        const setRangeValuesParams: ISetRangeValuesMutationParams = {
            workbookId: target.workbookId,
            worksheetId: target.worksheetId,
            cellValue,
        };

        const result = this._commandService.syncExecuteCommand(SetRangeValuesMutation.id, setRangeValuesParams);
        return result;
    }

    private async _pasteHTML(html: string, pasteType = PASTE_TYPE.DEFAULT): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting html content', html);

        const copyId = extractId(html);

        if (copyId) {
            return this._pasteInternal(copyId, pasteType);
        }
        return this._pasteExternal(html, pasteType);
    }

    private async _pasteExternal(html: string, pasteType = PASTE_TYPE.DEFAULT): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting external content', html);

        // steps of pasting:
        const target = this._getPastingTarget();
        const { selection, workbookId, worksheetId } = target;
        if (!selection) {
            return false;
        }

        // 1. get properties of the table by parsing raw html content, including col properties / row properties
        // cell properties and cell contents.
        const { rowProperties, colProperties, cellMatrix } = this._htmlToUSM.convert(html);
        const { startColumn, endColumn, startRow, endRow } = cellMatrix.getDataRange();
        const rowCount = endRow - startRow + 1;
        const colCount = endColumn - startColumn + 1;
        if (!cellMatrix) {
            return false;
        }

        // 2. get filtered rows in the target pasting area and get the final pasting matrix
        // we also handle transpose pasting at this step
        // note: handle transpose before filtering
        // matrix before adjustment -> transpose -> filtering -> matrix under adjustment
        // TODO: not implemented yet

        // 3. call hooks with cell position and properties and get mutations (both do mutations and undo mutations)
        // we also handle 'copy value only' or 'copy style only' as this step
        const pastedRange = this._transformPastedData(rowCount, colCount, cellMatrix, selection.range);

        // pastedRange.endColumn = pastedRange.startColumn + colCount;
        // pastedRange.endRow = pastedRange.startRow + rowCount;

        // If PastedRange is null, it means that the paste fails
        if (!pastedRange) {
            return false;
        }

        // 4. execute these mutations by the one method
        return this._pasteUSM(
            {
                rowProperties,
                colProperties,
                cellMatrix,
            },
            {
                workbookId,
                worksheetId,
                pastedRange,
            },
            undefined,
            pasteType
        );
    }

    private async _pasteInternal(copyId: string, pasteType = PASTE_TYPE.DEFAULT): Promise<boolean> {
        const target = this._getPastingTarget();
        const { selection, workbookId, worksheetId } = target;
        const cachedData = copyContentCache.get(copyId);
        const { range, matrix: cellMatrix } = cachedData || {};
        if (!selection || !cellMatrix || !cachedData || !range) {
            return false;
        }

        if (!selection || !cellMatrix || !cachedData) {
            return false;
        }

        const styles = this._currentUniverService.getUniverSheetInstance(workbookId)?.getStyles();
        cellMatrix.forValue((row, col, value) => {
            if (typeof value.s === 'string') {
                const newValue = Tools.deepClone(value);
                newValue.s = styles?.getStyleByCell(value);
                cellMatrix.setValue(row, col, newValue);
            }
        });

        const { startColumn, endColumn, startRow, endRow } = cellMatrix.getDataRange();
        const pastedRange = this._transformPastedData(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            cellMatrix,
            selection.range
        );

        if (!pastedRange) {
            return false;
        }

        const pasteRes = this._pasteUSM(
            { cellMatrix }, // paste data
            {
                workbookId, // paste target
                worksheetId,
                pastedRange,
            },
            {
                range, // paste source
                workbookId: cachedData.workbookId,
                worksheetId: cachedData.worksheetId,
                copyType: cachedData.copyType,
                copyId,
            },
            pasteType
        );

        if (cachedData.copyType === COPY_TYPE.CUT) {
            copyContentCache.del(copyId);
        }

        this._copyMarkId && this._markSelectionService.removeShape(this._copyMarkId);
        this._copyMarkId = null;

        return pasteRes;
    }

    private _pasteUSM(
        data: IUniverSheetCopyDataModel,
        target: IPasteTarget,
        source?: IPasteSource,
        pasteType = PASTE_TYPE.DEFAULT
    ): boolean {
        const { rowProperties, colProperties, cellMatrix } = data;
        const { workbookId, worksheetId, pastedRange } = target;
        const { startColumn, endColumn } = pastedRange;
        const colCount = endColumn - startColumn + 1;
        const hooks = this._clipboardHooks;
        const enabledHooks: ISheetClipboardHook[] = [];
        const disableCopying = hooks.some(
            (h) => enabledHooks.push(h) && h.onBeforePaste?.(workbookId, worksheetId, pastedRange) === false
        );
        if (disableCopying) {
            enabledHooks.forEach((h) => h.onAfterPaste?.(false));
            return false;
        }
        if (!cellMatrix) return false;

        const copyInfo = source ? { copyRange: source.range, copyType: source.copyType } : undefined;

        const redoMutationsInfo: IMutationInfo[] = [];
        const undoMutationsInfo: IMutationInfo[] = [];

        hooks.forEach((h) => {
            if (rowProperties) {
                const rowReturn = h.onPasteRows?.(pastedRange, rowProperties, pasteType);
                if (rowReturn) {
                    redoMutationsInfo.push(...rowReturn.redos);
                    undoMutationsInfo.push(...rowReturn.undos);
                }
            }

            const colReturn = h.onPasteColumns?.(
                pastedRange,
                colProperties || new Array(colCount).map(() => ({})),
                pasteType
            );
            if (colReturn) {
                redoMutationsInfo.push(...colReturn.redos);
                undoMutationsInfo.push(...colReturn.undos);
            }

            const contentReturn = h.onPasteCells?.(pastedRange, cellMatrix, pasteType, copyInfo);
            if (contentReturn) {
                redoMutationsInfo.push(...contentReturn.redos);
                undoMutationsInfo.push(...contentReturn.undos);
            }
        });

        this._logService.log('[SheetClipboardService]', 'pasting mutations', {
            undoMutationsInfo,
            redoMutationsInfo,
        });

        const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undoMutationsInfo,
                redoMutations: redoMutationsInfo,
            });
        }

        return result;
    }

    // NOTE: why there are some differences between internal and external pasting?

    private _getPastingTarget() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const selection = this._selectionManagerService.getLast();
        return {
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            selection,
        };
    }

    /**
     * Handles copying one range to another range, obtained by the following rules
     *
     * [Content to be assigned] => [Target range]
     *
     * I. There are no merged cells in the upper left corner of the pasted area
     *
     * 1. 1 -> 1: 1 => 1
     * 2. N -> 1: N => N
     * 3. 1 -> N: N => N
     * 4. N1 -> N2:
     *     1) N1 <N2: If N2 is a multiple of N1 (X), N1 * X => N2; If not, N1 => N1 (refer to office excel, different from google sheet)
     *     2) N1> N2: N1 => N1
     *
     * The above four cases can be combined and processed as
     *
     * Case 1, 1/2/4-2 merged into N1 => N1
     * Case 2, 3/4-1 merge into N1 * X => N2 or Case 1
     *
     * In the end we only need to judge whether N2 is a multiple of N1
     *
     * II. The pasted area contains merged cells
     *
     * 1. If N2 is a multiple of N1,
     *   1) If N2 === N1, paste this area directly and the range remains unchanged.
     *   2) Otherwise, determine whether other cells are included
     *     1] If included, tile, the range remains unchanged
     *     2] If not included, determine whether the source data is a combined cell
     *       1} If yes, tile, the range remains unchanged
     *       2} If not, only the content will be pasted, the original style will be discarded, and the scope will remain unchanged.
     *
     * 2. If N2 is not a multiple of N1, determine whether the upper left corner cell (merged or non-merged or combined) is consistent with the size of the original data.
     *   1) If consistent, only paste this area;
     *   2) If inconsistent, then determine whether the pasted area contains other cells.
     *     1] If yes, pasting is not allowed and an error will pop up;
     *     2] If not, only the content will be pasted and the original style will be discarded.
     *
     * @param rowCount
     * @param colCount
     * @param cellMatrix
     * @param range
     */
    private _transformPastedData(
        rowCount: number,
        colCount: number,
        cellMatrix: ObjectMatrix<ICellDataWithSpanInfo>,
        range: IRange
    ): IRange | null {
        const { startRow, startColumn, endRow, endColumn } = range;
        const destinationRows = endRow - startRow + 1;
        const destinationColumns = endColumn - startColumn + 1;

        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        // const mergedRange = worksheet.getMergedCell(startRow, startColumn);
        const mergeData = worksheet.getMergeData();
        // get all merged cells
        const mergedCellsInRange = mergeData.filter((rect) =>
            Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect)
        );
        const mergedRange = mergedCellsInRange[0];

        let mergedRangeStartRow = 0;
        let mergedRangeStartColumn = 0;
        let mergedRangeEndRow = 0;
        let mergedRangeEndColumn = 0;
        if (mergedRange) {
            mergedRangeStartRow = mergedRange.startRow;
            mergedRangeStartColumn = mergedRange.startColumn;
            mergedRangeEndRow = mergedRange.endRow;
            mergedRangeEndColumn = mergedRange.endColumn;
        }

        // judge whether N2 is a multiple of N1
        if (destinationRows % rowCount === 0 && destinationColumns % colCount === 0) {
            // N2 !== N1
            if (mergedCellsInRange.length > 0 && (destinationRows !== rowCount || destinationColumns !== colCount)) {
                // Only merged cells, not other cells
                if (
                    mergedRangeStartRow === startRow &&
                    mergedRangeStartColumn === startColumn &&
                    mergedRangeEndRow === endRow &&
                    mergedRangeEndColumn === endColumn
                ) {
                    const isMultiple = isMultipleCells(cellMatrix);
                    if (isMultiple) {
                        for (let r = 0; r < destinationRows; r++) {
                            for (let c = 0; c < destinationColumns; c++) {
                                const cell = cellMatrix.getValue(r % rowCount, c % colCount);
                                cell && cellMatrix.setValue(r, c, cell);
                            }
                        }
                    } else {
                        cellMatrix.forValue((row, col, cell) => {
                            cell.s = null;
                            delete cell.colSpan;
                            delete cell.rowSpan;
                        });
                    }
                } else {
                    for (let r = 0; r < destinationRows; r++) {
                        for (let c = 0; c < destinationColumns; c++) {
                            const cell = cellMatrix.getValue(r % rowCount, c % colCount);
                            cell && cellMatrix.setValue(r, c, cell);
                        }
                    }
                }
            } else {
                /**
                 * Expand cellMatrix content according to the destination size
                 * A1,B1  =>  A1,B1,C1,D1
                 * A2,B2      A2,B2,C2,D2
                 *            A3,B3,C3,D3
                 *            A4,B4,C4,D4
                 */
                for (let r = 0; r < destinationRows; r++) {
                    for (let c = 0; c < destinationColumns; c++) {
                        const cell = cellMatrix.getValue(r % rowCount, c % colCount);
                        cell && cellMatrix.setValue(r, c, cell);
                    }
                }
            }
        } else if (mergedCellsInRange.length > 0) {
            const isMatch = this._topLeftCellsMatch(rowCount, colCount, range);
            if (isMatch) {
                // Expand or shrink the destination to the same size as the original range
                range.endRow = startRow + rowCount - 1;
                range.endColumn = startColumn + colCount - 1;
            } else if (endRow > mergedRange.endRow || endColumn > mergedRange.endColumn) {
                // TODO@Dushusir: use dialog component
                alert("We can't do that to a merged cell ");
                return null;
            } else {
                cellMatrix.forValue((row, col, cell) => {
                    cell.s = null;
                    delete cell.colSpan;
                    delete cell.rowSpan;
                });
            }
        } else {
            // Expand or shrink the destination to the same size as the original range
            range.endRow = startRow + rowCount - 1;
            range.endColumn = startColumn + colCount - 1;
        }

        return range;
    }

    /**
     * Determine whether the cells starting from the upper left corner of the range (merged or non-merged or combined) are consistent with the size of the original data
     * @param cellMatrix
     * @param range
     */
    private _topLeftCellsMatch(rowCount: number, colCount: number, range: IRange): boolean {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const { startRow, startColumn, endRow, endColumn } = range;

        const isRowAcross = rowAcrossMergedCell(
            startRow + rowCount - 1,
            startColumn,
            startColumn + rowCount - 1,
            worksheet
        );
        const isColAcross = columnAcrossMergedCell(
            startColumn + colCount - 1,
            startRow,
            startRow + rowCount - 1,
            worksheet
        );

        return !isRowAcross && !isColAcross;
    }
}

// #region paste parsing

// #endregion

// #region copy generation

/**
 *
 * @param matrix
 * @param cols
 * @param hooks
 */
function getTableContent(matrix: number[][], cols: number[], hooks: ISheetClipboardHook[]) {}

function getSingleCellContent() {}

function getMatrixPlainText(matrix: ObjectMatrix<ICellDataWithSpanInfo>) {
    let plain = '';
    matrix.forRow((row, cols) => {
        const arr: string[] = [];
        cols.forEach((col) => {
            const cell = matrix.getValue(row, col);
            if (cell) {
                const cellText = getCellTextForClipboard(cell);
                arr.push(cellText);
            }
        });
        plain += arr.join('\t');
        if (row !== matrix.getLength() - 1) {
            plain += '\n';
        }
    });

    return plain;
}

function getCellTextForClipboard(cell: ICellDataWithSpanInfo) {
    const formatValue = cell.v;
    return escapeSpecialCode(formatValue?.toString() || '');
}

export const escapeSpecialCode = (cellStr: string) =>
    cellStr
        .replace(/&/g, '&amp;')
        .replace(/\ufeff/g, '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

function rowAcrossMergedCell(row: number, startColumn: number, endColumn: number, worksheet: Worksheet): boolean {
    return worksheet
        .getMergeData()
        .some(
            (mergedCell) =>
                mergedCell.startRow <= row &&
                row < mergedCell.endRow &&
                startColumn <= mergedCell.startColumn &&
                mergedCell.startColumn <= endColumn
        );
}

function columnAcrossMergedCell(col: number, startRow: number, endRow: number, worksheet: Worksheet): boolean {
    return worksheet
        .getMergeData()
        .some(
            (mergedCell) =>
                mergedCell.startColumn <= col &&
                col < mergedCell.endColumn &&
                startRow <= mergedCell.startRow &&
                mergedCell.startRow <= endRow
        );
}

/**
 * Determine whether CellMatrix consists of multiple cells, it must consist of 2 or more cells. It can be an ordinary cell or merge cell
 * @param cellMatrix
 */
function isMultipleCells(cellMatrix: ObjectMatrix<ICellDataWithSpanInfo>): boolean {
    let count = 0;
    cellMatrix.forValue((row, col, cell) => {
        if (cell) {
            count++;
        }

        if (count > 1) {
            return false;
        }
    });
    return count > 1;
}

// #endregion

function isLegalSpreadsheetHTMLContent(html: string): boolean {
    return html.indexOf('<table') !== -1; // NOTE: This is just a temporary implementation. Definitely would be changed later.
}
