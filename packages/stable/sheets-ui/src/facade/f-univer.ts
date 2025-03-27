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

import type { DocumentDataModel, IDisposable, Injector, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type {
    IColumnsHeaderCfgParam,
    IRender,
    IRowsHeaderCfgParam,
    RenderComponentType,
    SheetComponent,
    SheetExtension,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/engine-render';
import type { CommandListenerSkeletonChange } from '@univerjs/sheets';
import type { IEditorBridgeServiceVisibleParam, ISetZoomRatioCommandParams, ISheetPasteByShortKeyParams, IViewportScrollState } from '@univerjs/sheets-ui';
import type { FRange } from '@univerjs/sheets/facade';
import type { IBeforeClipboardChangeParam, IBeforeClipboardPasteParam, IBeforeSheetEditEndEventParams, IBeforeSheetEditStartEventParams, ISheetEditChangingEventParams, ISheetEditEndedEventParams, ISheetEditStartedEventParams, ISheetZoomEvent } from './f-event';
import { CanceledError, DisposableCollection, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, ILogService, IUniverInstanceService, LifecycleService, LifecycleStages, RichTextValue, toDisposable, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { COMMAND_LISTENER_SKELETON_CHANGE, getSkeletonChangedEffectedRange, SheetsSelectionsService } from '@univerjs/sheets';
import { DragManagerService, HoverManagerService, IEditorBridgeService, ISheetClipboardService, SetCellEditVisibleOperation, SetZoomRatioCommand, SHEET_VIEW_KEY, SheetPasteShortKeyCommand, SheetScrollManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { FSheetHooks } from '@univerjs/sheets/facade';
import { CopyCommand, CutCommand, HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, KeyCode, PasteCommand, PLAIN_TEXT_CLIPBOARD_MIME_TYPE, supportClipboardAPI } from '@univerjs/ui';
import { combineLatest, filter } from 'rxjs';

/**
 * @ignore
 */
export interface IFUniverSheetsUIMixin {
    /**
     * @deprecated use same API in FWorkSheet.
     * Customize the column header of the spreadsheet.
     * @param {IColumnsHeaderCfgParam} cfg The configuration of the column header.
     * @example
     * ```typescript
     * univerAPI.customizeColumnHeader({ headerStyle: { fontColor: '#fff', size: 40, backgroundColor: '#4e69ee', fontSize: 9 }, columnsCfg: ['MokaII', undefined, null, { text: 'Size', textAlign: 'left' }] });
     * ```
     */
    customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void;

    /**
     * @deprecated use same API in FWorkSheet.
     * Customize the row header of the spreadsheet.
     * @param {IRowsHeaderCfgParam} cfg The configuration of the row header.
     * @example
     * ```typescript
     * univerAPI.customizeRowHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, rowsCfg: ['MokaII', undefined, null, { text: 'Size', textAlign: 'left' }] });
     * ```
     */
    customizeRowHeader(cfg: IRowsHeaderCfgParam): void;

    /**
     * Register sheet row header render extensions.
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetRowHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable;
    /**
     * Register sheet column header render extensions.
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetColumnHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable;
    /**
     * Register sheet main render extensions.
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetMainExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent` as instead.
     */
    getSheetHooks(): FSheetHooks;
}

export class FUniverSheetsUIMixin extends FUniver implements IFUniverSheetsUIMixin {
    // eslint-disable-next-line max-lines-per-function
    private _initSheetUIEvent(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        // Edit events
        this.registerEventHandler(
            this.Event.BeforeSheetEditStart,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetCellEditVisibleOperation.id) return;

                const target = this.getActiveSheet();
                if (!target) return;

                const { workbook, worksheet } = target;
                const editorBridgeService = injector.get(IEditorBridgeService);
                const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                const { visible, keycode, eventType } = params;
                const loc = editorBridgeService.getEditLocation()!;

                if (visible) {
                    const eventParams: IBeforeSheetEditStartEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: false,
                    };
                    this.fireEvent(this.Event.BeforeSheetEditStart, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetEditEnd,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetCellEditVisibleOperation.id) return;

                const target = this.getActiveSheet();
                if (!target) return;

                const { workbook, worksheet } = target;
                const editorBridgeService = injector.get(IEditorBridgeService);
                const univerInstanceService = injector.get(IUniverInstanceService);
                const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                const { visible, keycode, eventType } = params;
                const loc = editorBridgeService.getEditLocation()!;

                if (!visible) {
                    const eventParams: IBeforeSheetEditEndEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: false,
                        value: RichTextValue.create(univerInstanceService.getUnit<DocumentDataModel>(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)!.getSnapshot()),
                        isConfirm: keycode !== KeyCode.ESC,
                    };
                    this.fireEvent(this.Event.BeforeSheetEditEnd, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetEditStarted,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetCellEditVisibleOperation.id) return;

                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) return;

                const { workbook, worksheet } = target;
                const editorBridgeService = injector.get(IEditorBridgeService);
                const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                const { visible, keycode, eventType } = params;
                const loc = editorBridgeService.getEditLocation()!;

                if (visible) {
                    const eventParams: ISheetEditStartedEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: false,
                    };
                    this.fireEvent(this.Event.SheetEditStarted, eventParams);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetEditEnded,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetCellEditVisibleOperation.id) return;

                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) return;

                const { workbook, worksheet } = target;
                const editorBridgeService = injector.get(IEditorBridgeService);
                const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                const { visible, keycode, eventType } = params;
                const loc = editorBridgeService.getEditLocation()!;

                if (!visible) {
                    const eventParams: ISheetEditEndedEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: false,
                        isConfirm: keycode !== KeyCode.ESC,
                    };
                    this.fireEvent(this.Event.SheetEditEnded, eventParams);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetEditChanging,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== RichTextEditingMutation.id) return;

                const target = this.getActiveSheet();
                if (!target) return;

                const { workbook, worksheet } = target;
                const editorBridgeService = injector.get(IEditorBridgeService);
                const univerInstanceService = injector.get(IUniverInstanceService);
                const params = commandInfo.params as IRichTextEditingMutationParams;
                if (!editorBridgeService.isVisible().visible) return;

                const { unitId } = params;
                if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                    const { row, column } = editorBridgeService.getEditLocation()!;
                    const eventParams: ISheetEditChangingEventParams = {
                        workbook,
                        worksheet,
                        row,
                        column,
                        value: RichTextValue.create(univerInstanceService.getUnit<DocumentDataModel>(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)!.getSnapshot()),
                        isZenEditor: false,
                    };
                    this.fireEvent(this.Event.SheetEditChanging, eventParams);
                }
            })
        );

        // Zoom events
        this.registerEventHandler(
            this.Event.BeforeSheetZoomChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetZoomRatioCommand.id) return;

                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) return;

                const { workbook, worksheet } = target;
                const eventParams: ISheetZoomEvent = {
                    zoom: (commandInfo.params as ISetZoomRatioCommandParams).zoomRatio,
                    workbook,
                    worksheet,
                };
                this.fireEvent(this.Event.BeforeSheetZoomChange, eventParams);
                if (eventParams.cancel) {
                    throw new CanceledError();
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetZoomChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetZoomRatioCommand.id) return;

                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) return;

                const { workbook, worksheet } = target;
                this.fireEvent(this.Event.SheetZoomChanged, {
                    zoom: worksheet.getZoom(),
                    workbook,
                    worksheet,
                });
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _initObserverListener(injector: Injector): void {
        const renderManagerService = injector.get(IRenderManagerService);

        const lifeCycleService = injector.get(LifecycleService);
        const disposable = new DisposableCollection();

        // eslint-disable-next-line max-lines-per-function
        this.disposeWithMe(lifeCycleService.lifecycle$.subscribe((lifecycle) => {
            if (lifecycle !== LifecycleStages.Rendered) return;
            disposable.dispose();
            const hoverManagerService = injector.get(HoverManagerService);
            const dragManagerService = injector.get(DragManagerService);
            if (!hoverManagerService) return;

            // Cell events
            this.registerEventHandler(
                this.Event.CellClicked,
                () => hoverManagerService.currentClickedCell$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.location.unitId, cell.location.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.CellClicked, {
                            ...baseParams,
                            ...cell,
                            row: cell.location.row,
                            column: cell.location.col,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.CellHover,
                () => hoverManagerService.currentRichText$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.unitId, cell.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.CellHover, {
                            ...baseParams,
                            ...cell,
                            row: cell.row,
                            column: cell.col,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.CellPointerDown,
                () => hoverManagerService.currentPointerDownCell$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.unitId, cell.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.CellPointerDown, {
                            ...baseParams,
                            ...cell,
                            row: cell.row,
                            column: cell.col,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.CellPointerUp,
                () => hoverManagerService.currentPointerUpCell$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.unitId, cell.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.CellPointerUp, {
                            ...baseParams,
                            ...cell,
                            row: cell.row,
                            column: cell.col,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.CellPointerMove,
                () => hoverManagerService.currentCellPosWithEvent$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.unitId, cell.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.CellPointerMove, {
                            ...baseParams,
                            ...cell,
                            row: cell.row,
                            column: cell.col,
                        });
                    })
            );

            // Drag events
            this.registerEventHandler(
                this.Event.DragOver,
                () => dragManagerService.currentCell$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.location.unitId, cell.location.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.DragOver, {
                            ...baseParams,
                            ...cell,
                            row: cell.location.row,
                            column: cell.location.col,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.Drop,
                () => dragManagerService.endCell$
                    ?.pipe(filter((cell) => !!cell))
                    .subscribe((cell) => {
                        const baseParams = this.getSheetTarget(cell.location.unitId, cell.location.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.Drop, {
                            ...baseParams,
                            ...cell,
                            row: cell.location.row,
                            column: cell.location.col,
                        });
                    })
            );

            // Row Header events
            this.registerEventHandler(
                this.Event.RowHeaderClick,
                () => hoverManagerService.currentRowHeaderClick$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.RowHeaderClick, {
                            ...baseParams,
                            row: header.index,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.RowHeaderPointerDown,
                () => hoverManagerService.currentRowHeaderPointerDown$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.RowHeaderPointerDown, {
                            ...baseParams,
                            row: header.index,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.RowHeaderPointerUp,
                () => hoverManagerService.currentRowHeaderPointerUp$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.RowHeaderPointerUp, {
                            ...baseParams,
                            row: header.index,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.RowHeaderHover,
                () => hoverManagerService.currentHoveredRowHeader$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.RowHeaderHover, {
                            ...baseParams,
                            row: header.index,
                        });
                    })
            );

            // Column Header events
            this.registerEventHandler(
                this.Event.ColumnHeaderClick,
                () => hoverManagerService.currentColHeaderClick$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.ColumnHeaderClick, {
                            ...baseParams,
                            column: header.index,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.ColumnHeaderPointerDown,
                () => hoverManagerService.currentColHeaderPointerDown$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.ColumnHeaderPointerDown, {
                            ...baseParams,
                            column: header.index,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.ColumnHeaderPointerUp,
                () => hoverManagerService.currentColHeaderPointerUp$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.ColumnHeaderPointerUp, {
                            ...baseParams,
                            column: header.index,
                        });
                    })
            );

            this.registerEventHandler(
                this.Event.ColumnHeaderHover,
                () => hoverManagerService.currentHoveredColHeader$
                    ?.pipe(filter((header) => !!header))
                    .subscribe((header) => {
                        const baseParams = this.getSheetTarget(header.unitId, header.subUnitId);
                        if (!baseParams) return;
                        this.fireEvent(this.Event.ColumnHeaderHover, {
                            ...baseParams,
                            column: header.index,
                        });
                    })
            );
        }));
        this.disposeWithMe(disposable);

        // UI Events in renderUnit
        const unitMap = new Map<string, IDisposable>();
        let sheetRenderUnit: Nullable<IRender>;
        const combined$ = combineLatest([
            renderManagerService.created$,
            lifeCycleService.lifecycle$,
        ]);
        // eslint-disable-next-line max-lines-per-function
        this.disposeWithMe(combined$.subscribe(([created, lifecycle]) => {
            // univer & univer-pro are not same in life cycle.

            // for pro
            // type     2   2   1   1
            // stage    1   2   2   2
            // for univer
            // type     2   1   1   1
            // stage    1   1   1   2

            if (created.type === UniverInstanceType.UNIVER_SHEET) {
                sheetRenderUnit = created;
            }
            if (lifecycle <= LifecycleStages.Rendered) return;
            if (!sheetRenderUnit) return;

            const disposable = new DisposableCollection();
            const workbook = this.getWorkbook(sheetRenderUnit.unitId);
            if (!workbook) return;

            if (unitMap.get(sheetRenderUnit.unitId)) {
                unitMap.get(sheetRenderUnit.unitId)?.dispose();
            }
            unitMap.set(sheetRenderUnit.unitId, disposable);
            const scrollManagerService = sheetRenderUnit.with(SheetScrollManagerService);
            const selectionService = sheetRenderUnit.with(SheetsSelectionsService);

            // Register scroll event handler
            disposable.add(this.registerEventHandler(
                this.Event.Scroll,
                () => scrollManagerService.validViewportScrollInfo$.subscribe((params: Nullable<IViewportScrollState>) => {
                    if (!params) return;
                    this.fireEvent(this.Event.Scroll, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        ...params,
                    });
                })
            ));

            // Register selection event handlers
            disposable.add(this.registerEventHandler(
                this.Event.SelectionMoveStart,
                () => selectionService.selectionMoveStart$.subscribe((selections) => {
                    this.fireEvent(this.Event.SelectionMoveStart, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                })
            ));

            disposable.add(this.registerEventHandler(
                this.Event.SelectionMoving,
                () => selectionService.selectionMoving$.subscribe((selections) => {
                    this.fireEvent(this.Event.SelectionMoving, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                })
            ));

            disposable.add(this.registerEventHandler(
                this.Event.SelectionMoveEnd,
                () => selectionService.selectionMoveEnd$.subscribe((selections) => {
                    this.fireEvent(this.Event.SelectionMoveEnd, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                })
            ));

            disposable.add(this.registerEventHandler(
                this.Event.SelectionChanged,
                () => selectionService.selectionChanged$.subscribe((selections) => {
                    this.fireEvent(this.Event.SelectionChanged, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                })
            ));
            // for pro, in pro, life cycle & created$ is not same as univer sdk
            // if not clear sheetRenderUnit, that would cause event bind twice!
            sheetRenderUnit = null;
            this.disposeWithMe(disposable);
        }));

        this.disposeWithMe(renderManagerService.disposed$.subscribe((unitId) => {
            unitMap.get(unitId)?.dispose();
            unitMap.delete(unitId);
        }));

        this.disposeWithMe(() => {
            unitMap.forEach((disposable) => {
                disposable.dispose();
            });
        });
    }

    /**
     * @ignore
     */

    override _initialize(injector: Injector): void {
        this._initSheetUIEvent(injector);
        this._initObserverListener(injector);
        const commandService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.BeforeClipboardChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                switch (commandInfo.id) {
                    case CopyCommand.id:
                    case CutCommand.id:
                        this._beforeClipboardChange();
                        break;
                }
            })
        );

        this.registerEventHandler(
            this.Event.ClipboardChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                switch (commandInfo.id) {
                    case CopyCommand.id:
                    case CutCommand.id:
                        this._clipboardChanged();
                        break;
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeClipboardPaste,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                switch (commandInfo.id) {
                    case SheetPasteShortKeyCommand.id:
                        this._beforeClipboardPaste(commandInfo.params);
                        break;
                    case PasteCommand.id:
                        this._beforeClipboardPasteAsync();
                        break;
                }
            })
        );

        this.registerEventHandler(
            this.Event.ClipboardPasted,
            () => commandService.onCommandExecuted((commandInfo) => {
                switch (commandInfo.id) {
                    case SheetPasteShortKeyCommand.id:
                        this._clipboardPaste(commandInfo.params);
                        break;
                    case PasteCommand.id:
                        this._clipboardPasteAsync();
                        break;
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetSkeletonChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (COMMAND_LISTENER_SKELETON_CHANGE.indexOf(commandInfo.id) > -1) {
                    const sheet = this.getActiveSheet();
                    if (!sheet) return;
                    const ranges = getSkeletonChangedEffectedRange(commandInfo, sheet.worksheet.getMaxColumns())
                        .map((range) => this.getWorkbook(range.unitId)?.getSheetBySheetId(range.subUnitId)?.getRange(range.range))
                        .filter(Boolean) as FRange[];
                    if (!ranges.length) return;

                    this.fireEvent(this.Event.SheetSkeletonChanged, {
                        workbook: sheet.workbook,
                        worksheet: sheet.worksheet,
                        payload: commandInfo as CommandListenerSkeletonChange,
                        skeleton: sheet.worksheet.getSkeleton()!,
                        effectedRanges: ranges,
                    });
                }
            })
        );
    }

    private _generateClipboardCopyParam(): IBeforeClipboardChangeParam | undefined {
        const workbook = this.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        const range = workbook?.getActiveRange();
        if (!workbook || !worksheet || !range) {
            return;
        }

        const clipboardService = this._injector.get(ISheetClipboardService);
        const content = clipboardService.generateCopyContent(workbook.getId(), worksheet.getSheetId(), range.getRange());
        if (!content) {
            return;
        }
        const { html, plain } = content;
        const eventParams: IBeforeClipboardChangeParam = {
            workbook,
            worksheet,
            text: plain,
            html,
            fromSheet: worksheet,
            fromRange: range,
        };
        return eventParams;
    }

    private _beforeClipboardChange(): void {
        const eventParams = this._generateClipboardCopyParam();
        if (!eventParams) return;

        this.fireEvent(this.Event.BeforeClipboardChange, eventParams);
        if (eventParams.cancel) {
            throw new CanceledError();
        }
    }

    private _clipboardChanged(): void {
        const eventParams = this._generateClipboardCopyParam();
        if (!eventParams) return;

        this.fireEvent(this.Event.ClipboardChanged, eventParams);
    }

    private _generateClipboardPasteParam(params?: ISheetPasteByShortKeyParams): IBeforeClipboardPasteParam | undefined {
        if (!params) {
            return;
        }
        const { htmlContent, textContent } = params as ISheetPasteByShortKeyParams;
        const workbook = this.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return;
        }
        const eventParams: IBeforeClipboardPasteParam = {
            workbook,
            worksheet,
            text: textContent,
            html: htmlContent,
        };
        return eventParams;
    }

    private async _generateClipboardPasteParamAsync(): Promise<IBeforeClipboardPasteParam | undefined> {
        const workbook = this.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return;
        }
        const clipboardInterfaceService = this._injector.get(IClipboardInterfaceService);
        const clipboardItems = await clipboardInterfaceService.read();
        const item = clipboardItems[0];
        let eventParams;
        if (item) {
            const types = item.types;
            const text =
                types.indexOf(PLAIN_TEXT_CLIPBOARD_MIME_TYPE) !== -1
                    ? await item.getType(PLAIN_TEXT_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                    : '';
            const html =
                types.indexOf(HTML_CLIPBOARD_MIME_TYPE) !== -1
                    ? await item.getType(HTML_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                    : '';
            eventParams = {
                workbook,
                worksheet,
                text,
                html,
            };
        }
        return eventParams;
    }

    private _beforeClipboardPaste(params?: ISheetPasteByShortKeyParams): void {
        const eventParams = this._generateClipboardPasteParam(params);
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new CanceledError();
        }
    }

    private _clipboardPaste(params?: ISheetPasteByShortKeyParams): void {
        const eventParams = this._generateClipboardPasteParam(params);
        if (!eventParams) return;
        this.fireEvent(this.Event.ClipboardPasted, eventParams);
        if (eventParams.cancel) {
            throw new CanceledError();
        }
    }

    private async _beforeClipboardPasteAsync(): Promise<void> {
        if (!supportClipboardAPI()) {
            const logService = this._injector.get(ILogService);
            logService.warn('[Facade]: The navigator object only supports the browser environment');
            return;
        }
        const eventParams = await this._generateClipboardPasteParamAsync();
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new CanceledError();
        }
    }

    private async _clipboardPasteAsync(): Promise<void> {
        if (!supportClipboardAPI()) {
            const logService = this._injector.get(ILogService);
            logService.warn('[Facade]: The navigator object only supports the browser environment');
            return;
        }
        const eventParams = await this._generateClipboardPasteParamAsync();
        if (!eventParams) return;
        this.fireEvent(this.Event.ClipboardPasted, eventParams);
        if (eventParams.cancel) {
            throw new CanceledError();
        }
    }

    override customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void {
        const wb = this.getActiveWorkbook();
        if (!wb) {
            console.error('WorkBook not exist');
            return;
        }
        const unitId = wb?.getId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const activeSheet = wb.getActiveSheet();
        const subUnitId = activeSheet.getSheetId();
        const render = renderManagerService.getRenderById(unitId);
        if (render && cfg.headerStyle?.size) {
            const skm = render.with(SheetSkeletonManagerService);
            skm.setColumnHeaderSize(render, subUnitId, cfg.headerStyle?.size);
            activeSheet?.refreshCanvas();
        }

        const sheetColumn = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        sheetColumn.setCustomHeader(cfg);
        activeSheet?.refreshCanvas();
    }

    override customizeRowHeader(cfg: IRowsHeaderCfgParam): void {
        const wb = this.getActiveWorkbook();
        if (!wb) {
            console.error('WorkBook not exist');
            return;
        }
        const unitId = wb?.getId();
        const sheetRow = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        sheetRow.setCustomHeader(cfg);
    }

    override registerSheetRowHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    override registerSheetColumnHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    override registerSheetMainExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.MAIN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    /**
     * Get sheet render component from render by unitId and view key.
     * @private
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SHEET_VIEW_KEY} viewKey The view key of the spreadsheet.
     * @returns {Nullable<RenderComponentType>} The render component.
     */
    private _getSheetRenderComponent(unitId: string, viewKey: SHEET_VIEW_KEY): Nullable<RenderComponentType> {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (!render) {
            throw new Error(`Render Unit with unitId ${unitId} not found`);
        }

        const { components } = render;

        const renderComponent = components.get(viewKey);
        if (!renderComponent) {
            throw new Error('Render component not found');
        }

        return renderComponent;
    }

    /**
     * Get sheet hooks.
     * @returns {FSheetHooks} FSheetHooks instance
     */
    override getSheetHooks(): FSheetHooks {
        return this._injector.createInstance(FSheetHooks);
    }
}

FUniver.extend(FUniverSheetsUIMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsUIMixin { }
}
