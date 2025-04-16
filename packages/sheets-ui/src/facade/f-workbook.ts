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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, RenderManagerService } from '@univerjs/engine-render';
import type { ICellPosWithEvent, IDragCellPosition, IEditorBridgeServiceVisibleParam, IHoverRichTextInfo, IHoverRichTextPosition, IScrollState, SheetSelectionRenderService } from '@univerjs/sheets-ui';

import type { IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import type { ICellEventParam } from './f-event';
import { awaitTime, ICommandService, ILogService, toDisposable } from '@univerjs/core';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { DragManagerService, HoverManagerService, ISheetSelectionRenderService, SetCellEditVisibleOperation, SheetScrollManagerService } from '@univerjs/sheets-ui';
import { FWorkbook } from '@univerjs/sheets/facade';
import { IDialogService, ISidebarService, KeyCode } from '@univerjs/ui';
import { filter } from 'rxjs';

/**
 * @ignore
 */
export interface IFWorkbookSheetsUIMixin {
    /**
     * Open a sidebar.
     * @deprecated use `univerAPI.openSidebar` instead
     * @param {ISidebarMethodOptions} params the sidebar options
     * @returns {IDisposable} the disposable object
     * @example
     * ```ts
     * univerAPI.openSidebar({
     *   id: 'mock-sidebar-id',
     *   width: 300,
     *   header: {
     *     label: 'Sidebar Header',
     *   },
     *   children: {
     *     label: 'Sidebar Content',
     *   },
     *   footer: {
     *     label: 'Sidebar Footer',
     *   },
     *   onClose: () => {
     *     console.log('Sidebar closed')
     *   },
     * });
     * ```
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a dialog.
     * @deprecated use `univerAPI.openDialog` instead
     * @param {IDialogPartMethodOptions} dialog the dialog options
     * @returns {IDisposable} the disposable object
     * @example
     * ```ts
     * import { Button } from '@univerjs/design';
     *
     * univerAPI.openDialog({
     *   id: 'mock-dialog-id',
     *   width: 500,
     *   title: {
     *     label: 'Dialog Title',
     *   },
     *   children: {
     *     label: 'Dialog Content',
     *   },
     *   footer: {
     *     title: (
     *       <>
     *         <Button onClick={() => { console.log('Cancel clicked') }}>Cancel</Button>
     *         <Button variant="primary" onClick={() => { console.log('Confirm clicked') }} style={{marginLeft: '10px'}}>Confirm</Button>
     *       </>
     *     )
     *   },
     *   draggable: true,
     *   mask: true,
     *   maskClosable: true,
     * });
     * ```
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellClicked, (params) => {})` instead
     */
    onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellHover, (params) => {})` instead
     */
    onCellHover(callback: (cell: IHoverRichTextPosition) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellPointerMove, (params) => {})` instead
     */
    onCellPointerMove(callback: (cell: ICellPosWithEvent, event: IPointerEvent | IMouseEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellPointerDown, (params) => {})` instead
     */
    onCellPointerDown(callback: (cell: ICellPosWithEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellPointerUp, (params) => {})` instead
     */
    onCellPointerUp(callback: (cell: ICellPosWithEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.DragOver, (params) => {})` instead
     */
    onDragOver(callback: (cell: IDragCellPosition) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.Drop, (params) => {})` instead
     */
    onDrop(callback: (cell: IDragCellPosition) => void): IDisposable;

    /**
     * Start the editing process of the current active cell
     * @returns {boolean} Whether the editing process is started successfully
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.startEditing();
     * ```
     */
    startEditing(): boolean;

    /**
     * @deprecated Use `endEditingAsync` as instead
     */
    endEditing(save?: boolean): Promise<boolean>;

    /**
     * @async
     * End the editing process of the current active cell
     * @param {boolean} save - Whether to save the changes, default is true
     * @returns {Promise<boolean>} Whether the editing process is ended successfully
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * await fWorkbook.endEditingAsync(false);
     * ```
     */
    endEditingAsync(save?: boolean): Promise<boolean>;

    /**
     * Get scroll state of specified sheet.
     * @param {string} sheetId - sheet id
     * @returns {IScrollState} scroll state
     * @example
     * ``` ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // scroll to cell D10
     * fWorksheet.scrollToCell(9, 3);
     *
     * // get scroll state
     * const scrollState = fWorkbook.getScrollStateBySheetId(fWorksheet.getSheetId());
     * const { offsetX, offsetY, sheetViewStartRow, sheetViewStartColumn } = scrollState;
     * console.log(scrollState); // sheetViewStartRow: 9, sheetViewStartColumn: 3, offsetX: 0, offsetY: 0
     * ```
     */
    getScrollStateBySheetId(sheetId: string): Nullable<IScrollState>;

    /**
     * Disable selection. After disabled, there would be no response for selection.
     * @returns {FWorkbook} FWorkbook instance for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.disableSelection();
     * ```
     */
    disableSelection(): FWorkbook;

    /**
     * Enable selection. After this you can select range.
     * @returns {FWorkbook} FWorkbook instance for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.enableSelection();
     * ```
     */
    enableSelection(): FWorkbook;

    /**
     * Set selection invisible, Unlike disableSelection, selection still works, you just can not see them.
     * @returns {FWorkbook} FWorkbook instance for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.transparentSelection();
     * ```
     */
    transparentSelection(): FWorkbook;

    /**
     * Set selection visible.
     * @returns {FWorkbook} FWorkbook instance for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.showSelection();
     * ```
     */
    showSelection(): FWorkbook;
}

export class FWorkbookSheetsUIMixin extends FWorkbook implements IFWorkbookSheetsUIMixin {
    override openSiderbar(params: ISidebarMethodOptions): IDisposable {
        this._logDeprecation('openSiderbar');

        const sideBarService = this._injector.get(ISidebarService);
        return sideBarService.open(params);
    }

    override openDialog(dialog: IDialogPartMethodOptions): IDisposable {
        this._logDeprecation('openDialog');

        const dialogService = this._injector.get(IDialogService);
        const disposable = dialogService.open({
            ...dialog,
            onClose: () => {
                disposable.dispose();
            },
        });

        return disposable;
    }

    private _logDeprecation(name: string): void {
        const logService = this._injector.get(ILogService);

        logService.warn('[FWorkbook]', `${name} is deprecated. Please use the function of the same name on "FUniver".`);
    }

    generateCellParams(cell: IHoverRichTextPosition | ICellPosWithEvent): ICellEventParam {
        const worksheet = this.getActiveSheet();
        return {
            row: cell.row,
            column: cell.col,
            workbook: this,
            worksheet,
        };
    }

    override onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentClickedCell$
                .pipe(filter((cell) => !!cell))
                .subscribe((cell) => {
                    callback(cell);
                })
        );
    }

    override onCellHover(callback: (cell: IHoverRichTextPosition) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentRichText$
                .pipe(filter((cell) => !!cell))
                .subscribe(callback)
        );
    }

    override onCellPointerDown(callback: (cell: ICellPosWithEvent) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentPointerDownCell$.subscribe(callback)
        );
    }

    override onCellPointerUp(callback: (cell: ICellPosWithEvent) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentPointerUpCell$.subscribe(callback)
        );
    }

    override onCellPointerMove(callback: (cell: ICellPosWithEvent, event: IPointerEvent | IMouseEvent) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentCellPosWithEvent$
                .pipe(filter((cell) => !!cell))
                .subscribe((cell: ICellPosWithEvent) => {
                    callback(cell, cell.event);
                })
        );
    }

    override onDragOver(callback: (cell: IDragCellPosition) => void): IDisposable {
        const dragManagerService = this._injector.get(DragManagerService);
        return toDisposable(
            dragManagerService.currentCell$
                .pipe(filter((cell) => !!cell))
                .subscribe((cell: IDragCellPosition) => {
                    callback(cell);
                })
        );
    }

    override onDrop(callback: (cell: IDragCellPosition) => void): IDisposable {
        const dragManagerService = this._injector.get(DragManagerService);
        return toDisposable(
            dragManagerService.endCell$
                .pipe(filter((cell) => !!cell))
                .subscribe((cell: IDragCellPosition) => {
                    callback(cell);
                })
        );
    }

    override startEditing(): boolean {
        const commandService = this._injector.get(ICommandService);
        return commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            eventType: DeviceInputEventType.Dblclick,
            unitId: this._workbook.getUnitId(),
            visible: true,
        } as IEditorBridgeServiceVisibleParam);
    }

    override async endEditing(save?: boolean): Promise<boolean> {
        const commandService = this._injector.get(ICommandService);
        commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            eventType: DeviceInputEventType.Keyboard,
            keycode: save ? KeyCode.ENTER : KeyCode.ESC,
            visible: false,
            unitId: this._workbook.getUnitId(),
        } as IEditorBridgeServiceVisibleParam);

        // wait for the async cell edit operation to complete
        await awaitTime(0);
        return true;
    }

    override endEditingAsync(save = true): Promise<boolean> {
        return this.endEditing(save);
    }

    /**
     * Get scroll state of specified sheet.
     * @param {string} sheetId - sheet id
     * @returns {IScrollState} scroll state
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getScrollStateBySheetId($sheetId)
     * ```
     */
    override getScrollStateBySheetId(sheetId: string): Nullable<IScrollState> {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (!render) return null;
        const scm = render.with(SheetScrollManagerService);
        return scm.getScrollStateByParam({ unitId, sheetId });
    }

    override disableSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).disableSelection();
        }
        return this;
    }

    override enableSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).enableSelection();
        }
        return this;
    }

    override transparentSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).transparentSelection();
        }
        return this;
    }

    override showSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).showSelection();
        }
        return this;
    }
}

FWorkbook.extend(FWorkbookSheetsUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsUIMixin {}
}
