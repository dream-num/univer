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

import { RANGE_TYPE } from '@univerjs/core';
import { matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { filterReferenceNode, isComma, isReference } from '../filter-reference-node';
import { findIndexFromSequenceNodes, findRefSequenceIndex } from '../find-index-from-sequence-nodes';
import { getOffsetFromSequenceNodes } from '../get-offset-from-sequence-nodes';
import { rangePreProcess } from '../range-pre-process';
import { sequenceNodeToText } from '../sequence-node-to-text';
import { getSheetIdByName, getSheetNameById, unitRangesToText } from '../unit-ranges-to-text';
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

    it('uses the range selector guard to reject typed text that is not a range list', () => {
        expect(verifyRange([referenceNode as never, matchToken.COMMA, referenceNode as never])).toBe(true);
        expect(verifyRange([referenceNode as never, '+', referenceNode as never])).toBe(false);
        expect(verifyRange([referenceNode as never, functionNode as never])).toBe(false);
    });

    it('rebuilds typed range text with separators when editing multiple references', () => {
        expect(sequenceNodeToText([
            { nodeType: sequenceNodeType.REFERENCE, token: 'A1:B2' } as never,
            matchToken.COMMA,
            { nodeType: sequenceNodeType.REFERENCE, token: "'Data Sheet'!D3" } as never,
        ])).toBe("A1:B2,'Data Sheet'!D3");
    });

    it('maps editor cursor offsets back to the parsed range token and reference ordinal', () => {
        const nodes = [
            { nodeType: sequenceNodeType.REFERENCE, token: 'A1:B2' },
            matchToken.COMMA,
            { nodeType: sequenceNodeType.REFERENCE, token: "'Data Sheet'!D3" },
        ] as never[];

        expect(getOffsetFromSequenceNodes(nodes)).toBe("A1:B2,'Data Sheet'!D3".length);
        expect(findIndexFromSequenceNodes(nodes, 5)).toBe(0);
        expect(findIndexFromSequenceNodes(nodes, 8, false)).toBe(2);
        expect(findIndexFromSequenceNodes(nodes, 3)).toBe(-1);
        expect(findRefSequenceIndex(nodes, 2)).toBe(1);
        expect(findRefSequenceIndex(nodes, 1)).toBe(-1);
    });

    it('serializes selected ranges with sheet and workbook qualifiers only when the formula needs them', () => {
        const ranges = [
            {
                unitId: 'book-1',
                sheetName: 'Sheet1',
                range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
            },
            {
                unitId: 'book-1',
                sheetName: 'Data Sheet',
                range: { startRow: 2, endRow: 2, startColumn: 3, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
            },
        ];

        expect(unitRangesToText(ranges, false, 'Sheet1')).toEqual(['A1:B2', 'D3']);
        expect(unitRangesToText(ranges, true, 'Sheet1')).toEqual(['A1:B2', "'Data Sheet'!D3"]);
        expect(unitRangesToText(ranges, true, 'Sheet1', true)).toEqual(["'[book-1]Sheet1'!A1:B2", "'[book-1]Data Sheet'!D3"]);
    });

    it('resolves sheet ids and names through the current workbook when serializing references', () => {
        const workbook = {
            getSheetBySheetName: (name: string) => name === 'Data Sheet' ? { getSheetId: () => 'sheet-data' } : undefined,
            getSheetBySheetId: (sheetId: string) => sheetId === 'sheet-data' ? { getName: () => 'Data Sheet' } : undefined,
        };
        const univerInstanceService = {
            getUnit: (unitId: string) => unitId === 'book-1' ? workbook : undefined,
        };

        expect(getSheetIdByName(univerInstanceService as never, 'book-1', 'Data Sheet')).toBe('sheet-data');
        expect(getSheetNameById(univerInstanceService as never, 'book-1', 'sheet-data')).toBe('Data Sheet');
        expect(getSheetIdByName(univerInstanceService as never, 'book-1', 'Missing')).toBe('');
        expect(getSheetNameById(univerInstanceService as never, 'missing-book', 'sheet-data')).toBe('');
    });

    it('normalizes a reverse-dragged range before the selector confirms it', () => {
        expect(rangePreProcess({
            startRow: 8,
            endRow: 2,
            startColumn: 5,
            endColumn: 1,
        })).toEqual({
            startRow: 2,
            endRow: 8,
            startColumn: 1,
            endColumn: 5,
        });
    });
});
