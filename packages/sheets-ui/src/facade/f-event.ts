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
import type { IDragCellPosition } from '@univerjs/sheets-ui';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { KeyCode } from '@univerjs/ui';
import { FEventName } from '@univerjs/core/facade';

/**
 * Event interface triggered before clipboard content changes
 */
export interface IBeforeClipboardChangeEventParams extends IEventBase {
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

/**
 * Event interface triggered after clipboard content changes
 */
export interface IClipboardChangedEventParams extends IBeforeClipboardChangeEventParams { };

/**
 * Event interface triggered before pasting content from clipboard
 */
export interface IBeforeClipboardPasteEventParams extends IEventBase {
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

/**
 * Event interface triggered after pasting content from clipboard
 */
export interface IClipboardPastedEventParams extends IBeforeClipboardPasteEventParams { };

/**
 * Event interface triggered before cell editing starts
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
    eventType?: DeviceInputEventType;
    /** Optional keycode triggering the edit */
    keycode?: KeyCode;
}

/**
 * Event interface triggered when cell editing starts
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
    eventType?: DeviceInputEventType;
    /** Optional keycode that triggered the edit */
    keycode?: KeyCode;
}

/**
 * Event interface triggered while cell content is being changed
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
}

/**
 * Event interface triggered before cell editing ends
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
    eventType?: DeviceInputEventType;
    /** Optional keycode triggering the edit end */
    keycode?: KeyCode;
    /** Whether the edit will be confirmed or cancelled */
    isConfirm: boolean;
}

/**
 * Event interface triggered when cell editing ends
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
    eventType?: DeviceInputEventType;
    /** Optional keycode that triggered the edit end */
    keycode?: KeyCode;
    /** Whether the edit was confirmed or cancelled */
    isConfirm: boolean;
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

/**
 * Event interface for cell-related events such as click, pointer down/up, hover, etc.
 */
export interface ICellEventParams extends ISheetUIEventBase {
    row: number;
    column: number;
}

/**
 * Event interface for drag-related events such as drag over and drop on spreadsheet cells
 */
export interface IDragEventParams extends IDragCellPosition, ICellEventParams {
}

/**
 * Event interface for row header related events such as click, pointer down/up, hover, etc.
 */
export interface ISheetRowHeaderEventParams extends ISheetUIEventBase {
    row: number;
}

/**
 * Event interface for column header related events such as click, pointer down/up, hover, etc.
 */
export interface ISheetColumnHeaderEventParams extends ISheetUIEventBase {
    column: number;
}

/**
 * Event interface for scroll event on spreadsheet
 */
export interface IScrollEventParams extends ISheetUIEventBase {
    scrollX: number;
    scrollY: number;
}

/**
 * Event interface for selection change and selection move events on spreadsheet
 */
export interface ISelectionEventParams extends ISheetUIEventBase {
    selections: IRange[];
}

/**
 * Event interface for sheet zoom change event
 */
export interface ISheetZoomEventParams extends IEventBase {
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

/**
 * Event interface for sheet skeleton change event
 */
export interface ISheetSkeletonChangedEventParams extends ISheetUIEventBase {
    skeleton: SpreadsheetSkeleton;
    payload: CommandListenerSkeletonChange;
    effectedRanges: FRange[];
}

/**
 * @ignore
 */
export interface IFSheetsUIEventNameMixin {
    /**
     * Trigger this event before the clipboard content changes.
     * Type of the event parameter is {@link IBeforeClipboardChangeEventParams}
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
     * Type of the event parameter is {@link IClipboardChangedEventParams}
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
     * Type of the event parameter is {@link IBeforeClipboardPasteEventParams}
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
     * Type of the event parameter is {@link IClipboardPastedEventParams}
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
     *   const { worksheet, workbook, row, column, eventType, keycode } = params;
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
     *   const { worksheet, workbook, row, column, eventType, keycode } = params;
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
     *   const { worksheet, workbook, row, column, value } = params;
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
     *   const { worksheet, workbook, row, column, value, eventType, keycode, isConfirm } = params;
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
     *   const { worksheet, workbook, row, column, eventType, keycode, isConfirm } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetEditEnded: 'SheetEditEnded';

    /**
     * Event fired when a cell is clicked
     * @see {@link ICellEventParams}
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
     * @see {@link ICellEventParams}
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
     * @see {@link ICellEventParams}
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
     * @see {@link ICellEventParams}
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
     * @see {@link ICellEventParams}
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
     * @see {@link ISheetRowHeaderEventParams}
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
     * @see {@link ISheetRowHeaderEventParams}
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
     * @see {@link ISheetRowHeaderEventParams}
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
     * @see {@link ISheetRowHeaderEventParams}
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
     * @see {@link ISheetColumnHeaderEventParams}
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
     * @see {@link ISheetColumnHeaderEventParams}
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
     * @see {@link ISheetColumnHeaderEventParams}
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
     * @see {@link ISheetColumnHeaderEventParams}
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
     * @see {@link IDragEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.DragOver, (params) => {
     *   const { row, column, dataTransfer } = params;
     *   console.log(params, dataTransfer.files.length);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly DragOver: 'DragOver';

    /**
     * Event fired when the drag element is dropped on the spreadsheet cells
     * @see {@link IDragEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.Drop, (params) => {
     *   const { row, column, dataTransfer } = params;
     *   console.log(params, dataTransfer.files.length);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly Drop: 'Drop';

    /**
     * Event fired when scroll spreadsheet.
     * @see {@link IScrollEventParams}
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
     * @see {@link ISelectionEventParams}
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
     * @see {@link ISelectionEventParams}
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
     * @see {@link ISelectionEventParams}
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
     * @see {@link ISelectionEventParams}
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
     * @see {@link ISheetZoomEventParams}
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
     * @see {@link ISheetZoomEventParams}
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
     * @see {@link ISheetSkeletonChangedEventParams}
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

export class FSheetsUIEventNameMixin extends FEventName implements IFSheetsUIEventNameMixin {
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
        return 'BeforeSheetEditStart' as const;
    }

    override get SheetEditStarted(): 'SheetEditStarted' {
        return 'SheetEditStarted' as const;
    }

    override get SheetEditChanging(): 'SheetEditChanging' {
        return 'SheetEditChanging' as const;
    }

    override get BeforeSheetEditEnd(): 'BeforeSheetEditEnd' {
        return 'BeforeSheetEditEnd' as const;
    }

    override get SheetEditEnded(): 'SheetEditEnded' {
        return 'SheetEditEnded' as const;
    }

    override get CellClicked(): 'CellClicked' {
        return 'CellClicked' as const;
    }

    override get CellHover(): 'CellHover' {
        return 'CellHover' as const;
    }

    override get CellPointerDown(): 'CellPointerDown' {
        return 'CellPointerDown' as const;
    }

    override get CellPointerUp(): 'CellPointerUp' {
        return 'CellPointerUp' as const;
    }

    override get CellPointerMove(): 'CellPointerMove' {
        return 'CellPointerMove' as const;
    }

    override get DragOver(): 'DragOver' {
        return 'DragOver' as const;
    }

    override get Drop(): 'Drop' {
        return 'Drop' as const;
    }

    override get Scroll(): 'Scroll' {
        return 'Scroll' as const;
    }

    override get SelectionMoveStart(): 'SelectionMoveStart' {
        return 'SelectionMoveStart' as const;
    }

    override get SelectionChanged(): 'SelectionChanged' {
        return 'SelectionChanged' as const;
    }

    override get SelectionMoving(): 'SelectionMoving' {
        return 'SelectionMoving' as const;
    }

    override get SelectionMoveEnd(): 'SelectionMoveEnd' {
        return 'SelectionMoveEnd' as const;
    }

    override get RowHeaderClick(): 'RowHeaderClick' {
        return 'RowHeaderClick' as const;
    }

    override get RowHeaderPointerDown(): 'RowHeaderPointerDown' {
        return 'RowHeaderPointerDown' as const;
    }

    override get RowHeaderPointerUp(): 'RowHeaderPointerUp' {
        return 'RowHeaderPointerUp' as const;
    }

    override get RowHeaderHover(): 'RowHeaderHover' {
        return 'RowHeaderHover' as const;
    }

    override get ColumnHeaderClick(): 'ColumnHeaderClick' {
        return 'ColumnHeaderClick' as const;
    }

    override get ColumnHeaderPointerDown(): 'ColumnHeaderPointerDown' {
        return 'ColumnHeaderPointerDown' as const;
    }

    override get ColumnHeaderPointerUp(): 'ColumnHeaderPointerUp' {
        return 'ColumnHeaderPointerUp' as const;
    }

    override get ColumnHeaderHover(): 'ColumnHeaderHover' {
        return 'ColumnHeaderHover' as const;
    }

    override get SheetSkeletonChanged(): 'SheetSkeletonChanged' {
        return 'SheetSkeletonChanged' as const;
    }

    override get BeforeSheetZoomChange(): 'BeforeSheetZoomChange' {
        return 'BeforeSheetZoomChange' as const;
    }

    override get SheetZoomChanged(): 'SheetZoomChanged' {
        return 'SheetZoomChanged' as const;
    }
}

/**
 * @ignore
 */
export interface ISheetsUIEventParamConfig {
    BeforeClipboardChange: IBeforeClipboardChangeEventParams;
    ClipboardChanged: IClipboardChangedEventParams;
    BeforeClipboardPaste: IBeforeClipboardPasteEventParams;
    ClipboardPasted: IClipboardPastedEventParams;
    BeforeSheetEditStart: IBeforeSheetEditStartEventParams;
    SheetEditStarted: ISheetEditStartedEventParams;
    SheetEditChanging: ISheetEditChangingEventParams;
    BeforeSheetEditEnd: IBeforeSheetEditEndEventParams;
    SheetEditEnded: ISheetEditEndedEventParams;
    CellClicked: ICellEventParams;
    CellHover: ICellEventParams;
    CellPointerDown: ICellEventParams;
    CellPointerUp: ICellEventParams;
    CellPointerMove: ICellEventParams;
    Drop: IDragEventParams;
    DragOver: IDragEventParams;
    RowHeaderClick: ISheetRowHeaderEventParams;
    // RowHeaderDbClick: ISheetRowHeaderEventParams;
    RowHeaderHover: ISheetRowHeaderEventParams;
    RowHeaderPointerDown: ISheetRowHeaderEventParams;
    RowHeaderPointerUp: ISheetRowHeaderEventParams;
    ColumnHeaderClick: ISheetColumnHeaderEventParams;
    // ColumnHeaderDbClick: ISheetColumnHeaderEventParams;
    ColumnHeaderHover: ISheetColumnHeaderEventParams;
    ColumnHeaderPointerDown: ISheetColumnHeaderEventParams;
    ColumnHeaderPointerUp: ISheetColumnHeaderEventParams;
    Scroll: IScrollEventParams;
    // SelectionChanging: ISelectionEventParams;
    SelectionMoveStart: ISelectionEventParams;
    SelectionMoving: ISelectionEventParams;
    SelectionMoveEnd: ISelectionEventParams;
    SelectionChanged: ISelectionEventParams;
    SheetZoomChanged: ISheetZoomEventParams;
    BeforeSheetZoomChange: ISheetZoomEventParams;

    SheetSkeletonChanged: ISheetSkeletonChangedEventParams;
}

FEventName.extend(FSheetsUIEventNameMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsUIEventNameMixin { }
    interface IEventParamConfig extends ISheetsUIEventParamConfig { }
}
