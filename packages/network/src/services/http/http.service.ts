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

import type { Nullable } from '@univerjs/core';
import { Disposable, remove, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { firstValueFrom, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { HTTPHeaders } from './headers';
import type { HTTPResponseType } from './http';
import { IHTTPImplementation } from './implementations/implementation';
import { HTTPParams } from './params';
import type { HTTPRequestMethod } from './request';
import { HTTPRequest } from './request';
import type { HTTPEvent, HTTPResponseError } from './response';
import { HTTPResponse } from './response';
import type { HTTPHandlerFn, HTTPInterceptorFn, RequestPipe } from './interceptor';

export interface IRequestParams {
    /** Query params. These params would be append to the url before the request is sent. */
    params?: { [param: string]: string | number | boolean };

    /** Query headers. */
    headers?: { [key: string]: string | number | boolean };
    /** Expected types of the response data. */
    responseType?: HTTPResponseType;
    withCredentials?: boolean;
}

export interface IPostRequestParams extends IRequestParams {
    body?: unknown;
}

/**
 * Register an HTTP interceptor. Interceptor could modify requests, responses, headers or errors.
 */
export interface IHTTPInterceptor {
    /** The priority of the interceptor. The higher the value, the earlier the interceptor is called. */
    priority?: number;
    /** The interceptor function. */
    interceptor: HTTPInterceptorFn;
}

/**
 * This service provides http request methods and allows to register http interceptors.
 *
 * You can use interceptors to:
 *
 * 1. modify requests (headers included) before they are sent, or modify responses before they are returned to the caller.
 * 2. thresholding, logging, caching, etc.
 * 3. authentication, authorization, etc.
 */
export class HTTPService extends Disposable {
    private _interceptors: IHTTPInterceptor[] = [];

    // eslint-disable-next-line ts/no-explicit-any
    private _pipe: Nullable<RequestPipe<any>>;

    constructor(@IHTTPImplementation private readonly _http: IHTTPImplementation) {
        super();
    }

    /**
     * Register an HTTP interceptor.
     *
     * @param interceptor the http interceptor
     * @returns a disposable handler to remove the interceptor
     */
    registerHTTPInterceptor(interceptor: IHTTPInterceptor): IDisposable {
        if (this._interceptors.indexOf(interceptor) !== -1) {
            throw new Error('[HTTPService]: The interceptor has already been registered!');
        }

        this._interceptors.push(interceptor);
        this._interceptors = this._interceptors.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

        this._pipe = null;

        return toDisposable(() => remove(this._interceptors, interceptor));
    }

    get<T>(url: string, options?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._request<T>('GET', url, options);
    }

    post<T>(url: string, options?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._request<T>('POST', url, options);
    }

    put<T>(url: string, options?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._request<T>('PUT', url, options);
    }

    delete<T>(url: string, options?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._request<T>('DELETE', url, options);
    }

    patch<T>(url: string, options?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._request<T>('PATCH', url, options);
    }

    /** The HTTP request implementations */
    private async _request<T>(
        method: HTTPRequestMethod,
        url: string,
        options?: IRequestParams
    ): Promise<HTTPResponse<T>> {
        // Things to do when sending a HTTP request:
        // 1. Generate HTTPRequest/HTTPHeader object
        // 2. Call interceptors and finally the HTTP implementation.
        const headers = new HTTPHeaders(options?.headers);
        const params = new HTTPParams(options?.params);
        const request = new HTTPRequest(method, url, {
            headers,
            params,
            withCredentials: options?.withCredentials ?? false, // default value for withCredentials is false by MDN
            responseType: options?.responseType ?? 'json',
            body: (['GET', 'DELETE'].includes(method)) ? undefined : (options as IPostRequestParams)?.body,
        });

        // eslint-disable-next-line ts/no-explicit-any
        const events$: Observable<HTTPEvent<any>> = of(request).pipe(
            concatMap((request) => this._runInterceptorsAndImplementation(request))
        );

        // The event$ may emit multiple values, but we only care about the first one.
        // We may need to care about other events (especially progress events) in the future.
        const result = await firstValueFrom(events$);
        if (result instanceof HTTPResponse) {
            return result;
        }

        throw new Error(`${(result as HTTPResponseError).error}`);
    }

    // eslint-disable-next-line ts/no-explicit-any
    private _runInterceptorsAndImplementation(request: HTTPRequest): Observable<HTTPEvent<any>> {
        // In this method we first call all interceptors and finally the HTTP implementation.
        // And the HTTP response will be passed back through the interceptor chain.
        if (!this._pipe) {
            this._pipe = this._interceptors
                .map((handler) => handler.interceptor)
                .reduceRight(
                    (nextHandlerFunction, interceptorFunction: HTTPInterceptorFn) =>
                        chainInterceptorFn(nextHandlerFunction, interceptorFunction),
                    (requestFromPrevInterceptor, finalHandler) => finalHandler(requestFromPrevInterceptor)
                );
        }

        return this._pipe!(request, (requestToNext) => this._http.send(requestToNext) /* final handler */);
    }
}

function chainInterceptorFn(afterInterceptorChain: HTTPInterceptorFn, currentInterceptorFn: HTTPInterceptorFn) {
    return (prevRequest: HTTPRequest, nextHandlerFn: HTTPHandlerFn) =>
        currentInterceptorFn(prevRequest, (nextRequest) => afterInterceptorChain(nextRequest, nextHandlerFn));
}
