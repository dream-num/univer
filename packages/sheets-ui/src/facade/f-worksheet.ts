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

import type { IDisposable, IRange, Nullable } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type { IScrollState, IViewportScrollState, SheetSelectionRenderService } from '@univerjs/sheets-ui';
import { ICommandService, toDisposable } from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, sheetContentViewportKeys } from '@univerjs/engine-render';
import { ChangeZoomRatioCommand, ISheetSelectionRenderService, SheetScrollManagerService, SheetSkeletonManagerService, SheetsScrollRenderController } from '@univerjs/sheets-ui';
import { FWorksheet } from '@univerjs/sheets/facade';

export interface IFWorksheetSkeletonMixin {
    /**
     * Refresh the canvas.
     */
    refreshCanvas(): void;
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
    zoom(zoomRatio: number): Promise<boolean>;
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
}

export class FWorksheetSkeletonMixin extends FWorksheet implements IFWorksheetSkeletonMixin {
    override refreshCanvas(): void {
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
    }

    override zoom(zoomRatio: number): Promise<boolean> {
        const commandService = this._injector.get(ICommandService);
        return commandService.executeCommand(ChangeZoomRatioCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            zoomRatio,
        });
    }

    override getZoom(): number {
        return this._worksheet.getZoomRatio();
    }

    /**
     * Return visible range, sum view range of 4 viewports.
     * @returns IRange
     */
    getVisibleRange(): IRange {
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

    /**
     * Scroll spreadsheet to cell position. Based on the limitations of viewport and the number of rows and columns, you can only scroll to the maximum scrollable range.
     * @param row
     * @param column
     */
    scrollToCell(row: number, column: number): void {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (render) {
            const scrollRenderController = render?.with(SheetsScrollRenderController);
            scrollRenderController.scrollToCell(row, column);
        }
    }

    /**
     * Get scroll state of current sheet.
     * @returns {IScrollState} curr scroll state
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getActiveSheet().getScrollState()
     * ```
     */
    getScrollState(): Nullable<IScrollState> {
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
        if (!render) return null;
        const scm = render.with(SheetScrollManagerService);
        return scm.getScrollStateByParam({ unitId, sheetId });
    }

    /**
     * Invoked when scrolling the sheet.
     * @param {function(params: Nullable<IViewportScrollState>): void} callback The scrolling callback function.
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().getActiveSheet().onScroll((params) => {...})
     * ```
     */
    onScroll(callback: (params: Nullable<IViewportScrollState>) => void): IDisposable {
        const unitId = this._workbook.getUnitId();
        const renderManagerService = this._injector.get(IRenderManagerService) as RenderManagerService;
        const scrollManagerService = renderManagerService.getRenderById(unitId)?.with(SheetScrollManagerService);
        if (scrollManagerService) {
            const sub = scrollManagerService.validViewportScrollInfo$.subscribe((params: Nullable<IViewportScrollState>) => {
                callback(params);
            });
            return toDisposable(sub);
        }
        return toDisposable(() => {});
    }

    /**
     * Disable selection. After disabled, there would be no response for selection.
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

FWorksheet.extend(FWorksheetSkeletonMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetSkeletonMixin {}
}
