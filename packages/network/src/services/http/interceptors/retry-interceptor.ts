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

import { delay, of, throwError } from 'rxjs';
import { concatMap, retryWhen } from 'rxjs/operators';
import type { HTTPInterceptorFn } from '../interceptor';

const MAX_RETRY_ATTEMPTS = 2;
const DELAY_INTERVAL = 1000;

// TODO@wzhudev: should fix these deprecated warning here

export const retryInterceptor: HTTPInterceptorFn = (request, next) => {
    return next(request).pipe(
        retryWhen((errors) => {
            return errors.pipe(
                concatMap((error, index) => {
                    if (index > MAX_RETRY_ATTEMPTS) {
                        return throwError(error);
                    }

                    return of(error);
                }),
                delay(DELAY_INTERVAL)
            );
        })
    );
};
