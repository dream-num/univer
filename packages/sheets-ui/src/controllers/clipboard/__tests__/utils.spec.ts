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

import { CanceledError, ErrorService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { createPasteFormulaParser } from '../utils';

describe('external paste formula validation', () => {
    it('reports the source of each invalid formula and accepts valid input', () => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        try {
            const injector = univer.__getInjector();
            const messages: string[] = [];
            injector.get(ErrorService).error$.subscribe(({ errorKey }) => messages.push(errorKey));
            const parse = createPasteFormulaParser(injector);
            expect(parse('=SUM({1,2;3,4})')).toBe('=SUM({1,2;3,4})');
            expect(() => parse('=SUM({1,2;3})')).toThrow(CanceledError);
            expect(() => parse('=SUM(A1;A2)')).toThrow(CanceledError);
            const locale = injector.get(LocaleService);
            expect(messages).toEqual([
                locale.t('sheets-ui.definedName.formulaOrRefStringInvalid'),
                locale.t('sheets-ui.info.formulaSeparator', '=SUM(1.5,2.5)'),
            ]);
        } finally {
            univer.dispose();
        }
    });
});
