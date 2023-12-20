/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellData, IMutationInfo, IObjectMatrixPrimitiveType, IRange, Worksheet } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    ILogService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    toDisposable,
    Tools,
} from '@univerjs/core';
import type { ISetRangeValuesMutationParams, ISetSelectionsOperationParams } from '@univerjs/sheets';
import {
    getPrimaryForRange,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { IMarkSelectionService } from '../mark-selection/mark-selection.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { copyContentCache, extractId, genId } from './copy-content-cache';
import { HtmlToUSMService } from './html-to-usm/converter';
import PastePluginLark from './html-to-usm/paste-plugins/plugin-lark';
import PastePluginWord from './html-to-usm/paste-plugins/plugin-word';
import type {
    ICellDataWithSpanInfo,
    IPasteSource,
    IPasteTarget,
    ISheetClipboardHook,
    IUniverSheetCopyDataModel,
} from './type';
import { COPY_TYPE } from './type';
import { USMToHtmlService } from './usm-to-html/convertor';

export const PREDEFINED_HOOK_NAME = {
    DEFAULT_COPY: 'default-copy',
    DEFAULT_PASTE: 'default-paste',
    SPECIAL_PASTE_VALUE: 'special-paste-value',
    SPECIAL_PASTE_FORMAT: 'special-paste-format',
    SPECIAL_PASTE_COL_WIDTH: 'special-paste-col-width',
    SPECIAL_PASTE_BESIDES_BORDER: 'special-paste-besides-border',
};

/**
 * This service provide hooks for sheet features to supplement content or modify behavior of clipboard.
 */

HtmlToUSMService.use(PastePluginWord);
HtmlToUSMService.use(PastePluginLark);
export interface ISheetClipboardService {
    copy(): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(item: ClipboardItem, pasteType?: string): Promise<boolean>;

    addClipboardHook(hook: ISheetClipboardHook): IDisposable;
    getClipboardHooks(): ISheetClipboardHook[];
}

export const ISheetClipboardService = createIdentifier<ISheetClipboardService>('sheet.clipboard-service');

export class SheetClipboardService extends Disposable implements ISheetClipboardService {
    private _clipboardHooks: ISheetClipboardHook[] = [];
    private readonly _clipboardHooks$ = new BehaviorSubject<ISheetClipboardHook[]>([]);
    readonly clipboardHooks$ = this._clipboardHooks$.asObservable();

    private _htmlToUSM;
    private _usmToHtml;
    private _copyMarkId: string | null = null;
    private _pasteType = PREDEFINED_HOOK_NAME.DEFAULT_PASTE;

    constructor(
        @ILogService private readonly _logService: ILogService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
        this._htmlToUSM = new HtmlToUSMService({
            getCurrentSkeleton: () => this._sheetSkeletonManagerService.getCurrent(),
        });
        this._usmToHtml = new USMToHtmlService();
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
        const matrixFragment = new ObjectMatrix<ICellDataWithSpanInfo>();
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cellData = matrix.getValue(r, c);
                if (cellData) {
                    matrixFragment.setValue(r - startRow, c - startColumn, {
                        ...getEmptyCell(),
                        ...Tools.deepClone(cellData),
                    });
                } else {
                    matrixFragment.setValue(r - startRow, c - startColumn, getEmptyCell());
                }
            }
        }

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
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            range: selection.range,
            matrix: matrixFragment,
            copyType,
        });

        // 8. write html and get plain text info the clipboard interface
        await this._clipboardInterfaceService.write(plain, html);

        // 9. mark the copy range
        this._markSelectionService.removeAllShapes();

        const style = this._selectionManagerService.createCopyPasteSelection();
        this._copyMarkId = this._markSelectionService.addShape({ ...selection, style });

        // tell hooks to clean up
        hooks.forEach((h) => h.onAfterCopy?.());

        return true;
    }

    async cut(): Promise<boolean> {
        return this.copy(COPY_TYPE.CUT);
    }

    async paste(item: ClipboardItem, pasteType = PREDEFINED_HOOK_NAME.DEFAULT_PASTE): Promise<boolean> {
        const types = item.types;
        const text =
            types.indexOf(PLAIN_TEXT_CLIPBOARD_MIME_TYPE) !== -1
                ? await item.getType(PLAIN_TEXT_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                : '';
        const html =
            types.indexOf(HTML_CLIPBOARD_MIME_TYPE) !== -1
                ? await item.getType(HTML_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                : '';

        if (html) {
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
        if (this._clipboardHooks.findIndex((h) => h.hookName === hook.hookName) !== -1) {
            this._logService.error('[SheetClipboardService]', 'hook already exists', hook.hookName);
            return { dispose: () => {} };
        }
        // hook added should be ordered at meaning while
        const insertIndex = this._clipboardHooks.findIndex((existingHook) => {
            const existingHookPriority = existingHook.priority || 0;
            const hookPriority = hook.priority || 0;
            return hookPriority < existingHookPriority;
        });

        this._clipboardHooks.splice(insertIndex !== -1 ? insertIndex : this._clipboardHooks.length, 0, hook);

        this._notifyClipboardHook();
        return toDisposable(() => {
            const index = this._clipboardHooks.indexOf(hook);
            if (index > -1) {
                this._clipboardHooks.splice(index, 1);
                this._notifyClipboardHook();
            }
        });
    }

    getClipboardHooks(): ISheetClipboardHook[] {
        return this._clipboardHooks;
    }

    private _notifyClipboardHook() {
        this._clipboardHooks$.next(this._clipboardHooks);
    }

    private async _pastePlainText(text: string): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting plain text content.', text);

        // TODO: maybe we should support pasting rich text values here? That is not supported yet.
        const target = this._getPastingTarget();
        if (!target.selection) {
            return false;
        }

        const range = target.selection.range;
        const cellValue: IObjectMatrixPrimitiveType<ICellData> = {
            [range.startRow]: {
                [range.endColumn]: {
                    v: text,
                },
            },
        };

        const setRangeValuesParams: ISetRangeValuesMutationParams = {
            unitId: target.unitId,
            subUnitId: target.subUnitId,
            cellValue,
        };

        const result = this._commandService.syncExecuteCommand(SetRangeValuesMutation.id, setRangeValuesParams);
        return result;
    }

    private async _pasteHTML(html: string, pasteType: string): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting html content', html);

        const copyId = extractId(html);

        if (copyId) {
            return this._pasteInternal(copyId, pasteType);
        }
        return this._pasteExternal(html, pasteType);
    }

    private async _pasteExternal(html: string, pasteType: string): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting external content', html);

        // steps of pasting:
        const target = this._getPastingTarget();
        const { selection, unitId, subUnitId } = target;
        if (!selection) {
            return false;
        }

        // 1. get properties of the table by parsing raw html content, including col properties / row properties
        // cell properties and cell contents.
        const { rowProperties, colProperties, cellMatrix } = this._htmlToUSM.convert(html);
        const { startColumn, endColumn, startRow, endRow } = cellMatrix.getDataRange();
        const rowCount = endRow - startRow + 1;
        const colCount = endColumn - startColumn + 1;
        if (!cellMatrix || endColumn < startColumn || endRow < startRow) {
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
                unitId,
                subUnitId,
                pastedRange,
            },
            pasteType
        );
    }

    private async _pasteInternal(copyId: string, pasteType: string): Promise<boolean> {
        const target = this._getPastingTarget();
        const { selection, unitId, subUnitId } = target;
        const cachedData = Tools.deepClone(copyContentCache.get(copyId));
        const { range, matrix: cellMatrix } = cachedData || {};
        if (!selection || !cellMatrix || !cachedData || !range) {
            return false;
        }

        if (!selection || !cellMatrix || !cachedData) {
            return false;
        }

        const styles = this._currentUniverService.getUniverSheetInstance(unitId)?.getStyles();
        cellMatrix.forValue((row, col, value) => {
            if (typeof value.s === 'string') {
                const newValue = Tools.deepClone(value);
                newValue.s = styles?.getStyleByCell(value);
                cellMatrix.setValue(row, col, newValue);
            }
        });

        const { startColumn, endColumn, startRow, endRow } = range;
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
                unitId, // paste target
                subUnitId,
                pastedRange,
            },
            pasteType,
            {
                range, // paste source
                unitId: cachedData.unitId,
                subUnitId: cachedData.subUnitId,
                copyType: cachedData.copyType,
                copyId,
            }
        );

        if (cachedData.copyType === COPY_TYPE.CUT) {
            copyContentCache.del(copyId);
            this._copyMarkId && this._markSelectionService.removeShape(this._copyMarkId);
            this._copyMarkId = null;
        }

        return pasteRes;
    }

    private _pasteUSM(
        data: IUniverSheetCopyDataModel,
        target: IPasteTarget,
        pasteType: string,
        source?: IPasteSource
    ): boolean {
        const { rowProperties, colProperties, cellMatrix } = data;
        const { unitId, subUnitId, pastedRange } = target;
        const { startColumn, endColumn } = pastedRange;
        const colCount = endColumn - startColumn + 1;
        const hooks = this._clipboardHooks;
        const enabledHooks: ISheetClipboardHook[] = [];
        const disableCopying = hooks.some(
            (h) => enabledHooks.push(h) && h.onBeforePaste?.(unitId, subUnitId, pastedRange) === false
        );
        if (disableCopying) {
            enabledHooks.forEach((h) => h.onAfterPaste?.(false));
            return false;
        }
        if (!cellMatrix) return false;

        const copyInfo = source
            ? {
                  copyRange: source.range,
                  copyType: source.copyType,
                  unitId: source.unitId,
                  subUnitId: source.subUnitId,
              }
            : { copyType: COPY_TYPE.COPY };

        const redoMutationsInfo: IMutationInfo[] = [];
        const undoMutationsInfo: IMutationInfo[] = [];

        // if hooks are not special or default, it will be executed in any case.
        // other hooks will be executed only when the paste type is the same as the hook name, including the default one
        const filteredHooks: ISheetClipboardHook[] = hooks.filter(
            (h) =>
                (!h.specialPasteInfo && h.hookName !== PREDEFINED_HOOK_NAME.DEFAULT_PASTE) || pasteType === h.hookName
        );
        filteredHooks.forEach((h) => {
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

        // setting the selection should be done separately, regardless of the pasting type.
        const setSelectionOperation = this._getSetSelectionOperation(unitId, subUnitId, pastedRange, cellMatrix);
        if (setSelectionOperation) {
            redoMutationsInfo.push(setSelectionOperation);
        }

        this._logService.log('[SheetClipboardService]', 'pasting mutations', {
            undoMutationsInfo,
            redoMutationsInfo,
        });

        const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undoMutationsInfo,
                redoMutations: redoMutationsInfo,
            });
        }

        return result;
    }

    private _getSetSelectionOperation(
        unitId: string,
        subUnitId: string,
        range: IRange,
        cellMatrix: ObjectMatrix<ICellDataWithSpanInfo>
    ) {
        const worksheet = this._currentUniverService.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return null;
        }
        const { startRow, startColumn } = range;
        const primaryCell = {
            startRow,
            endRow: startRow,
            startColumn,
            endColumn: startColumn,
        };

        const primary = getPrimaryForRange(primaryCell, worksheet);

        const mainCell = cellMatrix.getValue(0, 0);
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
            unitId,
            subUnitId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range, primary, style: null }],
        };
        return {
            id: SetSelectionsOperation.id,
            params: setSelectionsParam,
        };
    }

    // NOTE: why there are some differences between internal and external pasting?

    private _getPastingTarget() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const selection = this._selectionManagerService.getLast();
        return {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
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

function getEmptyCell(): ICellData {
    return {
        p: null,
        v: null,
        s: null,
        f: null,
        si: null,
        t: null,
    };
}
