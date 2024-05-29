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

import type {
    ICellData,
    IDocumentData,
    IMutationInfo,
    IObjectArrayPrimitiveType,
    IObjectMatrixPrimitiveType,
    IRange,
    IRowData,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import {
    BooleanNumber,
    convertBodyToHtml,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    extractPureTextFromCell,
    handleStyleToString,
    ICommandService,
    IConfigService,
    IContextService,
    isFormulaString,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    ObjectMatrix,
    OnLifecycle,
    RxDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    ISetRangeValuesMutationParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowHeightMutationParams,
} from '@univerjs/sheets';
import {
    InsertColMutation,
    InsertRowMutation,
    MAX_CELL_PER_SHEET_KEY,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import { IMessageService, textTrim } from '@univerjs/ui';
import { Inject, Injector, Optional } from '@wendellhu/redi';

import { ITextSelectionRenderManager, ptToPx } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteShortKeyCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';
import type {
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    ICopyPastePayload,
    ISheetClipboardHook,
    ISheetDiscreteRangeLocation,
} from '../../services/clipboard/type';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { whenSheetEditorFocused } from '../shortcuts/utils';
import {
    generateBody,
    getClearAndSetMergeMutations,
    getClearCellStyleMutations,
    getDefaultOnPasteCellMutations,
    getSetCellStyleMutations,
    getSetCellValueMutations,
} from './utils';

/**
 * This controller add basic clipboard logic for basic features such as text color / BISU / row widths to the clipboard
 * service. You can create a similar clipboard controller to add logic for your own features.
 */
@OnLifecycle(LifecycleStages.Steady, SheetClipboardController)
export class SheetClipboardController extends RxDisposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _currentUniverSheet: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IConfigService private readonly _configService: IConfigService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(LocaleService) private readonly _localService: LocaleService,
        @Optional(ITextSelectionRenderManager) private readonly _textSelectionRenderManager?: ITextSelectionRenderManager
    ) {
        super();

        this._init();

        this._textSelectionRenderManager?.onPaste$.pipe(takeUntil(this.dispose$)).subscribe((config) => {
            if (!whenSheetEditorFocused(this._contextService)) {
                return;
            }

            // editor's value should not change and avoid triggering input event
            config!.event.preventDefault();

            const clipboardEvent = config!.event as ClipboardEvent;
            const htmlContent = clipboardEvent.clipboardData?.getData('text/html');
            const textContent = clipboardEvent.clipboardData?.getData('text/plain');
            this._commandService.executeCommand(SheetPasteShortKeyCommand.id, { htmlContent, textContent });
        });
    }

    private _init() {
        // register sheet clipboard commands
        [SheetCopyCommand, SheetCutCommand, SheetPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerMultipleCommand(command))
        );

        [
            SheetPasteValueCommand,
            SheetPasteFormatCommand,
            SheetPasteColWidthCommand,
            SheetPasteBesidesBorderCommand,
            SheetPasteShortKeyCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        // register basic sheet clipboard hooks
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._initCopyingHooks()));
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._initPastingHook()));
        const disposables = this._initSpecialPasteHooks().map((hook) =>
            this._sheetClipboardService.addClipboardHook(hook)
        );
        this.disposeWithMe({ dispose: () => disposables.forEach((d) => d.dispose()) });
    }

    private _initCopyingHooks(): ISheetClipboardHook {
        const self = this;
        let currentSheet: Worksheet | null = null;
        return {
            id: PREDEFINED_HOOK_NAME.DEFAULT_COPY,
            isDefaultHook: true,
            onBeforeCopy(unitId, subUnitId) {
                currentSheet = self._getWorksheet(unitId, subUnitId);
            },
            onCopyCellContent(row: number, col: number): string {
                const cell = currentSheet!.getCell(row, col);
                if (cell?.p?.body?.paragraphs || cell?.p?.body?.textRuns) {
                    return convertBodyToHtml(cell.p.body);
                }
                const content = cell ? extractPureTextFromCell(cell) : '';
                return content;
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

                const mergedCellByRowCol = currentSheet!.getMergedCell(row, col);

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

                if (mergedCellByRowCol) {
                    const endRow = mergedCellByRowCol.endRow;
                    const endColumn = mergedCellByRowCol.endColumn;
                    const lastRange = currentSheet!.getRange(endRow, endColumn);
                    const lastTextStyle = lastRange.getTextStyle();
                    if (lastTextStyle) {
                        const lastStyle = handleStyleToString(lastTextStyle);
                        if (style) {
                            style += lastStyle ? `;${lastStyle}` : '';
                        } else {
                            style = lastStyle;
                        }
                    }
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
            getFilteredOutRows(range: IRange) {
                const { startRow, endRow } = range;
                const worksheet = self._currentUniverSheet.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
                const res: number[] = [];
                if (!worksheet) {
                    return res;
                }
                for (let r = startRow; r <= endRow; r++) {
                    if (worksheet.getRowFiltered(r)) {
                        res.push(r);
                    }
                }
                return res;
            },
        };
    }

    private _initPastingHook(): ISheetClipboardHook {
        const self = this;

        let unitId: string | null = null;
        let subUnitId: string | null = null;
        let currentSheet: Worksheet | null = null;

        return {
            id: PREDEFINED_HOOK_NAME.DEFAULT_PASTE,
            isDefaultHook: true,
            onBeforePaste({ unitId: unitId_, subUnitId: subUnitId_, range }) {
                currentSheet = self._getWorksheet(unitId_, subUnitId_);
                unitId = unitId_;
                subUnitId = subUnitId_;

                // examine if pasting would cause number of cells to exceed the upper limit
                // this is not implemented yet
                const maxConfig = self._configService.getConfig<number>(MAX_CELL_PER_SHEET_KEY);
                const endRow = range.rows[range.rows.length - 1];
                const endColumn = range.cols[range.cols.length - 1];
                if (maxConfig && endRow * endColumn > maxConfig) {
                    self._messageService.show({
                        type: MessageType.Error,
                        content: self._localService.t('clipboard.paste.exceedMaxCells'),
                    }); // TODO: show error info
                    return false;
                }

                return true;
            },

            onPasteRows(pasteTo, rowProperties) {
                const { range } = pasteTo;
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxRow = currentSheet!.getMaxRows();
                const addingRowsCount = range.rows[range.rows.length - 1] - maxRow;
                const existingRowsCount = rowProperties.length - addingRowsCount;

                const rowManager = currentSheet!.getRowManager();
                if (addingRowsCount > 0) {
                    const rowInfo: IObjectArrayPrimitiveType<IRowData> = {};
                    rowProperties.slice(existingRowsCount).forEach((property, index) => {
                        const { style, height: PropertyHeight } = property || {};
                        if (style) {
                            const cssTextArray = style.split(';');
                            let height = DEFAULT_WORKSHEET_ROW_HEIGHT;

                            cssTextArray.find((css) => {
                                css = css.toLowerCase();
                                const key = textTrim(css.substr(0, css.indexOf(':')));
                                const value = textTrim(css.substr(css.indexOf(':') + 1));
                                if (key === 'height') {
                                    if (value.endsWith('pt')) {
                                        height = ptToPx(Number.parseFloat(value));
                                    } else {
                                        height = Number.parseFloat(value);
                                    }
                                    return true;
                                }
                                return false;
                            });

                            rowInfo[index] = {
                                h: height,
                                hd: BooleanNumber.FALSE,
                            };
                        } else if (PropertyHeight) {
                            rowInfo[index] = {
                                h: Number.parseFloat(PropertyHeight),
                                hd: BooleanNumber.FALSE,
                            };
                        }
                    });

                    const addRowMutation: IInsertRowMutationParams = {
                        unitId: unitId!,
                        subUnitId: subUnitId!,
                        range: {
                            startColumn: range.cols[0],
                            endColumn: range.cols[range.cols.length - 1],
                            endRow: range.rows[range.rows.length - 1],
                            startRow: maxRow },
                        rowInfo,
                    };
                    redoMutations.push({
                        id: InsertRowMutation.id,
                        params: addRowMutation,
                    });
                }

                // get row height of existing rows
                // TODO When Excel pasted, there was no width height, Do we still need to set the height?
                const rowHeight: IObjectArrayPrimitiveType<number> = {};
                const originRowHeight: IObjectArrayPrimitiveType<number> = {};
                rowProperties.slice(0, existingRowsCount).forEach((property, index) => {
                    const { style, height: propertyHeight } = property;
                    if (style) {
                        const cssTextArray = style.split(';');
                        let height = DEFAULT_WORKSHEET_ROW_HEIGHT;

                        cssTextArray.find((css) => {
                            css = css.toLowerCase();
                            const key = textTrim(css.substr(0, css.indexOf(':')));
                            const value = textTrim(css.substr(css.indexOf(':') + 1));
                            if (key === 'height') {
                                if (value.endsWith('pt')) {
                                    height = ptToPx(Number.parseFloat(value));
                                } else {
                                    height = Number.parseFloat(value);
                                }
                                return true;
                            }
                            return false;
                        });

                        rowHeight[index + range.rows[0]] = height;
                    } else if (propertyHeight) {
                        const rowConfigBeforePaste = rowManager.getRow(range.rows[0] + index);
                        const willSetHeight = Number.parseFloat(propertyHeight);
                        if (rowConfigBeforePaste) {
                            const { h = DEFAULT_WORKSHEET_ROW_HEIGHT, ah = 0 } = rowConfigBeforePaste;
                            const nowRowHeight = Math.max(h, ah);
                            if (willSetHeight > nowRowHeight) {
                                rowHeight[index + range.rows[0]] = willSetHeight;
                                originRowHeight[index + range.rows[0]] = nowRowHeight;
                            }
                        } else {
                            rowHeight[index + range.rows[0]] = willSetHeight;
                            originRowHeight[index + range.rows[0]] = rowManager.getRow(range.rows[0] + index)?.h ?? DEFAULT_WORKSHEET_ROW_HEIGHT;
                        }
                    }
                });

                // apply row properties to the existing rows
                const setRowPropertyMutation: ISetWorksheetRowHeightMutationParams = {
                    unitId: unitId!,
                    subUnitId: subUnitId!,
                    ranges: [{ startRow: range.rows[0], endRow: Math.min(range.rows[range.rows.length - 1], maxRow),
                               startColumn: range.cols[0], endColumn: range.cols[range.cols.length - 1],
                    }],
                    rowHeight,
                };
                redoMutations.push({
                    id: SetWorksheetRowHeightMutation.id,
                    params: setRowPropertyMutation,
                });

                undoMutations.push({
                    id: SetWorksheetRowHeightMutation.id,
                    params: {
                        ...setRowPropertyMutation,
                        rowHeight: 20,
                    },
                });

                return {
                    redos: redoMutations,
                    undos: undoMutations,
                };
            },

            onPasteColumns(pasteTo, colProperties, pasteType) {
                const { range } = pasteTo;
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const addingColsCount = range.cols[range.cols.length - 1] - maxColumn;
                const existingColsCount = colProperties.length - addingColsCount;

                const defaultColumnWidth = self._configService.getConfig<number>(DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY) ?? DEFAULT_WORKSHEET_COLUMN_WIDTH;

                if (addingColsCount > 0) {
                    const addColMutation: IInsertColMutationParams = {
                        unitId: unitId!,
                        subUnitId: subUnitId!,
                        range: {
                            startRow: range.rows[0],
                            endRow: range.rows[range.rows.length - 1],
                            endColumn: range.cols[range.cols.length - 1],
                            startColumn: maxColumn,
                        },
                        colInfo: colProperties.slice(existingColsCount).map((property) => ({
                            w: property.width ? +property.width : defaultColumnWidth,
                            hd: BooleanNumber.FALSE,
                        })),
                    };
                    redoMutations.push({
                        id: InsertColMutation.id,
                        params: addColMutation,
                    });
                }
                // apply col properties to the existing rows
                const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                    unitId: unitId!,
                    subUnitId: subUnitId!,
                    ranges: [{
                        startRow: range.rows[0],
                        endRow: range.rows[range.rows.length - 1],

                        startColumn: range.cols[0],
                        endColumn: Math.min(range.cols[range.cols.length - 1], maxColumn) }],
                    colWidth: colProperties
                        .slice(0, existingColsCount)
                        .map((property) => (property.width ? +property.width : defaultColumnWidth)),
                };
                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPastePlainText(pasteTo: ISheetDiscreteRangeLocation, text: string, payload: ICopyPastePayload) {
                return self._onPastePlainText(pasteTo, text, payload);
            },

            onPasteCells(
                pasteFrom: ISheetDiscreteRangeLocation,
                pasteTo: ISheetDiscreteRangeLocation,
                data: ObjectMatrix<ICellDataWithSpanInfo>,
                payload: ICopyPastePayload
            ) {
                return self._onPasteCells(pasteFrom, pasteTo, data, payload);
            },

            onAfterPaste(success) {
                currentSheet = null;
            },
        };
    }

    private _generateDocumentDataModelSnapshot(snapshot: Partial<IDocumentData>) {
        const currentSkeleton = this._sheetSkeletonManagerService.getCurrent();
        if (currentSkeleton == null) {
            return null;
        }

        const { skeleton } = currentSkeleton;
        const documentModel = skeleton.getBlankCellDocumentModel()?.documentModel;
        const p = documentModel?.getSnapshot();
        const documentData = { ...p, ...snapshot };
        documentModel?.reset(documentData);
        return documentModel?.getSnapshot();
    }

    private _onPastePlainText(pasteTo: ISheetDiscreteRangeLocation, text: string, payload: ICopyPastePayload) {
        const { range, unitId, subUnitId } = pasteTo;
        let cellValue: IObjectMatrixPrimitiveType<ICellData>;
        if (/\r|\n/.test(text)) {
            const body = generateBody(text);
            const p = this._generateDocumentDataModelSnapshot({ body });
            cellValue = {
                [range.rows[0]]: {
                    [range.cols[0]]: {
                        p,
                    },
                },
            };
        } else {
            if (isFormulaString(text)) {
                cellValue = {
                    [range.rows[0]]: {
                        [range.cols[0]]: {
                            f: text,
                        },
                    },
                };
            } else {
                cellValue = {
                    [range.rows[0]]: {
                        [range.cols[0]]: {
                            v: text,
                        },
                    },
                };
            }
        }

        const setRangeValuesParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue,
        };

        return {
            redos: [
                {
                    id: SetRangeValuesMutation.id,
                    params: setRangeValuesParams,
                },
            ],
            undos: [
                {
                    id: SetRangeValuesMutation.id,
                    params: SetRangeValuesUndoMutationFactory(this._injector, setRangeValuesParams),
                },
            ],
        };
    }

    private _onPasteCells(
        pasteFrom: ISheetDiscreteRangeLocation,
        pasteTo: ISheetDiscreteRangeLocation,
        data: ObjectMatrix<ICellDataWithSpanInfo>,
        payload: ICopyPastePayload
    ): {
            redos: IMutationInfo[];
            undos: IMutationInfo[];
        } {
        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        return getDefaultOnPasteCellMutations(pasteFrom, pasteTo, data, payload, accessor);
    }

    private _initSpecialPasteHooks() {
        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        const self = this;

        const specialPasteValueHook: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
            specialPasteInfo: {
                label: 'specialPaste.value',
            },
            onPasteCells: (pasteFrom, pasteTo, data) => {
                return getSetCellValueMutations(pasteTo, pasteFrom, data, accessor);
            },
        };
        const specialPasteFormatHook: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            specialPasteInfo: {
                label: 'specialPaste.format',
            },
            onPasteCells(pasteFrom, pasteTo, matrix) {
                const redoMutationsInfo: IMutationInfo[] = [];
                const undoMutationsInfo: IMutationInfo[] = [];

                // clear cell style
                const { undos: styleUndos, redos: styleRedos } = getClearCellStyleMutations(pasteTo, matrix, accessor);
                redoMutationsInfo.push(...styleRedos);
                undoMutationsInfo.push(...styleUndos);

                // clear and set merge
                const { undos: mergeUndos, redos: mergeRedos } = getClearAndSetMergeMutations(
                    pasteTo,
                    matrix,
                    accessor
                );
                redoMutationsInfo.push(...mergeRedos);
                undoMutationsInfo.push(...mergeUndos);

                const { undos: setStyleUndos, redos: setStyleRedos } = getSetCellStyleMutations(
                    pasteTo,
                    matrix,
                    accessor
                );

                redoMutationsInfo.push(...setStyleRedos);
                undoMutationsInfo.push(...setStyleUndos);

                return {
                    undos: undoMutationsInfo,
                    redos: redoMutationsInfo,
                };
            },
        };

        const specialPasteColWidthHook: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
            specialPasteInfo: {
                label: 'specialPaste.colWidth',
            },
            onPasteCells() {
                return {
                    undos: [],
                    redos: [],
                };
            },
            onPasteColumns(pasteTo, colProperties, payload) {
                const workbook = self._currentUniverSheet.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const unitId = workbook.getUnitId();
                const subUnitId = workbook.getActiveSheet().getSheetId();
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];
                const currentSheet = self._getWorksheet(unitId, subUnitId);
                const { range } = pasteTo;
                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const addingColsCount = range.cols[range.cols.length - 1] - maxColumn;
                const existingColsCount = colProperties.length - addingColsCount;
                const defaultColumnWidth = self._configService.getConfig<number>(DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY) ?? DEFAULT_WORKSHEET_COLUMN_WIDTH;

                const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                    unitId: unitId!,
                    subUnitId: subUnitId!,
                    ranges: [{
                        startRow: range.rows[0],
                        endRow: Math.min(range.cols[range.cols.length - 1], maxColumn),
                        startColumn: range.cols[0],
                        endColumn: range.cols[range.cols.length - 1],
                    }],
                    colWidth: colProperties
                        .slice(0, existingColsCount)
                        .map((property) => (property.width ? +property.width : defaultColumnWidth)),
                };
                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },
        };

        const specialPasteBesidesBorder: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_BESIDES_BORDER,
            specialPasteInfo: {
                label: 'specialPaste.besidesBorder',
            },
            onPasteCells(pasteFrom, pasteTo, matrix, payload) {
                const workbook = self._currentUniverSheet.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const redoMutationsInfo: IMutationInfo[] = [];
                const undoMutationsInfo: IMutationInfo[] = [];
                const { range, unitId, subUnitId } = pasteTo;
                const valueMatrix = new ObjectMatrix<ICellData>();

                // TODO@Dushusir: undo selection
                matrix.forValue((row, col, value) => {
                    const style = value.s;
                    if (typeof style === 'object') {
                        valueMatrix.setValue(range.rows[row], range.cols[col], {
                            s: { ...style, bd: undefined },
                            v: value.v,
                        });
                    }
                });

                // set cell value and style
                const setValuesMutation: ISetRangeValuesMutationParams = {
                    unitId,
                    subUnitId,
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

                const { undos, redos } = getClearAndSetMergeMutations(pasteTo, matrix, accessor);
                undoMutationsInfo.push(...undos);
                redoMutationsInfo.push(...redos);

                return {
                    redos: redoMutationsInfo,
                    undos: undoMutationsInfo,
                };
            },
        };

        return [specialPasteValueHook, specialPasteFormatHook, specialPasteColWidthHook, specialPasteBesidesBorder];
    }

    private _getWorksheet(unitId: string, subUnitId: string): Worksheet {
        const worksheet = this._currentUniverSheet.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);

        if (!worksheet) {
            throw new Error(
                `[SheetClipboardController]: cannot find a worksheet with unitId ${unitId} and subUnitId ${subUnitId}.`
            );
        }

        return worksheet;
    }
}

// Generate cellValue from range and set null
function generateNullCellValue(range: IRange[]): IObjectMatrixPrimitiveType<Nullable<ICellData>> {
    const cellValue = new ObjectMatrix<Nullable<ICellData>>();
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
