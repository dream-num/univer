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

import type { HTTPInterceptorFn, HTTPInterceptorFnFactory } from '../interceptor';
import { catchError, throwError } from 'rxjs';
import { HTTPResponseError } from '../response';

export interface IAuthInterceptorParams {
    errorStatusCodes: number[];
    onAuthError: () => void;
}

export const AuthInterceptorFactory: HTTPInterceptorFnFactory<[IAuthInterceptorParams]> = (params) => {
    const { errorStatusCodes, onAuthError } = params;

    const authInterceptor: HTTPInterceptorFn = (request, next) => {
        return next(request).pipe(
            catchError((error) => {
                if ((error instanceof HTTPResponseError) && errorStatusCodes.some((c) => c === error.status)) {
                    onAuthError();
                }

                return throwError(() => error);
            })
        );
    };

    return authInterceptor;
};
