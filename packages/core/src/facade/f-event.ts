/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

/* eslint-disable ts/explicit-function-return-type */

import type { CommandType, IDocumentData, IExecutionOptions, LifecycleStages, UniverInstanceType } from '@univerjs/core';
import type { FDoc } from './f-doc';

/**
 * Base interface for all event parameters
 * @interface IEventBase
 * @ignore
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
    /** optional execution options for the command */
    options?: IExecutionOptions;
}

/**
 * @hideconstructor
 */
export class FEventName {
    /**
     * @ignore
     */
    static _instance: FEventName | null;

    static get() {
        if (this._instance) {
            return this._instance;
        }

        const instance = new FEventName();
        this._instance = instance;
        return instance;
    }

    /**
     * @ignore
     */
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.DocCreated, (params) => {
     *   const { unitId, type, doc, unit } = params;
     *   console.log('doc created', params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.DocDisposed, (params) => {
     *   const { unitId, unitType, snapshot } = params;
     *   console.log('doc disposed', params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
     *   const { stage } = params;
     *   console.log('life cycle changed', params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.Redo, (event) => {
     *   const { params, id, type } = event;
     *   console.log('redo command executed', event);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.Undo, (event) => {
     *   const { params, id, type } = event;
     *   console.log('undo command executed', event);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeRedo, (event) => {
     *   const { params, id, type } = event;
     *   console.log('before redo command executed', event);
     *
     *   // Cancel the redo operation
     *   event.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeUndo, (event) => {
     *   const { params, id, type } = event;
     *   console.log('before undo command executed', event);
     *
     *   // Cancel the undo operation
     *   event.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {
     *   const { params, id, type, options } = event;
     *   console.log('command executed', event);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event) => {
     *   const { params, id, type, options } = event;
     *   console.log('before command executed', event);
     *
     *   // Cancel the command execution
     *   event.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
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
