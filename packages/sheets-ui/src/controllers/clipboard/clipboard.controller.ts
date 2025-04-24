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
    ICommandInfo,
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
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    ISetRangeValuesMutationParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowHeightMutationParams,
} from '@univerjs/sheets';
import type {
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    ICopyPastePayload,
    ISheetClipboardHook,
    ISheetDiscreteRangeLocation,
} from '../../services/clipboard/type';
import type { IScrollStateWithSearchParam } from '../../services/scroll-manager.service';

import type { IUniverSheetsUIConfig } from '../config.schema';

import {
    BooleanNumber,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    extractPureTextFromCell,
    handleStyleToString,
    ICommandService,
    IConfigService,
    IContextService,
    Inject,
    Injector,
    isFormulaString,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    RxDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';

import { MessageType } from '@univerjs/design';
import { convertBodyToHtml, DocSelectionRenderService } from '@univerjs/docs-ui';

import { IRenderManagerService, withCurrentTypeOfRenderer } from '@univerjs/engine-render';
import {
    InsertColMutation,
    InsertRowMutation,
    MAX_CELL_PER_SHEET_KEY,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import { BuiltInUIPart, connectInjector, IMessageService, IUIPartsService } from '@univerjs/ui';
import { Subject, takeUntil } from 'rxjs';
import { AddWorksheetMergeCommand } from '../../commands/commands/add-worksheet-merge.command';
import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetOptionalPasteCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteShortKeyCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { ClipboardPopupMenu } from '../../views/clipboard/ClipboardPopupMenu';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../config.schema';
import { whenSheetEditorFocused } from '../shortcuts/utils';
import { RemovePasteMenuCommands } from './const';
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

const shouldRemoveShapeIds = [
    InsertColMutation.id,
    InsertRowMutation.id,
    RemoveColMutation.id,
    RemoveRowMutation.id,
    MoveRangeMutation.id,
    MoveRowsMutation.id,
    MoveColsMutation.id,
];

export class SheetClipboardController extends RxDisposable {
    private _refreshOptionalPaste$ = new Subject();
    refreshOptionalPaste$ = this._refreshOptionalPaste$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IConfigService private readonly _configService: IConfigService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localService: LocaleService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService
    ) {
        super();
        this._init();
        this._initCommandListener();
        this._initUIComponents();
        this._pasteWithDoc();
    }

    refreshOptionalPaste() {
        this._refreshOptionalPaste$.next(Math.random());
    }

    private _pasteWithDoc() {
        const sheetPasteShortKeyFn = (docSelectionRenderService: DocSelectionRenderService) => {
            docSelectionRenderService.onPaste$.pipe(takeUntil(this.dispose$)).subscribe((config) => {
                if (!whenSheetEditorFocused(this._contextService)) {
                    return;
                }

                // editor's value should not change and avoid triggering input event
                config!.event.preventDefault();

                const clipboardEvent = config!.event as ClipboardEvent;
                const htmlContent = clipboardEvent.clipboardData?.getData('text/html');
                const textContent = clipboardEvent.clipboardData?.getData('text/plain');
                const files = this._resolveClipboardFiles(clipboardEvent.clipboardData);

                this._commandService.executeCommand(SheetPasteShortKeyCommand.id, { htmlContent, textContent, files });
            });
        };

        // docSelectionRenderService would init before clipboardService controller when creating a univer.
        // But when creating a sheet unit again after the previous sheet unit has been disposed, clipboard controller would init before docSelectionRenderService.
        // In this case, DocSelectionRenderService isn't ready when clipboardService controller init.
        // So better listening to the created$ event of the renderManagerService to get the DocSelectionRenderService instance.
        let docSelectionRenderService = this._renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)?.with(DocSelectionRenderService);

        if (docSelectionRenderService) {
            sheetPasteShortKeyFn(docSelectionRenderService);
        }
        this._renderManagerService.created$.subscribe((renderer) => {
            if (renderer.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                docSelectionRenderService = this._renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)?.with(DocSelectionRenderService);
                if (docSelectionRenderService) {
                    sheetPasteShortKeyFn(docSelectionRenderService);
                }
            }
        });
    }

    private _resolveClipboardFiles(clipboardData: DataTransfer | null) {
        if (!clipboardData) {
            return;
        }

        const files = Array.from(clipboardData.items)
            .map((item) => item.kind === 'file' ? item.getAsFile() : undefined)
            .filter(Boolean) as File[];

        return files.length > 0 ? files : undefined;
    }

    private _init(): void {
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
            SheetOptionalPasteCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        // register basic sheet clipboard hooks
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._initCopyingHooks()));
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._initPastingHook()));
        const disposables = this._initSpecialPasteHooks().map((hook) =>
            this._sheetClipboardService.addClipboardHook(hook)
        );
        this.disposeWithMe({ dispose: () => disposables.forEach((d) => d.dispose()) });
    }

    // eslint-disable-next-line max-lines-per-function
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
                    return convertBodyToHtml(cell.p);
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

                let style = '';

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

                return Object.keys(properties).length ? properties : null;
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
                const worksheet = self._instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
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

    // eslint-disable-next-line max-lines-per-function
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

            // eslint-disable-next-line max-lines-per-function
            onPasteRows(pasteTo, rowProperties) {
                const { range } = pasteTo;
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxRow = currentSheet!.getMaxRows();
                const rowCount = maxRow - 1;
                const addingRowsCount = range.rows[range.rows.length - 1] - rowCount;
                const existingRowsCount = rowProperties.length - addingRowsCount;

                const rowManager = currentSheet!.getRowManager();
                if (addingRowsCount > 0) {
                    const rowInfo: IObjectArrayPrimitiveType<IRowData> = {};
                    rowProperties.slice(existingRowsCount).forEach((property, index) => {
                        const { height: PropertyHeight } = property || {};
                        if (PropertyHeight) {
                            rowInfo[index] = {
                                h: Number.parseFloat(PropertyHeight),
                                hd: BooleanNumber.FALSE,
                            };
                        }
                    });

                    const addRowRange = {
                        startColumn: range.cols[0],
                        endColumn: range.cols[range.cols.length - 1],
                        endRow: range.rows[range.rows.length - 1],
                        startRow: maxRow,
                    };

                    const addRowMutation: IInsertRowMutationParams = {
                        unitId: unitId!,
                        subUnitId: subUnitId!,
                        range: addRowRange,
                        rowInfo,
                    };
                    redoMutations.push({
                        id: InsertRowMutation.id,
                        params: addRowMutation,
                    });
                    undoMutations.push({
                        id: RemoveRowMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            range: addRowRange,
                        },
                    });
                }

                // get row height of existing rows
                // TODO When Excel pasted, there was no width height, Do we still need to set the height?
                const rowHeight: IObjectArrayPrimitiveType<number> = {};
                const originRowHeight: IObjectArrayPrimitiveType<number> = {};
                rowProperties.slice(0, existingRowsCount).forEach((property, index) => {
                    const { height: propertyHeight } = property;
                    if (propertyHeight) {
                        const rowConfigBeforePaste = rowManager.getRow(range.rows[0] + index);
                        const willSetHeight = Number.parseFloat(propertyHeight);
                        if (rowConfigBeforePaste) {
                            const { h = DEFAULT_WORKSHEET_ROW_HEIGHT, ah = 0 } = rowConfigBeforePaste;
                            const nowRowHeight = Math.max(h, ah);
                            if (willSetHeight > nowRowHeight) {
                                rowHeight[index + range.rows[0]] = willSetHeight;
                                originRowHeight[index + range.rows[0]] = nowRowHeight;
                            } else {
                                rowHeight[index + range.rows[0]] = nowRowHeight;
                                originRowHeight[index + range.rows[0]] = nowRowHeight;
                            }
                        } else {
                            rowHeight[index + range.rows[0]] = willSetHeight;
                            originRowHeight[index + range.rows[0]] = rowManager.getRow(range.rows[0] + index)?.h ?? DEFAULT_WORKSHEET_ROW_HEIGHT;
                        }
                    }
                });

                // apply row properties to the existing rows
                if (Object.keys(rowHeight).length) {
                    const setRowPropertyMutation: ISetWorksheetRowHeightMutationParams = {
                        unitId: unitId!,
                        subUnitId: subUnitId!,
                        ranges: [{
                            startRow: range.rows[0],
                            endRow: Math.min(range.rows[range.rows.length - 1], maxRow),
                            startColumn: range.cols[0],
                            endColumn: range.cols[range.cols.length - 1],
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
                            rowHeight: originRowHeight,
                        },
                    });
                }

                return {
                    redos: redoMutations,
                    undos: undoMutations,
                };
            },

            // eslint-disable-next-line max-lines-per-function
            onPasteColumns(pasteTo, colProperties, pasteType) {
                const { range } = pasteTo;
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const colCount = maxColumn - 1;
                const addingColsCount = range.cols[range.cols.length - 1] - colCount;
                const existingColsCount = colProperties.length - addingColsCount;

                const defaultColumnWidth = self._configService.getConfig<number>(DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY) ?? DEFAULT_WORKSHEET_COLUMN_WIDTH;
                const pasteToCols = range.cols;
                const startColumn = pasteToCols[0];

                if (addingColsCount > 0) {
                    const addColRange = {
                        startRow: range.rows[0],
                        endRow: range.rows[range.rows.length - 1],
                        endColumn: range.cols[range.cols.length - 1],
                        startColumn: maxColumn,
                    };
                    const addColMutation: IInsertColMutationParams = {
                        unitId: unitId!,
                        subUnitId: subUnitId!,
                        range: addColRange,
                        colInfo: colProperties.slice(existingColsCount).map((property, index) => ({
                            w: property.width ? Math.max(+property.width, currentSheet!.getColumnWidth(pasteToCols[index])) : defaultColumnWidth,
                            hd: BooleanNumber.FALSE,
                        })),
                    };
                    redoMutations.push({
                        id: InsertColMutation.id,
                        params: addColMutation,
                    });
                    undoMutations.push({
                        id: RemoveColMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            range: addColRange,
                        },
                    });
                }

                const targetSetColPropertyParams = {
                    unitId: unitId!,
                    subUnitId: subUnitId!,
                    ranges: [{
                        startRow: range.rows[0],
                        endRow: range.rows[range.rows.length - 1],

                        startColumn: range.cols[0],
                        endColumn: Math.min(range.cols[range.cols.length - 1], maxColumn),
                    }],
                };

                // apply col properties to the existing rows
                if (colProperties.length > 0) {
                    const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                        ...targetSetColPropertyParams,
                        colWidth: colProperties
                            .slice(0, existingColsCount)
                            .reduce((p, c, index) => {
                                p[index + startColumn] = c.width ? Math.max(+c.width, currentSheet!.getColumnWidth(pasteToCols[index]) ?? defaultColumnWidth) : defaultColumnWidth;
                                return p;
                            }, {} as IObjectArrayPrimitiveType<number>),
                    };

                    const undoSetColPropertyParams: ISetWorksheetColWidthMutationParams = {
                        ...targetSetColPropertyParams,
                        colWidth: colProperties
                            .slice(0, existingColsCount)
                            .reduce((p, c, index) => {
                                p[index + startColumn] = currentSheet!.getColumnWidth(pasteToCols[index]) ?? defaultColumnWidth;
                                return p;
                            }, {} as IObjectArrayPrimitiveType<Nullable<number>>),
                    };

                    redoMutations.push({
                        id: SetWorksheetColWidthMutation.id,
                        params: setColPropertyMutation,
                    });

                    undoMutations.push({
                        id: SetWorksheetColWidthMutation.id,
                        params: undoSetColPropertyParams,
                    });
                }

                return {
                    redos: redoMutations,
                    undos: undoMutations,
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
        const currentSkeleton = withCurrentTypeOfRenderer(
            UniverInstanceType.UNIVER_SHEET,
            SheetSkeletonManagerService,
            this._instanceService,
            this._renderManagerService
        )?.getCurrentParam();

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
        if (/\r|\n/.test(text) || Tools.isLegalUrl(text)) {
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
        return this._injector.invoke((accessor) => {
            return getDefaultOnPasteCellMutations(pasteFrom, pasteTo, data, payload, accessor);
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _initSpecialPasteHooks() {
        const self = this;

        const specialPasteValueHook: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
            specialPasteInfo: {
                label: 'specialPaste.value',
            },
            onPasteCells: (pasteFrom, pasteTo, data) => {
                return this._injector.invoke((accessor) => {
                    return getSetCellValueMutations(pasteTo, pasteFrom, data, accessor);
                });
            },
        };
        const specialPasteFormatHook: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            specialPasteInfo: {
                label: 'specialPaste.format',
            },
            onPasteCells: (pasteFrom, pasteTo, matrix) => {
                const redoMutationsInfo: IMutationInfo[] = [];
                const undoMutationsInfo: IMutationInfo[] = [];

                // clear cell style
                const { undos: styleUndos, redos: styleRedos } = this._injector.invoke((accessor) => {
                    return getClearCellStyleMutations(pasteTo, matrix, accessor);
                });
                redoMutationsInfo.push(...styleRedos);
                undoMutationsInfo.push(...styleUndos);

                // clear and set merge
                const { undos: mergeUndos, redos: mergeRedos } = this._injector.invoke((accessor) => {
                    return getClearAndSetMergeMutations(
                        pasteTo,
                        matrix,
                        accessor
                    );
                });
                redoMutationsInfo.push(...mergeRedos);
                undoMutationsInfo.push(...mergeUndos);

                const { undos: setStyleUndos, redos: setStyleRedos } = this._injector.invoke((accessor) => {
                    return getSetCellStyleMutations(
                        pasteTo,
                        pasteFrom,
                        matrix,
                        accessor
                    );
                });

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
                const workbook = self._instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const unitId = workbook.getUnitId();
                const subUnitId = workbook.getActiveSheet()?.getSheetId();

                if (!unitId || !subUnitId) {
                    throw new Error('Cannot find unitId or subUnitId');
                }

                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];
                const currentSheet = self._getWorksheet(unitId, subUnitId);

                const { range } = pasteTo;
                const pasteToCols = range.cols;
                const startColumn = pasteToCols[0];
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
                        .reduce((p, c, index) => {
                            p[index + startColumn] = c.width ? Math.max(+c.width, currentSheet!.getColumnWidth(pasteToCols[index]) ?? defaultColumnWidth) : defaultColumnWidth;
                            return p;
                        }, {} as IObjectArrayPrimitiveType<number>),
                };

                const undoSetColPropertyMutation: ISetWorksheetColWidthMutationParams = {
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
                        .reduce((p, c, index) => {
                            p[index + startColumn] = currentSheet!.getColumnWidth(pasteToCols[index]) ?? defaultColumnWidth;
                            return p;
                        }, {} as IObjectArrayPrimitiveType<Nullable<number>>),
                };

                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                undoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: undoSetColPropertyMutation,
                });

                return {
                    redos: redoMutations,
                    undos: undoMutations,
                };
            },
        };

        const specialPasteBesidesBorder: ISheetClipboardHook = {
            id: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_BESIDES_BORDER,
            specialPasteInfo: {
                label: 'specialPaste.besidesBorder',
            },
            onPasteCells: (pasteFrom, pasteTo, matrix, payload) => {
                const workbook = self._instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const redoMutationsInfo: IMutationInfo[] = [];
                const undoMutationsInfo: IMutationInfo[] = [];
                const { range, unitId, subUnitId } = pasteTo;
                const valueMatrix = new ObjectMatrix<ICellData>();

                // TODO@Dushusir: undo selection
                matrix.forValue((row, col, value) => {
                    const style = value.s;
                    if (typeof style === 'object') {
                        const newValue = Tools.deepClone(value);
                        if (newValue.s) {
                            newValue.s = {
                                ...style,
                                bd: null,
                            };
                        }
                        valueMatrix.setValue(range.rows[row], range.cols[col], newValue);
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
                const undoSetValuesMutation: ISetRangeValuesMutationParams = this._injector.invoke(
                    SetRangeValuesUndoMutationFactory,
                    setValuesMutation
                );

                undoMutationsInfo.push({
                    id: SetRangeValuesMutation.id,
                    params: undoSetValuesMutation,
                });

                const { undos, redos } = this._injector.invoke((accessor) => {
                    return getClearAndSetMergeMutations(pasteTo, matrix, accessor);
                });
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
        const worksheet = this._instanceService.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);

        if (!worksheet) {
            throw new Error(
                `[SheetClipboardController]: cannot find a worksheet with unitId ${unitId} and subUnitId ${subUnitId}.`
            );
        }

        return worksheet;
    }

    private _initCommandListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === AddWorksheetMergeCommand.id) {
                    this._sheetClipboardService.removeMarkSelection();
                } else if (shouldRemoveShapeIds.includes(command.id)) {
                    this._sheetClipboardService.removeMarkSelection();
                }
            })
        );

        const sheetsUIConfig = this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        if (sheetsUIConfig?.clipboardConfig?.hidePasteOptions) {
            return;
        }

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (RemovePasteMenuCommands.includes(command.id)) {
                    this._sheetClipboardService.disposePasteOptionsCache();
                }
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetScrollOperation.id) {
                    if (!this._sheetClipboardService.getPasteMenuVisible()) {
                        return;
                    }
                    const params = command.params as IScrollStateWithSearchParam;
                    const scrollUnitId = params.unitId;
                    const pasteOptionsCache = this._sheetClipboardService.getPasteOptionsCache();
                    const menuUnitId = pasteOptionsCache?.target.unitId;
                    if (scrollUnitId === menuUnitId) {
                        this._refreshOptionalPaste$.next(Math.random());
                    }
                }
            })
        );
    }

    private _initUIComponents() {
        const sheetsUIConfig = this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        if (sheetsUIConfig?.clipboardConfig?.hidePasteOptions) {
            return;
        }

        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(ClipboardPopupMenu, this._injector))
        );
    }
}
