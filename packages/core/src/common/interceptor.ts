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

/* eslint-disable ts/no-explicit-any */

import type { Nullable } from '../shared/types';
import { remove } from './array';

export type InterceptorHandler<M = unknown, C = unknown> = (
    value: Nullable<M>,
    context: C,
    next: (value: Nullable<M>) => Nullable<M>
) => Nullable<M>;

export enum InterceptorEffectEnum {
    Style = 1, // 1<< 0
    Value = 2, // 1<< 1
}

export interface IInterceptor<M, C> {
    id?: string;
    priority?: number;
    handler: InterceptorHandler<M, C>;
}

export interface ICellInterceptor<M, C> extends IInterceptor<M, C> {
    /**
     * The effect of the interceptor handler.
     * If the effect is 'Style', the worksheet@getCellValueOnly will bypass this interceptor.
     * If the effect is 'Value', the worksheet@getStyleOnly will bypass this interceptor.
     */
    effect?: InterceptorEffectEnum;
}

export function createInterceptorKey<T, C>(key: string): IInterceptor<T, C> {
    const symbol = `sheet_interceptor_${key}`;
    return symbol as unknown as IInterceptor<T, C>; // FIXME: priority and handler is completely missing?
};

export type IComposeInterceptors<T = any, C = any> = (
    interceptors: Array<IInterceptor<T, C>>
) => (initValue: Nullable<T>, initContext: C) => Nullable<T>;

/**
 * A helper to compose a certain type of interceptors.
 */
export const composeInterceptors = <T, C>(interceptors: Array<IInterceptor<T, C>>) =>

    function (initialValue: Nullable<T>, context: C) {
        let index = -1;
        let value: Nullable<T> = initialValue;

        for (let i = 0; i <= interceptors.length; i++) {
            if (i <= index) {
                throw new Error('[SheetInterceptorService]: next() called multiple times!');
            }

            index = i;

            if (i === interceptors.length) {
                return value;
            }

            const interceptor = interceptors[i];
            let nextCalled = false;

            value = interceptor.handler!(value, context, (nextValue) => {
                nextCalled = true;
                return nextValue;
            });

            if (!nextCalled) {
                break;
            }
        }

        return value;
    } as ReturnType<IComposeInterceptors<T, C>>;

export class InterceptorManager<P extends Record<string, IInterceptor<any, any>>> {
    private _interceptorsByName: Map<string, Array<IInterceptor<unknown, unknown>>> = new Map();
    private _interceptorPoints: P;

    constructor(interceptorPoints: P) {
        this._interceptorPoints = interceptorPoints;
    }

    /**
     * Get the interceptors.
     * @param name Name of the intercepted point.
     * @param filter A callback function to filter the interceptors.
     * @returns It will return a composed interceptor function. If you will perform the interceptor repeatedly,
     * you should cache the result instead of calling this function multiple times.
     */
    public fetchThroughInterceptors<T, C>(name: IInterceptor<T, C>, filter?: (interceptor: IInterceptor<any, any>) => boolean) {
        const key = name as unknown as string;
        let interceptors = this._interceptorsByName.get(key) as unknown as Array<typeof name>;

        if (filter) {
            interceptors = interceptors.filter(filter);
        }

        return composeInterceptors(interceptors || []);
    }

    public intercept<T extends IInterceptor<any, any>>(name: T, interceptor: T) {
        const key = name as unknown as string;
        if (!this._interceptorsByName.has(key)) {
            this._interceptorsByName.set(key, []);
        }
        const interceptors = this._interceptorsByName.get(key)!;
        interceptors.push(interceptor);

        this._interceptorsByName.set(
            key,
            interceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)) // from large to small
        );
        return () => remove(this._interceptorsByName.get(key)!, interceptor);
    }

    public getInterceptPoints() {
        return this._interceptorPoints;
    }

    public dispose() {
        this._interceptorsByName.clear();
    }
}

export function createAsyncInterceptorKey<T, C>(key: string): IAsyncInterceptor<T, C> {
    const symbol = `sheet_async_interceptor_${key}`;
    return symbol as unknown as IAsyncInterceptor<T, C>;
};

export type AsyncInterceptorHandler<M = unknown, C = unknown> = (
    value: Nullable<M>,
    context: C,
    next: (value: Nullable<M>) => Promise<Nullable<M>>
) => Promise<Nullable<M>>;

export interface IAsyncInterceptor<M, C> {
    /**
     * The priority of the interceptor, the larger the number, the higher the priority.
     * @default 0
     */
    priority?: number;
    handler: AsyncInterceptorHandler<M, C>;
}

export type IComposeAsyncInterceptors<T = any, C = any> = (
    interceptors: Array<IAsyncInterceptor<T, C>>
) => (initValue: Nullable<T>, initContext: C) => Promise<Nullable<T>>;

export const composeAsyncInterceptors = <T, C>(
    interceptors: Array<IAsyncInterceptor<T, C>>
): ((initialValue: Nullable<T>, context: C) => Promise<Nullable<T>>) => {
    return async function (initialValue: Nullable<T>, context: C) {
        let index = -1;
        let value: Nullable<T> = initialValue;

        for (let i = 0; i <= interceptors.length; i++) {
            if (i <= index) {
                throw new Error('[SheetInterceptorService]: next() called multiple times!');
            }

            index = i;

            if (i === interceptors.length) {
                return value;
            }

            const interceptor = interceptors[i];
            let nextCalled = false;

            value = await interceptor.handler!(value, context, async (nextValue) => {
                nextCalled = true;
                return nextValue;
            });

            if (!nextCalled) {
                break;
            }
        }

        return value;
    };
};

export class AsyncInterceptorManager<P extends Record<string, IAsyncInterceptor<any, any>>> {
    private _asyncInterceptorsByName: Map<string, Array<IAsyncInterceptor<unknown, unknown>>> = new Map();
    private _asyncInterceptorPoints: P;

    constructor(asyncInterceptorPoints: P) {
        this._asyncInterceptorPoints = asyncInterceptorPoints;
    }

    /**
     * Get the interceptors.
     * @param name Name of the intercepted point.
     * @param filter A callback function to filter the interceptors.
     * @returns It will return a composed interceptor function. If you will perform the interceptor repeatedly,
     * you should cache the result instead of calling this function multiple times.
     */
    public fetchThroughAsyncInterceptors<T, C>(name: IAsyncInterceptor<T, C>, filter?: (interceptor: IAsyncInterceptor<any, any>) => boolean) {
        const key = name as unknown as string;
        let interceptors = this._asyncInterceptorsByName.get(key) as unknown as Array<typeof name>;

        if (filter) {
            interceptors = interceptors.filter(filter);
        }

        return composeAsyncInterceptors(interceptors || []);
    }

    public async interceptAsync<T extends IAsyncInterceptor<any, any>>(name: T, interceptor: T) {
        const key = name as unknown as string;
        if (!this._asyncInterceptorsByName.has(key)) {
            this._asyncInterceptorsByName.set(key, []);
        }

        const interceptors = this._asyncInterceptorsByName.get(key)!;
        interceptors.push(interceptor);

        this._asyncInterceptorsByName.set(
            key,
            interceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)) // from large to small
        );
        return () => remove(this._asyncInterceptorsByName.get(key)!, interceptor);
    }

    public getInterceptPoints() {
        return this._asyncInterceptorPoints;
    }

    public dispose() {
        this._asyncInterceptorsByName.clear();
    }
}
