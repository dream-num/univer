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

import type { ITextRange } from '../../../../../sheets/typedef';
import { describe, expect, it } from 'vitest';
import { makeSelection, normalizeSelection } from '../selection';

describe('makeSelection', () => {
    it('should create a collapsed selection when only startOffset is provided', () => {
        const startOffset = 5;
        const expected: ITextRange = { startOffset, endOffset: startOffset, collapsed: true };
        const result = makeSelection(startOffset);
        expect(result).toEqual(expected);
    });

    it('should create a selection with startOffset and endOffset when both are provided', () => {
        const startOffset = 5;
        const endOffset = 10;
        const expected: ITextRange = { startOffset, endOffset, collapsed: false };
        const result = makeSelection(startOffset, endOffset);
        expect(result).toEqual(expected);
    });

    it('should create a collapsed selection when startOffset equals endOffset', () => {
        const startOffset = 5;
        const endOffset = 5;
        const expected: ITextRange = { startOffset, endOffset, collapsed: true };
        const result = makeSelection(startOffset, endOffset);
        expect(result).toEqual(expected);
    });

    it('should throw an error when endOffset is less than startOffset', () => {
        const startOffset = 10;
        const endOffset = 5;
        expect(() => makeSelection(startOffset, endOffset)).toThrowError(
            `Cannot make a doc selection when endOffset ${endOffset} is less than startOffset ${startOffset}.`
        );
    });
});

describe('normalizeSelection', () => {
    it('should normalize selection with startOffset less than endOffset', () => {
        const selection: ITextRange = { startOffset: 5, endOffset: 10, collapsed: false };
        const expected: ITextRange = { startOffset: 5, endOffset: 10, collapsed: false };
        const result = normalizeSelection(selection);
        expect(result).toEqual(expected);
    });

    it('should normalize selection with startOffset greater than endOffset', () => {
        const selection: ITextRange = { startOffset: 10, endOffset: 5, collapsed: false };
        const expected: ITextRange = { startOffset: 5, endOffset: 10, collapsed: false };
        const result = normalizeSelection(selection);
        expect(result).toEqual(expected);
    });

    it('should normalize selection with startOffset equal to endOffset', () => {
        const selection: ITextRange = { startOffset: 5, endOffset: 5, collapsed: true };
        const expected: ITextRange = { startOffset: 5, endOffset: 5, collapsed: true };
        const result = normalizeSelection(selection);
        expect(result).toEqual(expected);
    });

    it('should retain the collapsed property', () => {
        const selection: ITextRange = { startOffset: 10, endOffset: 5, collapsed: true };
        const expected: ITextRange = { startOffset: 5, endOffset: 10, collapsed: true };
        const result = normalizeSelection(selection);
        expect(result).toEqual(expected);
    });
});
