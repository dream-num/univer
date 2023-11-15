import { ISetRangeValuesMutationParams, SelectionManagerService, SetRangeValuesMutation } from '@univerjs/base-sheets';
import {
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/base-ui';
import {
    Disposable,
    ICellData,
    ICommandInfo,
    ICommandService,
    ILogService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Rectangle,
    toDisposable,
    Worksheet,
} from '@univerjs/core';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';

export type ICellDataWithSpanInfo = ICellData & { rowSpan?: number; colSpan?: number };

export interface IClipboardPropertyItem {
    [key: string]: string;
}

export interface IParsedCellValue {
    rowSpan?: number;
    colSpan?: number;
    properties: IClipboardPropertyItem;
    content: string;
}

/**
 * `ClipboardHook` could:
 * 1. Before copy/cut/paste, decide whether to execute the command and prepare caches if necessary.
 * 1. When copying, decide what content could be written into clipboard.
 * 1. When pasting, get access to the clipboard content and append mutations to the paste command.
 */
export interface ISheetClipboardHook {
    priority?: number;

    /**
     * The callback would be called after the clipboard service has decided what region need to be copied.
     * Features could use this hook to build copying cache or any other pre-copy jobs.
     */
    onBeforeCopy?(workbookId: string, worksheetId: string, range: IRange): void;
    /**
     *
     * @param row
     * @param col
     * @return content
     */
    onCopyCellContent?(row: number, col: number): string;
    /**
     * Properties that would be appended to the td element.
     *
     * @deprecated should be merged with `onCopyCellContent` to `onCopyCell`
     * @param row row of the the copied cell
     * @param col col of the the copied cell
     */
    onCopyCellStyle?(row: number, col: number, rowSpan?: number, colSpan?: number): IClipboardPropertyItem | null;
    /**
     * Properties that would be appended to the tr element.
     * @param row each row of the the copied range
     */
    onCopyRow?(row: number): IClipboardPropertyItem | null;
    /**
     * Properties that would be appended to the col element.
     * @param col each col of the copied range
     */
    onCopyColumn?(col: number): IClipboardPropertyItem | null;
    /**
     * Would be called after copy content has been written into clipboard.
     * Features could do some cleaning up jobs here.
     */
    onAfterCopy?(): void;

    // We do not need cut hooks. We could just use copy hooks to do the same thing,
    // and tell paste hooks that the source is from a cut command.

    // Unlike copy hooks, paste hooks would be called **only once each** because features would do batch mutations.

    /**
     * The callback would be called after the clipboard service has decided what region need to be pasted.
     * Features could use this hook to build copying cache or any other pre-copy jobs.
     *
     * @returns if it block copying it should return false
     */
    onBeforePaste?(workbookId: string, worksheetId: string, range: IRange): boolean;
    /**
     *
     * @param row
     * @param col
     */
    onPasteCells?(
        range: IRange,
        matrix: ObjectMatrix<IParsedCellValue>
    ): {
        undos: ICommandInfo[];
        redos: ICommandInfo[];
    };
    onPasteRows?(
        range: IRange,
        rowProperties: IClipboardPropertyItem[]
    ): {
        undos: ICommandInfo[];
        redos: ICommandInfo[];
    };
    onPasteColumns?(
        range: IRange,
        colProperties: IClipboardPropertyItem[]
    ): {
        undos: ICommandInfo[];
        redos: ICommandInfo[];
    };
    onAfterPaste?(success: boolean): void;

    /**
     * The callback would be called before the clipboard service decides what region need to be copied from or pasted to.
     * It would jump over these filtered rows when copying or pasting.
     */
    getFilteredOutRows?(): number[];
}

/**
 * This service provide hooks for sheet features to supplement content or modify behavior of clipboard.
 */
export interface ISheetClipboardService {
    copy(): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(item: ClipboardItem): Promise<boolean>;

    addClipboardHook(hook: ISheetClipboardHook): IDisposable;
}

export const ISheetClipboardService = createIdentifier<ISheetClipboardService>('sheet.clipboard-service');

export class SheetClipboardService extends Disposable implements ISheetClipboardService {
    private _clipboardHooks: ISheetClipboardHook[] = [];

    constructor(
        @ILogService private readonly _logService: ILogService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    async copy(): Promise<boolean> {
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

        // 4. use filteredRows into to remove rows for the matrix
        // TODO: filtering

        // tell hooks to get ready for copying
        hooks.forEach((h) => h.onBeforeCopy?.(workbook.getUnitId(), worksheet.getSheetId(), selection.range));

        // 5. generate html and pure text contents by calling all clipboard hooks
        // col styles
        const colStyles = getColStyle(getArrayFromTo(startColumn, endColumn), hooks);
        // row styles and table contents
        const rowContents: string[] = [];

        matrix.forRow((row, cols) => {
            // TODO: cols here should filtered out those in span cells
            rowContents.push(getRowContent(row, cols, hooks, matrix));
        });

        const html = `<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none">${colStyles}
<tbody>${rowContents.join('')}</tbody></table>`;

        // TODO: plain text copying is not implemented yet
        // 6. write html and get plain text info the clipboard interface
        await this._clipboardInterfaceService.write('TODO: plain text copy is not implemented', html);

        // tell hooks to clean up
        hooks.forEach((h) => h.onAfterCopy?.());

        return true;
    }

    async cut(): Promise<boolean> {
        // TODO: pretty the same as `copy` but we should mark the cutting area and highlight it with a selection
        return true;
    }

    async paste(item: ClipboardItem): Promise<boolean> {
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
            return this._pasteHTML(html);
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

    private async _pasteHTML(html: string): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting html content', html);

        // TODO: support internal pasting
        if (true) {
            return this._pasteExternal(html);
        }

        return this._pasteInternal();
    }

    private async _pasteExternal(html: string): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting external content', html);

        // steps of pasting:
        const target = this._getPastingTarget();
        const { selection, workbookId, worksheetId } = target;
        if (!selection) {
            return false;
        }

        // 1. get properties of the table by parsing raw html content, including col properties / row properties
        // cell properties and cell contents.
        const colProperties = parseColGroup(html);
        const { rowProperties, rowCount, colCount, cellMatrix } = parseTableRows(html);
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

        const hooks = this._clipboardHooks;
        const enabledHooks: ISheetClipboardHook[] = [];
        const disableCopying = hooks.some(
            (h) => enabledHooks.push(h) && h.onBeforePaste?.(workbookId, worksheetId, pastedRange) === false
        );
        if (disableCopying) {
            enabledHooks.forEach((h) => h.onAfterPaste?.(false));
            return false;
        }

        const redoMutationsInfo: ICommandInfo[] = [];
        const undoMutationsInfo: ICommandInfo[] = [];

        hooks.forEach((h) => {
            const rowReturn = h.onPasteRows?.(pastedRange, rowProperties);
            if (rowReturn) {
                redoMutationsInfo.push(...rowReturn.redos);
                undoMutationsInfo.push(...rowReturn.undos);
            }

            const colReturn = h.onPasteColumns?.(pastedRange, colProperties || new Array(colCount).map(() => ({})));
            if (colReturn) {
                redoMutationsInfo.push(...colReturn.redos);
                undoMutationsInfo.push(...colReturn.undos);
            }

            const contentReturn = h.onPasteCells?.(pastedRange, cellMatrix);
            if (contentReturn) {
                redoMutationsInfo.push(...contentReturn.redos);
                undoMutationsInfo.push(...contentReturn.undos);
            }
        });

        // 4. execute these mutations
        this._logService.log('[SheetClipboardService]', 'pasting mutations', {
            undoMutationsInfo,
            redoMutationsInfo,
        });

        const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
        }

        return result;
    }

    private async _pasteInternal(): Promise<boolean> {
        // internal pasting is pretty much like `_pasteExternal`
        return true;
        // NOTE: if the source is from a cut command, we should invoke a move mutation instead
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
        cellMatrix: ObjectMatrix<IParsedCellValue>,
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
                            cell.properties.style = '';
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
                    cell.properties.style = '';
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

/**
 * Parse columns and their properties from colgroup element.
 *
 * @param raw content
 * @returns cols and their properties
 */
function parseColGroup(raw: string): IClipboardPropertyItem[] | null {
    const COLGROUP_TAG_REGEX = /<colgroup([\s\S]*?)>(.*?)<\/colgroup>/;
    const colgroupMatch = raw.match(COLGROUP_TAG_REGEX);
    if (!colgroupMatch || !colgroupMatch[2]) {
        return null;
    }

    const COL_TAG_REGEX = /<col([\s\S]*?)>/g;
    const colMatches = colgroupMatch[2].matchAll(COL_TAG_REGEX);
    if (!colMatches) {
        return null;
    }

    return Array.from(colMatches).map((colMatch) => parseProperties(colMatch[1]));
}

/**
 * This function parses <tr> elements in the table. So it would return several things.
 * @param html raw content
 * @returns
 */
function parseTableRows(html: string): {
    rowProperties: IClipboardPropertyItem[];
    rowCount: number;
    colCount: number;
    cellMatrix: ObjectMatrix<IParsedCellValue> | null;
} {
    const ROWS_REGEX = /<tr([\s\S]*?)>([\s\S]*?)<\/tr>/gi;
    const rowMatches = html.matchAll(ROWS_REGEX);
    if (!rowMatches) {
        return {
            rowProperties: [],
            rowCount: 0,
            colCount: 0,
            cellMatrix: null,
        };
    }

    const rowMatchesAsArray = Array.from(rowMatches);
    const rowProperties = rowMatchesAsArray.map((rowMatch) => parseProperties(rowMatch[1]));

    const { colCount, cellMatrix } = parseTableCells(rowMatchesAsArray.map((rowMatch) => rowMatch[2]));

    return {
        rowProperties,
        rowCount: rowProperties.length,
        colCount,
        cellMatrix,
    };
}

/**
 *
 * @param tdStrings
 */
function parseTableCells(tdStrings: string[]) {
    const cellMatrix = new ObjectMatrix<IParsedCellValue>();
    const maxRowOfCol = new Map<number, number>();
    const TDS_REGEX = /<td([\s\S]*?)>([\s\S]*?)<\/td>/gi;

    let colCount = 0;
    let colIndex = 0;
    let rowIndex = 0;

    tdStrings.forEach((trStr, r) => {
        const isFirstRow = r === 0;
        const cellMatches = trStr.matchAll(TDS_REGEX);

        colIndex = 0;

        Array.from(cellMatches).forEach((cellMatch) => {
            const cellProperties = parseProperties(cellMatch[1]);
            const content = cellMatch[2].replace(/&nbsp;/g, ' '); // paste from excel
            const rowSpan = cellProperties.rowspan ? +cellProperties.rowspan : 1;
            const colSpan = cellProperties.colspan ? +cellProperties.colspan : 1;

            if (!isFirstRow) {
                for (let i = colIndex; i < colCount; i++) {
                    const thisPosOccupied = maxRowOfCol.get(i)! >= rowIndex;
                    if (!thisPosOccupied) {
                        colIndex = i;
                        break;
                    }
                }
            }

            const value: IParsedCellValue = {
                content,
                properties: cellProperties,
            };
            if (colSpan > 1) value.colSpan = +colSpan;
            if (rowSpan > 1) value.rowSpan = +rowSpan;

            // when iterating the first row, we should calc colCount as well
            if (isFirstRow) {
                colCount += colSpan;
            }

            // update maxRowOfCol
            for (let i = colIndex; i < colIndex + colSpan; i++) {
                maxRowOfCol.set(i, rowIndex + rowSpan - 1);
            }

            // set value to matrix
            cellMatrix.setValue(rowIndex, colIndex, value);

            // point to next colIndex
            colIndex += colSpan;
        });

        rowIndex += 1;
    });

    return {
        colCount,
        cellMatrix,
    };
}

function parseProperties(propertyStr: string): IClipboardPropertyItem {
    if (!propertyStr) {
        return {};
    }

    const PROPERTY_REGEX = /([\w-]+)="([^"]*)"/gi;
    const propertyMatches = propertyStr.matchAll(PROPERTY_REGEX);
    const property: IClipboardPropertyItem = {};
    Array.from(propertyMatches).forEach((m) => {
        const [_, key, val] = m;
        property[key] = val;
    });

    return property;
}

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

/**
 * Get content of a single td element.
 * @param row index of the copied cell
 * @param col index of the copied cell
 * @returns
 */
function getTDContent(
    row: number,
    col: number,
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellDataWithSpanInfo>
) {
    const v = matrix.getValue(row, col);
    const properties = hooks
        .map((hook) => hook.onCopyCellStyle?.(row, col, v?.rowSpan, v?.colSpan))
        .filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const content = hooks.reduce((acc, hook) => acc || hook.onCopyCellContent?.(row, col) || '', '');

    return `<td${str}>${content}</td>`;
}

/**
 *
 * @param row index of the copied row
 * @param cols
 * @param hooks
 * @returns
 */
function getRowContent(
    row: number,
    cols: number[],
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellDataWithSpanInfo>
) {
    const properties = hooks.map((hook) => hook.onCopyRow?.(row)).filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const tds = cols
        .map((col) => getTDContent(row, col, hooks, matrix))
        .filter((v) => !!v)
        .join('');

    return `<tr${str}>${tds}</tr>`;
}

function getColStyle(cols: number[], hooks: ISheetClipboardHook[]) {
    const str = cols
        .map((col) => {
            const properties = hooks
                .map((hook) => hook.onCopyColumn?.(col))
                .filter((v) => !!v) as IClipboardPropertyItem[];
            const mergedProperties = mergeProperties(properties);
            const str = zipClipboardPropertyItemToString(mergedProperties);
            return `<col ${str}>`;
        })
        .join('');

    return `<colgroup>${str}</colgroup>`;
}

function mergeProperties(properties: IClipboardPropertyItem[]): IClipboardPropertyItem {
    return properties.reduce((acc, cur) => {
        const keys = Object.keys(cur);
        keys.forEach((key) => {
            if (!acc[key]) {
                acc[key] = cur[key];
            } else {
                acc[key] += `;${cur[key]}`;
            }
        });
        return acc;
    }, {});
}

function zipClipboardPropertyItemToString(item: IClipboardPropertyItem) {
    return Object.keys(item).reduce((acc, cur) => {
        acc += ` ${cur}="${item[cur]}"`;
        return acc;
    }, '');
}

function getArrayFromTo(f: number, to: number): number[] {
    const arr: number[] = [];
    for (let i = f; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}

function isLegalSpreadsheetHTMLContent(html: string): boolean {
    return html.indexOf('<table') !== -1; // NOTE: This is just a temporary implementation. Definitely would be changed later.
}

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
function isMultipleCells(cellMatrix: ObjectMatrix<IParsedCellValue>): boolean {
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
