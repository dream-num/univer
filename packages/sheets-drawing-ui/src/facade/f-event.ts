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

import type { IDrawingSearch } from '@univerjs/core';
import type { IEventBase } from '@univerjs/core/facade';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { FWorkbook } from '@univerjs/sheets/facade';
import type { FOverGridImage } from './f-over-grid-image';
import { FEventName } from '@univerjs/core/facade';

/**
 * @ignore
 */
interface IFDrawingEventNameMixin {
    /**
     * Triggered before floating image insertion.
     * @see {@link IBeforeOverGridImageInsertParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageInsert, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, insertImageParams } = params;
     *   // Cancel the insertion operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeOverGridImageInsert: 'BeforeOverGridImageInsert';

    /**
     * Triggered after floating image insertion.
     * @see {@link IOverGridImageInsertedParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.OverGridImageInserted, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, images } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly OverGridImageInserted: 'OverGridImageInserted';

    /**
     * Triggered before floating image removal.
     * @see {@link IBeforeOverGridImageRemoveParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageRemove, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, images } = params;
     *   // Cancel the removal operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeOverGridImageRemove: 'BeforeOverGridImageRemove';

    /**
     * Triggered after floating image removal.
     * @see {@link IOverGridImageRemovedParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.OverGridImageRemoved, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, removeImageParams } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly OverGridImageRemoved: 'OverGridImageRemoved';

    /**
     * Triggered before floating image change.
     * @see {@link IBeforeOverGridImageChangeParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageChange, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, images } = params;
     *   // Cancel the image change
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeOverGridImageChange: 'BeforeOverGridImageChange';

    /**
     * Triggered after floating image change.
     * @see {@link IOverGridImageChangedParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.OverGridImageChanged, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, images } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly OverGridImageChanged: 'OverGridImageChanged';

    /**
     * Triggered before floating image selection.
     * @see {@link IBeforeOverGridImageSelectParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageSelect, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, selectedImages, oldSelectedImages } = params;
     *   // cancel the selection operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeOverGridImageSelect: 'BeforeOverGridImageSelect';

    /**
     * Triggered after floating image selection.
     * @see {@link IOverGridImageSelectedParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.OverGridImageSelected, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, selectedImages } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
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

/**
 * @ignore
 */
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
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFDrawingEventNameMixin { }
    interface IEventParamConfig extends IFSheetsUIEventParamConfig { }
}
