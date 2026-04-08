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

import { matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { filterReferenceNode, isComma, isReference } from '../filter-reference-node';
import { verifyRange } from '../verify-range';

const referenceNode = { nodeType: sequenceNodeType.REFERENCE, token: 'A1' };
const functionNode = { nodeType: sequenceNodeType.FUNCTION, token: 'SUM' };

describe('range selector utils', () => {
    it('keeps only commas and reference nodes when extracting ranges from a parsed formula', () => {
        expect(isComma(matchToken.COMMA)).toBe(true);
        expect(isComma(';')).toBe(false);
        expect(isReference(referenceNode as never)).toBe(true);
        expect(isReference(functionNode as never)).toBe(false);
        expect(filterReferenceNode([functionNode as never, matchToken.COMMA, referenceNode as never])).toEqual([
            matchToken.COMMA,
            referenceNode,
        ]);
    });

    it('accepts only reference-and-comma sequences as a valid range selection', () => {
        expect(verifyRange([referenceNode as never, matchToken.COMMA, referenceNode as never])).toBe(true);
        expect(verifyRange([referenceNode as never, functionNode as never])).toBe(false);
        expect(verifyRange([referenceNode as never, ';'])).toBe(false);
    });
});
