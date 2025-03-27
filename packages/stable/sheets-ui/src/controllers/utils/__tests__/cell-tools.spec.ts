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
import { extractStringFromForceString, isForceString } from '../cell-tools';

describe('Test cell tools', () => {
    it('Function isForceString', () => {
        let str = "'test";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('test');

        str = "'1";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('1');

        str = "'=SUM";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('=SUM');

        str = "''";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe("'");

        str = "'1e+3";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('1e+3');

        str = "'-1";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('-1');

        str = '\'"2"';
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('"2"');

        str = "'0";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('0');

        str = "'null";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('null');

        str = "'1e";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('1e');

        str = "'.2";
        expect(isForceString(str)).toBeTruthy();
        expect(extractStringFromForceString(str)).toBe('.2');

        expect(isForceString('=sum')).toBeFalsy();
        expect(isForceString('1')).toBeFalsy();
        expect(isForceString('test')).toBeFalsy();
    });
});
