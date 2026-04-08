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

import type { IEventBase } from '@univerjs/core/facade';
import type { ISheetFloatDom } from '@univerjs/sheets-drawing';
import type { FWorkbook } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core/facade';

/**
 * @ignore
 */
interface IFSheetsDrawingUIEventNameMixin {
    /**
     * Triggered before float dom insertion.
     * @see {@link IBeforeFloatDomAddEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeFloatDomAdd, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, drawings } = params;
     *   // Cancel the insertion operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeFloatDomAdd: 'BeforeFloatDomAdd';

    /**
     * Triggered after float dom insertion.
     * @see {@link IFloatDomAddedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.FloatDomAdded, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, drawings } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly FloatDomAdded: 'FloatDomAdded';

    /**
     * Triggered before float dom update.
     * @see {@link IBeforeFloatDomUpdateEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeFloatDomUpdate, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, drawings } = params;
     *   // Cancel the update operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeFloatDomUpdate: 'BeforeFloatDomUpdate';

    /**
     * Triggered after float dom update.
     * @see {@link IFloatDomUpdatedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.FloatDomUpdated, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, drawings } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly FloatDomUpdated: 'FloatDomUpdated';

    /**
     * Triggered before float dom deletion.
     * @see {@link IBeforeFloatDomDeleteEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeFloatDomDelete, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, drawings } = params;
     *   // Cancel the deletion operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeFloatDomDelete: 'BeforeFloatDomDelete';

    /**
     * Triggered after float dom deletion.
     * @see {@link IFloatDomDeletedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.FloatDomDeleted, (params) => {
     *   console.log(params);
     *   // do something
     *   const { workbook, drawings } = params;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly FloatDomDeleted: 'FloatDomDeleted';
}

export class FSheetsDrawingUIEventNameMixin extends FEventName implements IFSheetsDrawingUIEventNameMixin {
    override get BeforeFloatDomAdd(): 'BeforeFloatDomAdd' {
        return 'BeforeFloatDomAdd' as const;
    }

    override get FloatDomAdded(): 'FloatDomAdded' {
        return 'FloatDomAdded' as const;
    }

    override get BeforeFloatDomUpdate(): 'BeforeFloatDomUpdate' {
        return 'BeforeFloatDomUpdate' as const;
    }

    override get FloatDomUpdated(): 'FloatDomUpdated' {
        return 'FloatDomUpdated' as const;
    }

    override get BeforeFloatDomDelete(): 'BeforeFloatDomDelete' {
        return 'BeforeFloatDomDelete' as const;
    }

    override get FloatDomDeleted(): 'FloatDomDeleted' {
        return 'FloatDomDeleted' as const;
    }
}

/**
 * @ignore
 */
export interface IBeforeFloatDomAddEventParams extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of float dom drawings to be added.
     */
    drawings: ISheetFloatDom[];
}

export interface IFloatDomAddedEventParams extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of float dom drawings that were added.
     */
    drawings: ISheetFloatDom[];
}

export interface IBeforeFloatDomUpdateEventParams extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of float dom drawings to be updated.
     */
    drawings: ISheetFloatDom[];
}

export interface IFloatDomUpdatedEventParams extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of float dom drawings that were updated.
     */
    drawings: ISheetFloatDom[];
}

export interface IBeforeFloatDomDeleteEventParams extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of float dom drawings to be deleted.
     */
    drawings: ISheetFloatDom[];
}

export interface IFloatDomDeletedEventParams extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;

    /**
     * Collection of float dom drawing ids that were deleted.
     */
    drawings: string[];
}

interface ISheetsDrawingUIEventParamConfig {
    BeforeFloatDomAdd: IBeforeFloatDomAddEventParams;
    FloatDomAdded: IFloatDomAddedEventParams;

    BeforeFloatDomUpdate: IBeforeFloatDomUpdateEventParams;
    FloatDomUpdated: IFloatDomUpdatedEventParams;

    BeforeFloatDomDelete: IBeforeFloatDomDeleteEventParams;
    FloatDomDeleted: IFloatDomDeletedEventParams;
}

FEventName.extend(FSheetsDrawingUIEventNameMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsDrawingUIEventNameMixin { }
    interface IEventParamConfig extends ISheetsDrawingUIEventParamConfig { }
}
