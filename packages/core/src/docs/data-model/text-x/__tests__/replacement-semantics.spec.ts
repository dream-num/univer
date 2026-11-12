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

import type { IDocumentBody, IParagraph, ITextStyle } from '../../../../types/interfaces/i-document-data';
import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { PresetListType } from '../../preset-list-type';
import { ActionIterator } from '../action-iterator';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';
import { composeBody } from '../utils';

function apply(body: IDocumentBody, actions: TextXAction[]): IDocumentBody {
    return TextX.apply(structuredClone(body), structuredClone(actions));
}

function getHeadingParagraph(): IParagraph {
    return {
        startIndex: 1,
        paragraphId: 'para_first',
        headingCollapsed: true,
        styleId: 'heading-1',
        paragraphStyle: { outlineLevel: 1, lineSpacing: 2 },
        bullet: {
            listId: 'list-1',
            listType: PresetListType.BULLET_LIST,
            nestingLevel: 0,
            textStyle: {},
        },
    };
}

describe('paragraph replacement composition', () => {
    it.each([{}, { paragraphStyle: {} }])('clears omitted paragraph fields when replacing with %j', (attributes) => {
        const first: IDocumentBody = { dataStream: '', paragraphs: [getHeadingParagraph()] };
        const second: IDocumentBody = {
            dataStream: '',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_replacement', ...attributes }],
        };
        const originalFirst = structuredClone(first);
        const originalSecond = structuredClone(second);

        const composed = composeBody(first, second, UpdateDocsAttributeType.REPLACE);

        expect(composed.paragraphs).toEqual(second.paragraphs);
        expect(first).toEqual(originalFirst);
        expect(second).toEqual(originalSecond);
    });

    it('preserves the existing paragraph ID when a legacy replacement omits it', () => {
        // Older retain updates can omit IDs even though document snapshots require them.
        const replacement = { dataStream: '', paragraphs: [{ startIndex: 1 }] } as IDocumentBody;

        expect(composeBody(
            { dataStream: '', paragraphs: [getHeadingParagraph()] },
            replacement,
            UpdateDocsAttributeType.REPLACE
        ).paragraphs).toEqual([{ startIndex: 1, paragraphId: 'para_first' }]);
    });

    it.each([
        { paragraphs: [] },
        { paragraphs: [{ startIndex: 2, paragraphId: 'middle' }] },
        { paragraphs: [{ startIndex: 0, paragraphId: 'before' }, { startIndex: 4, paragraphId: 'after' }] },
    ])('keeps only explicitly supplied replacement paragraphs: $paragraphs', ({ paragraphs }) => {
        const previous = [1, 2, 3].map((startIndex) => ({ startIndex, paragraphId: `previous-${startIndex}` }));

        expect(composeBody(
            { dataStream: '', paragraphs: previous },
            { dataStream: '', paragraphs },
            UpdateDocsAttributeType.REPLACE
        ).paragraphs).toEqual(paragraphs);
    });

    it('preserves paragraphs when a replacement does not write the paragraph array', () => {
        const paragraphs = [getHeadingParagraph()];

        expect(composeBody(
            { dataStream: '', paragraphs },
            { dataStream: '', textRuns: [{ st: 0, ed: 1, ts: { bl: BooleanNumber.FALSE } }] },
            UpdateDocsAttributeType.REPLACE
        ).paragraphs).toEqual(paragraphs);
    });

    it('still merges paragraph fields for COVER updates', () => {
        const paragraph = getHeadingParagraph();
        const result = composeBody(
            { dataStream: '', paragraphs: [structuredClone(paragraph)] },
            { dataStream: '', paragraphs: [{ startIndex: 1, paragraphId: 'para_first', paragraphStyle: { lineSpacing: 3 } }] },
            UpdateDocsAttributeType.COVER
        );

        expect(result.paragraphs).toEqual([{
            ...paragraph,
            paragraphStyle: { outlineLevel: 1, lineSpacing: 3 },
        }]);
    });

    it('applies composed formatting and its inverse like the sequential edits', () => {
        const initial: IDocumentBody = {
            dataStream: 'a\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_first' }],
            customRanges: [],
            customDecorations: [],
        };
        const heading: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
            coverType: UpdateDocsAttributeType.COVER,
            body: { dataStream: '', paragraphs: [getHeadingParagraph()] },
        }];
        const clearHeading: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', paragraphs: [{ startIndex: 1, paragraphId: 'para_first' }] },
        }];
        const composed = TextX.compose(structuredClone(heading), structuredClone(clearHeading));
        const sequential = apply(apply(initial, heading), clearHeading);
        const result = apply(initial, composed);

        expect(result).toEqual(sequential);
        expect(result.paragraphs).toEqual(initial.paragraphs);
        const inverse = TextX.invert(TextX.makeInvertible(structuredClone(composed), structuredClone(initial)));
        expect(apply(result, inverse)).toEqual(initial);
    });

    it('clears formatting on an inserted paragraph when composing a later replacement', () => {
        const initial: IDocumentBody = { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'para_end' }] };
        const insert: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 2,
            body: { dataStream: 'a\r', paragraphs: [getHeadingParagraph()] },
        }];
        const replace: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', paragraphs: [{ startIndex: 1, paragraphId: 'para_first' }] },
        }];

        const result = apply(initial, TextX.compose(structuredClone(insert), structuredClone(replace)));

        expect(result).toEqual(apply(apply(initial, insert), replace));
        expect(result.paragraphs).toEqual([
            { startIndex: 1, paragraphId: 'para_first' },
            { startIndex: 2, paragraphId: 'para_end' },
        ]);
    });
});

describe('explicit paragraph replacement slices', () => {
    it('preserves an empty replacement in every split chunk', () => {
        const action: TextXAction = {
            t: TextXActionType.RETAIN,
            len: 5,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', paragraphs: [] },
        };
        const iterator = new ActionIterator([action]);

        expect(iterator.next(2).body?.paragraphs).toEqual([]);
        expect(iterator.next().body?.paragraphs).toEqual([]);
        expect(new ActionIterator([action]).next().body?.paragraphs).toEqual([]);
        expect(action.body?.paragraphs).toEqual([]);
    });

    it('preserves an empty replacement slice before the next paragraph entry', () => {
        const iterator = new ActionIterator([{
            t: TextXActionType.RETAIN,
            len: 5,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', paragraphs: [{ startIndex: 3, paragraphId: 'paragraph-1' }] },
        }]);

        expect(iterator.next(2).body?.paragraphs).toEqual([]);
        expect(iterator.next().body?.paragraphs).toEqual([{ startIndex: 1, paragraphId: 'paragraph-1' }]);
    });

    it('does not add paragraph replacement intent to an unrelated retain', () => {
        const iterator = new ActionIterator([{
            t: TextXActionType.RETAIN,
            len: 2,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', textRuns: [{ st: 0, ed: 2, ts: { bl: BooleanNumber.FALSE } }] },
        }]);

        expect(iterator.next(1).body?.paragraphs).toBeUndefined();
        expect(iterator.next().body?.paragraphs).toBeUndefined();
    });

    it('keeps paragraph clearing effective when a concurrent insertion splits the retain', () => {
        const initial: IDocumentBody = {
            dataStream: 'a\rb\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'first' }, { startIndex: 3, paragraphId: 'second' }],
        };
        const clear: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 4,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', paragraphs: [] },
        }];
        const insert: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 2 },
            { t: TextXActionType.INSERT, len: 1, body: { dataStream: 'x' } },
        ];
        const clearAfterInsert = TextX.transform(structuredClone(clear), structuredClone(insert), 'left');
        const insertAfterClear = TextX.transform(structuredClone(insert), structuredClone(clear), 'right');
        const result = apply(apply(initial, insert), clearAfterInsert);

        expect(result).toEqual(apply(apply(initial, clear), insertAfterClear));
        expect(result.dataStream).toBe('a\rxb\r\n');
        expect(result.paragraphs).toEqual([]);
    });
});

describe('falsy text-style replacement ownership', () => {
    const cases: [string, ITextStyle, ITextStyle][] = [
        ['zero', { bl: BooleanNumber.FALSE }, { bl: BooleanNumber.TRUE }],
        ['false', { caps: false }, { caps: true }],
        ['empty string', { ff: '' }, { ff: 'Arial' }],
        ['null', { bg: null }, { bg: { rgb: '#ffffff' } }],
    ];

    it.each(cases)('keeps a winning %s replacement and disjoint peer formatting in both application orders', (_name, replacementStyle, peerStyle) => {
        const initial: IDocumentBody = { dataStream: 'a\r\n', textRuns: [] };
        const replace: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: { dataStream: '', textRuns: [{ st: 0, ed: 1, ts: replacementStyle }] },
        }];
        const cover: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.COVER,
            body: { dataStream: '', textRuns: [{ st: 0, ed: 1, ts: { ...peerStyle, it: BooleanNumber.TRUE } }] },
        }];
        const coverAfterReplace = TextX.transform(structuredClone(cover), structuredClone(replace), 'right');
        const replaceAfterCover = TextX.transform(structuredClone(replace), structuredClone(cover), 'left');
        const result = apply(apply(initial, replace), coverAfterReplace);

        expect(coverAfterReplace[0].body?.textRuns).toEqual([{ st: 0, ed: 1, ts: { it: BooleanNumber.TRUE } }]);
        expect(result).toEqual(apply(apply(initial, cover), replaceAfterCover));
        expect(result.textRuns).toEqual([{ st: 0, ed: 1, ts: { ...replacementStyle, it: BooleanNumber.TRUE } }]);
        expect(apply(initial, TextX.compose(structuredClone(replace), coverAfterReplace))).toEqual(result);
        expect(apply(initial, TextX.compose(structuredClone(cover), replaceAfterCover))).toEqual(result);
    });
});
