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

import type { IDocumentBody } from '@univerjs/core';
import type { IFindQuery } from '@univerjs/find-replace';
import { CustomRangeType, DataStreamTreeTokenType } from '@univerjs/core';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { describe, expect, it } from 'vitest';
import { findDocRanges } from '../utils';

function query(findString: string, overrides: Partial<IFindQuery> = {}): IFindQuery {
    return {
        findString,
        replaceRevealed: true,
        caseSensitive: false,
        matchesTheWholeWord: false,
        matchesTheWholeCell: false,
        findDirection: FindDirection.ROW,
        findScope: FindScope.SUBUNIT,
        findBy: FindBy.VALUE,
        ...overrides,
    };
}

describe('findDocRanges', () => {
    it('matches literal text and respects case', () => {
        const body = { dataStream: 'Apple a.b apple\r\n' } as IDocumentBody;
        expect(findDocRanges(body, query('a.b'), false)).toEqual([
            { startOffset: 6, endOffset: 9, replaceable: true },
        ]);
        expect(findDocRanges(body, query('apple', { caseSensitive: true }), false)).toEqual([
            { startOffset: 10, endOffset: 15, replaceable: true },
        ]);
    });

    it('uses Docs word segmentation for English and Chinese', () => {
        expect(findDocRanges({ dataStream: 'cat scatter\r\n' }, query('cat', { matchesTheWholeWord: true }), false)).toHaveLength(1);
        expect(findDocRanges({ dataStream: '中文测试\r\n' }, query('中文', { matchesTheWholeWord: true }), false)).toHaveLength(1);
    });

    it('finds table text and marks whole entities non-replaceable', () => {
        const body: IDocumentBody = {
            dataStream: `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}target\r\n`,
            customRanges: [{
                startIndex: 3,
                endIndex: 8,
                rangeId: 'mention',
                rangeType: CustomRangeType.MENTION,
                wholeEntity: true,
            }],
        };

        expect(findDocRanges(body, query('target'), false)).toEqual([
            { startOffset: 3, endOffset: 9, replaceable: false },
        ]);
    });

    it('marks every match non-replaceable in a disabled document', () => {
        expect(findDocRanges({ dataStream: 'cat cat\r\n' }, query('cat'), true)).toEqual([
            { startOffset: 0, endOffset: 3, replaceable: false },
            { startOffset: 4, endOffset: 7, replaceable: false },
        ]);
    });

    it('maps matches in consumer-facing replacement text back to the native entity', () => {
        const body: IDocumentBody = {
            dataStream: 'A\uFFFCC\r\n',
            customRanges: [{
                startIndex: 1,
                endIndex: 1,
                rangeId: 'formula-1',
                rangeType: CustomRangeType.CUSTOM,
                wholeEntity: true,
            }],
        };

        expect(findDocRanges(body, query('42'), false, {
            text: 'A42C\r\n',
            characters: [
                { startOffset: 0, endOffset: 1, replaceable: true },
                { startOffset: 1, endOffset: 2, replaceable: false },
                { startOffset: 1, endOffset: 2, replaceable: false },
                { startOffset: 2, endOffset: 3, replaceable: true },
                { startOffset: 3, endOffset: 4, replaceable: true },
                { startOffset: 4, endOffset: 5, replaceable: true },
            ],
        })).toEqual([
            { startOffset: 1, endOffset: 2, replaceable: false },
        ]);
    });
});
