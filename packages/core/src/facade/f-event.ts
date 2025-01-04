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

export interface ISheetCreateParam {
    unitId: string;
    type: UniverInstanceType.UNIVER_SHEET;
    data: IWorkbookData;
}

export interface IDocumentCreateParam {
    unitId: string;
    type: UniverInstanceType.UNIVER_DOC;
    data: IDocumentData;
}

export interface ILifeCycleChangedParam {
    stage: LifecycleStages;
}
export interface IEventBase {
    cancel?: boolean;
}

export type IUnitCreateEvent = IEventBase & (ISheetCreateParam | IDocumentCreateParam);
export type ILifeCycleChangedEvent = IEventBase & ILifeCycleChangedParam;

export class FEventName {
    static _intance: FEventName | null;
    static get() {
        if (this._intance) {
            return this._intance;
        }

        const instance = new FEventName();
        this._intance = instance;
        return instance;
    }

    static extend(source: any): void {
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name !== 'constructor') {
                // @ts-ignore
                this.prototype[name] = source.prototype[name];
            }
        });

        Object.getOwnPropertyNames(source).forEach((name) => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                // @ts-ignore
                this[name] = source[name];
            }
        });
    }

    constructor() {
        for (const key in FEventName.prototype) {
            // @ts-ignore
            this[key] = FEventName.prototype[key];
        }
    }

    get UnitCreated() {
        return 'UnitCreated' as const;
    }

    get LifeCycleChanged() {
        return 'LifeCycleChanged' as const;
    }
}

export interface IEventParamConfig {
    // UnitCreated: IUnitCreateEvent;
    LifeCycleChanged: ILifeCycleChangedEvent;
}
