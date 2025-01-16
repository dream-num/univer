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

import type { IEventBase, IRange, RichTextValue } from '@univerjs/core';
import type { DeviceInputEventType, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { CommandListenerSkeletonChange } from '@univerjs/sheets';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { KeyCode } from '@univerjs/ui';
import { FEventName } from '@univerjs/core';

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

export interface IFSheetsUIEventNameMixin {
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

    /**
     * Event fired when a cell is clicked
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.CellClicked, (params)=> {
     *      const { worksheet, workbook, row, column, value, isZenEditor } = params;
     * });
     * ```
     */
    readonly CellClicked: 'CellClicked';
    /**
     * Event fired when a cell is pointer down
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.CellPointerDown, (params)=> {
     *      const { worksheet, workbook, row, column } = params;
     * });
     * ```
     */
    readonly CellPointerDown: 'CellPointerDown';

    /**
     * Event fired when a cell is pointer up
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.CellPointerUp, (params)=> {
     *      const { worksheet, workbook, row, column } = params;
     * });
     * ```
     */
    readonly CellPointerUp: 'CellPointerUp';

    /**
     * Event fired when a cell is hovered
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.CellHover, (params)=> {
     *      const { worksheet, workbook, row, column } = params;
     * });
     * ```
     */
    readonly CellHover: 'CellHover';
    /**
     * Event fired when move on spreadsheet cells
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.CellPointerMove, (params)=> {
     *      const { worksheet, workbook, row, column } = params;
     * });
     * ```
     */
    readonly CellPointerMove: 'CellPointerMove';

    /**
     * Triggered when a row header is clicked
     * @param {ISheetRowHeaderEvent} params - Event parameters containing unitId, subUnitId, and row index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.RowHeaderClick, (params) => {
     *   console.log(`Row ${params.row} header clicked in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly RowHeaderClick: 'RowHeaderClick';

    /**
     * Triggered when pointer is pressed down on a row header
     * @param {ISheetRowHeaderEvent} params - Event parameters containing unitId, subUnitId, and row index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.RowHeaderPointerDown, (params) => {
     *   console.log(`Pointer down on row ${params.row} header in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly RowHeaderPointerDown: 'RowHeaderPointerDown';

    /**
     * Triggered when pointer is released on a row header
     * @param {ISheetRowHeaderEvent} params - Event parameters containing unitId, subUnitId, and row index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.RowHeaderPointerUp, (params) => {
     *   console.log(`Pointer up on row ${params.row} header in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly RowHeaderPointerUp: 'RowHeaderPointerUp';

    /**
     * Triggered when pointer hovers over a row header
     * @param {ISheetRowHeaderEvent} params - Event parameters containing unitId, subUnitId, and row index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.RowHeaderHover, (params) => {
     *   console.log(`Hovering over row ${params.row} header in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly RowHeaderHover: 'RowHeaderHover';

    /**
     * Triggered when a column header is clicked
     * @param {ISheetColumnHeaderEvent} params - Event parameters containing unitId, subUnitId, and column index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.ColumnHeaderClick, (params) => {
     *   console.log(`Column ${params.column} header clicked in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly ColumnHeaderClick: 'ColumnHeaderClick';

    /**
     * Triggered when pointer is pressed down on a column header
     * @param {ISheetColumnHeaderEvent} params - Event parameters containing unitId, subUnitId, and column index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.ColumnHeaderPointerDown, (params) => {
     *   console.log(`Pointer down on column ${params.column} header in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly ColumnHeaderPointerDown: 'ColumnHeaderPointerDown';

    /**
     * Triggered when pointer is released on a column header
     * @param {ISheetColumnHeaderEvent} params - Event parameters containing unitId, subUnitId, and column index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.ColumnHeaderPointerUp, (params) => {
     *   console.log(`Pointer up on column ${params.column} header in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly ColumnHeaderPointerUp: 'ColumnHeaderPointerUp';

    /**
     * Triggered when pointer hovers over a column header
     * @param {ISheetColumnHeaderEvent} params - Event parameters containing unitId, subUnitId, and column index
     * @example
     * ```typescript
     * univerAPI.onSheetEvent(Event.ColumnHeaderHover, (params) => {
     *   console.log(`Hovering over column ${params.column} header in sheet ${params.worksheet.getSheetId()}`);
     * });
     * ```
     */
    readonly ColumnHeaderHover: 'ColumnHeaderHover';

    /**
     * Event fired when drag over spreadsheet cells
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.DragOver, (params)=> {
     *      const { worksheet, workbook, row, column } = params;
     * });
     * ```
     */
    readonly DragOver: 'DragOver';

    /**
     * Event fired when drop on spreadsheet cells
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().addEvent(univerAPI.Event.Drop, (params)=> {
     *      const { worksheet, workbook, row, column } = params;
     * });
     * ```
     */
    readonly Drop: 'Drop';

    /**
     * Event fired when scroll spreadsheet.
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.Scroll, (params)=> {
     *      const { worksheet, workbook, scrollX, scrollY } = params;
     * });
     * ```
     */
    readonly Scroll: 'Scroll';

    /**
     * Event fired when selection changed.
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SelectionChanged, (p)=> {
     *      const { worksheet, workbook, selections } = p;
     * });
     * ```
     */
    readonly SelectionChanged: 'SelectionChanged';

    /**
     * Event fired when selection move start
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SelectionMoveStart, (p)=> {
     *      const { worksheet, workbook, selections } = p;
     * });
     * ```
     */
    readonly SelectionMoveStart: 'SelectionMoveStart';

    /**
     * Event fired when selection move end
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SelectionMoving, (p)=> {
     *      const { worksheet, workbook, selections } = p;
     * });
     * ```
     */
    readonly SelectionMoving: 'SelectionMoving';

    /**
     * Event fired when selection move end
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p)=> {
     *      const { worksheet, workbook, selections } = p;
     * });
     * ```
     */
    readonly SelectionMoveEnd: 'SelectionMoveEnd';

    /**
     * Event fired when zoom changed
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetZoomChanged, (p)=> {
     *      const { worksheet, workbook, zoom } = p;
     * });
     * ```
     */
    readonly SheetZoomChanged: 'SheetZoomChanged';

    /**
     * Event fired before zoom changed
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetZoomChange, (p)=> {
     *      const { worksheet, workbook, zoom } = p;
     * });
     * ```
     */
    readonly BeforeSheetZoomChange: 'BeforeSheetZoomChange';

    /**
     * Event fired when sheet skeleton changed
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetSkeletonChanged, (p)=> {
     *      const { worksheet, workbook } = p;
     * });
     * ```
     */
    readonly SheetSkeletonChanged: 'SheetSkeletonChanged';

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

    override get CellClicked(): 'CellClicked' {
        return CellFEventName.CellClicked;
    }

    override get CellHover(): 'CellHover' {
        return CellFEventName.CellHover;
    }

    override get CellPointerDown(): 'CellPointerDown' {
        return CellFEventName.CellPointerDown;
    }

    override get CellPointerUp(): 'CellPointerUp' {
        return CellFEventName.CellPointerUp;
    }

    override get CellPointerMove(): 'CellPointerMove' {
        return CellFEventName.CellPointerMove;
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
}

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
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsUIEventNameMixin { }
    interface IEventParamConfig extends IFSheetsUIEventParamConfig { }
}
