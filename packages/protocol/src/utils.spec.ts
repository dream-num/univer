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
    it('treats falsy code 0 (ErrorCode.UNDEFINED) as an error', () => {
        expect(isError({ code: ErrorCode.UNDEFINED, message: 'x' })).toBe(true);
        expect(isError({ code: 0, message: 'x' })).toBe(true);
    });

    it('treats only OK as success', () => {
        expect(isError({ code: ErrorCode.OK, message: 'ok' })).toBe(false);
        // WTF: error code from HTTP is a string, not a number
        expect(isError({ code: 'OK' as unknown as ErrorCode, message: 'ok' })).toBe(false);
    });

    it('treats other numeric codes as errors', () => {
        expect(isError({ code: ErrorCode.INTERNAL_ERROR, message: 'boom' })).toBe(true);
        expect(isError({ code: ErrorCode.NOT_FOUND, message: 'missing' })).toBe(true);
    });

    it('returns false when there is no error or no code', () => {
        expect(isError()).toBe(false);
        expect(isError(undefined)).toBe(false);
        expect(isError({} as { code: ErrorCode; message: string })).toBe(false);
    });
});
