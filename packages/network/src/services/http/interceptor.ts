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

import type { Observable } from 'rxjs';

import type { HTTPRequest } from './request';
import type { HTTPEvent } from './response';

export type HTTPHandlerFn = (request: HTTPRequest) => Observable<HTTPEvent<unknown>>;

/**
 * HTTP interceptor function. When the interceptor is called, it would receive a request object and a next function.
 *
 * @param request The `request` could be been modified by interceptors whose priority is higher than the current interceptor.
 *
 * @param next When the interceptor decides to pass the request to the next interceptor, it should call the `next` function with
 * the request.
 * The `next` function would return an `Observable`. The current interceptor should subscribe to it and emit the messages
 * from next interceptor to the previous interceptor.
 *
 * @returns An `Observable` that emits the response of the request. It would be subscribed by the previous interceptor.
 *
 * An interceptor the logs the request and response would look like this:
 * @example
 * function logInterceptor(request: HTTPRequest, next: HTTPHandlerFn): Observable<HTTPEvent<unknown>> {
 *     console.log('Request:', request);
 *     return next(request).pipe(cat(response => console.log('Response:', response)));
 * }
 */
export type HTTPInterceptorFn = (request: HTTPRequest, next: HTTPHandlerFn) => Observable<HTTPEvent<unknown>>;

export type RequestPipe<T> = (req: HTTPRequest, finalHandlerFn: HTTPHandlerFn) => Observable<HTTPEvent<T>>;

export type HTTPInterceptorFnFactory<T extends unknown[] = []> = (...args: T) => HTTPInterceptorFn;
