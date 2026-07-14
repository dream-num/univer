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

import type { ITransformState, Nullable } from '@univerjs/core';
import type { ISheetFloatDom } from '@univerjs/sheets-drawing';
import type { ICanvasFloatDom, ICanvasFloatDomInfo, IDOMAnchor } from '@univerjs/sheets-drawing-ui';
import type { IFComponentKey } from '@univerjs/sheets-ui/facade';
import type { FRange } from '@univerjs/sheets/facade';
import type { ISaveCellImagesOptions } from './f-range';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, SetSheetDrawingCommand, transformToAxisAlignPosition, transformToDrawingPosition } from '@univerjs/sheets-drawing';
import { FileNamePart, IBatchSaveImagesService, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { transformComponentKey } from '@univerjs/sheets-ui/facade';
import { FWorksheet } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';

// why omit this key? if componentKey is missing, then which component should be used?
export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey { }

export interface IFCanvasFloatDomResult extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId' | 'initPosition'>,
    IFComponentKey,
    Pick<ICanvasFloatDomInfo, 'id'> {
    position: ITransformState;
    id: string;
}

/**
 * @ignore
 */
export interface IFWorksheetDrawingUIMixin {
    /**
     * Get float dom by id
     * @param {string} id - float dom id
     * @returns {IFCanvasFloatDomResult | null} float dom info or null if not found
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const floatDom = fWorksheet.getFloatDomById('myFloatDomId');
     * if (floatDom) {
     *   console.log('Float dom position:', floatDom.position);
     *   console.log('Component key:', floatDom.componentKey);
     *   console.log('Custom data:', floatDom.data);
     * }
     * ```
     */
    getFloatDomById(id: string): Nullable<IFCanvasFloatDomResult>;

    /**
     * Get all float doms in current worksheet
     * @returns {IFCanvasFloatDomResult[]} array of float dom info
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const allFloatDoms = fWorksheet.getAllFloatDoms();
     * allFloatDoms.forEach(floatDom => {
     *   console.log('Float dom ID:', floatDom.id);
     *   console.log('Position:', floatDom.position);
     * });
     * ```
     */
    getAllFloatDoms(): IFCanvasFloatDomResult[];

    /**
     * Update float dom position and properties
     * @param {string} id - float dom id
     * @param {Partial<IFCanvasFloatDomResult>} config - new float dom config
     * @returns {FWorksheet} The worksheet instance for chaining
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const firstFloatDom = fWorksheet.getAllFloatDoms()[0];
     *
     * if (!firstFloatDom) return;
     *
     * // Update first float dom position and size
     * fWorksheet.updateFloatDom(firstFloatDom.id, {
     *   position: {
     *     left: 100,
     *     top: 100,
     *     width: 200,
     *     height: 150,
     *     angle: 45, // rotate 45 degrees
     *   }
     * });
     *
     * // Update first float dom data
     * fWorksheet.updateFloatDom(firstFloatDom.id, {
     *   data: {
     *     label: 'Updated Label',
     *     color: '#ff0000'
     *   }
     * });
     *
     * // Disable the first float dom from transform
     * fWorksheet.updateFloatDom(firstFloatDom.id, {
     *   allowTransform: false
     * });
     * ```
     */
    updateFloatDom(id: string, config: Partial<IFCanvasFloatDomResult>): this;

    /**
     * Batch update float doms
     * @param {Array<{id: string, config: Partial<IFCanvasFloatDomResult>}>} updates - array of update configs
     * @returns {FWorksheet} The worksheet instance for chaining
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Update multiple float doms at once
     * const allFloatDoms = fWorksheet.getAllFloatDoms();
     * fWorksheet.batchUpdateFloatDoms(allFloatDoms.map((floatDom, index) => {
     *   if (floatDom.id === 'MyFloatDomId') {
     *     return {
     *       id: floatDom.id,
     *       config: {
     *         position: {
     *           left: 100,
     *           top: 100
     *         },
     *         data: {
     *           label: 'Updated'
     *         }
     *       }
     *     }
     *   }
     *
     *   return {
     *     id: floatDom.id,
     *     config: {
     *       position: {
     *         left: 300,
     *         top: 100
     *       }
     *     }
     *   }
     * }));
     * ```
     */
    batchUpdateFloatDoms(updates: Array<{ id: string; config: Partial<IFCanvasFloatDomResult> }>): this;

    /**
     * Remove float dom by id
     * @param {string} id - float dom id
     * @returns {FWorksheet} The worksheet instance for chaining
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const firstFloatDom = fWorksheet.getAllFloatDoms()[0];
     *
     * if (!firstFloatDom) return;
     *
     * // Remove the first float dom
     * fWorksheet.removeFloatDom(firstFloatDom.id);
     * ```
     */
    removeFloatDom(id: string): this;

    /**
     * Add a float dom to position.
     * @param {IFICanvasFloatDom} layer - The float dom layer configuration.
     * @param {string} [id] - The float dom id, if not given will be auto generated.
     * @returns float dom id and dispose function
     * @example
     * ```tsx
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // You should register components at an appropriate time (e.g., when Univer is loaded).
     * // This is a React component. For other frameworks, pass a matching adapter option, such as `{ framework: 'vue3' }`.
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
     * const disposable = fWorksheet.addFloatDomToPosition({
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
     * console.log(disposable?.id); // The id of the floating DOM
     *
     * // Remove the floating DOM after 2 seconds
     * setTimeout(() => {
     *   disposable?.dispose();
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
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
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
     * const disposable = fWorksheet.addFloatDomToRange(fRange, { componentKey: 'RangeLoading' }, {}, 'myRangeLoading');
     * console.log(disposable?.id); // The id of the floating DOM
     *
     * // Remove the floating DOM after 2 seconds
     * setTimeout(() => {
     *   disposable?.dispose();
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
     * const disposable2 = fWorksheet.addFloatDomToRange(
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
     * console.log(disposable2?.id); // The id of the floating DOM
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
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
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
     * const disposable = fWorksheet.addFloatDomToColumnHeader(
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
     * console.log(disposable?.id); // The id of the floating DOM
     *
     * // Remove the float button after 2 seconds
     * setTimeout(() => {
     *   disposable?.dispose();
     * }, 2000);
     * ```
     */
    addFloatDomToColumnHeader(column: number, layer: Partial<IFICanvasFloatDom>, domPos: IDOMAnchor, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;

    /**
     * Save all cell images from specified ranges to the file system.
     * This method will open a directory picker dialog and save all images to the selected directory.
     *
     * @param {ISaveCellImagesOptions} [options] - Options for saving images
     * @param {FRange[]} [ranges] - The ranges to get cell images from. If not provided, all images in the worksheet will be saved.
     * @returns {Promise<boolean>} True if images are saved successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Save cell images from multiple ranges
     * const range1 = fWorksheet.getRange('A1:B10');
     * const range2 = fWorksheet.getRange('D1:E10');
     *
     * // Save with default options (using cell address as file name)
     * await fWorksheet.saveCellImagesAsync(undefined, [range1, range2]);
     *
     * // Save with custom options
     * await fWorksheet.saveCellImagesAsync({
     *   useCellAddress: true,
     *   useColumnIndex: 2, // Use values from column C for file names
     * }, [range1, range2]);
     * ```
     */
    saveCellImagesAsync(options?: ISaveCellImagesOptions, ranges?: FRange[]): Promise<boolean>;
}

export class FWorksheetDrawingUIMixin extends FWorksheet implements IFWorksheetDrawingUIMixin {
    override getFloatDomById(id: string): Nullable<IFCanvasFloatDomResult> {
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const info = floatDomService.getFloatDomInfo(id);
        if (!info) return null;

        const { unitId, subUnitId } = info;
        const { rect } = info;
        const state = rect.getState();
        const { left = 0, top = 0, width = 0, height = 0, flipX = false, flipY = false, angle = 0, skewX = 0, skewY = 0 } = state;
        const drawingParm = this._injector.get(ISheetDrawingService).getDrawingByParam({
            drawingId: info.id,
            unitId,
            subUnitId,
        })! as ISheetFloatDom;

        if (!drawingParm) return null;

        return {
            position: {
                left,
                top,
                width,
                height,
                flipX,
                flipY,
                angle,
                skewX,
                skewY,
            },
            componentKey: drawingParm.componentKey,
            allowTransform: drawingParm.allowTransform,
            data: drawingParm.data,
            id: info.id,
        };
    }

    override getAllFloatDoms(): IFCanvasFloatDomResult[] {
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        return Array.from(floatDomService.getFloatDomsBySubUnitId(unitId, subUnitId).values())
            .map((info): IFCanvasFloatDomResult | null => {
                const { rect } = info;
                const drawingParm = this._injector.get(ISheetDrawingService).getDrawingByParam({
                    drawingId: info.id,
                    unitId,
                    subUnitId,
                })! as ISheetFloatDom;

                if (!drawingParm) return null;

                const { left, top, width, height, flipX, flipY, angle, skewX, skewY } = rect.getState();

                return {
                    position: {
                        left,
                        top,
                        width,
                        height,
                        flipX,
                        flipY,
                        angle,
                        skewX,
                        skewY,
                    },
                    componentKey: drawingParm.componentKey,
                    allowTransform: drawingParm.allowTransform,
                    data: drawingParm.data,
                    id: info.id,
                };
            })
            .filter((dom): dom is IFCanvasFloatDomResult => dom != null);
    }

    override updateFloatDom(id: string, config: Partial<Omit<IFCanvasFloatDomResult, 'id'>>): this {
        const sheetSkeletonService = this._injector.get(SheetSkeletonService);
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const info = floatDomService.getFloatDomInfo(id);
        if (!info) return this;

        const { unitId, subUnitId } = info;
        const skeleton = sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!skeleton) return this;

        const drawingParm = this._injector.get(ISheetDrawingService).getDrawingByParam({
            unitId,
            subUnitId,
            drawingId: id,
        })! as ISheetFloatDom;

        const newParam: ISheetFloatDom = {
            ...drawingParm,
            componentKey: config.componentKey || drawingParm.componentKey,
            allowTransform: config.allowTransform !== undefined ? config.allowTransform : drawingParm.allowTransform,
            data: config.data || drawingParm.data,
            sheetTransform: config.position
                ? transformToDrawingPosition(config.position, skeleton) ?? drawingParm.sheetTransform
                : drawingParm.sheetTransform,
            transform: {
                ...drawingParm.transform,
                ...config.position, // Merge with existing transform
            },
            axisAlignSheetTransform: config.position
                ? transformToAxisAlignPosition(config.position, skeleton) ?? drawingParm.sheetTransform
                : drawingParm.sheetTransform,
        };

        const res = this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId, subUnitId, drawings: [newParam] });
        if (!res) {
            throw new Error('updateFloatDom failed');
        }
        return this;
    }

    override batchUpdateFloatDoms(updates: Array<{ id: string; config: Partial<Omit<IFCanvasFloatDomResult, 'id'>> }>): this {
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const drawingService = this._injector.get(ISheetDrawingService);
        const sheetSkeletonService = this._injector.get(SheetSkeletonService);

        const drawings: ISheetFloatDom[] = [];

        for (const update of updates) {
            const info = floatDomService.getFloatDomInfo(update.id);
            if (!info) continue;

            const { unitId, subUnitId } = info;
            const skeleton = sheetSkeletonService.getSkeleton(unitId, subUnitId);
            if (!skeleton) continue;

            const drawingParm = drawingService.getDrawingByParam({
                unitId,
                subUnitId,
                drawingId: update.id,
            }) as ISheetFloatDom;
            if (!drawingParm) continue;

            const newParam: ISheetFloatDom = {
                ...drawingParm,
                componentKey: update.config.componentKey || drawingParm.componentKey,
                allowTransform: update.config.allowTransform !== undefined ? update.config.allowTransform : drawingParm.allowTransform,
                data: update.config.data || drawingParm.data,
                sheetTransform: update.config.position
                    ? transformToDrawingPosition(update.config.position, skeleton) ?? drawingParm.sheetTransform
                    : drawingParm.sheetTransform,
                transform: {
                    ...drawingParm.transform,
                    ...update.config.position, // Merge with existing transform
                },
                axisAlignSheetTransform: update.config.position
                    ? transformToAxisAlignPosition(update.config.position, skeleton) ?? drawingParm.sheetTransform
                    : drawingParm.sheetTransform,
            };

            drawings.push(newParam);
        }

        if (drawings.length > 0) {
            const unitId = this._workbook.getUnitId();
            const subUnitId = this._worksheet.getSheetId();
            const res = this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId, subUnitId, drawings });
            if (!res) {
                throw new Error('batchUpdateFloatDoms failed');
            }
        }

        return this;
    }

    override removeFloatDom(id: string): this {
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        floatDomService.removeFloatDom(id);
        return this;
    }

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

    override async saveCellImagesAsync(options?: ISaveCellImagesOptions, ranges?: FRange[]): Promise<boolean> {
        const batchSaveService = this._injector.get(IBatchSaveImagesService);
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();

        // Get all ranges as IRange array
        const iRanges = ranges ? ranges.map((r) => r.getRange()) : [this._worksheet.getCellMatrix().getDataRange()];

        // Get images from all ranges
        const images = batchSaveService.getCellImagesFromRanges(unitId, subUnitId, iRanges);

        if (images.length === 0) {
            return false;
        }

        // If only one image, download directly
        if (images.length === 1) {
            try {
                await batchSaveService.downloadSingleImage(images[0]);
                return true;
            } catch (error) {
                console.error('Failed to download image:', error);
                return false;
            }
        }

        // Build config from options
        const fileNameParts: FileNamePart[] = [];
        const useCellAddress = options?.useCellAddress ?? true;
        const useColumnIndex = options?.useColumnIndex;

        if (useCellAddress) {
            fileNameParts.push(FileNamePart.CELL_ADDRESS);
        }
        if (useColumnIndex !== undefined) {
            fileNameParts.push(FileNamePart.COLUMN_VALUE);
        }

        // Ensure at least one naming option
        if (fileNameParts.length === 0) {
            fileNameParts.push(FileNamePart.CELL_ADDRESS);
        }

        try {
            await batchSaveService.saveImagesWithContext(images, {
                fileNameParts,
                columnIndex: useColumnIndex,
            }, unitId, subUnitId);
            return true;
        } catch (error) {
            console.error('Failed to save images:', error);
            return false;
        }
    }
}

FWorksheet.extend(FWorksheetDrawingUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetDrawingUIMixin { }
}
