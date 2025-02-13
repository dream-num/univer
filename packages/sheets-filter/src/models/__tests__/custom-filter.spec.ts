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
import { equals, greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo, notEquals, textMatch } from '../custom-filters';

describe('Test custom filter functions', () => {
    describe('Test "greaterThan" operator', () => {
        it('filter out values if there are not of type number', () => {
            expect(greaterThan.fn('1', 0)).toBeFalsy();
        });

        it('should execute "greaterThan" correctly', () => {
            expect(greaterThan.fn(1, 0)).toBeTruthy();
            expect(greaterThan.fn(0, 0)).toBeFalsy();
            expect(greaterThan.fn(-1, 0)).toBeFalsy();
        });
    });

    describe('Test "greaterThanOrEqual" operator', () => {
        it('filter out values if there are not of type number', () => {
            expect(greaterThanOrEqualTo.fn('1', 0)).toBeFalsy();
        });

        it('should execute "greaterThanOrEqual" correctly', () => {
            expect(greaterThanOrEqualTo.fn(1, 0)).toBeTruthy();
            expect(greaterThanOrEqualTo.fn(0, 0)).toBeTruthy();
            expect(greaterThanOrEqualTo.fn(-1, 0)).toBeFalsy();
        });
    });

    describe('Test "lessThan" operator', () => {
        it('filter out values if there are not of type number', () => {
            expect(lessThan.fn('1', 0)).toBeFalsy();
        });

        it('should execute "lessThan" correctly', () => {
            expect(lessThan.fn(1, 0)).toBeFalsy();
            expect(lessThan.fn(0, 0)).toBeFalsy();
            expect(lessThan.fn(-1, 0)).toBeTruthy();
        });
    });

    describe('Test "lessThanOrEqual" operator', () => {
        it('filter out values if there are not of type number', () => {
            expect(lessThanOrEqualTo.fn('1', 0)).toBeFalsy();
        });

        it('should execute "lessThanOrEqual" correctly', () => {
            expect(lessThanOrEqualTo.fn(1, 0)).toBeFalsy();
            expect(lessThanOrEqualTo.fn(0, 0)).toBeTruthy();
            expect(lessThanOrEqualTo.fn(-1, 0)).toBeTruthy();
        });
    });

    describe('Test "equals" operator', () => {
        it('filter out values if there are not of type number', () => {
            expect(equals.fn('0', 0)).toBeFalsy();
        });

        it('should execute "equals" correctly', () => {
            expect(equals.fn(1, 0)).toBeFalsy();
            expect(equals.fn(0, 0)).toBeTruthy();
            expect(equals.fn(-1, 0)).toBeFalsy();
        });
    });

    describe('Test "notEquals" operator', () => {
        it('should not filter out values if there are not of type number', () => {
            expect(notEquals.fn('0', 0)).toBeTruthy();
        });

        it('should execute "notEquals" correctly', () => {
            expect(notEquals.fn(1, 0)).toBeTruthy();
            expect(notEquals.fn(0, 0)).toBeFalsy();
            expect(notEquals.fn(-1, 0)).toBeTruthy();
        });

        it('should "notEquals" implement support matching strings if `compare` is a string', () => {
            // equivalent to "notContains"
            expect(notEquals.fn(123, '*123*')).toBeFalsy();
            expect(notEquals.fn('12', '*123*')).toBeTruthy();
        });
    });

    describe('Test text match operator', () => {
        it('should execute "textMatch" correctly', () => {
            // equivalent to "startsWith"
            expect(textMatch.fn('hello world', 'hello*')).toBeTruthy();
            expect(textMatch.fn('hello', 'hello*')).toBeTruthy();
            expect(textMatch.fn('hell', 'hello*')).toBeFalsy();

            // equivalent to "endsWith"
            expect(textMatch.fn('hello world', '*world')).toBeTruthy();
            expect(textMatch.fn('world', '*world')).toBeTruthy();
            expect(textMatch.fn('wrld', '*world')).toBeFalsy();

            // equivalent to "contains"
            expect(textMatch.fn('hello world', '*llo w*')).toBeTruthy();
            expect(textMatch.fn('hell world', '*llo w*')).toBeFalsy();
        });

        it('should support "?" wild card', () => {
            expect(textMatch.fn('hello', 'hell?')).toBeTruthy();
            expect(textMatch.fn('helloooo', 'hell?')).toBeFalsy();
            expect(textMatch.fn('helloooo', 'hell?ooo')).toBeTruthy();
            expect(textMatch.fn('hello world', 'hell?')).toBeFalsy();
            expect(textMatch.fn('hello', '?hell?')).toBeFalsy();
            expect(textMatch.fn('yhell', '?hell?')).toBeFalsy();

            expect(textMatch.fn('hello111', '*hello?*')).toBeTruthy();
            expect(textMatch.fn('hello111\r\n', '*hello?*')).toBeFalsy();
            expect(textMatch.fn('hello111\r\n'.trimEnd(), '*hello?*')).toBeTruthy();
            expect(textMatch.fn('hello', '*hello?*')).toBeFalsy();
        });
    });
});
