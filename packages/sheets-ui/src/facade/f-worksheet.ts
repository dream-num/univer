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

import type { IRange, Nullable } from '@univerjs/core';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';

import type { IScrollState } from '@univerjs/sheets-ui';
import { ICommandService } from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, sheetContentViewportKeys } from '@univerjs/engine-render';
import { ChangeZoomRatioCommand, SetWorksheetColAutoWidthCommand, SheetScrollManagerService, SheetSkeletonManagerService, SheetsScrollRenderController } from '@univerjs/sheets-ui';
import { FWorksheet } from '@univerjs/sheets/facade';

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
}

FWorksheet.extend(FWorksheetSkeletonMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetSkeletonMixin { }
}
