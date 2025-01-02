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

import type { IEventBase, IWorksheetData } from '@univerjs/core';
import type { FWorkbook } from './f-workbook';
import type { FWorksheet } from './f-worksheet';
import { FEventName } from '@univerjs/core';

export interface IFSheetEventMixin {
    get SheetCreated(): 'SheetCreated' ;
    get BeforeSheetCreate(): 'BeforeSheetCreate';
}

export class FSheetEventName extends FEventName implements IFSheetEventMixin {
    override get SheetCreated(): 'SheetCreated' { return 'SheetCreated' as const; }
    override get BeforeSheetCreate(): 'BeforeSheetCreate' { return 'BeforeSheetCreate' as const; }
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
}

FEventName.extend(FSheetEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetEventMixin { }
    interface IEventParamConfig extends ISheetEventParamConfig { }
}

