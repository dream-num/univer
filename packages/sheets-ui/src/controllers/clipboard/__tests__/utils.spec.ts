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

import { CellValueType, LocaleType, Univer } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { createPasteFormulaParser } from '../utils';

describe('external paste formula validation', () => {
    it('keeps invalid pasted formulas as text, including unrecognized separators', () => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            const injector = univer.__getInjector();
            const parse = createPasteFormulaParser(injector);
            expect(parse('=SUM({1,2;3,4})').f).toBe('=SUM({1,2;3,4})');
            expect(parse('=BOGUS(1)').f).toBe('=BOGUS(1)');
            for (const text of ['=SUM({1,2;3})', '=SUM(A1;A2)', '=SUM(A1,A2;A3)', '=1+', '=1+*2', '=SUM("1,5";A2)']) {
                expect(parse(text)).toEqual({ f: null, v: text, t: CellValueType.STRING });
            }
        } finally {
            univer.dispose();
        }
    });
});
