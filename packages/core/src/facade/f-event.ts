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

/**
 * Base interface for all event parameters
 * @interface IEventBase
 */
export interface IEventBase {
    /** Flag to cancel the event if supported */
    cancel?: boolean;
}

/**
 * Event interface triggered when a document is created
 * @interface IDocCreatedParam
 * @augments {IEventBase}
 */
export interface IDocCreatedParam extends IEventBase {
    /** Unique identifier of the document unit */
    unitId: string;
    /** Type identifier for document instances */
    type: UniverInstanceType.UNIVER_DOC;
    /** The created document instance */
    doc: FDoc;
    /** Reference to the document unit */
    unit: FDoc;
}

/**
 * Event interface triggered when a document is disposed
 * @interface IDocDisposedEvent
 * @augments {IEventBase}
 */
export interface IDocDisposedEvent extends IEventBase {
    /** Unique identifier of the disposed document unit */
    unitId: string;
    /** Type identifier for document instances */
    unitType: UniverInstanceType.UNIVER_DOC;
    /** Final state snapshot of the disposed document */
    snapshot: IDocumentData;
}

/**
 * Event interface for lifecycle stage changes
 * @interface ILifeCycleChangedEvent
 * @augments {IEventBase}
 */
export interface ILifeCycleChangedEvent extends IEventBase {
    /** Current stage of the lifecycle */
    stage: LifecycleStages;
}

/**
 * Event interface for command execution
 * @interface ICommandEvent
 * @augments {IEventBase}
 */
export interface ICommandEvent extends IEventBase {
    /** Parameters passed to the command */
    params: any;
    /** Unique identifier of the command */
    id: string;
    /** Type of the command */
    type: CommandType;
}

export class FEventName {
    static _instance: FEventName | null;
    static get() {
        if (this._instance) {
            return this._instance;
        }

        const instance = new FEventName();
        this._instance = instance;
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
     * Event fired when a document is created
     * @see {@link IDocCreatedParam}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.DocCreated, (params) => {
     *     const { unitId, type, doc, unit } = params;
     *     console.log('doc created', params);
     * });
     * ```
     */
    get DocCreated() {
        return 'DocCreated' as const;
    }

    /**
     * Event fired when a document is disposed
     * @see {@link IDocDisposedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.DocDisposed, (params) => {
     *     const { unitId, unitType, snapshot } = params;
     *     console.log('doc disposed', params);
     * });
     * ```
     */
    get DocDisposed() {
        return 'DocDisposed' as const;
    }

    /**
     * Event fired when life cycle is changed
     * @see {@link ILifeCycleChangedEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.LifeCycleChanged, (params) => {
     *      const { stage } = params;
     *     console.log('life cycle changed', params);
     * });
     * ```
     */
    get LifeCycleChanged() {
        return 'LifeCycleChanged' as const;
    }

    /**
     * Event fired when a redo command is executed
     * @see {@link ICommandEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.Redo, (event) => {
     *     const { params, id, type } = event;
     *     console.log('command executed', event);
     * });
     * ```
     */
    get Redo() {
        return 'Redo' as const;
    }

    /**
     * Event fired when an undo command is executed
     * @see {@link ICommandEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.Undo, (event) => {
     *     const { params, id, type } = event;
     *     console.log('command executed', event);
     * });
     * ```
     */
    get Undo() {
        return 'Undo' as const;
    }

    /**
     * Event fired before a redo command is executed
     * @see {@link ICommandEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeRedo, (event) => {
     *     const { params, id, type } = event;
     *     console.log('command executed', event);
     * });
     * ```
     */
    get BeforeRedo() {
        return 'BeforeRedo' as const;
    }

    /**
     * Event fired before an undo command is executed
     * @see {@link ICommandEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeUndo, (event) => {
     *     const { params, id, type } = event;
     *     console.log('command executed', event);
     * });
     * ```
     */
    get BeforeUndo() {
        return 'BeforeUndo' as const;
    }

    /**
     * Event fired when a command is executed
     * @see {@link ICommandEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.CommandExecuted, (event) => {
     *     const { params, id, type } = event;
     *     console.log('command executed', event);
     * });
     * ```
     */
    get CommandExecuted() {
        return 'CommandExecuted' as const;
    }

    /**
     * Event fired before a command is executed
     * @see {@link ICommandEvent}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeCommandExecute, (event) => {
     *     const { params, id, type } = event;
     *     console.log('command executed', event);
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
