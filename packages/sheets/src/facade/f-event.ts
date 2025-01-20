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

import type { IEventBase, IWorkbookData, IWorksheetData, UniverInstanceType } from '@univerjs/core';
import type { CommandListenerValueChange } from '@univerjs/sheets';
import type { FRange } from './f-range';
import type { FWorkbook } from './f-workbook';
import type { FWorksheet } from './f-worksheet';
import { FEventName } from '@univerjs/core';

/**
 * Interface for sheet-related events
 * Provides event names for sheet creation, workbook creation, and gridline changes
 */
export interface IFSheetEventMixin {
    /**
     * Event fired after a sheet is created
     * @see {@link ISheetCreatedEventParams}
     * @example
     * ```ts
     univerAPI.addEvent(univerAPI.Event.SheetCreated, (params) => {
         const { workbook, worksheet } = params;
         console.log('sheet created', params);
     });
     * ```
     */
    get SheetCreated(): 'SheetCreated' ;
    /**
     * Event fired before a sheet is created
     * @see {@link IBeforeSheetCreateEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetCreate, (params) => {
     *      const { workbook, index, sheet } = params;
     *     console.log('before sheet create', params);
     * });
     * ```
     */
    get BeforeSheetCreate(): 'BeforeSheetCreate';
    /**
     * Event fired before the active sheet changes
     * @see {@link IActiveSheetChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.ActiveSheetChanged, (params) => {
     *      const { workbook, activeSheet, oldActiveSheet } = params;
     *     console.log('before active sheet changed', params);
     * });
     * ```
     */
    get BeforeActiveSheetChange(): 'BeforeActiveSheetChange';
    /**
     * Event fired after the active sheet changes
     * @see {@link IActiveSheetChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.ActiveSheetChanged, (params) => {
     *      const { workbook, activeSheet } = params;
     *     console.log('after active sheet changed', params);
     * });
     * ```
     */
    get ActiveSheetChanged(): 'ActiveSheetChanged';
    /**
     * Event fired before a sheet is deleted
     * @see {@link IBeforeSheetDeleteEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetDelete, (params) => {
     *      const { workbook, worksheetId } = params;
     *     console.log('before sheet delete', params);
     * });
     * ```
     */
    get SheetDeleted(): 'SheetDeleted';
    /**
     * Event fired before a sheet is deleted
     * @see {@link IBeforeSheetDeleteEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetDelete, (params) => {
     *      const { workbook, worksheet } = params;
     *     console.log('before sheet delete', params);
     * });
     * ```
     */
    get BeforeSheetDelete(): 'BeforeSheetDelete';
    /**
     * Event fired after a sheet is moved
     * @see {@link ISheetMovedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetMoved, (params) => {
     *      const { workbook, worksheet, newIndex } = params;
     *     console.log('sheet moved', params);
     * });
     * ```
     */
    get SheetMoved(): 'SheetMoved';
    /**
     * Event fired before a sheet is moved
     * @see {@link IBeforeSheetMoveEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetMove, (params) => {
     *      const { workbook, worksheet, newIndex, oldIndex } = params;
     *     console.log('before sheet move', params);
     * });
     * ```
     */
    get BeforeSheetMove(): 'BeforeSheetMove';
    /**
     * Event fired after a sheet name is changed
     * @see {@link ISheetNameChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetNameChanged, (params) => {
     *      const { workbook, worksheet, newName } = params;
     *     console.log('sheet name changed', params);
     * });
     * ```
     */
    get SheetNameChanged(): 'SheetNameChanged';
    /**
     * Event fired before a sheet name is changed
     * @see {@link IBeforeSheetNameChangeEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetNameChange, (params) => {
     *      const { workbook, worksheet, newName, oldName } = params;
     *     console.log('before sheet name changed', params);
     * });
     * ```
     */
    get BeforeSheetNameChange(): 'BeforeSheetNameChange';
    /**
     * Event fired after a sheet tab color is changed
     * @see {@link ISheetTabColorChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetTabColorChanged, (params) => {
     *      const { workbook, worksheet, color } = params;
     *     console.log('sheet tab color changed', params);
     * });
     * ```
     */
    get SheetTabColorChanged(): 'SheetTabColorChanged';
    /**
     * Event fired before a sheet tab color is changed
     * @see {@link IBeforeSheetTabColorChangeEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetTabColorChange, (params) => {
     *      const { workbook, worksheet, color, oldColor } = params;
     *     console.log('before sheet tab color changed', params);
     * });
     * ```
     */
    get BeforeSheetTabColorChange(): 'BeforeSheetTabColorChange';
    /**
     * Event fired after a sheet is hidden
     * @see {@link ISheetHideChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetHideChanged, (params) => {
     *      const { workbook, worksheet } = params;
     *     console.log('sheet hide changed', params);
     * });
     * ```
     */
    get SheetHideChanged(): 'SheetHideChanged';
    /**
     * Event fired before a sheet is hidden
     * @see {@link IBeforeSheetHideChangeEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetHideChange, (params) => {
     *      const { workbook, worksheet, hide } = params;
     *     console.log('before sheet hide changed', params);
     * });
     * ```
     */
    get BeforeSheetHideChange(): 'BeforeSheetHideChange';
    /**
     * Event fired after a workbook is created
     * @see {@link IWorkbookCreateParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.WorkbookCreated, (params) => {
     *      const { unitId, type, workbook, unit } = params;
     *     console.log('workbook created', params);
     * });
     * ```
     */
    get WorkbookCreated(): 'WorkbookCreated';
    /**
     * Event fired after a workbook is disposed
     * @see {@link IWorkbookDisposedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.WorkbookDisposed, (params) => {
     *      const { unitId, unitType, snapshot } = params;
     *     console.log('unit disposed', params);
     * });
     * ```
     */
    get WorkbookDisposed(): 'WorkbookDisposed';

    /**
     * Event fired when gridline changed
     * @see {@link IGridlineChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.GridlineChanged, (params) => {
     *      const { workbook, worksheet, enabled, color } = params;
     *     console.log('gridline changed', params);
     * });
     * ```
     */
    get GridlineChanged(): 'GridlineChanged';

    /**
     * Event fired before gridline enable changed
     * @see {@link IBeforeGridlineEnableChange}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeGridlineEnableChange, (params) => {
     *      const { workbook, worksheet, enabled } = params;
     *     console.log('gridline changed', params);
     * });
     * ```
     */
    get BeforeGridlineEnableChange(): 'BeforeGridlineEnableChange';

    /**
     * Event fired before gridline color changed
     * @see {@link IBeforeGridlineColorChanged}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeGridlineColorChange, (params) => {
     *      const { workbook, worksheet, color } = params;
     *     console.log('gridline changed', params);
     * });
     * ```
     */
    get BeforeGridlineColorChange(): 'BeforeGridlineColorChange';

    /**
     * Event fired when sheet value changed
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.SheetValueChanged, (p)=> {
     *      const { workbook, effectedRanges, payload } = p;
     * });
     * ```
     */
    readonly SheetValueChanged: 'SheetValueChanged';

}

/**
 * Interface for workbook creation parameters
 * Extends the base event interface and includes workbook initialization details
 */
export interface IWorkbookCreateParam extends IEventBase {
    /** Unique identifier for the workbook unit */
    unitId: string;
    /** Type identifier specifying this is a sheet instance */
    type: UniverInstanceType.UNIVER_SHEET;
    /** The workbook instance being created */
    workbook: FWorkbook;
    /** The workbook unit reference */
    unit: FWorkbook;
}

/**
 * Interface for workbook disposal event
 * Contains information about the disposed workbook including its snapshot data
 */
export interface IWorkbookDisposedEvent extends IEventBase {
    /** Unique identifier of the disposed workbook unit */
    unitId: string;
    /** Type identifier specifying this was a sheet instance */
    unitType: UniverInstanceType.UNIVER_SHEET;
    /** Snapshot data of the workbook at the time of disposal */
    snapshot: IWorkbookData;
}

/**
 * Interface for gridline change event
 * Triggered when gridline visibility or color changes in a worksheet
 */
export interface IGridlineChangedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet where gridline changes occurred */
    worksheet: FWorksheet;
    /** Flag indicating whether gridlines are enabled or disabled */
    enabled: boolean;
    /** The color of the gridlines, undefined if using default color */
    color: string | undefined;
}

/**
 * Interface for event before gridline enable/disable
 * Triggered before changing the gridline visibility state
 */
export interface IBeforeGridlineEnableChange extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet where gridline state will change */
    worksheet: FWorksheet;
    /** The new enabled state to be applied */
    enabled: boolean;
}

/**
 * Interface for event before gridline color change
 * Triggered before changing the gridline color
 */
export interface IBeforeGridlineColorChanged extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet where gridline color will change */
    worksheet: FWorksheet;
    /** The new color to be applied, undefined to use default color */
    color: string | undefined;
}

/**
 * Interface for event parameters triggered before creating a new worksheet
 * Extends the base event interface and includes workbook and worksheet details
 */
export interface IBeforeSheetCreateEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** Optional index where the new sheet will be inserted */
    index?: number;
    /** Optional initial worksheet data */
    sheet?: IWorksheetData;
}

/**
 * Interface for event parameters triggered after a worksheet is created
 * Extends the base event interface and includes workbook and worksheet details
 */
export interface ISheetCreatedEventParams extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The newly created worksheet */
    worksheet: FWorksheet;
}

/**
 * Interface for sheet active change event
 * Contains information about the sheet that will become active
 */
export interface IBeforeActiveSheetChangeEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet that will become active */
    activeSheet: FWorksheet;
    /** The currently active worksheet */
    oldActiveSheet: FWorksheet;
}

/**
 * Interface for sheet active changed event
 * Contains information about the newly activated sheet
 */
export interface IActiveSheetChangedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet that has become active */
    activeSheet: FWorksheet;
}

/**
 * Interface for sheet deletion event
 * Contains information about the sheet that was deleted
 */
export interface ISheetDeletedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet that was deleted */
    sheetId: string;
}

/**
 * Interface for before sheet deletion event
 * Contains information about the sheet that will be deleted
 */
export interface IBeforeSheetDeleteEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet that will be deleted */
    worksheet: FWorksheet;
}

/**
 * Interface for sheet moved event
 * Contains information about the sheet movement
 */
export interface ISheetMovedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet that was moved */
    worksheet: FWorksheet;
    /** The new position index of the sheet */
    newIndex: number;
}

/**
 * Interface for before sheet move event
 * Contains information about the planned sheet movement
 */
export interface IBeforeSheetMoveEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet that will be moved */
    worksheet: FWorksheet;
    /** The target position index for the sheet */
    newIndex: number;
    /** The current position index of the sheet */
    oldIndex: number;
}

/**
 * Interface for sheet name change event
 * Contains information about the sheet name change
 */
export interface ISheetNameChangedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet whose name was changed */
    worksheet: FWorksheet;
    /** The new name of the sheet */
    newName: string;
}

/**
 * Interface for before sheet name change event
 * Contains information about the planned sheet name change
 */
export interface IBeforeSheetNameChangeEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet whose name will be changed */
    worksheet: FWorksheet;
    /** The new name to be applied */
    newName: string;
    /** The current name of the sheet */
    oldName: string;
}

/**
 * Interface for sheet tab color change event
 * Contains information about the sheet tab color change
 */
export interface ISheetTabColorChangedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet whose tab color was changed */
    worksheet: FWorksheet;
    /** The new color of the sheet tab */
    newColor: string | undefined;
}

/**
 * Interface for before sheet tab color change event
 * Contains information about the planned sheet tab color change
 */
export interface IBeforeSheetTabColorChangeEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet whose tab color will be changed */
    worksheet: FWorksheet;
    /** The new color to be applied */
    newColor: string | undefined;
    /** The current color of the sheet tab */
    oldColor: string | undefined;
}

/**
 * Interface for sheet hide state change event
 * Contains information about the sheet visibility change
 */
export interface ISheetHideChangedEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet whose visibility was changed */
    worksheet: FWorksheet;
    /** The new visibility state */
    hidden: boolean;
}

/**
 * Interface for before sheet hide state change event
 * Contains information about the planned sheet visibility change
 */
export interface IBeforeSheetHideChangeEvent extends IEventBase {
    /** The workbook instance containing the worksheet */
    workbook: FWorkbook;
    /** The worksheet whose visibility will be changed */
    worksheet: FWorksheet;
    /** The new visibility state to be applied */
    hidden: boolean;
}

/**
 * Interface for sheet value changed event
 * Contains information about the sheet value change
 */
export interface ISheetValueChangedEvent extends IEventBase {
    /** The affected ranges of the sheet */
    effectedRanges: FRange[];
    /** The payload of the value change */
    payload: CommandListenerValueChange;
}

/**
 * Configuration interface for sheet-related events
 * Provides event names and their corresponding event parameter interfaces
 */
export interface ISheetEventParamConfig {
    /** Event fired after a worksheet is created */
    SheetCreated: ISheetCreatedEventParams;
    /** Event fired before creating a worksheet */
    BeforeSheetCreate: IBeforeSheetCreateEventParams;
    /** Event fired after a workbook is created */
    WorkbookCreated: IWorkbookCreateParam;
    /** Event fired when a workbook is disposed */
    WorkbookDisposed: IWorkbookDisposedEvent;
    /** Event fired when gridline changed */
    GridlineChanged: IGridlineChangedEvent;
    /** Event fired before gridline enable changed */
    BeforeGridlineEnableChange: IBeforeGridlineEnableChange;
    /** Event fired before gridline color changed */
    BeforeGridlineColorChange: IBeforeGridlineColorChanged;
    /** Event fired before active sheet changes */
    BeforeActiveSheetChange: IBeforeActiveSheetChangeEvent;
    /** Event fired after active sheet changed */
    ActiveSheetChanged: IActiveSheetChangedEvent;
    /** Event fired after a sheet is deleted */
    SheetDeleted: ISheetDeletedEvent;
    /** Event fired before a sheet is deleted */
    BeforeSheetDelete: IBeforeSheetDeleteEvent;
    /** Event fired after a sheet is moved */
    SheetMoved: ISheetMovedEvent;
    /** Event fired before a sheet is moved */
    BeforeSheetMove: IBeforeSheetMoveEvent;
    /** Event fired after a sheet name is changed */
    SheetNameChanged: ISheetNameChangedEvent;
    /** Event fired before a sheet name is changed */
    BeforeSheetNameChange: IBeforeSheetNameChangeEvent;
    /** Event fired after a sheet tab color is changed */
    SheetTabColorChanged: ISheetTabColorChangedEvent;
    /** Event fired before a sheet tab color is changed */
    BeforeSheetTabColorChange: IBeforeSheetTabColorChangeEvent;
    /** Event fired after a sheet visibility is changed */
    SheetHideChanged: ISheetHideChangedEvent;
    /** Event fired before a sheet visibility is changed */
    BeforeSheetHideChange: IBeforeSheetHideChangeEvent;
    /** Event fired after a sheet value is changed */
    SheetValueChanged: ISheetValueChangedEvent;
}

export class FSheetEventName extends FEventName implements IFSheetEventMixin {
    override get SheetCreated(): 'SheetCreated' {
        return 'SheetCreated' as const;
    }

    override get BeforeSheetCreate(): 'BeforeSheetCreate' {
        return 'BeforeSheetCreate' as const;
    }

    override get WorkbookCreated(): 'WorkbookCreated' {
        return 'WorkbookCreated' as const;
    }

    override get WorkbookDisposed(): 'WorkbookDisposed' {
        return 'WorkbookDisposed' as const;
    }

    override get GridlineChanged(): 'GridlineChanged' {
        return 'GridlineChanged' as const;
    }

    override get BeforeGridlineEnableChange(): 'BeforeGridlineEnableChange' {
        return 'BeforeGridlineEnableChange' as const;
    }

    override get BeforeGridlineColorChange(): 'BeforeGridlineColorChange' {
        return 'BeforeGridlineColorChange' as const;
    }

    override get BeforeActiveSheetChange(): 'BeforeActiveSheetChange' {
        return 'BeforeActiveSheetChange' as const;
    }

    override get ActiveSheetChanged(): 'ActiveSheetChanged' {
        return 'ActiveSheetChanged' as const;
    }

    override get SheetDeleted(): 'SheetDeleted' {
        return 'SheetDeleted' as const;
    }

    override get BeforeSheetDelete(): 'BeforeSheetDelete' {
        return 'BeforeSheetDelete' as const;
    }

    override get SheetMoved(): 'SheetMoved' {
        return 'SheetMoved' as const;
    }

    override get BeforeSheetMove(): 'BeforeSheetMove' {
        return 'BeforeSheetMove' as const;
    }

    override get SheetNameChanged(): 'SheetNameChanged' {
        return 'SheetNameChanged' as const;
    }

    override get BeforeSheetNameChange(): 'BeforeSheetNameChange' {
        return 'BeforeSheetNameChange' as const;
    }

    override get SheetTabColorChanged(): 'SheetTabColorChanged' {
        return 'SheetTabColorChanged' as const;
    }

    override get BeforeSheetTabColorChange(): 'BeforeSheetTabColorChange' {
        return 'BeforeSheetTabColorChange' as const;
    }

    override get SheetHideChanged(): 'SheetHideChanged' {
        return 'SheetHideChanged' as const;
    }

    override get BeforeSheetHideChange(): 'BeforeSheetHideChange' {
        return 'BeforeSheetHideChange' as const;
    }

    override get SheetValueChanged(): 'SheetValueChanged' {
        return 'SheetValueChanged' as const;
    }
}

FEventName.extend(FSheetEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetEventMixin { }
    interface IEventParamConfig extends ISheetEventParamConfig { }
}
