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

    /**
     * Insert an image to the sheet
     * @param url The image url
     * @param column The column to insert the image
     * @param row The row to insert the image
     * @param offsetX The offset x of the image
     * @param offsetY The offset y of the image
     * @returns true if the image is inserted successfully
     * @example
     * ```ts
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * activeSheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', 5, 5, 0, 0);
     * ```
     */
    insertImage(url: string): Promise<boolean>;
    insertImage(url: string, column: number, row: number): Promise<boolean>;
    insertImage(url: string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource | string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;

    /**
     * Insert images to the sheet
     * @param sheetImages The images to insert
     * @returns true if the image is inserted successfully
     * @example
     * ```ts
     *  const activeSpreadsheet = univerAPI.getActiveWorkbook();
     *  const activeSheet = activeSpreadsheet.getActiveSheet();
     *  const imageBuilder = activeSheet.newOverGridImage();
     *  const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setWidth(500).setHeight(300).build();
     *  activeSheet.insertImages([param]);
     *
     *
     *  const image = activeSheet.getImageById(param.drawingId);
     *  console.log(image);

     *  setTimeout(async ()=>{
     *   const builder = image.toBuilder();
     *   const param = await builder.setHeight(50).setWidth(100).build();
     *   activeSheet.updateImages([param]);
     *  }, 4000);
     */
    insertImages(sheetImages: ISheetImage[]): void;

    getImages(): FOverGridImage[];

    getImageById(id: string): FOverGridImage | null;

    deleteImages(sheetImages: FOverGridImage[]): void;

    /**
     * Update images to the sheet
     * @param sheetImages The images to insert
     * @returns true if the image is inserted successfully
     * @example
     * ```ts
     *  const activeSpreadsheet = univerAPI.getActiveWorkbook();
     *  const activeSheet = activeSpreadsheet.getActiveSheet();
     *  const imageBuilder = activeSheet.newOverGridImage();
     *  const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setWidth(500).setHeight(300).build();
     *  activeSheet.insertImages([param]);
     *
     *
     *  const image = activeSheet.getImageById(param.drawingId);
     *  console.log(image);

     *  setTimeout(async ()=>{
     *   const builder = image.toBuilder();
     *   const param = await builder.setHeight(50).setWidth(100).build();
     *   activeSheet.updateImages([param]);
     *  }, 4000);
     */
    updateImages(sheetImages: ISheetImage[]): void;

    getActiveImages(): FOverGridImage[];

    onImageInserted(callback: (images: FOverGridImage[]) => void): void;

    onImageDeleted(callback: (images: FOverGridImage[]) => void): void;

    onImageChanged(callback: (images: FOverGridImage[]) => void): void;

     /**
      * Create a new over grid image builder.
      * @returns The builder
      * @example
      * ```ts
      * // create a new over grid image builder.
      * const builder = UniverApi.newOverGridImage();
      * ```
      */
    newOverGridImage(): FOverGridImageBuilder;
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
        const imageBuilder = this.newOverGridImage();
        if (typeof url === 'string') {
            imageBuilder.setSource(url);
        } else {
            const blobSource = url.getBlob();
            const base64 = await blobSource.getDataAsString();
            imageBuilder.setSource(base64, ImageSourceType.BASE64);
        }

        if (column !== undefined) {
            imageBuilder.setColumn(column);
        } else {
            imageBuilder.setColumn(0);
        }

        if (row !== undefined) {
            imageBuilder.setRow(row);
        } else {
            imageBuilder.setRow(0);
        }

        if (offsetX !== undefined) {
            imageBuilder.setColumnOffset(offsetX);
        } else {
            imageBuilder.setColumnOffset(0);
        }

        if (offsetY !== undefined) {
            imageBuilder.setRowOffset(offsetY);
        } else {
            imageBuilder.setRowOffset(0);
        }

        const param = await imageBuilder.build();

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

    override getImageById(id: string): FOverGridImage | null {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawing = sheetDrawingService.getDrawingByParam({ unitId: this._fWorkbook.getId(), subUnitId: this.getSheetId(), drawingId: id });
        if (drawing) {
            return this._injector.createInstance(FOverGridImage, drawing as ISheetImage);
        }
        return null;
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

    override newOverGridImage(): FOverGridImageBuilder {
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();
        return this._injector.createInstance(FOverGridImageBuilder, unitId, subUnitId);
    }
}

FWorksheet.extend(FWorksheetLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetLegacy {}
}
