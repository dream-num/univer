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

import type { DeviceInputEventType } from '@univerjs/engine-render';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { KeyCode } from '@univerjs/ui';
import { FEventName, type IEventBase, type RichTextValue } from '@univerjs/core';

export interface ISheetEditStartedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
}

export interface ISheetEditEndedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
    isConfirm: boolean;
}

export interface ISheetEditChangingEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    value: RichTextValue;
    isZenEditor: boolean;
}

export interface IBeforeSheetEditStartEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
}

export interface IBeforeSheetEditEndEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    value: RichTextValue;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
    isConfirm: boolean;
}

interface IFSheetsUIEventNameMixin {
    /**
     * Trigger this event before the clipboard content changes.
     * Type of the event parameter is {@link IBeforeClipboardChangeParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeClipboardChange, (param) => {
     *   const {text, html} = param;
     *   console.log('debugger', text, html); // {text: '...', html: '...'}
     *   // if want to cancel the clipboard change
     *   param.cancel = true;
     * })
     * ```
     */
    readonly BeforeClipboardChange: 'BeforeClipboardChange';

    /**
     * Trigger this event after the clipboard content changes.
     * Type of the event parameter is {@link IClipboardChangedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.ClipboardChanged, (param) => {
     *  const {text, html} = param;
     *  console.log('debugger', text, html); // {text: '...', html: '...'}
     * })
     * ```
     */
    readonly ClipboardChanged: 'ClipboardChanged';
    /**
     * Trigger this event before pasting.
     * Type of the event parameter is {@link IBeforeClipboardPasteParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeClipboardPaste, (param) => {
     *  const {text, html} = param;
     *  console.log('debugger', text, html);
     *  // if want to cancel the clipboard paste
     *  param.cancel = true;
     * })
     * ```
     */
    readonly BeforeClipboardPaste: 'BeforeClipboardPaste';
    /**
     * Trigger this event after pasting.
     * Type of the event parameter is {@link IClipboardPastedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.ClipboardPasted, (param) => {
     *  const {text, html} = param;
     *  console.log('debugger', text, html); // {text: '...', html: '...'}
     * })
     * ```
     */
    readonly ClipboardPasted: 'ClipboardPasted';

    /**
     * Event fired before a cell is edited
     * @see {@link IBeforeSheetEditStartEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetEditStart, (params) => {
     *      const { worksheet, workbook, row, column, eventType, keycode, isZenEditor } = params;
     * });
     * ```
     */
    readonly BeforeSheetEditStart: 'BeforeSheetEditStart';
    /**
     * Event fired after a cell is edited
     * @see {@link ISheetEditEndedEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetEditStarted, (params) => {
     *      const { worksheet, workbook, row, column, eventType, keycode, isZenEditor } = params;
     * });
     * ```
     */
    readonly SheetEditStarted: 'SheetEditStarted';
    /**
     * Event fired when a cell is being edited
     * @see {@link ISheetEditChangingEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetEditChanging, (params) => {
     *      const { worksheet, workbook, row, column, value, isZenEditor } = params;
     * });
     * ```
     */
    readonly SheetEditChanging: 'SheetEditChanging';
    /**
     * Event fired before a cell edit ends
     * @see {@link IBeforeSheetEditEndEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetEditEnd, (params) => {
     *      const { worksheet, workbook, row, column, value, eventType, keycode, isZenEditor } = params;
     * });
     * ```
     */
    readonly BeforeSheetEditEnd: 'BeforeSheetEditEnd';
    /**
     * Event fired after a cell edit ends
     * @see {@link ISheetEditEndedEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetEditEnded, (params) => {
     *      const { worksheet, workbook, row, column, eventType, keycode, isZenEditor } = params;
     * });
     * ```
     */
    readonly SheetEditEnded: 'SheetEditEnded';
}

export class FSheetsUIEventName extends FEventName implements IFSheetsUIEventNameMixin {
    override get BeforeClipboardChange(): 'BeforeClipboardChange' {
        return 'BeforeClipboardChange' as const;
    }

    override get ClipboardChanged(): 'ClipboardChanged' {
        return 'ClipboardChanged' as const;
    }

    override get BeforeClipboardPaste(): 'BeforeClipboardPaste' {
        return 'BeforeClipboardPaste' as const;
    }

    override get ClipboardPasted(): 'ClipboardPasted' {
        return 'ClipboardPasted' as const;
    }

    override get BeforeSheetEditStart(): 'BeforeSheetEditStart' {
        return 'BeforeSheetEditStart';
    }

    override get SheetEditStarted(): 'SheetEditStarted' {
        return 'SheetEditStarted';
    }

    override get SheetEditChanging(): 'SheetEditChanging' {
        return 'SheetEditChanging';
    }

    override get BeforeSheetEditEnd(): 'BeforeSheetEditEnd' {
        return 'BeforeSheetEditEnd';
    }

    override get SheetEditEnded(): 'SheetEditEnded' {
        return 'SheetEditEnded';
    }
}

export interface IBeforeClipboardChangeParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance currently being operated on. {@link FWorksheet}
     */
    worksheet: FWorksheet;
    /**
     * Clipboard Text String
     */
    text: string;
    /**
     * Clipboard HTML String
     */
    html: string;
    /**
     * The sheet containing the content that was (copied/cut)
     */
    fromSheet: FWorksheet;
    /**
     * The range containing the content that was (copied/cut)
     */
    fromRange: FRange;
}

export type IClipboardChangedParam = IBeforeClipboardChangeParam;

export interface IBeforeClipboardPasteParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance currently being operated on. {@link FWorkbook}
     */
    worksheet: FWorksheet;
    /**
     * Clipboard Text String
     */
    text?: string;
    /**
     * Clipboard HTML String
     */
    html?: string;
}

export type IClipboardPastedParam = IBeforeClipboardPasteParam;

interface IFSheetsUIEventParamConfig {
    BeforeClipboardChange: IBeforeClipboardChangeParam;
    ClipboardChanged: IClipboardChangedParam;
    BeforeClipboardPaste: IBeforeClipboardPasteParam;
    ClipboardPasted: IClipboardPastedParam;

    BeforeSheetEditStart: IBeforeSheetEditStartEventParams;
    SheetEditStarted: ISheetEditStartedEventParams;
    SheetEditChanging: ISheetEditChangingEventParams;
    BeforeSheetEditEnd: IBeforeSheetEditEndEventParams;
    SheetEditEnded: ISheetEditEndedEventParams;
}

FEventName.extend(FSheetsUIEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsUIEventNameMixin { }
    interface IEventParamConfig extends IFSheetsUIEventParamConfig { }
}

