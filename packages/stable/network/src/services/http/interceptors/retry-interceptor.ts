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

import type { Nullable } from '@univerjs/core';
import type { HTTPInterceptorFnFactory } from '../interceptor';
import { retry } from 'rxjs/operators';

const DEFAULT_MAX_RETRY_ATTEMPTS = 3;
const DELAY_INTERVAL = 1000;

export interface IRetryInterceptorFactoryParams {
    maxRetryAttempts?: number;
    delayInterval?: number;
}

export const RetryInterceptorFactory: HTTPInterceptorFnFactory<[Nullable<IRetryInterceptorFactoryParams>]> = (params) => {
    const maxRetryAttempts = params?.maxRetryAttempts ?? DEFAULT_MAX_RETRY_ATTEMPTS;
    const delayInterval = params?.delayInterval ?? DELAY_INTERVAL;
    return (request, next) => next(request).pipe(retry({ delay: delayInterval, count: maxRetryAttempts }));
};
