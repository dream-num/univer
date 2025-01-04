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
import type { IDocumentData } from '../types/interfaces';
import type { FDoc } from './f-doc';

export interface IEventBase {
    cancel?: boolean;
}
export interface IDocCreatedParam extends IEventBase {
    unitId: string;
    type: UniverInstanceType.UNIVER_DOC;
    doc: FDoc;
    unit: FDoc;
}

export interface IDocDisposedEvent extends IEventBase {
    unitId: string;
    unitType: UniverInstanceType.UNIVER_DOC;
    snapshot: IDocumentData;
}

export interface ILifeCycleChangedEvent extends IEventBase {
    stage: LifecycleStages;
}

export interface ICommandEvent extends IEventBase {
    params: any;
    id: string;
    type: CommandType;
}

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

    /**
     * DocCreated event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.DocCreated, (params) => {
     *     console.log('doc created', params);
     * });
     * ```
     */
    get DocCreated() {
        return 'DocCreated' as const;
    }

    /**
     * DocDisposed event
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.DocDisposed, (params) => {
     *     console.log('doc disposed', params);
     * });
     * ```
     */
    get DocDisposed() {
        return 'DocDisposed' as const;
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
    DocDisposed: IDocDisposedEvent;
    DocCreated: IDocCreatedParam;
    Redo: ICommandEvent;
    Undo: ICommandEvent;
    BeforeRedo: ICommandEvent;
    BeforeUndo: ICommandEvent;
    CommandExecuted: ICommandEvent;
    BeforeCommandExecute: ICommandEvent;
}
