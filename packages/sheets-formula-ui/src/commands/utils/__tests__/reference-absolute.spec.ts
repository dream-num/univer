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

import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { toggleReferenceAbsoluteAtCursor } from '../reference-absolute';

describe('toggleReferenceAbsoluteAtCursor', () => {
    const lexerTreeBuilder = new LexerTreeBuilder();

    it('cycles a single reference through all Excel absolute states', () => {
        let formulaText = '=A1';
        let cursorOffset = formulaText.length;

        const expectedCycle = ['=$A$1', '=A$1', '=$A1', '=A1'];

        for (const expectedFormulaText of expectedCycle) {
            const nextState = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, formulaText, cursorOffset);

            expect(nextState).not.toBeNull();
            expect(nextState!.formulaText).toBe(expectedFormulaText);

            formulaText = nextState!.formulaText;
            cursorOffset = nextState!.cursorOffset;
        }
    });

    it('cycles the cell part of a cross-sheet reference', () => {
        const nextState = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=Sheet2!B5', '=Sheet2!B'.length);

        expect(nextState).toEqual({
            formulaText: '=Sheet2!$B$5',
            cursorOffset: '=Sheet2!B'.length,
        });
    });

    it('cycles only the referenced side of a range based on cursor position', () => {
        const startSide = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=A1:B2', '=A'.length);
        const endSide = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=A1:B2', '=A1:'.length + 1);

        expect(startSide?.formulaText).toBe('=$A$1:B2');
        expect(endSide?.formulaText).toBe('=A1:$B$2');
    });

    it('cycles both sides when the caret is adjacent to the range separator', () => {
        const beforeColon = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=A1:B2', '=A1'.length);
        const afterColon = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=A1:B2', '=A1:'.length);

        expect(beforeColon?.formulaText).toBe('=$A$1:$B$2');
        expect(afterColon?.formulaText).toBe('=$A$1:$B$2');
        expect(beforeColon?.cursorOffset).toBe('=$A$1'.length);
        expect(afterColon?.cursorOffset).toBe('=$A$1:'.length);
    });

    it('keeps cycling both sides on repeated F4 presses at the range separator', () => {
        let formulaText = '=A1:B2';
        let cursorOffset = '=A1'.length;

        const expectedCycle = ['=$A$1:$B$2', '=A$1:B$2', '=$A1:$B2', '=A1:B2'];

        for (const expectedFormulaText of expectedCycle) {
            const nextState = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, formulaText, cursorOffset);

            expect(nextState?.formulaText).toBe(expectedFormulaText);

            formulaText = nextState!.formulaText;
            cursorOffset = nextState!.cursorOffset;
        }
    });

    it('the reference is row or column only', () => {
        const rowReference = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=1:1', '=1'.length);
        const columnReference = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=A:A', '=A'.length);

        expect(rowReference?.formulaText).toBe('=$1:$1');
        expect(columnReference?.formulaText).toBe('=$A:$A');
    });

    it('handles references at formula boundaries', () => {
        const startBoundary = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=A1+SUM(B2)', '=A1'.length);
        const endBoundary = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=SUM(1)+B2', '=SUM(1)+B2'.length);

        expect(startBoundary?.formulaText).toBe('=$A$1+SUM(B2)');
        expect(endBoundary?.formulaText).toBe('=SUM(1)+$B$2');
    });

    it('returns null when the cursor is not on a cell reference', () => {
        expect(toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=SUM(1, 2)', '=SUM('.length)).toBeNull();
        expect(toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '="A1"', '="'.length + 1)).toBeNull();
        expect(toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=namedRange', '=named'.length)).toBeNull();
        expect(toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '', 0)).toBeNull();
        expect(toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, '=1', 1)).toBeNull();
    });
});
