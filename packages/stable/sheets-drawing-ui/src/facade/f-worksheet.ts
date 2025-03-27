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
import type { IFBlobSource } from '@univerjs/core/facade';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { ICanvasFloatDom, IDOMAnchor } from '@univerjs/sheets-drawing-ui';
import type { IFComponentKey } from '@univerjs/sheets-ui/facade';
import type { FRange } from '@univerjs/sheets/facade';
import { DrawingTypeEnum, ImageSourceType, toDisposable } from '@univerjs/core';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { transformComponentKey } from '@univerjs/sheets-ui/facade';
import { FWorksheet } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';
import { FOverGridImage, FOverGridImageBuilder } from './f-over-grid-image';

// why omit this key? if componentKey is missing, then which component should be used?
export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {}

/**
 * @ignore
 */
export interface IFWorksheetLegacy {
    /**
     * Add a float dom to position.
     * @param {IFICanvasFloatDom} layer - The float dom layer configuration.
     * @param {string} [id] - The float dom id, if not given will be auto generated.
     * @returns float dom id and dispose function
     * @example
     * ```tsx
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     *
     * // You should register components at an appropriate time (e.g., when Univer is loaded)
     * // This is a React component. For Vue3 components, the third parameter should be `{ framework: 'vue3' }`
     * univerAPI.registerComponent(
     *   'myFloatDom',
     *   ({ data }) => (
     *     <div style={{ width: '100%', height: '100%', background: '#fff', border: '1px solid #ccc', boxSizing: 'border-box' }}>
     *       popup content:
     *       {' '}
     *       {data?.label}
     *     </div>
     *   ),
     * );
     *
     * // Add a floating DOM
     * // If disposable is null, floating DOM addition failed
     * const disposeable = fWorksheet.addFloatDomToPosition({
     *   componentKey: 'myFloatDom',
     *   initPosition: {
     *     startX: 100,
     *     endX: 300,
     *     startY: 100,
     *     endY: 200,
     *   },
     *
     *   // Component data
     *   data: {
     *     label: 'hahah',
     *   },
     * });
     *
     * // Remove the floating DOM after 2 seconds
     * setTimeout(() => {
     *   disposeable?.dispose();
     * }, 2000);
     * ```
     */
    addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    /**
     * Add dom over range to FloatDOM, And FloatDOM is registerComponent(BuiltInUIPart.CONTENT)
     * @param {FRange} range - The range to add the float dom.
     * @param {Partial<IFICanvasFloatDom>} layer - The float dom layer configuration.
     * @param {Partial<IDOMAnchor>} domLayout - The anchor configuration of the float dom.
     * @param {string} [id] - The float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     * @example
     * ```tsx
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     *
     * // Register a range loading component
     * const RangeLoading = () => {
     *   const divStyle = {
     *     width: '100%',
     *     height: '100%',
     *     backgroundColor: '#fff',
     *     border: '1px solid #ccc',
     *     boxSizing: 'border-box' as const,
     *     display: 'flex',
     *     justifyContent: 'center',
     *     alignItems: 'center',
     *     textAlign: 'center' as const,
     *     transformOrigin: 'top left',
     *   };
     *
     *   return (
     *     <div style={divStyle}>
     *       Loading...
     *     </div>
     *   );
     * };
     * univerAPI.registerComponent('RangeLoading', RangeLoading);
     *
     * // Add the range loading component covering the range A1:C3
     * const fRange = fWorksheet.getRange('A1:C3');
     * const disposeable = fWorksheet.addFloatDomToRange(fRange, { componentKey: 'RangeLoading' }, {}, 'myRangeLoading');
     *
     * // Remove the floating DOM after 2 seconds
     * setTimeout(() => {
     *   disposeable?.dispose();
     * }, 2000);
     *
     * // another example-------------------
     * // Register a float button component
     * const FloatButton = () => {
     *   const divStyle = {
     *     width: '100px',
     *     height: '30px',
     *     backgroundColor: '#fff',
     *     border: '1px solid #ccc',
     *     boxSizing: 'border-box' as const,
     *     display: 'flex',
     *     justifyContent: 'center',
     *     alignItems: 'center',
     *     textAlign: 'center' as const,
     *     cursor: 'pointer',
     *   };
     *
     *   const clickHandler = () => {
     *     console.warn('click');
     *   };
     *
     *   return (
     *     <div style={divStyle} onClick={clickHandler}>
     *       FloatButton
     *     </div>
     *   );
     * };
     * univerAPI.registerComponent('FloatButton', FloatButton);
     *
     * // Add the float button to the range A5:C7, position is start from A5 cell, and width is 100px, height is 30px, margin is 100% of range width and height
     * const fRange2 = fWorksheet.getRange('A5:C7');
     * const disposeable2 = fWorksheet.addFloatDomToRange(
     *   fRange2,
     *   {
     *     componentKey: 'FloatButton',
     *   },
     *   {
     *     width: 100,
     *     height: 30,
     *     marginX: '100%', // margin percent to range width, or pixel
     *     marginY: '100%'
     *   },
     *   'myFloatButton'
     * );
     * ```
     */
    addFloatDomToRange(range: FRange, layer: Partial<IFICanvasFloatDom>, domLayout: Partial<IDOMAnchor>, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    /**
     * Add dom at column header, And FloatDOM is registerComponent(BuiltInUIPart.CONTENT)
     * @param {number} column - The column index to add the float dom.
     * @param {Partial<IFICanvasFloatDom>} layer - The float dom layer configuration.
     * @param {IDOMAnchor} domPos - The anchor configuration of the float dom.
     * @param {string} [id] - The float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     *
     * // Register a float button component
     * const FloatButton = () => {
     *   const divStyle = {
     *     width: '100px',
     *     height: '30px',
     *     backgroundColor: '#fff',
     *     border: '1px solid #ccc',
     *     boxSizing: 'border-box' as const,
     *     display: 'flex',
     *     justifyContent: 'center',
     *     alignItems: 'center',
     *     textAlign: 'center' as const,
     *     cursor: 'pointer',
     *   };
     *
     *   const clickHandler = () => {
     *     console.warn('click');
     *   };
     *
     *   return (
     *     <div style={divStyle} onClick={clickHandler}>
     *       FloatButton
     *     </div>
     *   );
     * };
     * univerAPI.registerComponent('FloatButton', FloatButton);
     *
     * // Add the float button to the column D header, position is right align, width is 100px, height is 30px, margin is 0
     * const disposeable = fWorksheet.addFloatDomToColumnHeader(
     *   3,
     *   {
     *     componentKey: 'FloatButton',
     *     allowTransform: false,
     *   },
     *   {
     *     width: 100,
     *     height: 30,
     *     marginX: 0,
     *     marginY: 0,
     *     horizonOffsetAlign: 'right',
     *   },
     *   'myFloatButton'
     * );
     *
     * // Remove the float button after 2 seconds
     * setTimeout(() => {
     *   disposeable?.dispose();
     * }, 2000);
     * ```
     */
    addFloatDomToColumnHeader(column: number, layer: Partial<IFICanvasFloatDom>, domPos: IDOMAnchor, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    /**
     * Insert an image to the sheet
     * @param {string} url - The image url
     * @returns true if the image is inserted successfully
     * @example
     * ```ts
     * // Insert an image to the sheet, default position is A1
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const result = await fWorksheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4');
     * console.log(result);
     * ```
     */
    insertImage(url: string): Promise<boolean>;
    /**
     * @param {string} url - The image url
     * @param {number} column - The column index to insert the image
     * @param {number} row - The row index to insert the image
     * @returns True if the image is inserted successfully
     * @example
     * ```ts
     * // Insert an image to the sheet, position is F6
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const result = await fWorksheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', 5, 5);
     * console.log(result);
     * ```
     */
    insertImage(url: string, column: number, row: number): Promise<boolean>;
    /**
     * @param {string} url - The image url
     * @param {number} column - The column index to insert the image
     * @param {number} row - The row index to insert the image
     * @param {number} offsetX - The column offset, pixel unit
     * @param {number} offsetY - The row offset, pixel unit
     * @returns True if the image is inserted successfully
     * @example
     * ```ts
     * // Insert an image to the sheet, position is F6, offset is 10px
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const result = await fWorksheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', 5, 5, 10, 10);
     * console.log(result);
     * ```
     */
    insertImage(url: string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource | string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;

    /**
     * Insert images to the sheet
     * @param {ISheetImage[]} sheetImages - The images to insert
     * @returns {FWorksheet} The FWorksheet instance for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 500px, height is 300px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(500)
     *   .setHeight(300)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     *
     * // update the image width to 100px and height to 50px
     * setTimeout(async () => {
     *   const imageBuilder = fWorksheet.getImageById(image.drawingId).toBuilder();
     *   const newImage = await imageBuilder.setWidth(100).setHeight(50).buildAsync();
     *   fWorksheet.updateImages([newImage]);
     * }, 4000);
     * ```
     */
    insertImages(sheetImages: ISheetImage[]): FWorksheet;

    /**
     * Get all images of the sheet.
     * @returns {FOverGridImage[]} The FOverGridImage instances
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.getId());
     * });
     * ```
     */
    getImages(): FOverGridImage[];

    /**
     * Get image by drawing id
     * @param {string} id - The drawing id of the image
     * @returns {FOverGridImage | null} The FOverGridImage instance
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = fWorksheet.getImageById('xxxx');
     * console.log(image);
     * ```
     */
    getImageById(id: string): FOverGridImage | null;

    /**
     * Delete images from the sheet
     * @param {FOverGridImage[]} sheetImages - The images to delete
     * @returns {FWorksheet} The FWorksheet instance for chaining
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     *
     * // Delete the first image of the sheet
     * fWorksheet.deleteImages([image]);
     * ```
     */
    deleteImages(sheetImages: FOverGridImage[]): FWorksheet;

    /**
     * Update images to the sheet
     * @param {ISheetImage[]} sheetImages - The images to update
     * @returns {FWorksheet} The FWorksheet instance for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 500px, height is 300px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(500)
     *   .setHeight(300)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     *
     * // update the image width to 100px and height to 50px after 4 seconds
     * setTimeout(async () => {
     *   const imageBuilder = fWorksheet.getImageById(image.drawingId).toBuilder();
     *   const newImage = await imageBuilder.setWidth(100).setHeight(50).buildAsync();
     *   fWorksheet.updateImages([newImage]);
     * }, 4000);
     * ```
     */
    updateImages(sheetImages: ISheetImage[]): FWorksheet;

    /**
     * Get the current selected images.
     * @returns {FOverGridImage[]} The FOverGridImage instances
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const images = fWorksheet.getActiveImages();
     * images.forEach((image) => {
     *   console.log(image, image.getId());
     * });
     * ```
     */
    getActiveImages(): FOverGridImage[];

    /**
     * Hook when a image is inserted.
     * @param {function(FOverGridImage[]: void)} callback - The callback function when a image is inserted.
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.OverGridImageInserted, (params) => {})` as instead
     */
    onImageInserted(callback: (images: FOverGridImage[]) => void): IDisposable;

    /**
     * Hook when a image is deleted.
     * @param {function(FOverGridImage[]: void)} callback - The callback function when a image is deleted.
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.OverGridImageRemoved, (params) => {})` as instead
     */
    onImageDeleted(callback: (images: FOverGridImage[]) => void): IDisposable;

    /**
     * Hook when a image is changed.
     * @param {function(FOverGridImage[]: void)} callback - The callback function when a image is changed.
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.OverGridImageChanged, (params) => {})` as instead
     */
    onImageChanged(callback: (images: FOverGridImage[]) => void): IDisposable;

    /**
     * Create a new over grid image builder.
     * @returns {FOverGridImageBuilder} The FOverGridImageBuilder instance
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 500px, height is 300px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(500)
     *   .setHeight(300)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
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

    override addFloatDomToRange(fRange: FRange, layer: IFICanvasFloatDom, domLayout: IDOMAnchor, id?: string): Nullable<{
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

    override addFloatDomToColumnHeader(column: number, layer: IFICanvasFloatDom, domLayout: IDOMAnchor, id?: string): Nullable<{
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
        // param.drawingId

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
