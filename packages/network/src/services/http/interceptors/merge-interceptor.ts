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
import type { HTTPRequest } from '../request';
import { HTTPEventType, HTTPResponse } from '../response';
import type { HTTPHandlerFn } from '../interceptor';

const createDefaultFetchCheck = (time = 300) => {
    const noop = () => { };
    let cancel = noop;
    return (_currentConfig: HTTPRequest) => {
        return new Promise<boolean>((res) => {
            cancel();
            const t = setTimeout(() => {
                res(true);
            }, time);
            cancel = () => {
                clearTimeout(t);
                res(false);
            };
        });
    };
};

const createDistributeResult = <T, C>() => {
    return (result: C, list: T[]) => {
        return list.map((config) => ({ config, result }));
    };
};

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
    getParamsFromRequest: (requestConfig: HTTPRequest) => T;
    /**
     * The request parameters are merged to initiate the request
     */
    mergeParamsToRequest: (list: T[], requestConfig: HTTPRequest) => HTTPRequest;

}, options: {
    /**
     * Determine when to initiate a request
     * By default, requests up to 300ms are automatically aggregated
     */
        fetchCheck?: (currentConfig: HTTPRequest) => Promise<boolean>;
    /**
     * The result of the request is dispatched based on the request parameters.
     * By default each request gets the full result of the batch request
     */
        distributeResult?: (result: C, list: T[]) => { config: T; result: C }[];
    } = {}) => {
    interface IHook { next: (v: HTTPResponse<C>) => void; config: T; error: (error: string) => void };
    const { isMatch, getParamsFromRequest, mergeParamsToRequest } = config;
    const { fetchCheck = createDefaultFetchCheck(300), distributeResult = createDistributeResult() } = options;
    const hookList: IHook[] = [];
    const getPlainList = (_list: IHook[]) => _list.map((item) => item.config);

    return (requestConfig: HTTPRequest, next: HTTPHandlerFn) => {
        if (!isMatch(requestConfig)) {
            return next(requestConfig);
        }
        return new Observable<HTTPResponse<C>>((observer) => {
            const params = getParamsFromRequest(requestConfig);
            hookList.push({
                next: (v) => observer.next(v),
                error: (error) => observer.error(error),
                config: params,
            });
            const list = getPlainList(hookList);
            fetchCheck(requestConfig).then((isFetch) => {
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

                    next(mergeParamsToRequest(list, requestConfig)).subscribe({
                        next: (e) => {
                            if (e.type === HTTPEventType.Response) {
                                const body = e.body as C;
                                const configList = distributeResult(body, list);
                                currentHookList.forEach((hookItem) => {
                                    const res = configList.find((item) => item.config === hookItem.config);
                                    if (res) {
                                        const response = new HTTPResponse({
                                            body: res.result,
                                            headers: e.headers,
                                            status: e.status,
                                            statusText: e.statusText,
                                        });
                                        hookItem.next(response);
                                    } else {
                                        hookItem.error('batch error');
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
