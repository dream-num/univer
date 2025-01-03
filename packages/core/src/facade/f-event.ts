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
import type { CommandType } from '../services/command/command.service';
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

export interface ICommandEvent extends IEventBase {
    params: any;
    id: string;
    type: CommandType;
}

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

    /**
     * BeforeUnitCreate event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeUnitCreate, (params) => {
     *     console.log('before unit created', params);
     * });
     * ```
     */
    get BeforeUnitCreate() {
        return 'BeforeUnitCreate' as const;
    }

    /**
     * UnitCreated event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.UnitCreated, (params) => {
     *     console.log('unit created', params);
     * });
     * ```
     */
    get UnitCreated() {
        return 'UnitCreated' as const;
    }

    /**
     * UnitDisposed event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.UnitDisposed, (params) => {
     *     console.log('unit disposed', params);
     * });
     * ```
     */
    get UnitDisposed() {
        return 'UnitDisposed' as const;
    }

    /**
     * LifeCycleChanged event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.LifeCycleChanged, (params) => {
     *     console.log('life cycle changed', params);
     * });
     * ```
     */
    get LifeCycleChanged() {
        return 'LifeCycleChanged' as const;
    }

    /**
     * Redo event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.Redo, (params) => {
     *     console.log('command executed', params);
     * });
     * ```
     */
    get Redo() {
        return 'Redo' as const;
    }

    /**
     * Undo event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.Undo, (params) => {
     *     console.log('command executed', params);
     * });
     * ```
     */
    get Undo() {
        return 'Undo' as const;
    }

    /**
     * BeforeRedo event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeRedo, (params) => {
     *     console.log('command executed', params);
     * });
     * ```
     */
    get BeforeRedo() {
        return 'BeforeRedo' as const;
    }

    /**
     * BeforeUndo event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeUndo, (params) => {
     *     console.log('command executed', params);
     * });
     * ```
     */
    get BeforeUndo() {
        return 'BeforeUndo' as const;
    }

    /**
     * CommandExecuted event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.CommandExecuted, (params) => {
     *     console.log('command executed', params);
     * });
     * ```
     */
    get CommandExecuted() {
        return 'CommandExecuted' as const;
    }

    /**
     * BeforeCommandExecute event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeCommandExecute, (params) => {
     *     console.log('command executed', params);
     * });
     * ```
     */
    get BeforeCommandExecute() {
        return 'BeforeCommandExecute' as const;
    }
}

export interface IEventParamConfig {
    LifeCycleChanged: ILifeCycleChangedEvent;
    UnitDisposed: IUnitDisposeEvent;
    UnitCreated: IUnitCreateEvent;
    Redo: ICommandEvent;
    Undo: ICommandEvent;
    BeforeRedo: ICommandEvent;
    BeforeUndo: ICommandEvent;
    CommandExecuted: ICommandEvent;
    BeforeCommandExecute: ICommandEvent;
}
