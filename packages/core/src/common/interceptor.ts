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

import { remove } from './array';
import type { Nullable } from './type-utils';

export type InterceptorHandler<M = unknown, C = unknown> = (
    value: Nullable<M>,
    context: C,
    next: (value: Nullable<M>) => Nullable<M>
) => Nullable<M>;

export interface IInterceptor<M, C> {
    priority?: number;
    handler: InterceptorHandler<M, C>;
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

    function (initialValue: T, context: C) {
        let index = -1;

        function passThrough(
            i: number,
            v: Parameters<IInterceptor<T, C>['handler']>[0]
        ): Parameters<IInterceptor<T, C>['handler']>[0] {
            if (i <= index) {
                throw new Error('[SheetInterceptorService]: next() called multiple times!');
            }

            index = i;
            if (i === interceptors.length) {
                return v;
            }

            const interceptor = interceptors[i];

            return interceptor.handler!(v, context, passThrough.bind(null, i + 1));
        }

        return passThrough(0, initialValue);
    } as ReturnType<IComposeInterceptors<T, C>>;

export class InterceptorManager<P extends Record<string, IInterceptor<any, any>>> {
    private _interceptorsByName: Map<string, Array<IInterceptor<unknown, unknown>>> = new Map();
    private _interceptorPoints: P;

    constructor(interceptorPoints: P) {
        this._interceptorPoints = interceptorPoints;
    }

    fetchThroughInterceptors<T, C>(name: IInterceptor<T, C>) {
        const key = name as unknown as string;
        const interceptors = this._interceptorsByName.get(key) as unknown as Array<typeof name>;
        return composeInterceptors(interceptors || []);
    }

    intercept<T extends IInterceptor<any, any>>(name: T, interceptor: T) {
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

    getInterceptPoints() {
        return this._interceptorPoints;
    }
}
