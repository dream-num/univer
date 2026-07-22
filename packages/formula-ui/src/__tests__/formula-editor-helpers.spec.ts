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

import { FunctionType, matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import {
    findFormulaStructuredReferences,
    getFormulaHighlightDataStream,
    getFormulaReplaceResult,
    resolveFormulaReferenceEditingContext,
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
});
