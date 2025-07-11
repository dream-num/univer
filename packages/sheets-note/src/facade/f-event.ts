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

import type { ISheetNote } from '@univerjs/sheets-note';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core/facade';

export interface ISheetNoteAddEventParams {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    note: ISheetNote;
    cancel?: boolean;
}

export interface ISheetNoteDeleteEventParams {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    oldNote: ISheetNote;
    cancel?: boolean;
}

export interface ISheetNoteUpdateEventParams {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    note: ISheetNote;
    oldNote: ISheetNote;
    cancel?: boolean;
}

export interface ISheetNoteShowEventParams {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    cancel?: boolean;
}

export interface ISheetNoteHideEventParams {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    cancel?: boolean;
}

/**
 * @ignore
 */
export interface ISheetsNoteEventParamConfig {
    SheetNoteAdd: ISheetNoteAddEventParams;
    SheetNoteDelete: ISheetNoteDeleteEventParams;
    SheetNoteUpdate: ISheetNoteUpdateEventParams;
    SheetNoteShow: ISheetNoteShowEventParams;
    SheetNoteHide: ISheetNoteHideEventParams;

    BeforeSheetNoteAdd: ISheetNoteAddEventParams;
    BeforeSheetNoteDelete: ISheetNoteDeleteEventParams;
    BeforeSheetNoteUpdate: ISheetNoteUpdateEventParams;
    BeforeSheetNoteShow: ISheetNoteShowEventParams;
    BeforeSheetNoteHide: ISheetNoteHideEventParams;
}

/**
 * @ignore
 */
interface ISheetNoteEvent {
    /**
     * Event fired when a note is added
     * @see {@link ISheetNoteAddEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetNoteAdd, (params) => {
     *   const { workbook, worksheet, row, col, note } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    SheetNoteAdd: 'SheetNoteAdd';
    /**
     * Event fired when a note is deleted
     * @see {@link ISheetNoteDeleteEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetNoteDelete, (params) => {
     *   const { workbook, worksheet, row, col, oldNote } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    SheetNoteDelete: 'SheetNoteDelete';
    /**
     * Event fired when a note is updated
     * @see {@link ISheetNoteUpdateEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetNoteUpdate, (params) => {
     *   const { workbook, worksheet, row, col, note, oldNote } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    SheetNoteUpdate: 'SheetNoteUpdate';
    /**
     * Event fired when a note is shown
     * @see {@link ISheetNoteShowEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetNoteShow, (params) => {
     *   const { workbook, worksheet, row, col } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    SheetNoteShow: 'SheetNoteShow';
    /**
     * Event fired when a note is hidden
     * @see {@link ISheetNoteHideEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetNoteHide, (params) => {
     *   const { workbook, worksheet, row, col } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    SheetNoteHide: 'SheetNoteHide';

    /**
     * Event fired before a note is added
     * @see {@link ISheetNoteAddEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteAdd, (params) => {
     *   const { workbook, worksheet, row, col, note } = params;
     *   console.log(params);
     *
     *   // Cancel the note addition operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    BeforeSheetNoteAdd: 'BeforeSheetNoteAdd';
    /**
     * Event fired before a note is deleted
     * @see {@link ISheetNoteDeleteEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteDelete, (params) => {
     *   const { workbook, worksheet, row, col, oldNote } = params;
     *   console.log(params);
     *
     *   // Cancel the note deletion operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    BeforeSheetNoteDelete: 'BeforeSheetNoteDelete';
    /**
     * Event fired before a note is updated
     * @see {@link ISheetNoteUpdateEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteUpdate, (params) => {
     *   const { workbook, worksheet, row, col, note, oldNote } = params;
     *   console.log(params);
     *
     *   // Cancel the note update operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    BeforeSheetNoteUpdate: 'BeforeSheetNoteUpdate';
    /**
     * Event fired before a note is shown
     * @see {@link ISheetNoteShowEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteShow, (params) => {
     *   const { workbook, worksheet, row, col } = params;
     *   console.log(params);
     *
     *   // Cancel the note show operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    BeforeSheetNoteShow: 'BeforeSheetNoteShow';
    /**
     * Event fired before a note is hidden
     * @see {@link ISheetNoteHideEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteHide, (params) => {
     *   const { workbook, worksheet, row, col } = params;
     *   console.log(params);
     *
     *   // Cancel the note hide operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    BeforeSheetNoteHide: 'BeforeSheetNoteHide';
}

/**
 * @ignore
 */
export class FSheetNoteEvent implements ISheetNoteEvent {
    get SheetNoteAdd(): 'SheetNoteAdd' {
        return 'SheetNoteAdd';
    }

    get SheetNoteDelete(): 'SheetNoteDelete' {
        return 'SheetNoteDelete';
    }

    get SheetNoteUpdate(): 'SheetNoteUpdate' {
        return 'SheetNoteUpdate';
    }

    get SheetNoteShow(): 'SheetNoteShow' {
        return 'SheetNoteShow';
    }

    get SheetNoteHide(): 'SheetNoteHide' {
        return 'SheetNoteHide';
    }

    get BeforeSheetNoteAdd(): 'BeforeSheetNoteAdd' {
        return 'BeforeSheetNoteAdd';
    }

    get BeforeSheetNoteDelete(): 'BeforeSheetNoteDelete' {
        return 'BeforeSheetNoteDelete';
    }

    get BeforeSheetNoteUpdate(): 'BeforeSheetNoteUpdate' {
        return 'BeforeSheetNoteUpdate';
    }

    get BeforeSheetNoteShow(): 'BeforeSheetNoteShow' {
        return 'BeforeSheetNoteShow';
    }

    get BeforeSheetNoteHide(): 'BeforeSheetNoteHide' {
        return 'BeforeSheetNoteHide';
    }
}

/**
 * @ignore
 */
export interface ISheetNoteEventConfig {
    SheetNoteAdd: ISheetNoteAddEventParams;
    SheetNoteDelete: ISheetNoteDeleteEventParams;
    SheetNoteUpdate: ISheetNoteUpdateEventParams;
    SheetNoteShow: ISheetNoteShowEventParams;
    SheetNoteHide: ISheetNoteHideEventParams;

    BeforeSheetNoteAdd: ISheetNoteAddEventParams;
    BeforeSheetNoteDelete: ISheetNoteDeleteEventParams;
    BeforeSheetNoteUpdate: ISheetNoteUpdateEventParams;
    BeforeSheetNoteShow: ISheetNoteShowEventParams;
    BeforeSheetNoteHide: ISheetNoteHideEventParams;
}

FEventName.extend(FSheetNoteEvent);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends ISheetNoteEvent {}
    interface IEventParamConfig extends ISheetNoteEventConfig {}
}
