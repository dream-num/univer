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

import type { Subscription } from 'rxjs';
import type { IDisposable } from '../common/di';
import type { IEventParamConfig } from './f-event';
import { Registry } from '../common/registry';
import { toDisposable } from '../shared';

export class FEventRegistry {
    protected _eventRegistry: Map<string, Registry<(param: any) => void>> = new Map();
    protected _eventHandlerMap = new Map<string, Set<() => IDisposable | Subscription>>();
    protected _eventHandlerRegisted = new Map<string, Map<() => IDisposable | Subscription, IDisposable>>();

    protected _ensureEventRegistry(event: string) {
        if (!this._eventRegistry.has(event)) {
            this._eventRegistry.set(event, new Registry());
        }

        return this._eventRegistry.get(event)!;
    }

    registerEventHandler(event: string, handler: () => IDisposable | Subscription) {
        const current = this._eventHandlerMap.get(event);
        if (current) {
            current.add(handler);
        } else {
            this._eventHandlerMap.set(event, new Set([handler]));
        }

        return toDisposable(() => {
            this._eventHandlerMap.get(event)?.delete(handler);
            this._eventHandlerRegisted.get(event)?.get(handler)?.dispose();
            this._eventHandlerRegisted.get(event)?.delete(handler);
        });
    }

    removeEvent<T extends keyof IEventParamConfig>(event: T, callback: (params: IEventParamConfig[T]) => void) {
        const map = this._ensureEventRegistry(event);
        map.delete(callback);

        if (map.getData().length === 0) {
            const disposable = this._eventHandlerRegisted.get(event);
            disposable?.forEach((d) => d.dispose());
            this._eventHandlerRegisted.delete(event);
        }
    }

    /**
     * Add an event listener
     * @param {string} event key of event
     * @param {(params: IEventParamConfig[typeof event]) => void} callback callback when event triggered
     * @returns {Disposable} The Disposable instance, for remove the listener
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.UnitCreated, (params) => {
     *   console.log('unit created', params);
     * });
     * ```
     */
    addEvent<T extends keyof IEventParamConfig>(event: T, callback: (params: IEventParamConfig[T]) => void) {
        this._ensureEventRegistry(event).add(callback);
        let current = this._eventHandlerRegisted.get(event);
        const handlers = this._eventHandlerMap.get(event);
        if (!current) {
            current = new Map();
            this._eventHandlerRegisted.set(event, current);
            handlers?.forEach((handler) => {
                current?.set(handler, toDisposable(handler()));
            });
        }

        return toDisposable(() => this.removeEvent(event, callback));
    }

    /**
     * Fire an event, used in internal only.
     * @param {string} event key of event
     * @param {any} params params of event
     * @returns {boolean} should cancel
     * @example
     * ```ts
     * this.fireEvent(univerAPI.event.UnitCreated, params);
     * ```
     */
    fireEvent<T extends keyof IEventParamConfig>(event: T, params: IEventParamConfig[T]) {
        this._eventRegistry.get(event)?.getData().forEach((callback) => {
            callback(params);
        });

        return params.cancel;
    }
}
