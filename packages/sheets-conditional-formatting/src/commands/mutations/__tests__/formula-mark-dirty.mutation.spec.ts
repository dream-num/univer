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
import { ConditionalFormattingFormulaMarkDirty } from '../formula-mark-dirty.mutation';

describe('ConditionalFormattingFormulaMarkDirty', () => {
    it('accepts dirty formula maps as a command message', () => {
        expect(ConditionalFormattingFormulaMarkDirty.handler({} as never, {
            'book-1': {
                'sheet-1': {
                    'cf-1_=A1>0': true,
                },
            },
        })).toBe(true);
    });
});
