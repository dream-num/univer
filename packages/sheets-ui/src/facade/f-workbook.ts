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

import type { ICellEventParam } from './f-event';
import { awaitTime, ICommandService, ILogService, toDisposable } from '@univerjs/core';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { HoverManagerService, ISheetSelectionRenderService, SetCellEditVisibleOperation, SheetScrollManagerService } from '@univerjs/sheets-ui';
import { FWorkbook } from '@univerjs/sheets/facade';
import { type IDialogPartMethodOptions, IDialogService, type ISidebarMethodOptions, ISidebarService, KeyCode } from '@univerjs/ui';
import { filter } from 'rxjs';

export interface IFWorkbookSheetsUIMixin {
    /**
     * Open a sidebar.
     * @deprecated
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a dialog.
     * @deprecated
     * @param dialog the dialog options
     * @returns the disposable object
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellClick, () => {})` instead
     */
    onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CellHover, () => {})` instead
     */
    onCellHover(callback: (cell: IHoverRichTextPosition) => void): IDisposable;

    /**
     * Start the editing process
     * @returns A boolean value
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().startEditing();
     * ```
     */
    startEditing(): boolean;

    /**
     * @deprecated Use `endEditingAsync` as instead
     */
    endEditing(save?: boolean): Promise<boolean>;

    /**
     * @async
     * End the editing process
     * @param {boolean} save - Whether to save the changes, default is true
     * @returns {Promise<boolean>} A promise that resolves to a boolean value
     * @example
     * ```ts
     * await univerAPI.getActiveWorkbook().endEditingAsync(false);
     * ```
     */
    endEditingAsync(save?: boolean): Promise<boolean>;
    /*
     * Get scroll state of specified sheet.
     * @returns {IScrollState} scroll state
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getScrollStateBySheetId($sheetId)
     * ```
     */
    getScrollStateBySheetId(sheetId: string): Nullable<IScrollState>;

    /**
     * Disable selection. After disabled, there would be no response for selection.
     * @returns {FWorkbook} FWorkbook instance
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().disableSelection();
     * ```
     */
    disableSelection(): FWorkbook;

    /**
     * Enable selection. After this you can select range.
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().enableSelection();
     * ```
     */
    enableSelection(): FWorkbook;

    /**
     * Set selection invisible, Unlike disableSelection, selection still works, you just can not see them.
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().transparentSelection();
     * ```
     */
    transparentSelection(): FWorkbook;

    /**
     * Set selection visible.
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().showSelection();
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
