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

import { describe, expect, it } from 'vitest';
import { handleCustom, transformCustom } from '../cell-custom';

describe('test utils cell custom', () => {
    it('Function transformCustom', () => {
        expect(transformCustom({}, null)).toStrictEqual({});
        expect(transformCustom({}, undefined)).toStrictEqual({});
        expect(transformCustom({}, {})).toStrictEqual({});
        expect(transformCustom(undefined, { a: 1 })).toStrictEqual({ a: null });
        expect(transformCustom({ a: 1 }, { b: 2 })).toStrictEqual({ a: 1, b: null });
        expect(transformCustom({ a: 1 }, { b: 2, a: 3 })).toStrictEqual({ a: 1, b: null });
    });

    it('Function handleCustom', () => {
        const oldVal = {};
        handleCustom(oldVal, { custom: undefined });
        expect(oldVal).toStrictEqual({});

        handleCustom(oldVal, { custom: null });
        expect(oldVal).toStrictEqual({});

        handleCustom(oldVal, { custom: {} });
        expect(oldVal).toStrictEqual({});

        handleCustom(oldVal, { custom: { a: 1 } });
        expect(oldVal).toStrictEqual({ custom: { a: 1 } });

        handleCustom(oldVal, { custom: { b: 1 } });
        expect(oldVal).toStrictEqual({ custom: { a: 1, b: 1 } });

        handleCustom(oldVal, { custom: null });
        expect(oldVal).toStrictEqual({});
    });
});
