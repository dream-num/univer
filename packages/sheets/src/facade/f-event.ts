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
         console.log('unit created', params);
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
     *     console.log('unit created', params);
     * });
     * ```
     */
    get BeforeSheetCreate(): 'BeforeSheetCreate';
    /**
     * Event fired after a workbook is created
     * @see {@link IWorkbookCreateParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.WorkbookCreated, (params) => {
     *      const { unitId, type, workbook, unit } = params;
     *     console.log('unit created', params);
     * });
     * ```
     */

    get BeforeActiveSheetChange(): 'BeforeActiveSheetChange';
    get ActiveSheetChanged(): 'ActiveSheetChanged';
    get SheetDeleted(): 'SheetDeleted';
    get BeforeSheetDelete(): 'BeforeSheetDelete';
    get SheetMoved(): 'SheetMoved';
    get BeforeSheetMove(): 'BeforeSheetMove';
    get SheetNameChanged(): 'SheetNameChanged';
    get BeforeSheetNameChange(): 'BeforeSheetNameChange';
    get SheetTabColorChanged(): 'SheetTabColorChanged';
    get BeforeSheetTabColorChange(): 'BeforeSheetTabColorChange';
    get SheetHideChanged(): 'SheetHideChanged';
    get BeforeSheetHideChange(): 'BeforeSheetHideChange';
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
}

FEventName.extend(FSheetEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetEventMixin { }
    interface IEventParamConfig extends ISheetEventParamConfig { }
}
