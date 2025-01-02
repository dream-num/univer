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

import type { UniverInstanceType } from '../common/unit';
import type { LifecycleStages } from '../services/lifecycle/lifecycle';
import type { IWorkbookData } from '../sheets/typedef';
import type { IDocumentData } from '../types/interfaces';
import type { FWorkbook } from './f-workbook';
import type { FDoc } from './FDoc';
import { FBase } from './f-base';

export interface ISheetCreateParam {
    unitId: string;
    type: UniverInstanceType.UNIVER_SHEET;
    workbook: FWorkbook;
    unit: FWorkbook;
}

export interface IDocumentCreateParam {
    unitId: string;
    type: UniverInstanceType.UNIVER_DOC;
    doc: FDoc;
    unit: FDoc;
}

export interface IEventBase {
    cancel?: boolean;
}

export interface ILifeCycleChangedEvent extends IEventBase {
    stage: LifecycleStages;
}

export type IUnitCreateEvent = IEventBase & (ISheetCreateParam | IDocumentCreateParam);

export interface ISheetDisposedEvent extends IEventBase {
    unitId: string;
    unitType: UniverInstanceType.UNIVER_SHEET;
    snapshot: IWorkbookData;
}

export interface IDocDisposedEvent extends IEventBase {
    unitId: string;
    unitType: UniverInstanceType.UNIVER_DOC;
    snapshot: IDocumentData;
}

export type IUnitDisposeEvent = ISheetDisposedEvent | IDocDisposedEvent;

export class FEventName extends FBase {
    static _intance: FEventName | null;
    static get() {
        if (this._intance) {
            return this._intance;
        }

        const instance = new FEventName();
        this._intance = instance;
        return instance;
    }

    get BeforeUnitCreate() {
        return 'BeforeUnitCreate' as const;
    }

    get UnitCreated() {
        return 'UnitCreated' as const;
    }

    get UnitDisposed() {
        return 'UnitDisposed' as const;
    }

    get LifeCycleChanged() {
        return 'LifeCycleChanged' as const;
    }
}

export interface IEventParamConfig {
    LifeCycleChanged: ILifeCycleChangedEvent;
    UnitDisposed: IUnitDisposeEvent;
    UnitCreated: IUnitCreateEvent;
}
