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

import { ICommandService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ChangeZoomRatioCommand, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
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
}

FWorksheet.extend(FWorksheetSkeletonMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetSkeletonMixin {}
}
