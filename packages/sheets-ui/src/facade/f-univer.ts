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

import type { DocumentDataModel, IDisposable, Injector, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type {
    IColumnsHeaderCfgParam,
    IRowsHeaderCfgParam,
    RenderComponentType,
    SheetComponent,
    SheetExtension,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/engine-render';
import type { IEditorBridgeServiceVisibleParam, ISheetPasteByShortKeyParams, IViewportScrollState } from '@univerjs/sheets-ui';
import type { IBeforeClipboardChangeParam, IBeforeClipboardPasteParam, IBeforeSheetEditEndEventParams, IBeforeSheetEditStartEventParams, ISheetEditChangingEventParams, ISheetEditEndedEventParams, ISheetEditStartedEventParams } from './f-event';
import { CanceledError, DisposableCollection, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, FUniver, ICommandService, ILogService, IUniverInstanceService, LifecycleService, LifecycleStages, RichTextValue, toDisposable, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { DragManagerService, HoverManagerService, IEditorBridgeService, ISheetClipboardService, SetCellEditVisibleOperation, SHEET_VIEW_KEY, SheetPasteShortKeyCommand, SheetScrollManagerService } from '@univerjs/sheets-ui';
import { FSheetHooks } from '@univerjs/sheets/facade';
import { CopyCommand, CutCommand, HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, KeyCode, PasteCommand, PLAIN_TEXT_CLIPBOARD_MIME_TYPE, supportClipboardAPI } from '@univerjs/ui';
import { combineLatest, filter } from 'rxjs';

export interface IFUniverSheetsUIMixin {
    /**
     * Customize the column header of the spreadsheet.
     * @param {IColumnsHeaderCfgParam} cfg The configuration of the column header.
     * @example
     * ```typescript
     * univerAPI.customizeColumnHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, columnsCfg: ['MokaII', undefined, null, { text: 'Size', textAlign: 'left' }] });
     * ```
     */
    customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void;
    /**
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
        this.disposeWithMe(commandService.beforeCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetCellEditVisibleOperation.id) {
                if (!this._eventListend(this.Event.BeforeSheetEditStart) && !this._eventListend(this.Event.BeforeSheetEditEnd)) {
                    return;
                }
                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) {
                    return;
                }
                const { workbook, worksheet } = target;
                const editorBridgeService = injector.get(IEditorBridgeService);
                const univerInstanceService = injector.get(IUniverInstanceService);
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
                } else {
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
            }
        }));

        this.disposeWithMe(commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetCellEditVisibleOperation.id) {
                if (!this._eventListend(this.Event.SheetEditStarted) && !this._eventListend(this.Event.SheetEditEnded)) {
                    return;
                }
                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) {
                    return;
                }
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
                } else {
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
            }

            if (commandInfo.id === RichTextEditingMutation.id) {
                if (!this._eventListend(this.Event.SheetEditChanging)) {
                    return;
                }
                const target = this.getCommandSheetTarget(commandInfo);
                if (!target) {
                    return;
                }
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
            }
        }));

        this._initObserverListener(injector);
    }

    // eslint-disable-next-line max-lines-per-function
    _initObserverListener(injector: Injector): void {
        const univerInstanceService = injector.get(IUniverInstanceService);
        const unitM = univerInstanceService.getFocusedUnit();
        const unitId = unitM?.getUnitId();
        const renderManagerService = injector.get(IRenderManagerService);
        if (unitId) {
            const lifeCycleService = injector.get(LifecycleService);

            const disposable = new DisposableCollection();
            const combined$ = combineLatest([
                renderManagerService.created$,
                lifeCycleService.lifecycle$,
            ]);
            const unitMap = new Map<string, IDisposable>();
            // eslint-disable-next-line max-lines-per-function
            this.disposeWithMe(lifeCycleService.lifecycle$.subscribe((lifecycle) => {
                if (lifecycle < LifecycleStages.Rendered) return;
                disposable.dispose();
                const hoverManagerService = injector.get(HoverManagerService);
                const dragManagerService = injector.get(DragManagerService);
                if (!hoverManagerService) return;
                disposable.add(
                    hoverManagerService.currentClickedCell$
                        .pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.CellClicked)) return;
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

                disposable.add(
                    hoverManagerService.currentRichText$?.pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.CellHover)) return;
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

                disposable.add(
                    hoverManagerService.currentPointerDownCell$?.pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.CellPointerDown)) return;
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

                disposable.add(
                    hoverManagerService.currentPointerUpCell$?.pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.CellPointerUp)) return;
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

                disposable.add(
                    hoverManagerService.currentCellPosWithEvent$?.pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.CellPointerMove)) return;
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

                disposable.add(
                    dragManagerService.currentCell$
                        .pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.DragOver)) return;
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

                disposable.add(
                    dragManagerService.endCell$
                        .pipe(filter((cell) => !!cell))
                        .subscribe((cell) => {
                            if (!this._eventListend(this.Event.Drop)) return;
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
            }));

            this.disposeWithMe(disposable);

            this.disposeWithMe(combined$.subscribe(([created, lifecycle]) => {
                if (lifecycle < LifecycleStages.Rendered) return;
                if (created.type !== UniverInstanceType.UNIVER_SHEET) return;
                const disposable = new DisposableCollection();
                const workbook = this.getWorkbook(created.unitId);
                if (unitMap.get(created.unitId)) {
                    unitMap.get(created.unitId)?.dispose();
                }
                unitMap.set(created.unitId, disposable);
                if (!workbook) return;
                const scrollManagerService = created.with(SheetScrollManagerService);
                disposable.add(scrollManagerService.validViewportScrollInfo$.subscribe((params: Nullable<IViewportScrollState>) => {
                    if (!params) return;
                    if (!this._eventListend(this.Event.Scroll)) return;
                    this.fireEvent(this.Event.Scroll, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        ...params,
                    });
                }));

                const selectionService = created.with(SheetsSelectionsService);
                disposable.add(selectionService.selectionMoveStart$.subscribe((selections) => {
                    if (!this._eventListend(this.Event.SelectionMoveStart)) return;
                    this.fireEvent(this.Event.SelectionMoveStart, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                }));

                disposable.add(selectionService.selectionMoving$.subscribe((selections) => {
                    if (!this._eventListend(this.Event.SelectionMoving)) return;
                    this.fireEvent(this.Event.SelectionMoving, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                }));

                disposable.add(selectionService.selectionMoveEnd$.subscribe((selections) => {
                    if (!this._eventListend(this.Event.SelectionMoveEnd)) return;
                    this.fireEvent(this.Event.SelectionMoveEnd, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                }));

                disposable.add(selectionService.selectionChanged$.subscribe((selections) => {
                    if (!this._eventListend(this.Event.SelectionChanged)) return;
                    this.fireEvent(this.Event.SelectionChanged, {
                        workbook,
                        worksheet: workbook.getActiveSheet(),
                        selections: selections?.map((s) => s.range) ?? [],
                    });
                }));
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
    }

    override _initialize(injector: Injector): void {
        this._initSheetUIEvent(injector);
        const commandService = injector.get(ICommandService);
        this.disposeWithMe(commandService.beforeCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case CopyCommand.id:
                case CutCommand.id:
                    this._beforeClipboardChange();
                    break;
                case SheetPasteShortKeyCommand.id:
                    this._beforeClipboardPaste(commandInfo.params);
                    break;
            }
        }));
        this.disposeWithMe(commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case CopyCommand.id:
                case CutCommand.id:
                    this._clipboardChanged();
                    break;
                case SheetPasteShortKeyCommand.id:
                    this._clipboardPaste();
                    break;
                case PasteCommand.id:
                    this._clipboardPasteAsync();
                    break;
            }
        }));
        // async listeners
        this.disposeWithMe(commandService.beforeCommandExecuted(async (commandInfo) => {
            switch (commandInfo.id) {
                case PasteCommand.id:
                    await this._beforeClipboardPasteAsync();
                    break;
            }
        }));
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
        if (!this.hasEventCallback(this.Event.BeforeClipboardChange)) {
            return;
        }
        const eventParams = this._generateClipboardCopyParam();
        if (!eventParams) return;

        this.fireEvent(this.Event.BeforeClipboardChange, eventParams);
        if (eventParams.cancel) {
            throw new Error('Before clipboard change is canceled');
        }
    }

    private _clipboardChanged(): void {
        if (!this.hasEventCallback(this.Event.ClipboardChanged)) {
            return;
        }
        const eventParams = this._generateClipboardCopyParam();
        if (!eventParams) return;

        this.fireEvent(this.Event.ClipboardChanged, eventParams);
        if (eventParams.cancel) {
            throw new Error('Clipboard changed is canceled');
        }
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
        if (!this.hasEventCallback(this.Event.BeforeClipboardPaste)) {
            return;
        }
        const eventParams = this._generateClipboardPasteParam(params);
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new Error('Before clipboard paste is canceled');
        }
    }

    private _clipboardPaste(params?: ISheetPasteByShortKeyParams): void {
        if (!this.hasEventCallback(this.Event.BeforeClipboardPaste)) {
            return;
        }
        const eventParams = this._generateClipboardPasteParam(params);
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new Error('Clipboard pasted is canceled');
        }
    }

    private async _beforeClipboardPasteAsync(): Promise<void> {
        if (!this.hasEventCallback(this.Event.BeforeClipboardPaste)) {
            return;
        }
        if (!supportClipboardAPI()) {
            const logService = this._injector.get(ILogService);
            logService.warn('[Facade]: The navigator object only supports the browser environment');
            return;
        }
        const eventParams = await this._generateClipboardPasteParamAsync();
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new Error('Before clipboard paste is canceled');
        }
    }

    private async _clipboardPasteAsync(): Promise<void> {
        if (!this.hasEventCallback(this.Event.ClipboardPasted)) {
            return;
        }
        if (!supportClipboardAPI()) {
            const logService = this._injector.get(ILogService);
            logService.warn('[Facade]: The navigator object only supports the browser environment');
            return;
        }
        const eventParams = await this._generateClipboardPasteParamAsync();
        if (!eventParams) return;
        this.fireEvent(this.Event.ClipboardPasted, eventParams);
        if (eventParams.cancel) {
            throw new Error('Clipboard pasted is canceled');
        }
    }

    override customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void {
        const wb = this.getActiveWorkbook();
        if (!wb) {
            console.error('WorkBook not exist');
            return;
        }
        const unitId = wb?.getId();
        const sheetColumn = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        sheetColumn.setCustomHeader(cfg);
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

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsUIMixin { }
}
