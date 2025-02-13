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

import type { IDisposable, IRange, Nullable } from '@univerjs/core';
import type { IColumnsHeaderCfgParam, IRowsHeaderCfgParam, RenderComponentType, RenderManagerService, SpreadsheetColumnHeader, SpreadsheetRowHeader, SpreadsheetSkeleton } from '@univerjs/engine-render';

import type { IScrollState, IViewportScrollState } from '@univerjs/sheets-ui';
import { ICommandService, toDisposable } from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, sheetContentViewportKeys } from '@univerjs/engine-render';
import { ChangeZoomRatioCommand, SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand, SetWorksheetColAutoWidthCommand, SHEET_VIEW_KEY, SheetScrollManagerService, SheetSkeletonManagerService, SheetsScrollRenderController } from '@univerjs/sheets-ui';
import { FWorksheet } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorksheetSkeletonMixin {
    /**
     * Refresh the canvas.
     */
    refreshCanvas(): FWorksheet;
    /**
     * Set zoom ratio of the worksheet.
     * @param {number} zoomRatio The zoom ratio to set.It should be in the range of 10 to 400.
     * @returns True if the command was successful, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * fWorksheet.zoom(200);
     * const zoomRatio = fWorksheet.getZoom();
     * console.log(zoomRatio); // 200
     * ```
     */
    zoom(zoomRatio: number): FWorksheet;
    /**
     * Get the zoom ratio of the worksheet.
     * @returns The zoom ratio of the worksheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const zoomRatio = fWorksheet.getZoom();
     * console.log(zoomRatio);
     * ```
     */
    getZoom(): number;

    /**
     * Return visible range, sum view range of 4 viewports.
     * @returns {IRange} - visible range
     * @example
     * ``` ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const visibleRange = fWorksheet.getVisibleRange();
     * ```
     */
    getVisibleRange(): IRange;

    /**
     * Scroll spreadsheet(viewMain) to cell position. Make the cell at topleft of current viewport.
     * Based on the limitations of viewport and the number of rows and columns, you can only scroll to the maximum scrollable range.
     * @param {number} row - Cell row index
     * @param {number} column - Cell column index
     * @returns {FWorksheet} - Current worksheet
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getActiveSheet().scrollToCell(1, 1);
     * ```
     */
    scrollToCell(row: number, column: number): FWorksheet;

    /**
     * Get scroll state of current sheet.
     * @returns {IScrollState} curr scroll state
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getActiveSheet().getScrollState()
     * ```
     */
    getScrollState(): IScrollState;

    /**
     * Get the skeleton service of the worksheet.
     * @returns {Nullable<SpreadsheetSkeleton>} The skeleton of the worksheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const skeleton = fWorksheet.getSkeleton();
     * console.log(skeleton);
     * ```
     */
    getSkeleton(): Nullable<SpreadsheetSkeleton>;

    /**
     * Set the given column width to fix-content.
     * @param {number} columnPosition - Column position
     * @param {number} numColumn - Number of columns
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * fWorksheet.setColumnAutoWidth(0, 3);
     * ```
     */
    setColumnAutoWidth(columnPosition: number, numColumn: number): FWorksheet;

    /**
     * Customize the column header of the spreadsheet.
     * @param {IColumnsHeaderCfgParam} cfg The configuration of the column header.
     * @example
     * ```typescript
        const fWorkbook = univerAPI.getActiveWorkbook();
        const fWorksheet = fWorkbook.getActiveSheet();
        fWorksheet.customizeColumnHeader({
            headerStyle: {
                fontColor: '#fff',
                backgroundColor: '#4e69ee',
                fontSize: 9
            },
            columnsCfg: {
                0: 'kuma II',
                3: {
                    text: 'Size',
                    textAlign: 'left', // CanvasTextAlign
                    fontColor: '#fff',
                    fontSize: 12,
                    borderColor: 'pink',
                    backgroundColor: 'pink',
                },
                4: 'Wow'
            }
        });
     * ```
     */
    customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void;

    /**
     * Customize the row header of the spreadsheet.
     * @param {IRowsHeaderCfgParam} cfg The configuration of the row header.
     * @example
     * ```typescript
        univerAPI.customizeRowHeader({
            headerStyle: {
                backgroundColor: 'pink',
                fontSize: 12
            },
            rowsCfg: {
                0: 'MokaII',
                3: {
                    text: 'Size',
                    textAlign: 'left'
                }
            }
        });
     * ```
     */
    customizeRowHeader(cfg: IRowsHeaderCfgParam): void;

    /**
     * Set column height for column header.
     * @param height
     * @example
     * ```ts
        const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
        sheet.setColumnHeaderHeight(100);
     * ```
     */
    setColumnHeaderHeight(height: number): FWorksheet;

    /**
     * Set column height for column header.
     * @param width
     * @example
     * ```ts
        const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
        sheet.setRowHeaderWidth(100);
     * ```
     */
    setRowHeaderWidth(width: number): FWorksheet;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.Scroll, () => {})` instead
     */
    onScroll(callback: (params: Nullable<IViewportScrollState>) => void): IDisposable;

}

export class FWorksheetSkeletonMixin extends FWorksheet implements IFWorksheetSkeletonMixin {
    override refreshCanvas(): FWorksheet {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const unitId = this._fWorkbook.id;
        const render = renderManagerService.getRenderById(unitId);

        if (!render) {
            throw new Error(`Render Unit with unitId ${unitId} not found`);
        }

        render.with(SheetSkeletonManagerService).reCalculate();

        const mainComponent = render.mainComponent;

        if (!mainComponent) {
            throw new Error('Main component not found');
        }

        mainComponent.makeDirty();

        return this;
    }

    override zoom(zoomRatio: number): FWorksheet {
        const commandService = this._injector.get(ICommandService);
        commandService.syncExecuteCommand(ChangeZoomRatioCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            zoomRatio,
        });
        return this;
    }

    override getZoom(): number {
        return this._worksheet.getZoomRatio();
    }

    override getVisibleRange(): IRange {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        let range: IRange = {
            startColumn: 0,
            startRow: 0,
            endColumn: 0,
            endRow: 0,
        };
        if (!render) return range;
        const skm = render.with(SheetSkeletonManagerService);
        const sk = skm.getCurrentSkeleton();
        if (!sk) return range;
        const visibleRangeMap = sk?.getVisibleRanges();
        if (!visibleRangeMap) return range;

        range = sk.getVisibleRangeByViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN) as IRange;
        for (const [k, r] of visibleRangeMap) {
            if (sheetContentViewportKeys.indexOf(k) === -1) continue;
            range.startColumn = Math.min(range.startColumn, r.startColumn);
            range.startRow = Math.min(range.startRow, r.startRow);
            range.endColumn = Math.max(range.endColumn, r.endColumn);
            range.endRow = Math.max(range.endRow, r.endRow);
        }

        return range;
    }

    override scrollToCell(row: number, column: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            const scrollRenderController = render?.with(SheetsScrollRenderController);
            scrollRenderController.scrollToCell(row, column);
        }
        return this;
    }

    override getScrollState(): IScrollState {
        const emptyScrollState: IScrollState = {
            offsetX: 0,
            offsetY: 0,
            sheetViewStartColumn: 0,
            sheetViewStartRow: 0,
        };
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (!render) return emptyScrollState;
        const sheetScrollManagerService = render.with(SheetScrollManagerService);
        const scrollState = sheetScrollManagerService.getScrollStateByParam({ unitId, sheetId });
        return scrollState || emptyScrollState;
    }

    override onScroll(callback: (params: Nullable<IViewportScrollState>) => void): IDisposable {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const scrollManagerService = renderManagerService.getRenderById(unitId)?.with(SheetScrollManagerService);
        if (scrollManagerService) {
            const sub = scrollManagerService.validViewportScrollInfo$.subscribe((params: Nullable<IViewportScrollState>) => {
                callback(params);
            });
            return toDisposable(sub);
        }
        return toDisposable(() => { });
    }

    override getSkeleton(): Nullable<SpreadsheetSkeleton> {
        const service = this._injector.get(IRenderManagerService).getRenderById(this._workbook.getUnitId())?.with(SheetSkeletonManagerService);
        return service?.getWorksheetSkeleton(this._worksheet.getSheetId())?.skeleton;
    }

    override setColumnAutoWidth(columnPosition: number, numColumn: number): FWorksheet {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const ranges = [
            {
                startColumn: columnPosition,
                endColumn: columnPosition + numColumn - 1,
                startRow: 0,
                endRow: this._worksheet.getRowCount() - 1,
            },
        ];

        this._commandService.syncExecuteCommand(SetWorksheetColAutoWidthCommand.id, {
            unitId,
            subUnitId,
            ranges,
        });

        return this;
    }

    override customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void {
        const activeSheet = this;
        const unitId = this._fWorkbook.getId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const subUnitId = activeSheet.getSheetId();
        const render = renderManagerService.getRenderById(unitId);
        if (render && cfg.headerStyle?.size) {
            const skm = render.with(SheetSkeletonManagerService);
            skm.setColumnHeaderSize(render, subUnitId, cfg.headerStyle?.size);
            activeSheet?.refreshCanvas();
        }

        const sheetColumn = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        if (sheetColumn) {
            sheetColumn.setCustomHeader(cfg);
            activeSheet?.refreshCanvas();
        }
    }

    override customizeRowHeader(cfg: IRowsHeaderCfgParam): void {
        const unitId = this._fWorkbook.getId();
        const sheetRow = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        sheetRow.setCustomHeader(cfg);
    }

    override setColumnHeaderHeight(height: number): FWorksheet {
        const activeSheet = this;
        const unitId = this._fWorkbook.getId();
        const subUnitId = activeSheet.getSheetId();

        this._commandService.executeCommand(SetColumnHeaderHeightCommand.id, {
            unitId,
            subUnitId,
            size: height,
        });

        activeSheet?.refreshCanvas();
        return this;
    }

    override setRowHeaderWidth(width: number): FWorksheet {
        const activeSheet = this;
        const unitId = this._fWorkbook.getId();
        const subUnitId = activeSheet.getSheetId();

        this._commandService.executeCommand(SetRowHeaderWidthCommand.id, {
            unitId,
            subUnitId,
            size: width,
        });

        const sheetRow = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        if (sheetRow) {
            sheetRow.setCustomHeader({ headerStyle: { size: width } });
        }
        activeSheet?.refreshCanvas();
        return this;
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
}

FWorksheet.extend(FWorksheetSkeletonMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetSkeletonMixin { }
}
