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

import type { IError } from './ts/univer/constants/errors';
import { ErrorCode } from './ts/univer/constants/errors';

/**
 * To examine if a response is an error.
 *
 * @param error error interface
 * @returns if the response is an error
 */
export function isError(error?: IError) {
    // Universer responses sometimes omit error.code, and error codes arriving
    // over HTTP are strings instead of numbers, so normalize before comparing.
    // Only ErrorCode.OK (1 / 'OK') means success; every other present code —
    // including UNDEFINED (0), which is falsy — is an error.
    const code: unknown = error?.code;
    if (code === undefined || code === null || code === '') {
        return false;
    }

    return String(code) !== String(ErrorCode.OK) && code !== 'OK';
}
