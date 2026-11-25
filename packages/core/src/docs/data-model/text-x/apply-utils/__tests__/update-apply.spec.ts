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
import type { IDocumentBody, ISdtCustomRange } from '../../../../../types/interfaces';
import { UpdateDocsAttributeType } from '../../../../../shared';
import { CustomRangeType, DocStyleType } from '../../../../../types/interfaces';
import { resolveDocumentParagraphBullet } from '../../../paragraph-style';
import { TextXActionType } from '../../action-types';
import { TextX } from '../../text-x';
import { updateAttribute } from '../update-apply';

describe('retained inherited numbering', () => {
    it('preserves named styles without creating numbering during a paragraph format update', () => {
        const body: IDocumentBody = { dataStream: 'A\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'stable', styleId: 'base' }] };
        updateAttribute(body, { dataStream: '', paragraphs: [{ startIndex: 0, paragraphId: 'stable', paragraphStyle: { horizontalAlign: 1 } }] }, 1, 1, UpdateDocsAttributeType.COVER);
        expect(body.paragraphs![0]).toMatchObject({ styleId: 'base', paragraphId: 'stable', paragraphStyle: { horizontalAlign: 1 } });
        expect(Object.hasOwn(body.paragraphs![0], 'bullet')).toBe(false);
    });

    it.each([undefined, null])('keeps an existing %s numbering state while formatting', (bullet) => {
        const body: IDocumentBody = { dataStream: 'A\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'stable', styleId: 'base', bullet }] };
        updateAttribute(body, { dataStream: '', paragraphs: [{ startIndex: 0, paragraphId: 'stable', paragraphStyle: { keepNext: 1 } }] }, 1, 1, UpdateDocsAttributeType.COVER);
        expect(body.paragraphs![0].styleId).toBe('base');
        expect(body.paragraphs![0].bullet).toBe(bullet);
    });

    it('merges only authored numbering properties and retains live parent values', () => {
        const body: IDocumentBody = { dataStream: 'A\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'stable', styleId: 'base', bullet: { nestingLevel: 1 } }] };
        updateAttribute(body, { dataStream: '', paragraphs: [{ startIndex: 0, paragraphId: 'stable', bullet: { nestingLevel: 2 } }] }, 1, 1, UpdateDocsAttributeType.COVER);
        expect(body.paragraphs![0].bullet).toEqual({ nestingLevel: 2 });
        const document = { styles: { base: { name: 'Base', type: DocStyleType.paragraph, bullet: { listId: 'parent', listType: 'ordered' } } } };
        expect(resolveDocumentParagraphBullet(document, body.paragraphs![0])).toEqual({ listId: 'parent', listType: 'ordered', nestingLevel: 2 });
        document.styles.base.bullet.listId = 'changed-parent';
        expect(resolveDocumentParagraphBullet(document, body.paragraphs![0])?.listId).toBe('changed-parent');
    });

    it('preserves explicit numbering suppression through cover updates, undo and redo', () => {
        const body: IDocumentBody = { dataStream: 'A\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'stable', styleId: 'base', bullet: { nestingLevel: 1 } }] };
        const actions = TextX.makeInvertible([
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.RETAIN, len: 1, coverType: UpdateDocsAttributeType.COVER, body: { dataStream: '', paragraphs: [{ startIndex: 0, paragraphId: 'stable', bullet: null }] } },
        ], body);
        TextX.apply(body, actions);
        expect(body.paragraphs![0]).toMatchObject({ styleId: 'base', bullet: null });
        TextX.apply(body, TextX.invert(actions));
        expect(body.paragraphs![0]).toMatchObject({ styleId: 'base', bullet: { nestingLevel: 1 } });
        TextX.apply(body, actions);
        expect(body.paragraphs![0]).toMatchObject({ styleId: 'base', bullet: null });
    });
});

describe('retained text formatting', () => {
    it.each([UpdateDocsAttributeType.COVER, UpdateDocsAttributeType.REPLACE])('keeps absent decorations absent for unrelated formatting (%s)', (coverType) => {
        const body: IDocumentBody = { dataStream: 'A\r\n' };
        updateAttribute(body, { dataStream: '', textRuns: [{ st: 0, ed: 1, ts: { bl: 1 } }] }, 1, 0, coverType);
        expect(body.customDecorations).toBeUndefined();
        updateAttribute(body, { dataStream: '', customDecorations: [] }, 1, 0, coverType);
        expect(body.customDecorations).toBeUndefined();
    });

    it.each([
        UpdateDocsAttributeType.COVER,
        UpdateDocsAttributeType.REPLACE,
    ])('keeps absent text runs absent when replaying an empty formatting update (%s)', (coverType) => {
        const body: IDocumentBody = { dataStream: 'A\r\n' };
        updateAttribute(body, { dataStream: '', textRuns: [] }, 1, 0, coverType);
        updateAttribute(body, { dataStream: '', textRuns: [{ st: 0, ed: 1, ts: {} }] }, 1, 0, coverType);
        expect(body.textRuns).toBeUndefined();
        expect(body.dataStream).toBe('A\r\n');
    });

    it('adds formatting to a plain body with no existing text-run array', () => {
        const body: IDocumentBody = { dataStream: 'A1B\r\n' };
        updateAttribute(body, { dataStream: '', textRuns: [{ st: 0, ed: 1, ts: { bl: 1 } }] }, 1, 1, UpdateDocsAttributeType.COVER);
        expect(body.textRuns).toEqual([{ st: 1, ed: 2, ts: { bl: 1 } }]);
        expect(body.dataStream).toBe('A1B\r\n');
    });
});

describe('retained SDT metadata boundaries', () => {
    it('restores child-before-parent order when a retained parent shrinks onto its child', () => {
        const child: ISdtCustomRange = {
            rangeId: 'child',
            rangeType: CustomRangeType.SDT,
            startIndex: 0,
            endIndex: 0,
            properties: { kind: 'repeatingSectionItem', placement: 'block' },
        };
        const parent: ISdtCustomRange = {
            ...child,
            rangeId: 'parent',
            endIndex: 4,
            properties: { kind: 'repeatingSection', placement: 'block' },
        };
        const body: IDocumentBody = { dataStream: 'A\rA\rB\r\n', customRanges: [child, parent] };
        updateAttribute(body, {
            dataStream: '',
            customRanges: [child, { ...parent, endIndex: 0 }],
        }, 2, 0, UpdateDocsAttributeType.REPLACE);
        expect(body.customRanges?.map((range) => range.rangeId)).toEqual(['child', 'parent']);
        expect(body.customRanges?.map((range) => range.endIndex)).toEqual([0, 0]);
    });

    it.each([
        { name: 'keeps both clipped edges', offset: 2, length: 3, start: 0, end: 2, expectedStart: 0, expectedEnd: 8 },
        { name: 'restores an explicit end before the retain edge', offset: 0, length: 5, start: 0, end: 2, expectedStart: 0, expectedEnd: 2 },
        { name: 'restores an explicit start after the retain edge', offset: 2, length: 7, start: 2, end: 6, expectedStart: 4, expectedEnd: 8 },
    ])('$name', ({ offset, length, start, end, expectedStart, expectedEnd }) => {
        const range: ISdtCustomRange = {
            rangeId: 'sdt',
            rangeType: CustomRangeType.SDT,
            startIndex: 0,
            endIndex: 8,
            properties: { kind: 'repeatingSection', placement: 'block', alias: 'before' },
        };
        const body: IDocumentBody = { dataStream: '123456789\r\n', customRanges: [range] };
        updateAttribute(body, {
            dataStream: '',
            customRanges: [{ ...range, startIndex: start, endIndex: end, properties: { ...range.properties, alias: 'after' } }],
        }, length, offset, UpdateDocsAttributeType.REPLACE);

        expect(body.customRanges).toHaveLength(1);
        expect(body.customRanges![0]).toMatchObject({
            rangeId: 'sdt',
            startIndex: expectedStart,
            endIndex: expectedEnd,
            properties: { alias: 'after' },
        });
    });
});

describe('retained heading collapse metadata', () => {
    it.each([true, false])('preserves the fold flag through paragraph formatting (%s)', (headingCollapsed) => {
        const body: IDocumentBody = { dataStream: 'A\rB\r\n', paragraphs: [
            { paragraphId: 'a', startIndex: 1, headingCollapsed, styleId: 'heading-style' },
            { paragraphId: 'b', startIndex: 3 },
        ] };
        updateAttribute(body, {
            dataStream: '',
            paragraphs: [{ paragraphId: 'a', startIndex: 0, paragraphStyle: { outlineLevel: 0 } }],
        }, 1, 1, UpdateDocsAttributeType.COVER);
        expect(body.paragraphs?.[0].headingCollapsed).toBe(headingCollapsed);
        expect(body.paragraphs?.[0].styleId).toBe('heading-style');
        expect(body.paragraphs?.[0].paragraphStyle?.outlineLevel).toBe(0);
        expect(body.paragraphs?.[1].headingCollapsed).toBeUndefined();
    });
});
