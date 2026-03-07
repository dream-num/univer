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
import { createREGEXFromWildChar, generateRandomId, Tools } from '../tools';

class CustomProto {
    value = 1;
}

describe('Tools extra coverage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should handle basic string and index helpers', () => {
        expect(Tools.deleteNull({ a: 1, b: null, c: undefined })).toEqual({ a: 1 });
        expect(Tools.stringAt(0)).toBe('A');
        expect(Tools.stringAt(26)).toBe('AA');
        expect(Tools.indexAt('A')).toBe(0);
        expect(Tools.indexAt('AA')).toBe(26);
        expect(Tools.deleteBlank(' a b\n c ')).toBe('abc');
        expect(Tools.deleteBlank()).toBeUndefined();
        expect(Tools.getClassName(new CustomProto())).toBe('CustomProto');
    });

    it('should merge, compare and clone complex values', () => {
        const merged = Tools.deepMerge(
            { a: { b: 1 }, list: [1], keep: true },
            { a: { c: 2 }, list: [2, 3], extra: 'x' }
        );
        expect(merged).toEqual({ a: { b: 1, c: 2 }, list: [2, 3], keep: true, extra: 'x' });
        expect(Tools.numberFixed(1.236, 2)).toBe(1.24);
        expect(Tools.diffValue([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
        expect(Tools.diffValue(new Date('2024-01-01'), new Date('2024-01-01'))).toBe(true);
        expect(Tools.diffValue(/a/i, /a/i)).toBe(true);
        expect(Tools.diffValue({ a: 1 }, { a: 2 })).toBe(false);

        const original = new CustomProto();
        const complex = {
            date: new Date('2024-01-01T00:00:00.000Z'),
            regexp: /test/gi,
            nested: [1, { x: 2 }],
            proto: original,
        };
        const cloned = Tools.deepClone(complex);

        expect(cloned).not.toBe(complex);
        expect(cloned.date).not.toBe(complex.date);
        expect(cloned.date.getTime()).toBe(complex.date.getTime());
        expect(cloned.regexp).not.toBe(complex.regexp);
        expect(cloned.regexp.toString()).toBe(complex.regexp.toString());
        expect(cloned.nested).not.toBe(complex.nested);
        expect(cloned.nested).toEqual(complex.nested);
        expect(cloned.proto).not.toBe(original);
        expect(Object.getPrototypeOf(cloned.proto)).toBe(CustomProto.prototype);
    });

    it('should expose type guards and primitive helpers', () => {
        expect(Tools.isDefine(0)).toBe(true);
        expect(Tools.isDefine(null)).toBe(false);
        expect(Tools.isBlank('   ')).toBe(true);
        expect(Tools.isBlank('x')).toBe(false);
        expect(Tools.isBlank(null)).toBe(true);
        expect(Tools.isPlainObject({ a: 1 })).toBe(true);
        expect(Tools.isPlainObject(new CustomProto())).toBe(false);
        expect(Tools.isDate(new Date())).toBe(true);
        expect(Tools.isRegExp(/a/)).toBe(true);
        expect(Tools.isArray([1])).toBe(true);
        expect(Tools.isString('x')).toBe(true);
        expect(Tools.isNumber(1)).toBe(true);
        expect(Tools.isStringNumber('1.2')).toBe(true);
        expect(Tools.isStringNumber('abc')).toBe(false);
        expect(Tools.isObject({})).toBe(true);
        expect(Tools.isEmptyObject({})).toBe(true);
        expect(Tools.isEmptyObject({ a: 1 })).toBe(false);
    });

    it('should handle collection and numeric helpers', () => {
        const input = { a: 1, b: null, c: { d: undefined, e: 2 } };

        expect(Tools.removeNull(input)).toEqual({ a: 1, c: { e: 2 } });
        expect(Tools.fillTwoDimensionalArray(2, 3, 'x')).toEqual([
            ['x', 'x', 'x'],
            ['x', 'x', 'x'],
        ]);
        expect(Tools.numToWord(27)).toBe('AA');
        expect(Tools.ABCatNum('AZ')).toBe(51);
        expect(Tools.ABCatNum('')).toBeNaN();
        expect(Tools.chatAtABC(51)).toBe('AZ');
        expect(Tools.commonExtend({ a: 1, b: 2 }, { b: null, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
        expect(Tools.hasIntersectionBetweenTwoRanges(1, 3, 3, 5)).toBe(true);
        expect(Tools.hasIntersectionBetweenTwoRanges(1, 2, 3, 4)).toBe(false);
        expect(Tools.isStartValidPosition('_name')).toBe(true);
        expect(Tools.isStartValidPosition('1name')).toBe(false);
        expect(Tools.isValidParameter('valid_name')).toBe(true);
        expect(Tools.isValidParameter('bad name')).toBe(false);
        expect(Tools.clamp(20, 1, 10)).toBe(10);
        expect(Tools.clamp(-1, 1, 10)).toBe(1);
    });

    it('should read timing, ids and wildcard regex helpers', () => {
        vi.spyOn(globalThis.performance, 'now').mockReturnValue(123.456);

        expect(Tools.now()).toBe(123.456);

        const customId = generateRandomId(6, 'ab');
        expect(customId).toMatch(/^[ab]{6}$/);
        expect(generateRandomId(5)).toHaveLength(5);

        const regex = createREGEXFromWildChar('file-??-*.ts');
        expect(regex.test('file-ab-index.ts')).toBe(true);
        expect(regex.test('file-a-index.ts')).toBe(false);
    });
});
