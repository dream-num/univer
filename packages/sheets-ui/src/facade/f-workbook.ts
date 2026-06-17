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
import type {
    IColumnsHeaderCfgParam,
    IRowsHeaderCfgParam,
    RenderComponentType,
    RenderManagerService,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/engine-render';
import type { IEditorBridgeServiceVisibleParam, IScrollState, SheetSelectionRenderService } from '@univerjs/sheets-ui';
import type { IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import { awaitTime, ICommandService, ILogService } from '@univerjs/core';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import {
    IEditorBridgeService,
    ISheetSelectionRenderService,
    SetCellEditVisibleOperation,
    SHEET_VIEW_KEY,
    SheetScrollManagerService,
} from '@univerjs/sheets-ui';
import { FWorkbook } from '@univerjs/sheets/facade';
import { IDialogService, ISidebarService, KeyCode } from '@univerjs/ui';

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
     * Customize the column header of the all worksheets in the workbook.
     * @param {IColumnsHeaderCfgParam} cfg The configuration of the column header.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.customizeColumnHeader({
     *   headerStyle: {
     *     fontColor: '#fff',
     *     backgroundColor: '#4e69ee',
     *     fontSize: 9
     *   },
     *   columnsCfg: {
     *     0: 'kuma II',
     *     3: {
     *       text: 'Size',
     *       textAlign: 'left', // CanvasTextAlign
     *       fontColor: '#fff',
     *       fontSize: 12,
     *       borderColor: 'pink',
     *       backgroundColor: 'pink',
     *     },
     *     4: 'Wow'
     *   }
     * });
     * ```
     */
    customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void;

    /**
     * Customize the row header of the all worksheets in the workbook.
     * @param {IRowsHeaderCfgParam} cfg The configuration of the row header.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.customizeRowHeader({
     *   headerStyle: {
     *     backgroundColor: 'pink',
     *     fontSize: 12
     *   },
     *   rowsCfg: {
     *     0: 'Moka II',
     *     3: {
     *       text: 'Size',
     *       textAlign: 'left', // CanvasTextAlign
     *     },
     *   }
     * });
     * ```
     */
    customizeRowHeader(cfg: IRowsHeaderCfgParam): void;

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
     * End the editing process of the current active cell, and discard the changes.
     * @returns {Promise<boolean>} Whether the editing process is ended successfully
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * await fWorkbook.abortEditingAsync();
     * ```
     */
    abortEditingAsync(): Promise<boolean>;

    /**
     * Check if the current active cell is in editing state
     * @returns {boolean} True if the current active cell is in editing state, false otherwise
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const isEditing = fWorkbook.isCellEditing();
     * console.log(isEditing);
     * ```
     */
    isCellEditing(): boolean;

    /**
     * Get scroll state of specified sheet.
     * @param {string} sheetId - sheet id
     * @returns {IScrollState} scroll state
     * @example
     * ``` ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
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

    override customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void {
        const unitId = this._workbook.getUnitId();
        const sheetColumn = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        sheetColumn.setCustomHeader(cfg);
    }

    override customizeRowHeader(cfg: IRowsHeaderCfgParam): void {
        const unitId = this._workbook.getUnitId();
        const sheetRow = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        sheetRow.setCustomHeader(cfg);
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
        const render = renderManagerService.getRenderUnitById(unitId);
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

    /* istanbul ignore next -- deprecated API helper */
    private _logDeprecation(name: string): void {
        const logService = this._injector.get(ILogService);

        logService.warn('[FWorkbook]', `${name} is deprecated. Please use the function of the same name on "FUniver".`);
    }

    override startEditing(): boolean {
        const commandService = this._injector.get(ICommandService);
        const editorBridgeService = this._injector.get(IEditorBridgeService);

        if (editorBridgeService.isVisible().visible) {
            return true;
        }

        return commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            eventType: DeviceInputEventType.Dblclick,
            unitId: this._workbook.getUnitId(),
            visible: true,
        } as IEditorBridgeServiceVisibleParam);
    }

    override async endEditingAsync(save = true): Promise<boolean> {
        const commandService = this._injector.get(ICommandService);
        const editorBridgeService = this._injector.get(IEditorBridgeService);

        if (editorBridgeService.isVisible().visible) {
            commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                eventType: DeviceInputEventType.Keyboard,
                keycode: save ? KeyCode.ENTER : KeyCode.ESC,
                visible: false,
                unitId: this._workbook.getUnitId(),
            } as IEditorBridgeServiceVisibleParam);
        }

        // wait for the async cell edit operation to complete
        await awaitTime(0);
        return true;
    }

    override abortEditingAsync(): Promise<boolean> {
        return this.endEditingAsync(false);
    }

    override isCellEditing(): boolean {
        const editorBridgeService = this._injector.get(IEditorBridgeService);
        return editorBridgeService.isVisible().visible;
    }

    override getScrollStateBySheetId(sheetId: string): Nullable<IScrollState> {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderUnitById(unitId);
        if (!render) return null;
        const scm = render.with(SheetScrollManagerService);
        return scm.getScrollStateByParam({ unitId, sheetId });
    }

    override disableSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderUnitById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).disableSelection();
        }
        return this;
    }

    override enableSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderUnitById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).enableSelection();
        }
        return this;
    }

    override transparentSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderUnitById(unitId);
        if (render) {
            (render.with(ISheetSelectionRenderService) as SheetSelectionRenderService).transparentSelection();
        }
        return this;
    }

    override showSelection(): FWorkbook {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const render = renderManagerService.getRenderUnitById(unitId);
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
