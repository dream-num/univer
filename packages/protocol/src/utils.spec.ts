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

import { describe, expect, it } from 'vitest';
import { ErrorCode } from './ts/univer/constants/errors';
import { isError } from './utils';

describe('isError', () => {
    it('should return false when there is no error code', () => {
        expect(isError(undefined)).toBe(false);
        // @ts-expect-error responses sometimes omit error.code
        expect(isError({})).toBe(false);
        // @ts-expect-error responses sometimes omit error.code
        expect(isError({ message: 'no code' })).toBe(false);
    });

    it('should return false only for OK in numeric and string form', () => {
        expect(isError({ code: ErrorCode.OK, message: 'ok' })).toBe(false);
        // @ts-expect-error error code from HTTP is a string not a number
        expect(isError({ code: 'OK', message: 'ok' })).toBe(false);
    });

    it('should return true for every other present code', () => {
        expect(isError({ code: ErrorCode.UNDEFINED, message: 'undefined' })).toBe(true);
        expect(isError({ code: ErrorCode.NOT_FOUND, message: 'missing' })).toBe(true);
        expect(isError({ code: ErrorCode.UNRECOGNIZED, message: 'unknown' })).toBe(true);
        // @ts-expect-error error code from HTTP is a string not a number
        expect(isError({ code: '4', message: 'missing' })).toBe(true);
        // lowercase 'ok' keeps the previous exact-match behavior
        // @ts-expect-error error code from HTTP is a string not a number
        expect(isError({ code: 'ok', message: 'ok' })).toBe(true);
    });
});
