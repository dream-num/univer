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

import type { ISheetLocationBase } from '@univerjs/sheets';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import { SheetDrawingUpdateController } from '@univerjs/sheets-drawing-ui';
import { FRange } from '@univerjs/sheets/facade';

export interface IFRangeSheetDrawingMixin {
    /**
     * Inserts an image into the current cell.
     *
     * @param {string | File} file File or URL string
     * @returns True if the image is inserted successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert an image into the cell A10
     * const fRange = fWorksheet.getRange('A10');
     * const result = await fRange.insertCellImageAsync('https://avatars.githubusercontent.com/u/61444807?s=48&v=4');
     * console.log(result);
     * ```
     */
    insertCellImageAsync(file: File | string): Promise<boolean>;
}

export class FRangeSheetDrawingUI extends FRange implements IFRangeSheetDrawingMixin {
    override async insertCellImageAsync(file: File | string): Promise<boolean> {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const controller = getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._injector.get(IUniverInstanceService), renderManagerService)
            ?.with(SheetDrawingUpdateController);
        if (!controller) {
            return false;
        }
        const location: ISheetLocationBase = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this.getRow(),
            col: this.getColumn(),
        };

        if (typeof file === 'string') {
            return controller.insertCellImageByUrl(file, location);
        } else {
            return controller.insertCellImageByFile(file, location);
        }
    }
}

FRange.extend(FRangeSheetDrawingUI);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetDrawingMixin { }
}
