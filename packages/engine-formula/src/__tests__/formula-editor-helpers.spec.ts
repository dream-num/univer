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

import { describe, expect, it, vi } from 'vitest';
import { FunctionType } from '../basics/function';
import { matchToken } from '../basics/token';
import { sequenceNodeType } from '../engine/utils/sequence';
import {
    buildFormulaTextRuns,
    findFormulaStructuredReferences,
    getFormulaHighlightDataStream,
    getFormulaReplaceResult,
    isFormulaReferenceAddingTextContext,
    resolveFormulaReferenceEditingContext,
    shouldSkipReferenceInsertion,
} from '../formula-editor-helpers';

describe('formula editor helpers', () => {
    it('replaces a partial function and appends its opening bracket', () => {
        expect(getFormulaReplaceResult(['SU'], 0, 'SUM', FunctionType.Math)).toEqual({
            text: `SUM${matchToken.OPEN_BRACKET}`,
            offset: -2,
        });
    });

    it('does not append a bracket for table references', () => {
        expect(getFormulaReplaceResult(['SalesTa'], 0, 'SalesTable', FunctionType.Table)).toEqual({
            text: 'SalesTable',
            offset: -3,
        });
    });

    it('serializes parsed references into an editor document stream', () => {
        const nodes = [{
            token: '[Book]Sheet1!A1',
            nodeType: sequenceNodeType.REFERENCE,
            startIndex: 0,
            endIndex: 15,
        }];

        expect(getFormulaHighlightDataStream('=', nodes)).toBe('=[Book]Sheet1!A1\r\n');
    });

    it('uses the same cursor rules for adding and replacing references', () => {
        const reference = {
            token: 'A1:B2',
            nodeType: sequenceNodeType.REFERENCE,
            startIndex: 4,
            endIndex: 8,
        };
        const sequenceNodes = ['SUM(', reference, '+'];

        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'SUM(A1:B2+',
            sequenceNodes,
            offset: 4,
        })).toMatchObject({ mode: 'add', referenceIndex: -1 });
        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'SUM(A1:B2+',
            sequenceNodes,
            offset: 9,
        })).toMatchObject({ mode: 'replace', referenceIndex: 0 });
        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'SUM(A1:B2+',
            sequenceNodes,
            offset: 10,
        })).toMatchObject({ mode: 'add', referenceIndex: -1 });
    });

    it('does not draw a reference in plain formula text', () => {
        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'SUM',
            sequenceNodes: ['SUM'],
            offset: 3,
        })).toMatchObject({ mode: 'none', referenceIndex: -1 });
    });

    it('allows adding a reference when the cursor is before the first sequence node', () => {
        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'SUM(A1)',
            sequenceNodes: [
                'SUM(',
                {
                    token: 'A1',
                    nodeType: sequenceNodeType.REFERENCE,
                    startIndex: 4,
                    endIndex: 5,
                },
                ')',
            ],
            offset: 0,
        })).toMatchObject({
            mode: 'add',
            nodeIndex: -1,
            referenceIndex: -1,
        });
    });

    it('edits structured table references as selectable references', () => {
        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'SUM(SalesTable[Amount])',
            sequenceNodes: [
                'SUM(',
                {
                    token: 'SalesTable[Amount]',
                    nodeType: sequenceNodeType.TABLE,
                    startIndex: 4,
                    endIndex: 21,
                },
                ')',
            ],
            offset: 10,
        })).toMatchObject({ mode: 'replace', referenceIndex: 0 });
    });

    it('finds cross-unit structured references that are not resolved by the local table map', () => {
        expect(findFormulaStructuredReferences('SUM([Sales Base]!Orders[Amount])')).toEqual([{
            token: '[Sales Base]!Orders[Amount]',
            startIndex: 4,
            endIndex: 30,
        }]);
    });

    // https://github.com/dream-num/univer/issues/7676
    it('allows adding a reference after a space following a comma', () => {
        expect(isFormulaReferenceAddingTextContext('SUM(A1, ', 8)).toBe(true);
    });

    // https://github.com/dream-num/univer/issues/7676
    it('allows adding a reference after a line break', () => {
        expect(isFormulaReferenceAddingTextContext('IF(\r\n', 5)).toBe(true);
        expect(isFormulaReferenceAddingTextContext('IF(\n', 4)).toBe(true);
        expect(isFormulaReferenceAddingTextContext('IF(\r\n  ', 7)).toBe(true);
    });

    // https://github.com/dream-num/univer/issues/7676
    it('does not allow adding a reference after a completed formula on a new line', () => {
        expect(isFormulaReferenceAddingTextContext('SUM(A1)\r\n', 9)).toBe(false);
        expect(isFormulaReferenceAddingTextContext('SUM(A1) ', 9)).toBe(true);
    });

    // https://github.com/dream-num/univer/issues/7676
    it('resolves add mode when the cursor is after a line break', () => {
        expect(resolveFormulaReferenceEditingContext({
            formulaText: 'IF(\r\n',
            sequenceNodes: ['IF', '('],
            offset: 5,
        })).toMatchObject({ mode: 'add', referenceIndex: -1 });
    });

    // https://github.com/dream-num/univer/issues/7676
    it('does not skip insertion when the cursor is past the last node but the text allows a reference', () => {
        expect(shouldSkipReferenceInsertion(-1, 2, 'SUM(A1, ', 8)).toBe(false);
        expect(shouldSkipReferenceInsertion(-1, 2, 'IF(\r\n', 5)).toBe(false);
    });

    // https://github.com/dream-num/univer/issues/7676
    it('skips insertion when the cursor is past the last node and the text disallows a reference', () => {
        expect(shouldSkipReferenceInsertion(-1, 2, 'SUM(A1)\r\n', 9)).toBe(true);
    });

    it('does not skip insertion when the cursor is on a sequence node or there are no nodes', () => {
        expect(shouldSkipReferenceInsertion(0, 2, 'SUM(A1)\r\n', 9)).toBe(false);
        expect(shouldSkipReferenceInsertion(-1, 0, 'SUM(A1, ', 8)).toBe(false);
    });
});

describe('engine-formula regression scenarios', () => {
    it('preserves incomplete formula editor text while applying token highlights', () => {
        expect(getFormulaHighlightDataStream('=', [
            'SUM(',
            { token: 'D37', nodeType: sequenceNodeType.REFERENCE, startIndex: 4, endIndex: 6 },
            ',',
            { token: 'F40', nodeType: sequenceNodeType.REFERENCE, startIndex: 8, endIndex: 10 },
        ], 'SUM(D37,F40,J36,J42')).toBe('=SUM(D37,F40,J36,J42\r\n');
    });

    it('builds colored text runs for references, numbers, strings, arrays, defined names, and plain text', () => {
        const result = buildFormulaTextRuns(
            { hasDefinedNameDescription: vi.fn((token: string) => token === 'SalesTotal') } as never,
            {
                formulaRefColors: ['#ff0000', '#00ff00'],
                numberColor: '#0000ff',
                stringColor: '#ff00ff',
                plainTextColor: '#111111',
            },
            [
                'SUM(',
                { token: 'A1', nodeType: sequenceNodeType.REFERENCE, startIndex: 4, endIndex: 5 },
                ',',
                { token: '42', nodeType: sequenceNodeType.NUMBER, startIndex: 7, endIndex: 8 },
                { token: '"ok"', nodeType: sequenceNodeType.STRING, startIndex: 9, endIndex: 12 },
                { token: '{1,2}', nodeType: sequenceNodeType.ARRAY, startIndex: 13, endIndex: 17 },
                { token: 'SalesTotal', nodeType: sequenceNodeType.DEFINED_NAME, startIndex: 18, endIndex: 27 },
                { token: '+', nodeType: sequenceNodeType.NORMAL, startIndex: 28, endIndex: 28 },
                { token: 'A1', nodeType: sequenceNodeType.REFERENCE, startIndex: 29, endIndex: 30 },
            ]
        );

        expect(result.refSelections).toEqual([
            expect.objectContaining({ token: 'A1', themeColor: '#ff0000', refIndex: 1, index: 0 }),
            expect.objectContaining({ token: 'A1', themeColor: '#ff0000', refIndex: 8, index: 1 }),
        ]);
        expect(result.textRuns.map((run) => run.ts?.cl?.rgb)).toEqual([
            '#111111',
            '#ff0000',
            '#111111',
            '#0000ff',
            '#ff00ff',
            '#ff00ff',
            '#111111',
            '#111111',
            '#ff0000',
        ]);
    });
});
