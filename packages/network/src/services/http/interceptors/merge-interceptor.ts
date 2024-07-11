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

import { Observable } from 'rxjs';
import type { HTTPRequest } from '../request';
import { HTTPEventType, HTTPResponse } from '../response';
import type { HTTPHandlerFn } from '../interceptor';

// eslint-disable-next-line max-lines-per-function
export const MergeInterceptorFactory = <T, C>(config: {
    /**
     *  Filter requests that need to be merged
     */
    isMatch: (requestConfig: HTTPRequest) => boolean;
    /**
     * Pre-process request parameters, the return value will be used as input parameters for subsequent operations
     * The result is used as an index key
     */
    preParams: (requestConfig: HTTPRequest) => T;
    /**
     * The request parameters are merged to initiate the request
     */
    mergeParams: (list: T[], requestConfig: HTTPRequest) => HTTPRequest;
    /**
     * Determine when to initiate a request
     */
    fetchCheck: (currentConfig: HTTPRequest, list: T[]) => Promise<{ isFetch: boolean; list: T[] }>;
    /**
     * The result of the request is dispatched based on the request parameters
     */
    distributeResult: (result: C, list: T[]) => { config: T; result: C }[];
}) => {
    interface IHook { next: (v: HTTPResponse<C>) => void; config: T; error: (error: string) => void };
    const { isMatch, preParams, mergeParams, fetchCheck, distributeResult } = config;
    const hookList: IHook[] = [];
    const getPlainList = (_list: IHook[]) => _list.map((item) => item.config);

    return (requestConfig: HTTPRequest, next: HTTPHandlerFn) => {
        if (!isMatch(requestConfig)) {
            return next(requestConfig);
        }
        return new Observable<HTTPResponse<C>>((observer) => {
            const params = preParams(requestConfig);
            hookList.push({
                next: (v) => observer.next(v),
                error: (error) => observer.error(error),
                config: params,
            });

            fetchCheck(requestConfig, getPlainList(hookList)).then((res) => {
                const { isFetch, list } = res;
                if (isFetch) {
                    // Pin down the queue that currently needs a request.
                    const currentHookList: IHook[] = [];
                    list.forEach((config) => {
                        const index = hookList.findIndex((item) => item.config === config);
                        if (index >= 0) {
                            const [hook] = hookList.splice(index, 1);
                            currentHookList.push(hook);
                        } else {
                            // There's no corresponding callback here. It could be that other operations have been handled and do not need to be handled.
                        }
                    });

                    next(mergeParams(getPlainList(currentHookList), requestConfig)).subscribe({
                        next: (e) => {
                            if (e.type === HTTPEventType.Response) {
                                const body = e.body as C;
                                const configList = distributeResult(body, list);
                                currentHookList.forEach((listItem) => {
                                    const res = configList.find((item) => item.config === listItem.config);
                                    if (res) {
                                        const response = new HTTPResponse({
                                            body: res.result,
                                            headers: e.headers,
                                            status: e.status,
                                            statusText: e.statusText,
                                        });
                                        listItem.next(response);
                                    } else {
                                        listItem.error('batch error');
                                    }
                                });
                            }
                        },
                        complete: () => observer.complete(),
                        error: (e) => observer.error(e),
                    });
                }
            });
        });
    };
};
