/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type {
    ICellData,
    ICellDataWithSpanAndDisplay,
    IDisposable,
    IMutationInfo,
    IRange,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import type { IDiscreteRange } from '../../controllers/utils/range-tools';
import type {
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    IPasteHookKeyType,
    IPasteHookValueType,
    IPasteOptionCache,
    IPasteTarget,
    ISheetClipboardHook,
    ISheetDiscreteRangeLocation,
    IUniverSheetCopyDataModel,
} from './type';
import {
    CellModeEnum,
    createIdentifier,
    Disposable,
    ErrorService,
    extractPureTextFromCell,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    isNotNullOrUndefined,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    sequenceExecute,
    ThemeService,
    toDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, withCurrentTypeOfRenderer } from '@univerjs/engine-render';

import {
    getPrimaryForRange,
    rangeToDiscreteRange,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,

    SheetsSelectionsService,
} from '@univerjs/sheets';
import { FILE__BMP_CLIPBOARD_MIME_TYPE, FILE__JPEG_CLIPBOARD_MIME_TYPE, FILE__WEBP_CLIPBOARD_MIME_TYPE, FILE_PNG_CLIPBOARD_MIME_TYPE, HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, imageMimeTypeSet, INotificationService, IPlatformService, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';

import { BehaviorSubject } from 'rxjs';
import { virtualizeDiscreteRanges } from '../../controllers/utils/range-tools';
import { IMarkSelectionService } from '../mark-selection/mark-selection.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { createCopyPasteSelectionStyle } from '../utils/selection-util';

import { CopyContentCache, extractId, genId } from './copy-content-cache';
import { HtmlToUSMService } from './html-to-usm/converter';
import { LarkPastePlugin } from './html-to-usm/paste-plugins/plugin-lark';
import { UniverPastePlugin } from './html-to-usm/paste-plugins/plugin-univer';
import { WordPastePlugin } from './html-to-usm/paste-plugins/plugin-word';
import { COPY_TYPE } from './type';
import { USMToHtmlService } from './usm-to-html/convertor';
import { convertTextToTable, discreteRangeContainsRange, htmlContainsImage, htmlIsFromExcel, mergeSetRangeValues, rangeIntersectWithDiscreteRange } from './utils';

export const PREDEFINED_HOOK_NAME = {
    DEFAULT_COPY: 'default-copy',
    DEFAULT_PASTE: 'default-paste',
    SPECIAL_PASTE_VALUE: 'special-paste-value',
    SPECIAL_PASTE_FORMAT: 'special-paste-format',
    SPECIAL_PASTE_COL_WIDTH: 'special-paste-col-width',
    SPECIAL_PASTE_BESIDES_BORDER: 'special-paste-besides-border',
    SPECIAL_PASTE_FORMULA: 'special-paste-formula',
} as const;

const IMAGE_MIME_TO_EXTENSION = {
    [FILE_PNG_CLIPBOARD_MIME_TYPE]: 'png',
    [FILE__JPEG_CLIPBOARD_MIME_TYPE]: 'jpg',
    [FILE__WEBP_CLIPBOARD_MIME_TYPE]: 'webp',
    [FILE__BMP_CLIPBOARD_MIME_TYPE]: 'bmp',
} as const;

interface ICopyContent {
    copyId: string;
    plain: string;
    html: string;
    matrixFragment: ObjectMatrix<ICellDataWithSpanAndDisplay>;
    discreteRange: IDiscreteRange;
}

/**
 * This service provide hooks for sheet features to supplement content or modify behavior of clipboard.
 */

HtmlToUSMService.use(WordPastePlugin);
HtmlToUSMService.use(LarkPastePlugin);
HtmlToUSMService.use(UniverPastePlugin);

export interface ISheetClipboardService {
    showMenu$: Observable<boolean>;
    setShowMenu: (show: boolean) => void;
    getPasteMenuVisible: () => boolean;

    pasteOptionsCache$: Observable<IPasteOptionCache | null>;
    getPasteOptionsCache: () => IPasteOptionCache | null;
    updatePasteOptionsCache(cache: IPasteOptionCache | null): void;

    copy(): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(item: ClipboardItem, pasteType?: string): Promise<boolean>; // get content from a ClipboardItem and paste it.
    legacyPaste(html?: string, text?: string, files?: File[]): Promise<boolean>; // paste a HTML string or plain text directly.

    rePasteWithPasteType(type: IPasteHookKeyType): boolean;
    disposePasteOptionsCache(): void;

    generateCopyContent(workbookId: string, worksheetId: string, range: IRange): Nullable<ICopyContent>;
    copyContentCache(): CopyContentCache; // return the cache content for inner copy/cut/paste.
    addClipboardHook(hook: ISheetClipboardHook): IDisposable; // add a hook to the clipboard service
    getClipboardHooks(): ISheetClipboardHook[]; // get all hooks

    removeMarkSelection(): void;
}

export const ISheetClipboardService = createIdentifier<ISheetClipboardService>('sheet.clipboard-service');

export class SheetClipboardService extends Disposable implements ISheetClipboardService {
    private _clipboardHooks: ISheetClipboardHook[] = [];

    private readonly _clipboardHooks$ = new BehaviorSubject<ISheetClipboardHook[]>([]);
    readonly clipboardHooks$ = this._clipboardHooks$.asObservable();

    private _htmlToUSM: HtmlToUSMService;
    private _usmToHtml: USMToHtmlService;

    private _copyContentCache: CopyContentCache;
    private _copyMarkId: string | null = null;

    // Record the parsed matrix and row and column attributes
    private _pasteOptionsCache$ = new BehaviorSubject<IPasteOptionCache | null>(null);
    readonly pasteOptionsCache$ = this._pasteOptionsCache$.asObservable();

    //Control the visibility of the Paste Options menu
    private readonly _showMenu$ = new BehaviorSubject(false);
    readonly showMenu$ = this._showMenu$.asObservable();

    constructor(
        @ILogService private readonly _logService: ILogService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService,
        @INotificationService private readonly _notificationService: INotificationService,
        @IPlatformService private readonly _platformService: IPlatformService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ErrorService) private readonly _errorService: ErrorService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._htmlToUSM = new HtmlToUSMService({
            getCurrentSkeleton: () => withCurrentTypeOfRenderer(
                UniverInstanceType.UNIVER_SHEET,
                SheetSkeletonManagerService,
                this._univerInstanceService,
                this._renderManagerService
            )?.getCurrentParam(),
        });

        this._usmToHtml = new USMToHtmlService();
        this._copyContentCache = new CopyContentCache();

        this.disposeWithMe(this._htmlToUSM);
        this._initUnitDisposed();
    }

    setShowMenu(show: boolean) {
        this._showMenu$.next(show);
    }

    getPasteMenuVisible() {
        return this._showMenu$.getValue();
    }

    getPasteOptionsCache() {
        return this._pasteOptionsCache$.getValue();
    }

    copyContentCache(): CopyContentCache {
        return this._copyContentCache;
    }

    generateCopyContent(workbookId: string, worksheetId: string, range: IRange, copyType: COPY_TYPE = COPY_TYPE.COPY): Nullable<ICopyContent> {
        const hooks = this._clipboardHooks;
        hooks.forEach((h) => h.onBeforeCopy?.(workbookId, worksheetId, range, copyType));
        const copyContent = this._generateCopyContent(workbookId, worksheetId, range, this._clipboardHooks);
        hooks.forEach((h) => h.onAfterCopy?.());

        return copyContent;
    }

    async copy(copyType = COPY_TYPE.COPY): Promise<boolean> {
        const selection = this._selectionManagerService.getCurrentLastSelection();
        if (!selection) {
            return false; // maybe we should notify user that there is no selection
        }

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const copyContent = this.generateCopyContent(workbookId, worksheetId, selection.range);

        if (!copyContent) {
            return false;
        }

        // 2. extract copy content for both internal and external
        const { html, plain, matrixFragment, copyId, discreteRange } = copyContent;

        // 3. cache the copy content for internal paste
        this._copyContentCache.set(copyId, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            range: discreteRange,
            matrix: matrixFragment,
            copyType,
        });

        // 4. write html and get plain text info the clipboard interface
        await this._clipboardInterfaceService.write(plain, html);

        // 5. mark the copy range
        this._markSelectionService.removeAllShapes();

        const style = createCopyPasteSelectionStyle(this._themeService);
        this._copyMarkId = this._markSelectionService.addShape({ ...selection, style });

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

        const imageIndex = types.findIndex((type) => imageMimeTypeSet.has(type));

        const shouldUseHTMLPaste = imageIndex === -1 || !htmlContainsImage(html);
        if (html && shouldUseHTMLPaste) {
            // Firstly see if the html content is from Excel
            if (this._platformService.isWindows && htmlIsFromExcel(html)) {
                this._notificationService.show({
                    type: 'warning',
                    title: this._localeService.t('clipboard.shortCutNotify.title'),
                    content: this._localeService.t('clipboard.shortCutNotify.useShortCutInstead'),
                });
                // Pasting should not be allowed here.
                // After the pop-up window prompts, can paste the contents of the clipboard as much as possible.
            }

            return this._pasteHTML(html, pasteType);
        }

        // clipboard item from excel may contain image, so we need to check if the clipboard item is from excel
        if (imageIndex !== -1) {
            const imageMimeType = types[imageIndex]!;
            const imageBlob = await item.getType(imageMimeType);

            if (imageBlob) {
                const imageExtension = IMAGE_MIME_TO_EXTENSION[imageMimeType as keyof typeof IMAGE_MIME_TO_EXTENSION];
                const file = new File(
                    [imageBlob],
                    `clipboard-image.${imageExtension}`,
                    { type: imageMimeType }
                );

                return this._pasteFiles([file], pasteType);
            }
        }

        if (text) {
            return this._pastePlainText(text, pasteType);
        }

        this._logService.error('[SheetClipboardService]', 'No valid data on clipboard');

        return false;
    }

    async legacyPaste(html?: string, text?: string, files?: File[]): Promise<boolean> {
        const isFromExcel = htmlIsFromExcel(html ?? '');

        if (files && !isFromExcel) {
            return this._pasteFiles(files, PREDEFINED_HOOK_NAME.DEFAULT_PASTE);
        } else if (html) {
            return this._pasteHTML(html, PREDEFINED_HOOK_NAME.DEFAULT_PASTE);
        } else if (text) {
            // Converts text with tabs and newlines into an HTML table
            if (/[\n\t]/.test(text)) {
                return this._pasteHTML(convertTextToTable(text), PREDEFINED_HOOK_NAME.DEFAULT_PASTE);
            } else {
                return this._pastePlainText(text, PREDEFINED_HOOK_NAME.DEFAULT_PASTE);
            }
        } else {
            return this._pasteUnrecognized();
        }
    }

    rePasteWithPasteType(type: IPasteHookKeyType): boolean {
        const pasteOptionsCache = this._pasteOptionsCache$.getValue();
        if (!pasteOptionsCache) {
            return false;
        }

        const undoRedoService = this._injector.get(IUndoRedoService);
        const element = undoRedoService.pitchTopUndoElement();
        if (element) {
            const result = sequenceExecute(element.undoMutations, this._commandService);
            if (result) {
                undoRedoService.popUndoToRedo();
            }
        }

        const { cellMatrix, rowProperties = [], colProperties = [], source, target } = pasteOptionsCache;

        this._pasteUSM({
            cellMatrix,
            colProperties,
            rowProperties,
        }, target, PREDEFINED_HOOK_NAME[type] as IPasteHookValueType, source);

        return true;
    }

    updatePasteOptionsCache(cache: IPasteOptionCache | null): void {
        this._pasteOptionsCache$.next(cache);
    }

    addClipboardHook(hook: ISheetClipboardHook): IDisposable {
        if (this._clipboardHooks.findIndex((h) => h.id === hook.id) !== -1) {
            this._logService.error('[SheetClipboardService]', 'hook already exists', hook.id);
            return { dispose: () => { /* empty */ } };
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

    private _generateCopyContent(unitId: string, subUnitId: string, range: IRange, hooks: ISheetClipboardHook[]): Nullable<ICopyContent> {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);

        if (!workbook || !worksheet) {
            return null;
        }

        // get filtered out rows those are filtered out by plugins (e.g. filter feature)
        const filteredRows = hooks.reduce((acc, cur) => {
            const rows = cur.getFilteredOutRows?.(range);
            rows?.forEach((r) => acc.add(r));
            return acc;
        }, new Set<number>());

        // calculate selection matrix, span cells would only - maybe warn uses that cells are too may in the future
        const { startColumn, startRow, endColumn, endRow } = range;

        const matrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn, CellModeEnum.Both);
        const matrixFragment = new ObjectMatrix<ICellDataWithSpanInfo>();
        let rowIndex = startRow;

        const plainMatrix = new ObjectMatrix<ICellDataWithSpanAndDisplay>();

        const discreteRange: IDiscreteRange = { rows: [], cols: [] };
        for (let r = startRow; r <= endRow; r++) {
            if (filteredRows.has(r)) {
                continue;
            }
            discreteRange.rows.push(r);
            for (let c = startColumn; c <= endColumn; c++) {
                const cellData = matrix.getValue(r, c);
                if (cellData) {
                    const newCellData = Tools.deepClone(cellData);
                    plainMatrix.setValue(rowIndex - startRow, c - startColumn, {
                        ...getEmptyCell(),
                        ...newCellData,
                    });

                    delete newCellData.displayV;
                    matrixFragment.setValue(rowIndex - startRow, c - startColumn, {
                        ...getEmptyCell(),
                        ...newCellData,
                    });
                } else {
                    plainMatrix.setValue(rowIndex - startRow, c - startColumn, getEmptyCell());
                    matrixFragment.setValue(rowIndex - startRow, c - startColumn, getEmptyCell());
                    matrix.setValue(r, c, getEmptyCell());
                }
            }
            rowIndex += 1;
        }
        for (let c = startColumn; c <= endColumn; c++) {
            discreteRange.cols.push(c);
        }

        // convert matrix to html
        let html = this._usmToHtml.convert(matrix, discreteRange, hooks);

        const plain = getMatrixPlainText(plainMatrix);
        const copyId = genId();
        html = html.replace(/(<[a-z]+)/, (_p0, p1) => `${p1} data-copy-id="${copyId}"`);

        return {
            copyId,
            plain,
            html,
            matrixFragment,
            discreteRange,
        };
    }

    private _notifyClipboardHook() {
        this._clipboardHooks$.next(this._clipboardHooks);
    }

    private async _executePaste(generateMutations: (hook: ISheetClipboardHook, payload: {
        unitId: string;
        subUnitId: string;
        range: IDiscreteRange;
    }) => undefined | ({ undos: IMutationInfo[]; redos: IMutationInfo[] })): Promise<boolean> {
        const target = this._getPastingTarget();
        if (!target.subUnitId || !target.selection) {
            return false;
        }

        const range = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(target.selection!.range, accessor, target.unitId, target.subUnitId);
        });

        if (!range) {
            return false;
        }

        const { unitId, subUnitId } = target;
        const hooks = this._clipboardHooks;
        const enabledHooks: ISheetClipboardHook[] = [];
        const disableCopying = hooks.some(
            (h) => enabledHooks.push(h) && h.onBeforePaste?.({ unitId, subUnitId, range }) === false
        );
        if (disableCopying) {
            enabledHooks.forEach((h) => h.onAfterPaste?.(false));
            return false;
        }

        const redoMutationsInfo: IMutationInfo[] = [];
        const undoMutationsInfo: IMutationInfo[] = [];
        enabledHooks.forEach((h) => {
            const contentReturn = generateMutations(h, {
                unitId,
                subUnitId,
                range,
            });

            if (contentReturn) {
                redoMutationsInfo.push(...contentReturn.redos);
                undoMutationsInfo.push(...contentReturn.undos);
            }
        });
        const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId(),
                undoMutations: undoMutationsInfo,
                redoMutations: redoMutationsInfo,
            });
        }

        return result;
    }

    private async _pasteFiles(files: File[], pasteType: IPasteHookValueType): Promise<boolean> {
        return this._executePaste((h, payload) => {
            return h.onPasteFiles?.(payload, files, { pasteType });
        });
    }

    private async _pastePlainText(text: string, pasteType: IPasteHookValueType): Promise<boolean> {
        return this._executePaste((h, payload) => {
            return h.onPastePlainText?.(payload, text, { pasteType });
        });
    }

    private _pasteUnrecognized() {
        return this._executePaste((h, payload) => {
            return h.onPasteUnrecognized?.(payload);
        });
    }

    private async _pasteHTML(html: string, pasteType: IPasteHookValueType): Promise<boolean> {
        const copyId = extractId(html);
        if (copyId && this._copyContentCache.get(copyId)) {
            return this._pasteInternal(copyId, pasteType);
        }
        return this._pasteExternal(html, pasteType);
    }

    private async _pasteExternal(html: string, pasteType: IPasteHookValueType): Promise<boolean> {
        // this._logService.log('[SheetClipboardService]', 'pasting external content', html);

        // steps of pasting:

        // 1. get properties of the table by parsing raw html content, including col properties / row properties
        // cell properties and cell contents.
        const { rowProperties, colProperties, cellMatrix } = this._htmlToUSM.convert(html);
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
        const pasteTarget = this._getPastedRange(cellMatrix);

        // pastedRange.endColumn = pastedRange.startColumn + colCount;
        // pastedRange.endRow = pastedRange.startRow + rowCount;

        // If PastedRange is null, it means that the paste fails
        if (!pasteTarget) {
            return false;
        }

        const worksheet = this._univerInstanceService
            .getUniverSheetInstance(pasteTarget.unitId)
            ?.getSheetBySheetId(pasteTarget.subUnitId);
        if (!worksheet) {
            return false;
        }

        const mergeData = worksheet?.getMergeData();

        if (mergeData.length) {
            const pastedRangeLapWithMergedCell = mergeData.some((m) => {
                return rangeIntersectWithDiscreteRange(m, pasteTarget.pastedRange) && !discreteRangeContainsRange(pasteTarget.pastedRange, m);
            });
            if (pastedRangeLapWithMergedCell) {
                this._errorService.emit(this._localeService.t('clipboard.paste.overlappingMergedCells'));
                return false;
            }
        }

        // 4. execute these mutations by the one method
        const res = this._pasteUSM(
            {
                rowProperties,
                colProperties,
                cellMatrix,
            },
            pasteTarget,
            pasteType
        );
        return res;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private async _pasteInternal(copyId: string, pasteType: IPasteHookValueType): Promise<boolean> {
        // const target = this._getPastingTarget();
        // const { selection, unitId, subUnitId } = target;
        const cachedData = Tools.deepClone(this._copyContentCache.get(copyId));
        const { range, matrix: cellMatrix, unitId: copyUnitId, subUnitId: copySubUnitId } = cachedData || {};
        if (!cellMatrix || !cachedData || !range || !copyUnitId || !copySubUnitId) {
            return false;
        }

        if (!cellMatrix || !cachedData) {
            return false;
        }

        const styles = this._univerInstanceService.getUniverSheetInstance(copyUnitId)?.getStyles();
        cellMatrix.forValue((row, col, value) => {
            if (typeof value.s === 'string') {
                const newValue = Tools.deepClone(value);
                newValue.s = styles?.getStyleByCell(value);
                cellMatrix.setValue(row, col, newValue);
            }

            if (value.colSpan || value.rowSpan) {
                for (let rStart = 0; rStart < value.rowSpan!; rStart++) {
                    for (let cStart = 0; cStart < value.colSpan!; cStart++) {
                        if (rStart === 0 && cStart === 0) continue;

                        const r = row + rStart;
                        const c = col + cStart;
                        cellMatrix.setValue(r, c, { s: styles?.getStyleByCell(value) });
                    }
                }
            }
        });
        const pasteTarget = this._getPastedRange(cellMatrix);
        if (!pasteTarget) return false;

        const pasteToWorksheet = this._univerInstanceService
            .getUniverSheetInstance(pasteTarget.unitId)
            ?.getSheetBySheetId(pasteTarget.subUnitId);
        if (!pasteToWorksheet) {
            return false;
        }

        const mergeData = pasteToWorksheet?.getMergeData();

        if (mergeData) {
            const pastedRangeLapWithMergedCell = mergeData.some((m) => {
                return rangeIntersectWithDiscreteRange(m, pasteTarget.pastedRange) && !discreteRangeContainsRange(pasteTarget.pastedRange, m);
            });
            if (pastedRangeLapWithMergedCell) {
                this._errorService.emit(this._localeService.t('clipboard.paste.overlappingMergedCells'));
                return false;
            }
        }

        const pasteFromWorkbook = this._univerInstanceService.getUnit<Workbook>(copyUnitId);
        if (!pasteFromWorkbook) return false;
        const pasteFromWorksheet = pasteFromWorkbook.getSheetBySheetId(copySubUnitId);
        if (!pasteFromWorksheet) return false;

        const colManager = pasteFromWorksheet.getColumnManager();
        const rowManager = pasteFromWorksheet.getRowManager();
        const defaultColumnWidth = pasteFromWorksheet.getConfig().defaultColumnWidth;
        const defaultRowHeight = pasteFromWorksheet.getConfig().defaultRowHeight;

        const colProperties: IClipboardPropertyItem[] = [];
        const rowProperties: IClipboardPropertyItem[] = [];

        range.cols.forEach((i) => {
            const column = colManager.getColumnOrCreate(i);
            colProperties.push({ width: `${column.w || defaultColumnWidth}` });
        });

        range.rows.forEach((j) => {
            const row = rowManager.getRowOrCreate(j);
            const { ah = defaultRowHeight, h = defaultRowHeight } = row;
            const height = Math.max(ah, h);
            rowProperties.push({ height: `${height}` });
        });

        if (cachedData.copyType === COPY_TYPE.CUT) {
            const start = pasteTarget.pastedRange.rows[0];
            const end = range.rows[range.rows.length - 1] - range.rows[0] + start;
            pasteTarget.pastedRange.rows = Array.from(new Array(end + 1).keys()).slice(start);
        }

        const pasteRes = this._pasteUSM(
            {
                cellMatrix,
                colProperties,
                rowProperties,
            }, // paste data
            pasteTarget,
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
            this._copyContentCache.set(copyId, { ...cachedData, matrix: null });
            this._copyMarkId && this._markSelectionService.removeShape(this._copyMarkId);
            this._copyMarkId = null;
        }

        return pasteRes;
    }

    // eslint-disable-next-line max-lines-per-function
    private _pasteUSM(
        data: IUniverSheetCopyDataModel,
        target: IPasteTarget,
        pasteType: IPasteHookValueType,
        source?: ISheetDiscreteRangeLocation & { copyId: string; copyType: COPY_TYPE }
    ): boolean {
        const { rowProperties, colProperties, cellMatrix } = data;
        const { unitId, subUnitId, pastedRange } = target;
        const colCount = pastedRange.cols.length;
        const hooks = this._clipboardHooks;
        const enabledHooks: ISheetClipboardHook[] = [];
        const disableCopying = hooks.some(
            (h) => enabledHooks.push(h) && h.onBeforePaste?.({ unitId, subUnitId, range: pastedRange }) === false
        );
        if (disableCopying) {
            enabledHooks.forEach((h) => h.onAfterPaste?.(false));
            return false;
        }
        if (!cellMatrix) return false;

        const pasteFrom = source
            ? {
                unitId: source.unitId,
                subUnitId: source.subUnitId,
                range: source.range,
            }
            : null;

        const payload = {
            copyType: source?.copyType || COPY_TYPE.COPY,
            copyId: source?.copyId,
            pasteType,
        };

        let redoMutationsInfo: IMutationInfo[] = [];
        let undoMutationsInfo: IMutationInfo[] = [];

        // if hooks are not special or default, it will be executed in any case.
        // other hooks will be executed only when the paste type is the same as the hook name, including the default one
        const filteredHooks: ISheetClipboardHook[] = enabledHooks.filter(
            (h) => (!h.specialPasteInfo && h.id !== PREDEFINED_HOOK_NAME.DEFAULT_PASTE) || pasteType === h.id
        );
        filteredHooks.forEach((h) => {
            if (rowProperties) {
                const rowReturn = h.onPasteRows?.({ range: pastedRange, unitId, subUnitId }, rowProperties, {
                    pasteType,
                });
                if (rowReturn) {
                    redoMutationsInfo.push(...rowReturn.redos);
                    undoMutationsInfo.push(...rowReturn.undos);
                }
            }

            const colReturn = h.onPasteColumns?.(
                { range: pastedRange, unitId, subUnitId },
                colProperties || new Array(colCount).map(() => ({})),
                { pasteType }
            );
            if (colReturn) {
                redoMutationsInfo.push(...colReturn.redos);
                undoMutationsInfo.push(...colReturn.undos);
            }

            const contentReturn = h.onPasteCells?.(
                pasteFrom,
                { range: pastedRange, unitId, subUnitId },
                cellMatrix,
                payload
            );
            if (contentReturn) {
                redoMutationsInfo.push(...contentReturn.redos);
                undoMutationsInfo.push(...contentReturn.undos);
            }
        });

        // setting the selection should be done separately, regardless of the pasting type.
        const setSelectionOperation = this._getSetSelectionOperation(unitId, subUnitId, pastedRange, cellMatrix, pasteType);
        if (setSelectionOperation) {
            redoMutationsInfo.push(setSelectionOperation);
        }

        redoMutationsInfo = mergeSetRangeValues(redoMutationsInfo);
        undoMutationsInfo = mergeSetRangeValues(undoMutationsInfo);
        undoMutationsInfo.push({ id: SetWorksheetActiveOperation.id, params: { unitId: target.unitId, subUnitId: target.subUnitId } });

        this._logService.log('[SheetClipboardService]', 'pasting mutations', {
            undoMutationsInfo,
            redoMutationsInfo,
        });

        const result = redoMutationsInfo.every((m) => this._commandService.syncExecuteCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undoMutationsInfo,
                redoMutations: redoMutationsInfo,
            });

            this.updatePasteOptionsCache({
                target: {
                    pastedRange,
                    unitId,
                    subUnitId,
                },
                cellMatrix,
                rowProperties,
                colProperties,
                pasteType,
                source,
            });
            this.setShowMenu(true);
        }

        filteredHooks.forEach((h) => h.onAfterPaste?.(result));
        return result;
    }

    private _getSetSelectionOperation(
        unitId: string,
        subUnitId: string,
        range: IDiscreteRange,
        cellMatrix: ObjectMatrix<ICellDataWithSpanAndDisplay>,
        pasteType?: string
    ) {
        const worksheet = this._univerInstanceService.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return null;
        }
        const { rows, cols } = range;
        const startRow = rows[0];
        const startColumn = cols[0];
        const endRow = rows[rows.length - 1];
        const endColumn = cols[cols.length - 1];

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

        const shouldExpandPrimary = pasteType === PREDEFINED_HOOK_NAME.DEFAULT_PASTE
            || pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_BESIDES_BORDER
            || pasteType === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT;

        if (shouldExpandPrimary && (rowSpan > 1 || colSpan > 1)) {
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
            selections: [{
                range: {
                    startRow,
                    endRow,
                    startColumn,
                    endColumn,
                },
                primary,
                style: null,
            }],
        };
        return {
            id: SetSelectionsOperation.id,
            params: setSelectionsParam,
        };
    }

    private _getPastingTarget() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        const selection = this._selectionManagerService.getCurrentLastSelection();
        return {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet?.getSheetId(),
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
    // eslint-disable-next-line max-lines-per-function, complexity
    private _transformPastedData(
        rowCount: number,
        colCount: number,
        cellMatrix: ObjectMatrix<ICellDataWithSpanAndDisplay>
    ): IPasteTarget | null {
        const target = this._getPastingTarget();
        const { selection, unitId, subUnitId } = target;
        if (!subUnitId || !selection) {
            return null;
        }

        const discreteRange = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(selection.range, accessor, unitId, subUnitId);
        });

        if (!discreteRange) {
            return null;
        }

        const { ranges: [vRange], mapFunc } = virtualizeDiscreteRanges([discreteRange]);
        const { startRow, startColumn, endRow, endColumn } = vRange;

        const destinationRows = endRow - startRow + 1;
        const destinationColumns = endColumn - startColumn + 1;

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        const mergeData = worksheet.getMergeData();
        // get all merged cells
        const mergedCellsInRange = mergeData.filter((rect) =>
            discreteRange.rows.includes(rect.startRow) && discreteRange.cols.includes(rect.startColumn)
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
                    mergedRangeStartRow === discreteRange.rows[0] &&
                    mergedRangeStartColumn === discreteRange.cols[0] &&
                    mergedRangeEndRow === discreteRange.rows[destinationRows - 1] &&
                    mergedRangeEndColumn === discreteRange.cols[destinationColumns - 1]
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
            const { row: topRow, col: leftCol } = mapFunc(startRow, startColumn);
            const isMatch = this._topLeftCellsMatch(rowCount, colCount, {
                topRow,
                leftCol,
            });
            if (isMatch) {
                // Expand or shrink the destination to the same size as the original range
                const newDiscreteRange = this._expandOrShrinkRowsCols(unitId, subUnitId, discreteRange, colCount, rowCount);

                discreteRange.rows = newDiscreteRange.rows;
                discreteRange.cols = newDiscreteRange.cols;
            } else if (endRow > mergedRange.endRow || endColumn > mergedRange.endColumn) {
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
            const newDiscreteRange = this._expandOrShrinkRowsCols(unitId, subUnitId, discreteRange, colCount, rowCount);

            discreteRange.rows = newDiscreteRange.rows;
            discreteRange.cols = newDiscreteRange.cols;
        }

        return {
            pastedRange: discreteRange,
            unitId,
            subUnitId,
        };
    }

    private _getPastedRange(cellMatrix: ObjectMatrix<ICellDataWithSpanAndDisplay>) {
        const target = this._getPastingTarget();
        const { selection, unitId, subUnitId } = target;
        if (!subUnitId || !selection) {
            return null;
        }
        const discreteRange = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(selection.range, accessor, unitId, subUnitId);
        });

        if (!discreteRange) {
            return null;
        }
        const { startColumn, endColumn, startRow, endRow } = cellMatrix.getDataRange();
        const rowCount = endRow - startRow + 1;
        const colCount = endColumn - startColumn + 1;

        if (rowCount <= 0 || colCount <= 0) return null;

        const pasteSelectionRangeRowLen = discreteRange.rows.length;
        const pasteSelectionRangeColLen = discreteRange.cols.length;

        const worksheet = this._univerInstanceService
            .getUniverSheetInstance(unitId)
            ?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return null;
        }

        const mergeData = worksheet?.getMergeData();

        if (pasteSelectionRangeRowLen % rowCount === 0 && pasteSelectionRangeColLen % colCount === 0) {
            const hasLapWithMerge = mergeData?.some((merge) => rangeIntersectWithDiscreteRange(merge, discreteRange));
            if (!hasLapWithMerge) {
                for (let r = 0; r < pasteSelectionRangeRowLen; r++) {
                    for (let c = 0; c < pasteSelectionRangeColLen; c++) {
                        const cell = cellMatrix.getValue(r % rowCount, c % colCount);
                        cell && cellMatrix.setValue(r, c, cell);
                    }
                }
                return {
                    pastedRange: discreteRange,
                    unitId,
                    subUnitId,
                };
            }
        }
        const newDiscreteRange = this._expandOrShrinkRowsCols(unitId, subUnitId, discreteRange, colCount, rowCount);

        discreteRange.rows = newDiscreteRange.rows;
        discreteRange.cols = newDiscreteRange.cols;

        return {
            pastedRange: discreteRange,
            unitId,
            subUnitId,
        };
    }

    private _expandOrShrinkRowsCols(unitId: string, subUnitId: string, range: IDiscreteRange, colCount: number, rowCount: number) {
        const { rows, cols } = range;
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        let newRows: number[];
        let newCols: number[];
        if (rows.length >= rowCount) {
            newRows = rows.slice(0, rowCount);
        } else {
            newRows = rows.slice(0);
            let rowIndex = rows[rows.length - 1] + 1;
            while (newRows.length < rowCount) {
                if (!worksheet!.getRowFiltered(rowIndex)) {
                    newRows.push(rowIndex);
                }
                rowIndex++;
            }
        }

        if (cols.length >= colCount) {
            newCols = cols.slice(0, colCount);
        } else {
            newCols = cols.slice(0);
            let colIndex = cols[cols.length - 1] + 1;
            while (newCols.length < colCount) {
                newCols.push(colIndex);
                colIndex++;
            }
        }

        return {
            rows: newRows,
            cols: newCols,
        };
    }

    /**
     * Determine whether the cells starting from the upper left corner of the range (merged or non-merged or combined) are consistent with the size of the original data
     * @param cellMatrix
     * @param range
     */
    private _topLeftCellsMatch(rowCount: number, colCount: number, range: { topRow: number; leftCol: number }): boolean {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const { topRow, leftCol } = range;
        const isRowAcross = rowAcrossMergedCell(
            topRow + rowCount - 1,
            leftCol,
            leftCol + colCount - 1,
            worksheet
        );
        const isColAcross = columnAcrossMergedCell(
            leftCol + colCount - 1,
            topRow,
            topRow + rowCount - 1,
            worksheet
        );

        return !isRowAcross && !isColAcross;
    }

    removeMarkSelection() {
        if (this._copyMarkId) {
            this._markSelectionService.removeShape(this._copyMarkId);
            this._copyMarkId = null;
        }
    }

    private _initUnitDisposed() {
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                if (workbook) {
                    const copyCache = this.copyContentCache();
                    copyCache.clearWithUnitId(workbook.getUnitId());
                }
            })
        );
    }

    disposePasteOptionsCache() {
        this.setShowMenu(false);
        this.updatePasteOptionsCache(null);
    }
}

// #region copy generation

export function getMatrixPlainText(matrix: ObjectMatrix<ICellDataWithSpanAndDisplay>) {
    let plain = '';
    const matrixLength = matrix.getLength();
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
        if (row !== matrixLength - 1) {
            plain += '\n';
        }
    });

    return plain;
}

function getCellTextForClipboard(cell: ICellDataWithSpanAndDisplay) {
    if (isNotNullOrUndefined(cell.displayV)) {
        return cell.displayV;
    }
    return extractPureTextFromCell(cell);
}

export const escapeSpecialCode = (cellStr: string) =>
    cellStr
        .replace(/&/g, '&amp;')
        .replace(/\uFEFF/g, '')
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
function isMultipleCells(cellMatrix: ObjectMatrix<ICellDataWithSpanAndDisplay>): boolean {
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
