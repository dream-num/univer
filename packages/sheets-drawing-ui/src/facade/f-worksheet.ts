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

import type { IDisposable, IFBlobSource, Nullable } from '@univerjs/core';
import type { FRange } from '@univerjs/sheets/facade';
import { DrawingTypeEnum, ImageSourceType, toDisposable } from '@univerjs/core';
import { ISheetDrawingService, type ISheetImage } from '@univerjs/sheets-drawing';
import { type ICanvasFloatDom, type IDOMRangeLayout, InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { type IFComponentKey, transformComponentKey } from '@univerjs/sheets-ui/facade';
import { FWorksheet } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';
import { FOverGridImage, FOverGridImageBuilder } from './f-over-grid-image';

// why omit this key? if componentKey is missing, then which component should be used?
export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {}

export interface IFWorksheetLegacy {
    /**
     * Add a float dom to position.
     * @param layer float dom config
     * @param id float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     * @example
     * ```ts
     let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     sheet.addFloatDomToPosition({
            allowTransform: false,
            initPosition: {
                startX: 200,
                endX: 400,
                startY: 200,
                endY: 400,
            },
            componentKey: 'ImageDemo',
            props: {
                a: 1,
            },
            data: {
                aa: '128',
            },
        });
     * ```
     */
    addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    /**
     * Add dom over range to FloatDOM, And FloatDOM is registerComponent(BuiltInUIPart.CONTENT)
     * @param layer
     * @param id
     * @example
     * ```ts
     const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     const range = sheet.getRange(0, 0, 3, 3);
     univerAPI.getActiveWorkbook().setActiveRange(range);
     const {id, dispose } = sheet.addFloatDomToRange(range, {
            allowTransform: false,
            componentKey: 'RangeLoading',
            props: {
                a: 1,
            },
            data: {
                aa: '128',
            },
        }, {},
        'loadingcover'
    )
    setTimeout(()=> {
        dispose();
    }, 2000)

    // another example-------------------
    {
     const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     const range = univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange()
     const {id, dispose } = sheet.addFloatDomToRange(range, {
            allowTransform: false,
            componentKey: 'FloatButton', // React comp key registered in ComponentManager
            props: {
                a: 1,
            },
            data: {
                aa: '128',
            },
        }, {
        width: 100,
        height: 30,
        marginX: '100%', // margin percent to range width, or pixel
        marginY: '100%'
    },
    'AIButton') // dom id
    }

     * ```
     */
    addFloatDomToRange(range: FRange, layer: IFICanvasFloatDom, domLayout: IDOMRangeLayout, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    /**
     * Add dom at column header, And FloatDOM is registerComponent(BuiltInUIPart.CONTENT)
     * @param column
     * @param layer
     * @param domPos
     * @param id
     * @example
     * ```ts
    {
     const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     const rs = sheet.addFloatDomToColumnHeader(3,
            {
                allowTransform: false,
                componentKey: 'FloatButton', // React comp key registered in ComponentManager
                props: {
                    a: 1,
                },
            },
            {width: 100, height: 40, marginX: 0, marginY: 0, horizonOffsetAlign: 'right'},
            'ai-selector' // dom id
        )
    }
     *```
     */
    addFloatDomToColumnHeader(column: number, layer: IFICanvasFloatDom, domPos: IDOMRangeLayout, id?: string): Nullable<{
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
     *  const image = activeSheet.getImageById(param.drawingId);
     *  console.log(image);
     *  setTimeout(async ()=>{
     *   const builder = image.toBuilder();
     *   const param = await builder.setHeight(50).setWidth(100).build();
     *   activeSheet.updateImages([param]);
     *  }, 4000);
     */
    insertImages(sheetImages: ISheetImage[]): FWorksheet;

    /**
     * Get all images in current sheet.
     * @returns FOverGridImage[]
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().getActiveSheet().getImages();
     * ```
     */
    getImages(): FOverGridImage[];

    /**
     * Get image by drawing id
     * @param id - The drawing id of the image
     * @returns FOverGridImage | null
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().getActiveSheet().getImageById('xxxx');
     * ```
     */
    getImageById(id: string): FOverGridImage | null;

    deleteImages(sheetImages: FOverGridImage[]): FWorksheet;

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
     *  const image = activeSheet.getImageById(param.drawingId);
     *  console.log(image);
     *  setTimeout(async ()=>{
     *   const builder = image.toBuilder();
     *   const param = await builder.setHeight(50).setWidth(100).build();
     *   activeSheet.updateImages([param]);
     *  }, 4000);
     */
    updateImages(sheetImages: ISheetImage[]): FWorksheet;

    /**
     * Get all images in current sheet.
     * @returns FOverGridImage[]
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().getActiveSheet().getImages();
     * ```
     */
    getActiveImages(): FOverGridImage[];

    /**
     * Hook when a image is inserted.
     * @param {function(FOverGridImage[]: void)} callback - The callback function when a image is inserted.
     */
    onImageInserted(callback: (images: FOverGridImage[]) => void): IDisposable;

    /**
     * Hook when a image is deleted.
     * @param {function(FOverGridImage[]: void)} callback - The callback function when a image is deleted.
     */
    onImageDeleted(callback: (images: FOverGridImage[]) => void): IDisposable;

    /**
     * Hook when a image is changed.
     * @param {function(FOverGridImage[]: void)} callback - The callback function when a image is changed.
     */
    onImageChanged(callback: (images: FOverGridImage[]) => void): IDisposable;

     /**
      * Create a new over grid image builder.
      * @returns {FOverGridImageBuilder} The builder
      * @example
      * ```ts
      * // create a new over grid image builder.
      * const builder = univerAPI.newOverGridImage();
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

    override addFloatDomToRange(fRange: FRange, layer: IFICanvasFloatDom, domLayout: IDOMRangeLayout, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const { key, disposableCollection } = transformComponentKey(layer, this._injector.get(ComponentManager));
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const res = floatDomService.addFloatDomToRange(fRange.getRange(), { ...layer, componentKey: key, unitId, subUnitId }, domLayout, id);

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

    override addFloatDomToColumnHeader(column: number, layer: IFICanvasFloatDom, domLayout: IDOMRangeLayout, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const { key, disposableCollection } = transformComponentKey(layer, this._injector.get(ComponentManager));
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const domRangeDispose = floatDomService.addFloatDomToColumnHeader(column, { ...layer, componentKey: key, unitId, subUnitId }, domLayout, id);

        if (domRangeDispose) {
            disposableCollection.add(domRangeDispose.dispose);
            return {
                id: domRangeDispose.id,
                dispose: (): void => {
                    disposableCollection.dispose();
                    domRangeDispose.dispose();
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

        const param = await imageBuilder.buildAsync();

        return this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: [param] });
    }

    override insertImages(sheetImages: ISheetImage[]): FWorksheet {
        const param = sheetImages.map((image) => {
            image.unitId = this._fWorkbook.getId();
            image.subUnitId = this.getSheetId();
            return image;
        });

        this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: param });
        return this;
    }

    override deleteImages(sheetImages: FOverGridImage[]): FWorksheet {
        const drawings = sheetImages.map((image) => {
            return {
                unitId: this._fWorkbook.getId(),
                drawingId: image.getId(),
                subUnitId: this.getSheetId(),
                drawingType: image.getType(),
            };
        });
        this._commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings });

        return this;
    }

    override getImages(): FOverGridImage[] {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawingData = sheetDrawingService.getDrawingData(this._fWorkbook.getId(), this.getSheetId());
        const images: FOverGridImage[] = [];
        for (const drawingId in drawingData) {
            const drawing = drawingData[drawingId];
            if (drawing.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                continue;
            }
            images.push(this._injector.createInstance(FOverGridImage, drawing as ISheetImage));
        }
        return images;
    }

    override getImageById(id: string): FOverGridImage | null {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawing = sheetDrawingService.getDrawingByParam({ unitId: this._fWorkbook.getId(), subUnitId: this.getSheetId(), drawingId: id });
        if (drawing && drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
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

    override updateImages(sheetImages: ISheetImage[]): FWorksheet {
        this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: sheetImages });
        return this;
    }

    override onImageInserted(callback: (images: FOverGridImage[]) => void): IDisposable {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        return toDisposable(sheetDrawingService.add$.subscribe((drawingSearches) => {
            const drawings = drawingSearches.map(
                (drawingSearch) => this._injector.createInstance(FOverGridImage, sheetDrawingService.getDrawingByParam(drawingSearch) as ISheetImage)
            );
            callback(drawings);
        }));
    }

    override onImageDeleted(callback: (images: FOverGridImage[]) => void): IDisposable {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        return toDisposable(sheetDrawingService.remove$.subscribe((drawingSearches) => {
            const drawings = drawingSearches.map(
                (drawingSearch) => this._injector.createInstance(FOverGridImage, sheetDrawingService.getDrawingByParam(drawingSearch) as ISheetImage)
            );
            callback(drawings);
        }));
    }

    override onImageChanged(callback: (images: FOverGridImage[]) => void): IDisposable {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        return toDisposable(sheetDrawingService.update$.subscribe((drawingSearches) => {
            const drawings = drawingSearches.map(
                (drawingSearch) => this._injector.createInstance(FOverGridImage, sheetDrawingService.getDrawingByParam(drawingSearch) as ISheetImage)
            );
            callback(drawings);
        }));
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
