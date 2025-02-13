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

import { Observable } from 'rxjs';
import type { Nullable } from '@univerjs/core';
import { remove } from '@univerjs/core';
import type { HTTPInterceptorFnFactory } from '../interceptor';

export interface IThresholdInterceptorFactoryParams {
    maxParallel?: number;
}

type HandlerFn = () => void;

export const ThresholdInterceptorFactory: HTTPInterceptorFnFactory<[Nullable<IThresholdInterceptorFactoryParams>]> = (params) => {
    /**
     * The local variable to store handles.
     */
    const handlers: HandlerFn[] = [];
    const ongoingHandlers = new Set<HandlerFn>();

    const tick = (): void => {
        while (ongoingHandlers.size < (params?.maxParallel ?? 1) && handlers.length > 0) {
            const handler = handlers.shift()!;
            ongoingHandlers.add(handler);
            handler();
        }
    };

    return (request, next) => {
        return new Observable((observer) => {
            const handler = () => next(request).subscribe({
                next: (event) => observer.next(event),
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
            });

            const teardown = () => {
                ongoingHandlers.delete(handler);
                remove(handlers, handler);
                tick();
            };

            handlers.push(handler);
            tick();

            return teardown;
        });
    };
};
