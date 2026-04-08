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

import type { LocaleService } from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FunctionType } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { generateParam, getFunctionName, getFunctionTypeValues } from '../utils';

describe('formula service utils', () => {
    const localeService = {
        t: (key: string) => {
            const dictionary: Record<string, string> = {
                'formula.functionType.math': 'Math',
                'formula.functionType.logical': 'Logical',
                'formula.alias.sum': '求和',
            };

            return dictionary[key] ?? key;
        },
    } as LocaleService;

    it('builds function type options and excludes unsupported groups for built-in formulas', () => {
        const values = getFunctionTypeValues(localeService, false);
        const labels = new Set(values.map((item) => item.label));
        const builtInValues = new Set(values.map((item) => item.value));

        expect(labels.has('Math')).toBe(true);
        expect(labels.has('Logical')).toBe(true);
        expect(builtInValues.has(`${FunctionType.User}`)).toBe(false);
        expect(builtInValues.has(`${FunctionType.DefinedName}`)).toBe(false);
        expect(builtInValues.has(`${FunctionType.Table}`)).toBe(false);
        expect(getFunctionTypeValues(localeService, true).some((item) => item.value === `${FunctionType.User}`)).toBe(true);
    });

    it('prefers localized aliases but falls back to the raw function name', () => {
        expect(getFunctionName({ functionName: 'SUM', aliasFunctionName: 'formula.alias.sum' } as IFunctionInfo, localeService)).toBe('求和');
        expect(getFunctionName({ functionName: 'COUNTIF', aliasFunctionName: 'formula.alias.unknown' } as IFunctionInfo, localeService)).toBe('COUNTIF');
        expect(getFunctionName({ functionName: 'MAX' } as IFunctionInfo, localeService)).toBe('MAX');
    });

    it('formats required, optional, and repeated parameters for the function helper UI', () => {
        expect(generateParam({ name: 'number1', require: false, repeat: false } as never)).toBe('[number1]');
        expect(generateParam({ name: 'number1', require: true, repeat: false } as never)).toBe('number1');
        expect(generateParam({ name: 'criteria', require: false, repeat: true } as never)).toBe('[criteria,...]');
        expect(generateParam({ name: 'value', require: true, repeat: true } as never)).toBe('value,...');
    });
});
