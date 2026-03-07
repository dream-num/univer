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
import { EMBEDDING_FORMULA_EDITOR, isEmbeddingFormulaEditor } from '../utils/is-embedding-formula-editor';
import { isRangeSelector, RANGE_SELECTOR_SYMBOLS } from '../utils/is-range-selector';

describe('editor utils', () => {
    it('should detect embedding formula editor unit ids', () => {
        expect(isEmbeddingFormulaEditor(`abc_${EMBEDDING_FORMULA_EDITOR}_xyz`)).toBe(true);
        expect(isEmbeddingFormulaEditor('normal-doc-id')).toBe(false);
    });

    it('should detect range selector unit ids', () => {
        expect(isRangeSelector(`abc_${RANGE_SELECTOR_SYMBOLS}_xyz`)).toBe(true);
        expect(isRangeSelector('normal-doc-id')).toBe(false);
    });
});
