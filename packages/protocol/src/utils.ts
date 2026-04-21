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
    // WTF: sometimes returns from Universer does not have error.code
    // WTF: error code from HTTP is a string not a number
    // @ts-expect-error error code from HTTP is a string not a number
    if (error && error.code && error.code !== ErrorCode.OK && error.code !== 'OK') {
        return true;
    }

    return false;
}
