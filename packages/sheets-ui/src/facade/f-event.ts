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

import type { IRange, RichTextValue } from '@univerjs/core';
import type { IEventBase } from '@univerjs/core/facade';
import type { DeviceInputEventType, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { CommandListenerSkeletonChange } from '@univerjs/sheets';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { KeyCode } from '@univerjs/ui';
import { FEventName } from '@univerjs/core/facade';

/**
 * Event interface triggered when cell editing starts
 * @interface ISheetEditStartedEventParams
 * @augments {IEventBase}
 */
export interface ISheetEditStartedEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet being edited */
    worksheet: FWorksheet;
    /** Row index of the editing cell */
    row: number;
    /** Column index of the editing cell */
    column: number;
    /** Type of input device event that triggered the edit */
    eventType: DeviceInputEventType;
    /** Optional keycode that triggered the edit */
    keycode?: KeyCode;
    /** Whether the edit is happening in zen editor mode */
    isZenEditor: boolean;
}

/**
 * Event interface triggered when cell editing ends
 * @interface ISheetEditEndedEventParams
 * @augments {IEventBase}
 */
export interface ISheetEditEndedEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet being edited */
    worksheet: FWorksheet;
    /** Row index of the edited cell */
    row: number;
    /** Column index of the edited cell */
    column: number;
    /** Type of input device event that triggered the edit end */
    eventType: DeviceInputEventType;
    /** Optional keycode that triggered the edit end */
    keycode?: KeyCode;
    /** Whether the edit happened in zen editor mode */
    isZenEditor: boolean;
    /** Whether the edit was confirmed or cancelled */
    isConfirm: boolean;
}

/**
 * Event interface triggered while cell content is being changed
 * @interface ISheetEditChangingEventParams
 * @augments {IEventBase}
 */
export interface ISheetEditChangingEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet being edited */
    worksheet: FWorksheet;
    /** Row index of the editing cell */
    row: number;
    /** Column index of the editing cell */
    column: number;
    /** Current value being edited */
    value: RichTextValue;
    /** Whether the edit is happening in zen editor mode */
    isZenEditor: boolean;
}

/**
 * Event interface triggered before cell editing starts
 * @interface IBeforeSheetEditStartEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetEditStartEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet to be edited */
    worksheet: FWorksheet;
    /** Row index of the cell to be edited */
    row: number;
    /** Column index of the cell to be edited */
    column: number;
    /** Type of input device event triggering the edit */
    eventType: DeviceInputEventType;
    /** Optional keycode triggering the edit */
    keycode?: KeyCode;
    /** Whether the edit will happen in zen editor mode */
    isZenEditor: boolean;
}

/**
 * Event interface triggered before cell editing ends
 * @interface IBeforeSheetEditEndEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetEditEndEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet being edited */
    worksheet: FWorksheet;
    /** Row index of the editing cell */
    row: number;
    /** Column index of the editing cell */
    column: number;
    /** Current value being edited */
    value: RichTextValue;
    /** Type of input device event triggering the edit end */
    eventType: DeviceInputEventType;
    /** Optional keycode triggering the edit end */
    keycode?: KeyCode;
    /** Whether the edit is happening in zen editor mode */
    isZenEditor: boolean;
    /** Whether the edit will be confirmed or cancelled */
    isConfirm: boolean;
}

export const CellFEventName = {
    CellClicked: 'CellClicked',
    CellPointerDown: 'CellPointerDown',
    CellPointerUp: 'CellPointerUp',
    CellPointerMove: 'CellPointerMove',
    CellHover: 'CellHover',
    DragOver: 'DragOver',
    Drop: 'Drop',
    Scroll: 'Scroll',
    SelectionMoveStart: 'SelectionMoveStart',
    SelectionMoving: 'SelectionMoving',
    SelectionMoveEnd: 'SelectionMoveEnd',
    SelectionChanged: 'SelectionChanged',
} as const;

/**
 * @ignore
 */
export interface IFSheetsUIEventNameMixin {
    /**
     * Trigger this event before the clipboard content changes.
     * Type of the event parameter is {@link IBeforeClipboardChangeParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeClipboardChange, (params) => {
     *   const { workbook, worksheet, text, html, fromSheet, fromRange } = params;
     *   console.log(params);
     *
     *   // Cancel the clipboard change operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeClipboardChange: 'BeforeClipboardChange';

    /**
     * Trigger this event after the clipboard content changes.
     * Type of the event parameter is {@link IClipboardChangedParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.ClipboardChanged, (params) => {
     *   const { workbook, worksheet, text, html, fromSheet, fromRange } = params;
     *   console.log(params);
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly ClipboardChanged: 'ClipboardChanged';

    /**
     * Trigger this event before pasting.
     * Type of the event parameter is {@link IBeforeClipboardPasteParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeClipboardPaste, (params) => {
     *   const { workbook, worksheet, text, html } = params;
     *   console.log(params);
     *
     *   // Cancel the clipboard paste operation
     *   params.cancel = true;
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeClipboardPaste: 'BeforeClipboardPaste';

    /**
     * Trigger this event after pasting.
     * Type of the event parameter is {@link IClipboardPastedParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.ClipboardPasted, (params) => {
     *   const { workbook, worksheet, text, html } = params;
     *   console.log(params);
     * })
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly ClipboardPasted: 'ClipboardPasted';

    /**
     * Event fired before a cell is edited
     * @see {@link IBeforeSheetEditStartEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetEditStart, (params) => {
     *   const { worksheet, workbook, row, column, eventType, keycode, isZenEditor } = params;
     *   console.log(params);
     *
     *   // Cancel the cell edit start operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetEditStart: 'BeforeSheetEditStart';

    /**
     * Event fired after a cell is edited
     * @see {@link ISheetEditStartedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetEditStarted, (params) => {
     *   const { worksheet, workbook, row, column, eventType, keycode, isZenEditor } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetEditStarted: 'SheetEditStarted';

    /**
     * Event fired when a cell is being edited
     * @see {@link ISheetEditChangingEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetEditChanging, (params) => {
     *   const { worksheet, workbook, row, column, value, isZenEditor } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetEditChanging: 'SheetEditChanging';

    /**
     * Event fired before a cell edit ends
     * @see {@link IBeforeSheetEditEndEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetEditEnd, (params) => {
     *   const { worksheet, workbook, row, column, value, eventType, keycode, isZenEditor, isConfirm } = params;
     *   console.log(params);
     *
     *   // Cancel the cell edit end operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetEditEnd: 'BeforeSheetEditEnd';

    /**
     * Event fired after a cell edit ends
     * @see {@link ISheetEditEndedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetEditEnded, (params) => {
     *   const { worksheet, workbook, row, column, eventType, keycode, isZenEditor, isConfirm } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetEditEnded: 'SheetEditEnded';

    /**
     * Event fired when a cell is clicked
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.CellClicked, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly CellClicked: 'CellClicked';

    /**
     * Event fired when a cell is pointer down
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.CellPointerDown, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly CellPointerDown: 'CellPointerDown';

    /**
     * Event fired when a cell is pointer up
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.CellPointerUp, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly CellPointerUp: 'CellPointerUp';

    /**
     * Event fired when a cell is hovered
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.CellHover, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly CellHover: 'CellHover';

    /**
     * Event fired when move on spreadsheet cells
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.CellPointerMove, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly CellPointerMove: 'CellPointerMove';

    /**
     * Triggered when a row header is clicked
     * @see {@link ISheetRowHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.RowHeaderClick, (params) => {
     *   const { worksheet, workbook, row } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly RowHeaderClick: 'RowHeaderClick';

    /**
     * Triggered when pointer is pressed down on a row header
     * @see {@link ISheetRowHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.RowHeaderPointerDown, (params) => {
     *   const { worksheet, workbook, row } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly RowHeaderPointerDown: 'RowHeaderPointerDown';

    /**
     * Triggered when pointer is released on a row header
     * @see {@link ISheetRowHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.RowHeaderPointerUp, (params) => {
     *   const { worksheet, workbook, row } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly RowHeaderPointerUp: 'RowHeaderPointerUp';

    /**
     * Triggered when pointer hovers over a row header
     * @see {@link ISheetRowHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.RowHeaderHover, (params) => {
     *   const { worksheet, workbook, row } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly RowHeaderHover: 'RowHeaderHover';

    /**
     * Triggered when a column header is clicked
     * @see {@link ISheetColumnHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.ColumnHeaderClick, (params) => {
     *   const { worksheet, workbook, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly ColumnHeaderClick: 'ColumnHeaderClick';

    /**
     * Triggered when pointer is pressed down on a column header
     * @see {@link ISheetColumnHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.ColumnHeaderPointerDown, (params) => {
     *   const { worksheet, workbook, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly ColumnHeaderPointerDown: 'ColumnHeaderPointerDown';

    /**
     * Triggered when pointer is released on a column header
     * @see {@link ISheetColumnHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.ColumnHeaderPointerUp, (params) => {
     *   const { worksheet, workbook, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly ColumnHeaderPointerUp: 'ColumnHeaderPointerUp';

    /**
     * Triggered when pointer hovers over a column header
     * @see {@link ISheetColumnHeaderEvent}
     * @example
     * ```typescript
     * const disposable = univerAPI.addEvent(univerAPI.Event.ColumnHeaderHover, (params) => {
     *   const { worksheet, workbook, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly ColumnHeaderHover: 'ColumnHeaderHover';

    /**
     * Event fired when the drag element passes over the spreadsheet cells
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.DragOver, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly DragOver: 'DragOver';

    /**
     * Event fired when the drag element is dropped on the spreadsheet cells
     * @see {@link ICellEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.Drop, (params) => {
     *   const { worksheet, workbook, row, column } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly Drop: 'Drop';

    /**
     * Event fired when scroll spreadsheet.
     * @see {@link IScrollEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.Scroll, (params) => {
     *   const { worksheet, workbook, scrollX, scrollY } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly Scroll: 'Scroll';

    /**
     * Event fired when selection changed.
     * @see {@link ISelectionEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SelectionChanged, (params)=> {
     *   const { worksheet, workbook, selections } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SelectionChanged: 'SelectionChanged';

    /**
     * Event fired when selection move start
     * @see {@link ISelectionEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SelectionMoveStart, (params)=> {
     *   const { worksheet, workbook, selections } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SelectionMoveStart: 'SelectionMoveStart';

    /**
     * Event fired when selection move end
     * @see {@link ISelectionEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SelectionMoving, (params)=> {
     *   const { worksheet, workbook, selections } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SelectionMoving: 'SelectionMoving';

    /**
     * Event fired when selection move end
     * @see {@link ISelectionEventParam}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (params)=> {
     *   const { worksheet, workbook, selections } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SelectionMoveEnd: 'SelectionMoveEnd';

    /**
     * Event fired when zoom changed
     * @see {@link ISheetZoomEvent}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetZoomChanged, (params)=> {
     *   const { worksheet, workbook, zoom } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetZoomChanged: 'SheetZoomChanged';

    /**
     * Event fired before zoom changed
     * @see {@link ISheetZoomEvent}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetZoomChange, (params)=> {
     *   const { worksheet, workbook, zoom } = params;
     *   console.log(params);
     *
     *   // Cancel the zoom change operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetZoomChange: 'BeforeSheetZoomChange';

    /**
     * Event fired when sheet skeleton changed
     * @see {@link ISheetSkeletonChangedEvent}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetSkeletonChanged, (params)=> {
     *   const { worksheet, workbook, skeleton, payload, effectedRanges } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetSkeletonChanged: 'SheetSkeletonChanged';
}

export class FSheetsUIEventName implements IFSheetsUIEventNameMixin {
    get BeforeClipboardChange(): 'BeforeClipboardChange' {
        return 'BeforeClipboardChange' as const;
    }

    get ClipboardChanged(): 'ClipboardChanged' {
        return 'ClipboardChanged' as const;
    }

    get BeforeClipboardPaste(): 'BeforeClipboardPaste' {
        return 'BeforeClipboardPaste' as const;
    }

    get ClipboardPasted(): 'ClipboardPasted' {
        return 'ClipboardPasted' as const;
    }

    get BeforeSheetEditStart(): 'BeforeSheetEditStart' {
        return 'BeforeSheetEditStart';
    }

    get SheetEditStarted(): 'SheetEditStarted' {
        return 'SheetEditStarted';
    }

    get SheetEditChanging(): 'SheetEditChanging' {
        return 'SheetEditChanging';
    }

    get BeforeSheetEditEnd(): 'BeforeSheetEditEnd' {
        return 'BeforeSheetEditEnd';
    }

    get SheetEditEnded(): 'SheetEditEnded' {
        return 'SheetEditEnded';
    }

    get CellClicked(): 'CellClicked' {
        return CellFEventName.CellClicked;
    }

    get CellHover(): 'CellHover' {
        return CellFEventName.CellHover;
    }

    get CellPointerDown(): 'CellPointerDown' {
        return CellFEventName.CellPointerDown;
    }

    get CellPointerUp(): 'CellPointerUp' {
        return CellFEventName.CellPointerUp;
    }

    get CellPointerMove(): 'CellPointerMove' {
        return CellFEventName.CellPointerMove;
    }

    get DragOver(): 'DragOver' {
        return 'DragOver' as const;
    }

    get Drop(): 'Drop' {
        return 'Drop' as const;
    }

    get Scroll(): 'Scroll' {
        return 'Scroll' as const;
    }

    get SelectionMoveStart(): 'SelectionMoveStart' {
        return 'SelectionMoveStart' as const;
    }

    get SelectionChanged(): 'SelectionChanged' {
        return 'SelectionChanged' as const;
    }

    get SelectionMoving(): 'SelectionMoving' {
        return 'SelectionMoving' as const;
    }

    get SelectionMoveEnd(): 'SelectionMoveEnd' {
        return 'SelectionMoveEnd' as const;
    }

    get RowHeaderClick(): 'RowHeaderClick' {
        return 'RowHeaderClick' as const;
    }

    get RowHeaderPointerDown(): 'RowHeaderPointerDown' {
        return 'RowHeaderPointerDown' as const;
    }

    get RowHeaderPointerUp(): 'RowHeaderPointerUp' {
        return 'RowHeaderPointerUp' as const;
    }

    get RowHeaderHover(): 'RowHeaderHover' {
        return 'RowHeaderHover' as const;
    }

    get ColumnHeaderClick(): 'ColumnHeaderClick' {
        return 'ColumnHeaderClick' as const;
    }

    get ColumnHeaderPointerDown(): 'ColumnHeaderPointerDown' {
        return 'ColumnHeaderPointerDown' as const;
    }

    get ColumnHeaderPointerUp(): 'ColumnHeaderPointerUp' {
        return 'ColumnHeaderPointerUp' as const;
    }

    get ColumnHeaderHover(): 'ColumnHeaderHover' {
        return 'ColumnHeaderHover' as const;
    }

    get SheetSkeletonChanged(): 'SheetSkeletonChanged' {
        return 'SheetSkeletonChanged' as const;
    }

    get BeforeSheetZoomChange(): 'BeforeSheetZoomChange' {
        return 'BeforeSheetZoomChange' as const;
    }

    get SheetZoomChanged(): 'SheetZoomChanged' {
        return 'SheetZoomChanged' as const;
    }
}

/**
 * @ignore
 */
export interface ISheetUIEventBase extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance currently being operated on. {@link FWorksheet}
     */
    worksheet: FWorksheet;
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

export interface ISheetZoomEvent extends IEventBase {
    /**
     * Zoom ratio
     */
    zoom: number;
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance currently being operated on. {@link FWorkbook}
     */
    worksheet: FWorksheet;
}

export interface ICellEventParam extends ISheetUIEventBase {
    row: number;
    column: number;
}

export interface IScrollEventParam extends ISheetUIEventBase {
    scrollX: number;
    scrollY: number;
}

export interface ISelectionEventParam extends ISheetUIEventBase {
    selections: IRange[];
}

export interface ISheetRowHeaderEvent extends ISheetUIEventBase {
    row: number;
}

export interface ISheetColumnHeaderEvent extends ISheetUIEventBase {
    column: number;
}

export interface ISheetSkeletonChangedEvent extends ISheetUIEventBase {
    skeleton: SpreadsheetSkeleton;
    payload: CommandListenerSkeletonChange;
    effectedRanges: FRange[];
}

/**
 * @ignore
 */
export interface IFSheetsUIEventParamConfig {
    BeforeClipboardChange: IBeforeClipboardChangeParam;
    ClipboardChanged: IClipboardChangedParam;
    BeforeClipboardPaste: IBeforeClipboardPasteParam;
    ClipboardPasted: IClipboardPastedParam;
    BeforeSheetEditStart: IBeforeSheetEditStartEventParams;
    SheetEditStarted: ISheetEditStartedEventParams;
    SheetEditChanging: ISheetEditChangingEventParams;
    BeforeSheetEditEnd: IBeforeSheetEditEndEventParams;
    SheetEditEnded: ISheetEditEndedEventParams;
    CellClicked: ICellEventParam;
    CellHover: ICellEventParam;
    CellPointerDown: ICellEventParam;
    CellPointerUp: ICellEventParam;
    CellPointerMove: ICellEventParam;
    Drop: ICellEventParam;
    DragOver: ICellEventParam;
    RowHeaderClick: ISheetRowHeaderEvent;
    RowHeaderDbClick: ISheetRowHeaderEvent;
    RowHeaderHover: ISheetRowHeaderEvent;
    RowHeaderPointerDown: ISheetRowHeaderEvent;
    RowHeaderPointerUp: ISheetRowHeaderEvent;
    ColumnHeaderClick: ISheetColumnHeaderEvent;
    ColumnHeaderDbClick: ISheetColumnHeaderEvent;
    ColumnHeaderHover: ISheetColumnHeaderEvent;
    ColumnHeaderPointerDown: ISheetColumnHeaderEvent;
    ColumnHeaderPointerUp: ISheetColumnHeaderEvent;
    Scroll: IScrollEventParam;
    SelectionChanging: ISelectionEventParam;
    SelectionMoveStart: ISelectionEventParam;
    SelectionMoving: ISelectionEventParam;
    SelectionMoveEnd: ISelectionEventParam;
    SelectionChanged: ISelectionEventParam;
    SheetZoomChanged: ISheetZoomEvent;
    BeforeSheetZoomChange: ISheetZoomEvent;

    SheetSkeletonChanged: ISheetSkeletonChangedEvent;
}

FEventName.extend(FSheetsUIEventName);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsUIEventNameMixin { }
    interface IEventParamConfig extends IFSheetsUIEventParamConfig { }
}
