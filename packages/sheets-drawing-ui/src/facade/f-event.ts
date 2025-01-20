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

import type { IDrawingSearch, IEventBase } from '@univerjs/core';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { FWorkbook } from '@univerjs/sheets/facade';
import type { FOverGridImage } from './f-over-grid-image';
import { FEventName } from '@univerjs/core';

interface IFDrawingEventNameMixin {
    /**
     * Triggered before floating image insertion.
     * Type of the event parameter is {@link IBeforeOverGridImageInsertParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageInsert, (param) => {
     *    const { workbook, insertImageParams } = param;
     *    // do something
     *    console.log(workbook, insertImageParams);
     *    // Cancel the insertion operation
     *    param.cancel = true;
     * })
     * ```
     */
    readonly BeforeOverGridImageInsert: 'BeforeOverGridImageInsert';

    /**
     * Triggered after floating image insertion.
     * Type of the event parameter is {@link IOverGridImageInsertedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.OverGridImageInserted, (param) => {
     *   const { workbook, images } = param;
     *  // do something
     *  console.log(workbook, images);
     * })
     * ```
     */
    readonly OverGridImageInserted: 'OverGridImageInserted';

    /**
     * Triggered before floating image removal.
     * Type of the event parameter is {@link IBeforeOverGridImageRemoveParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageRemove, (param) => {
     *  const { workbook, images } = param;
     * // do something
     * console.log(workbook, images);
     * // Cancel the removal operation
     * param.cancel = true;
     * })
     * ```
     */
    readonly BeforeOverGridImageRemove: 'BeforeOverGridImageRemove';

    /**
     * Triggered after floating image removal.
     * Type of the event parameter is {@link IOverGridImageRemovedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.OverGridImageRemoved, (param) => {
     * const { workbook, removeImageParams } = param;
     * // do something
     * console.log(workbook, removeImageParams);
     * })
     * ```
     */
    readonly OverGridImageRemoved: 'OverGridImageRemoved';

    /**
     * Triggered before floating image change.
     * Type of the event parameter is {@link IBeforeOverGridImageChangeParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageChange, (param) => {
     *   const { workbook, images } = param;
     *   // do something
     *   console.log(workbook, images);
     *   // Cancel the image change
     *   param.cancel = true;
     * })
     * ```
     */
    readonly BeforeOverGridImageChange: 'BeforeOverGridImageChange';

    /**
     * Triggered after floating image change.
     * Type of the event parameter is {@link IOverGridImageChangedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.OverGridImageChanged, (param) => {
     * const { workbook, images } = param;
     * // do something
     * console.log(workbook, images);
     * })
     * ```
     */
    readonly OverGridImageChanged: 'OverGridImageChanged';

    /**
     * Triggered before floating image selection.
     * Type of the event parameter is {@link IBeforeOverGridImageSelectParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageSelect, (param) => {
     *   const { workbook, selectedImages, oldSelectedImages } = param;
     *   // do something
     *   console.log(workbook, selectedImages, oldSelectedImages);
     *   // cancel the event
     *   param.cancel = true;
     * })
     * ```
     */
    readonly BeforeOverGridImageSelect: 'BeforeOverGridImageSelect';

    /**
     * Triggered after floating image selection.
     * Type of the event parameter is {@link IOverGridImageSelectedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.OverGridImageSelected, (param) => {
     * const { workbook, selectedImages } = param;
     * // do something
     * console.log(workbook, selectedImages);
     * })
     * ```
     */
    readonly OverGridImageSelected: 'OverGridImageSelected';
}

export class FDrawingEventNameMixin extends FEventName implements IFDrawingEventNameMixin {
    override get BeforeOverGridImageChange(): 'BeforeOverGridImageChange' {
        return 'BeforeOverGridImageChange' as const;
    }

    override get OverGridImageChanged(): 'OverGridImageChanged' {
        return 'OverGridImageChanged' as const;
    }

    override get BeforeOverGridImageInsert(): 'BeforeOverGridImageInsert' {
        return 'BeforeOverGridImageInsert' as const;
    }

    override get OverGridImageInserted(): 'OverGridImageInserted' {
        return 'OverGridImageInserted' as const;
    }

    override get BeforeOverGridImageRemove(): 'BeforeOverGridImageRemove' {
        return 'BeforeOverGridImageRemove' as const;
    }

    override get OverGridImageRemoved(): 'OverGridImageRemoved' {
        return 'OverGridImageRemoved' as const;
    }

    override get BeforeOverGridImageSelect(): 'BeforeOverGridImageSelect' {
        return 'BeforeOverGridImageSelect' as const;
    }

    override get OverGridImageSelected(): 'OverGridImageSelected' {
        return 'OverGridImageSelected' as const;
    }
}

export interface IBeforeOverGridImageChangeParamObject {
    /**
     * Parameters of the image to be updated. {@link ISheetImage}
     */
    changeParam: Partial<ISheetImage>;

    /**
     * Instance of the image to be updated. {@link FOverGridImage}
     */
    image: FOverGridImage;
}

export interface IBeforeOverGridImageChangeParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of parameters of the images to be updated, there may be multiple images to be updated. {@link IBeforeOverGridImageChangeParamObject}
     */
    images: IBeforeOverGridImageChangeParamObject[];
}

export interface IOverGridImageChangedParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Instances of the images after the update. {@link FOverGridImage}
     */
    images: FOverGridImage[];
}

export interface IBeforeOverGridImageInsertParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of parameters of the images to be inserted. {@link ISheetImage}
     */
    insertImageParams: ISheetImage[];
}

export interface IOverGridImageInsertedParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of instances of the images after insertion. {@link FOverGridImage}
     */
    images: FOverGridImage[];
}

export interface IBeforeOverGridImageRemoveParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of instances of the images to be removed. {@link FOverGridImage}
     */
    images: FOverGridImage[];
}

export interface IOverGridImageRemovedParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of parameters of the images after removal. {@link ISheetImage}
     */
    removeImageParams: IDrawingSearch[];
}

export interface IBeforeOverGridImageSelectParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The images before selection. {@link FOverGridImage}
     */
    oldSelectedImages: FOverGridImage[];

    selectedImages: FOverGridImage[];
}

export interface IOverGridImageSelectedParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The selected images. {@link FOverGridImage}
     */
    selectedImages: FOverGridImage[];
}

interface IFSheetsUIEventParamConfig {
    BeforeOverGridImageChange: IBeforeOverGridImageChangeParam;
    OverGridImageChanged: IOverGridImageChangedParam;

    BeforeOverGridImageInsert: IBeforeOverGridImageInsertParam;
    OverGridImageInserted: IOverGridImageInsertedParam;

    BeforeOverGridImageRemove: IBeforeOverGridImageRemoveParam;
    OverGridImageRemoved: IOverGridImageRemovedParam;

    BeforeOverGridImageSelect: IBeforeOverGridImageSelectParam;
    OverGridImageSelected: IOverGridImageSelectedParam;
}

FEventName.extend(FDrawingEventNameMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFDrawingEventNameMixin { }
    interface IEventParamConfig extends IFSheetsUIEventParamConfig { }
}
