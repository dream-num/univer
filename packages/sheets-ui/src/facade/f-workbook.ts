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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type { ICellPosWithEvent, IEditorBridgeServiceVisibleParam, IHoverRichTextInfo, IHoverRichTextPosition, IScrollState, SheetSelectionRenderService } from '@univerjs/sheets-ui';
import { awaitTime, ICommandService, ILogService, toDisposable } from '@univerjs/core';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { HoverManagerService, ISheetSelectionRenderService, SetCellEditVisibleOperation, SheetScrollManagerService } from '@univerjs/sheets-ui';
import { FWorkbook } from '@univerjs/sheets/facade';
import { type IDialogPartMethodOptions, IDialogService, type ISidebarMethodOptions, ISidebarService, KeyCode } from '@univerjs/ui';
import { filter } from 'rxjs';

export interface IFWorkbookSheetsUIMixin {
    /**
     * Open a sidebar.
     *
     * @deprecated
     *
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a dialog.
     *
     * @deprecated
     *
     * @param dialog the dialog options
     * @returns the disposable object
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;

    /**
     * Subscribe to cell click events
     *
     * @param callback - The callback function to be called when a cell is clicked
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable;

    /**
     * Subscribe cell hover events
     *
     * @param callback - The callback function to be called when a cell is hovered
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellHover(callback: (cell: IHoverRichTextPosition) => void): IDisposable;

    /**
     * Subscribe to pointer move events on workbook. Just like onCellHover, but with event information.
     * @param {function(ICellPosWithEvent): any} callback The callback function accept cell location and event.
     */
    onPointerMove(callback: (cell: Nullable<ICellPosWithEvent>, buttons: number) => void): IDisposable;
    /**
     * Subscribe to cell pointer down events.
     * @param {function(ICellPosWithEvent): any} callback The callback function accept cell location and event.
     */
    onCellPointerDown(callback: (cell: Nullable<ICellPosWithEvent>) => void): IDisposable;
    /**
     * Subscribe to cell pointer up events.
     * @param {function(ICellPosWithEvent): any} callback The callback function accept cell location and event.
     */
    onCellPointerUp(callback: (cell: Nullable<ICellPosWithEvent>) => void): IDisposable;

    /**
     * Start the editing process
     * @returns A boolean value
     */
    startEditing(): boolean;

    /**
     * End the editing process
     * @async
     * @param save - Whether to save the changes
     * @returns A promise that resolves to a boolean value
     */
    endEditing(save?: boolean): Promise<boolean>;
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

    override onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentClickedCell$
                .pipe(filter((cell) => !!cell))
                .subscribe(callback)
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

    override onCellPointerDown(callback: (cell: Nullable<ICellPosWithEvent>) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentPointerDownCell$.subscribe(callback)
        );
    }

    override onCellPointerUp(callback: (cell: Nullable<ICellPosWithEvent>) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentPointerUpCell$.subscribe(callback)
        );
    }

    override onPointerMove(callback: (cell: Nullable<ICellPosWithEvent>, buttons: number) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentCellPosWithEvent$
                .pipe(filter((cell) => !!cell))
                .subscribe((cell: ICellPosWithEvent) => {
                    callback(cell, cell.event.buttons);
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

    /**
     * Get scroll state of specified sheet.
     * @returns {IScrollState} scroll state
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getScrollStateBySheetId($sheetId)
     * ```
     */
    getScrollStateBySheetId(sheetId: string): Nullable<IScrollState> {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (!render) return null;
        const scm = render.with(SheetScrollManagerService);
        return scm.getScrollStateByParam({ unitId, sheetId });
    }

    /**
     * Disable selection. After disabled, there would be no response for selection.
     * @example
     * ```
     * univerAPI.getActiveWorkbook().disableSelection();
     * ```
     */
    disableSelection(): void {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).disableSelection();
        }
    }

    /**
     * Enable selection. After this you can select range.
     * @example
     * ```
     * univerAPI.getActiveWorkbook().enableSelection();
     * ```
     */
    enableSelection(): void {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).enableSelection();
        }
    }

    /**
     * Set selection invisible, Unlike disableSelection, selection still works, you just can not see them.
     * @example
     * ```
     * univerAPI.getActiveWorkbook().transparentSelection();
     * ```
     */
    transparentSelection(): void {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).transparentSelection();
        }
    }

    /**
     * Set selection visible.
     * @example
     * ```
     * univerAPI.getActiveWorkbook().showSelection();
     * ```
     */
    showSelection(): void {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).showSelection();
        }
    }
}

FWorkbook.extend(FWorkbookSheetsUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsUIMixin {}
}
