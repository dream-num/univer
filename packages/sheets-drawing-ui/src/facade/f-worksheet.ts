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

import { type IFBlobSource, ImageSourceType, type Nullable } from '@univerjs/core';
import { getImageSize } from '@univerjs/drawing';
import { ISheetDrawingService, type ISheetImage } from '@univerjs/sheets-drawing';
import { type ICanvasFloatDom, InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { type IFComponentKey, transformComponentKey } from '@univerjs/sheets-ui/facade';
import { FWorksheet } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';
import { FOverGridImage, FOverGridImageBuilder } from './f-over-grid-image';

export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {}

export interface IFWorksheetLegacy {
    /**
     * add a float dom to position
     * @param layer float dom config
     * @param id float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     */
    addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    insertImage(url: string): Promise<boolean>;
    insertImage(url: string, column: number, row: number): Promise<boolean>;
    insertImage(url: string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource | string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;

    insertImages(sheetImages: ISheetImage[]): void;

    getImages(): FOverGridImage[];

    deleteImages(sheetImages: FOverGridImage[]): void;

    updateImages(sheetImages: ISheetImage[]): void;

    getActiveImages(): FOverGridImage[];

    onImageInserted(callback: (images: FOverGridImage[]) => void): void;

    onImageDeleted(callback: (images: FOverGridImage[]) => void): void;

    onImageChanged(callback: (images: FOverGridImage[]) => void): void;
}

export class FWorksheetLegacy extends FWorksheet implements IFWorksheetLegacy {
    override addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const { key, disposableCollection } = transformComponentKey(layer, this._injector.get(ComponentManager));
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const res = floatDomService.addFloatDomToPosition({ ...layer, componentKey: key, unitId, subUnitId }, id);

        if (res) {
            disposableCollection.add(res.dispose);
            return {
                id: res.id,
                dispose: (): void => {
                    disposableCollection.dispose();
                    res.dispose();
                },
            };
        }

        disposableCollection.dispose();
        return null;
    }

    override async insertImage(url: IFBlobSource | string, column?: number, row?: number, offsetX?: number, offsetY?: number): Promise<boolean> {
        const imageBuilder = this._injector.createInstance(FOverGridImageBuilder);
        let width = 0;
        let height = 0;
        if (typeof url === 'string') {
            imageBuilder.setSource(url);
            const size = await getImageSize(url);
            width = size.width;
            height = size.height;
        } else {
            const blobSource = url.getBlob();
            const base64 = await blobSource.getDataAsString();
            imageBuilder.setSource(base64, ImageSourceType.BASE64);
            const size = await getImageSize(base64);
            width = size.width;
            height = size.height;
        }

        imageBuilder.setWidth(width);

        imageBuilder.setHeight(height);

        if (column != null) {
            imageBuilder.setColumn(column);
        } else {
            imageBuilder.setColumn(0);
        }

        if (row != null) {
            imageBuilder.setRow(row);
        } else {
            imageBuilder.setRow(0);
        }

        if (offsetX != null) {
            imageBuilder.setColumnOffset(offsetX);
        } else {
            imageBuilder.setColumnOffset(0);
        }

        if (offsetY != null) {
            imageBuilder.setRowOffset(offsetY);
        } else {
            imageBuilder.setRowOffset(0);
        }

        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();

        imageBuilder.setUnitId(unitId);
        imageBuilder.setSubUnitId(subUnitId);

        const param = imageBuilder.build();
        param.unitId = this._fWorkbook.getId();
        param.subUnitId = this.getSheetId();

        return this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: [param] });
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
        });
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

    override getActiveImages(): FOverGridImage[] {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawingData = sheetDrawingService.getFocusDrawings();
        const images: FOverGridImage[] = [];
        for (const drawingId in drawingData) {
            const drawing = drawingData[drawingId];
            images.push(this._injector.createInstance(FOverGridImage, drawing as ISheetImage));
        }
        return images;
    }

    override updateImages(sheetImages: ISheetImage[]): void {
        this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: sheetImages });
    }

    override onImageInserted(callback: (images: FOverGridImage[]) => void): void {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        sheetDrawingService.add$.subscribe((drawingSearches) => {
            const drawings = drawingSearches.map(
                (drawingSearch) => this._injector.createInstance(FOverGridImage, sheetDrawingService.getDrawingByParam(drawingSearch) as ISheetImage)
            );
            callback(drawings);
        });
    }

    override onImageDeleted(callback: (images: FOverGridImage[]) => void): void {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        sheetDrawingService.remove$.subscribe((drawingSearches) => {
            const drawings = drawingSearches.map(
                (drawingSearch) => this._injector.createInstance(FOverGridImage, sheetDrawingService.getDrawingByParam(drawingSearch) as ISheetImage)
            );
            callback(drawings);
        });
    }

    override onImageChanged(callback: (images: FOverGridImage[]) => void): void {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        sheetDrawingService.update$.subscribe((drawingSearches) => {
            const drawings = drawingSearches.map(
                (drawingSearch) => this._injector.createInstance(FOverGridImage, sheetDrawingService.getDrawingByParam(drawingSearch) as ISheetImage)
            );
            callback(drawings);
        });
    }
}

FWorksheet.extend(FWorksheetLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetLegacy {}
}
