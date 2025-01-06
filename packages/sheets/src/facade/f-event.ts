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

export interface IFSheetEventMixin {
    /**
     * Event fired after a sheet is created
     * @see {@link ISheetCreatedEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.SheetCreated, (params) => {
     *      const { workbook, worksheet } = params;
     *     console.log('unit created', params);
     * });
     * ```
     */
    get SheetCreated(): 'SheetCreated' ;
    /**
     * Event fired before a sheet is created
     * @see {@link IBeforeSheetCreateEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeSheetCreate, (params) => {
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
     * univerAPI.addEvent(univerAPI.event.WorkbookCreated, (params) => {
     *      const { unitId, type, workbook, unit } = params;
     *     console.log('unit created', params);
     * });
     * ```
     */
    get WorkbookCreated(): 'WorkbookCreated';
    /**
     * Event fired after a workbook is disposed
     * @see {@link IWorkbookDisposedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.WorkbookDisposed, (params) => {
     *      const { unitId, unitType, snapshot } = params;
     *     console.log('unit disposed', params);
     * });
     * ```
     */
    get WorkbookDisposed(): 'WorkbookDisposed';
}

export interface IWorkbookCreateParam extends IEventBase {
    unitId: string;
    type: UniverInstanceType.UNIVER_SHEET;
    workbook: FWorkbook;
    unit: FWorkbook;
}

export interface IWorkbookDisposedEvent extends IEventBase {
    unitId: string;
    unitType: UniverInstanceType.UNIVER_SHEET;
    snapshot: IWorkbookData;
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
}

export interface IBeforeSheetCreateEventParams extends IEventBase {
    workbook: FWorkbook;
    index?: number;
    sheet?: IWorksheetData;
}

export interface ISheetCreatedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
}

export interface ISheetEventParamConfig {
    SheetCreated: ISheetCreatedEventParams;
    BeforeSheetCreate: IBeforeSheetCreateEventParams;
    WorkbookCreated: IWorkbookCreateParam;
    WorkbookDisposed: IWorkbookDisposedEvent;
}

FEventName.extend(FSheetEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetEventMixin { }
    interface IEventParamConfig extends ISheetEventParamConfig { }
}

