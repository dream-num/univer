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
import { ALL_IMPLEMENTED_FUNCTIONS } from '..';
import { excelArgumentAcceptsRange } from '../implicit-intersection-arguments';

describe('Excel argument implicit intersection', () => {
    it('classifies every registered Excel worksheet function with ordinary arguments', () => {
        const unclassified = ALL_IMPLEMENTED_FUNCTIONS.map(([, name]) => name)
            .filter((name) => excelArgumentAcceptsRange(name, 0, 1) === undefined);
        expect([...new Set(unclassified)].sort()).toEqual([
            // Operators, reference syntax and lexical bindings have their own AST evaluation.
            'ANCHORARRAY',
            'COMPARE',
            'CUBE',
            'DIVIDED',
            'IF',
            'LAMBDA',
            'LET',
            'MINUS',
            'MULTIPLY',
            'PLUS',
            '_TRO_ALL',
            '_TRO_LEADING',
            '_TRO_TRAILING',
            // No arguments or external image data.
            'FALSE',
            'IMAGE',
            'NA',
            'NOW',
            'PI',
            'RAND',
            'TODAY',
            'TRUE',
            // Additional worksheet functions outside Excel's built-in function set.
            'ARRAY_CONSTRAIN',
            'AVERAGE.WEIGHTED',
            'EPOCHTODATE',
            'FLATTEN',
            'IMCOTH',
            'IMLOG',
            'IMTANH',
            'ISBETWEEN',
            'ISDATE',
            'ISEMAIL',
            'ISURL',
            'MARGINOFERROR',
            'REGEXMATCH',
            'ROUNDBANK',
            'TO_DATE',
        ].sort());
    });

    it('distinguishes a repeating criteria pair and the optional final SWITCH default', () => {
        expect(excelArgumentAcceptsRange('SUMIFS', 253, 255)).toBe(true);
        expect(excelArgumentAcceptsRange('SUMIFS', 254, 255)).toBe(false);
        expect(excelArgumentAcceptsRange('SWITCH', 3, 4)).toBe(true);
        expect(excelArgumentAcceptsRange('SWITCH', 3, 5)).toBe(false);
        expect(excelArgumentAcceptsRange('CUSTOM_FN', 0, 1)).toBeUndefined();
    });
});
