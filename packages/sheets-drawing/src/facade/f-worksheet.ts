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

import type { IDeleteDrawingCommandParam } from '../commands/commands/interfaces';
import type { ISheetImage } from '../services/sheet-drawing.service';
import { type IFBlobSource, ImageSourceType } from '@univerjs/core';
import { FWorksheet } from '@univerjs/sheets/facade';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import { ISheetDrawingService } from '../services/sheet-drawing.service';
import { FOverGridImage, FOverGridImageBuilder } from './f-over-grid-image';

export interface IFWorksheetDrawing {

    insertImage(url: string): void;
    insertImage(url: string, column: number, row: number): void;
    insertImage(url: string, column: number, row: number, offsetX: number, offsetY: number): void;
    insertImage(url: IFBlobSource): void;
    insertImage(url: IFBlobSource, column: number, row: number): void;
    insertImage(url: IFBlobSource, column: number, row: number, offsetX: number, offsetY: number): void;

    insertImages(sheetImages: ISheetImage[]): void;

    getImages(): FOverGridImage[];

    deleteImages(sheetImages: FOverGridImage[]): void;

    updateImages(sheetImages: ISheetImage[]): void;

}

export class FWorksheetDrawing extends FWorksheet implements IFWorksheetDrawing {
    override async insertImage(url: IFBlobSource | string, column?: number, row?: number, offsetX?: number, offsetY?: number) {
        const imageBuilder = this._injector.createInstance(FOverGridImageBuilder);
        if (typeof url === 'string') {
            imageBuilder.setSource(url);
        } else {
            const blobSource = url.getBlob();
            const base64 = await blobSource.getDataAsString();
            imageBuilder.setSource(base64, ImageSourceType.BASE64);
        }

        if (column != null) {
            imageBuilder.setFromColumn(column);
        }

        if (row != null) {
            imageBuilder.setFromRow(row);
        }

        if (offsetX != null) {
            imageBuilder.setFromColumnOffset(offsetX);
        }

        if (offsetY != null) {
            imageBuilder.setFromRowOffset(offsetY);
        }

        const param = imageBuilder.build();
        param.unitId = this._fWorkbook.getId();
        param.subUnitId = this.getSheetId();

        this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: [param] });
    }

    override insertImages(sheetImages: ISheetImage[]): void {
        const param = sheetImages.map((image) => {
            image.unitId = this._fWorkbook.getId();
            image.subUnitId = this.getSheetId();
            return image;
        });

        this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: param });
    }

    override deleteImages(sheetImages: FOverGridImage[]): void {
        const drawings = sheetImages.map((image) => {
            return {
                unitId: this._fWorkbook.getId(),
                drawingId: image.getId(),
                subUnitId: this.getSheetId(),
                drawingType: image.getType(),
            };
        }) as IDeleteDrawingCommandParam[];
        this._commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings });
    }

    override getImages(): FOverGridImage[] {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawingData = sheetDrawingService.getDrawingData(this._fWorkbook.getId(), this.getSheetId());
        const images: FOverGridImage[] = [];
        for (const drawingId in drawingData) {
            const drawing = drawingData[drawingId];
            images.push(this._injector.createInstance(FOverGridImage, drawing as ISheetImage));
        }
        return images;
    }

    override updateImages(sheetImages: ISheetImage[]): void {
        this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), sheetImages });
    }
}

FWorksheet.extend(FWorksheetDrawing);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetDrawing {}
}
