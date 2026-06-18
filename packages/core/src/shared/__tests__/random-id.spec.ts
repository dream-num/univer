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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRandomId, generateRandomId } from '../random-id';

function mockCrypto(bytes: number[]) {
    let offset = 0;
    const getRandomValues = vi.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = bytes[offset++ % bytes.length];
        }
        return array;
    });

    vi.stubGlobal('crypto', { getRandomValues });

    return getRandomValues;
}

describe('createRandomId', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('should generate a URL-safe id with the default size', () => {
        expect(createRandomId()).toHaveLength(21);
        expect(createRandomId()).toMatch(/^[A-Za-z0-9_-]{21}$/);
    });

    it('should use the requested size and custom alphabet', () => {
        mockCrypto([0, 1, 2, 3]);

        expect(createRandomId(6, 'abcd')).toBe('abcdab');
    });

    it('should return an empty id for size 0', () => {
        expect(createRandomId(0)).toBe('');
    });

    it('should skip biased crypto bytes outside the safe cutoff', () => {
        mockCrypto([250, 0, 1, 2]);

        expect(createRandomId(3, '0123456789')).toBe('012');
    });

    it('should read random values from self.crypto when global crypto is unavailable', () => {
        const getRandomValues = vi.fn((array: Uint8Array) => {
            array.fill(1);
            return array;
        });

        vi.stubGlobal('crypto', undefined);
        vi.stubGlobal('self', { crypto: { getRandomValues } });

        expect(createRandomId(4, 'ab')).toBe('bbbb');
        expect(getRandomValues).toHaveBeenCalled();
    });

    it('should fall back to Math.random when crypto is unavailable', () => {
        vi.stubGlobal('crypto', undefined);
        vi.stubGlobal('self', undefined);
        vi.stubGlobal('window', undefined);
        vi.spyOn(Math, 'random').mockReturnValue(0.75);

        expect(createRandomId(4, 'ab')).toBe('bbbb');
    });

    it('should expose generateRandomId as the compatibility API', () => {
        mockCrypto([0, 1]);

        expect(generateRandomId(4, 'ab')).toBe('abab');
    });
});
