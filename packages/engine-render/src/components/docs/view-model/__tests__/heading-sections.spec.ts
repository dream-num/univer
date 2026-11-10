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

import type { IDocumentData, IParagraph } from '@univerjs/core';
import {
    DataStreamTreeTokenType,
    DocStyleType,
    DocumentDataModel,
    DocumentFlavor,
    NamedStyleType,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocumentViewModel } from '../document-view-model';
import { getHeadingSections } from '../heading-sections';

function createView(dataStream: string, paragraphs: IParagraph[], documentFlavor = DocumentFlavor.MODERN) {
    const model = new DocumentDataModel({ id: 'headings', body: { dataStream, paragraphs }, documentStyle: { documentFlavor } });
    const view = new DocumentViewModel(model);
    return { model, view, sections: () => getHeadingSections(view.getChildren(), (index) => view.getParagraph(index)) };
}

describe('heading sections', () => {
    it('ends at the next same or higher heading, preserving nested fold state', () => {
        const { view, sections } = createView('A\rB\rtext\rC\rD\r\n', [
            { paragraphId: 'a', startIndex: 1, headingCollapsed: true, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { paragraphId: 'b', startIndex: 3, headingCollapsed: true, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_3 } },
            { paragraphId: 'text', startIndex: 8 },
            { paragraphId: 'c', startIndex: 10, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_2 } },
            { paragraphId: 'd', startIndex: 12, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
        ]);
        expect(sections().map(({ paragraphId, startOffset, endOffset }) => [paragraphId, startOffset, endOffset])).toEqual([
            ['a', 2, 11],
            ['b', 4, 9],
            ['c', 11, 11],
            ['d', 13, 13],
        ]);
        expect(view.getCollapsedHeadingAtOffset(3)?.paragraphId).toBe('a');
        expect(view.getCollapsedHeadingAtOffset(10)?.paragraphId).toBe('a');
        expect(view.getCollapsedHeadingAtOffset(11)).toBeUndefined();
        view.dispose();
    });

    it('keeps headings in separate columns in independent scopes', () => {
        const T = DataStreamTreeTokenType;
        const dataStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}A\rone\r${T.COLUMN_END}${T.COLUMN_START}B\rtwo\r${T.COLUMN_END}${T.COLUMN_GROUP_END}After\r\n`;
        const paragraphs: IParagraph[] = [];
        for (let i = 0; i < dataStream.length; i++) {
            if (dataStream[i] === '\r') {
                paragraphs.push({ paragraphId: `p${i}`, startIndex: i });
            }
        }
        paragraphs[0].paragraphStyle = { namedStyleType: NamedStyleType.HEADING_1 };
        paragraphs[0].headingCollapsed = true;
        paragraphs[2].paragraphStyle = { namedStyleType: NamedStyleType.HEADING_1 };
        const { view } = createView(dataStream, paragraphs);
        const headings = view.getHeadingSections();
        expect(headings).toHaveLength(2);
        expect(view.getCollapsedHeadingAtOffset(paragraphs[1].startIndex)?.paragraphId).toBe(paragraphs[0].paragraphId);
        expect(view.getCollapsedHeadingAtOffset(paragraphs[2].startIndex)).toBeUndefined();
        expect(view.getCollapsedHeadingAtOffset(paragraphs[4].startIndex)).toBeUndefined();
        view.dispose();
    });

    it('uses inherited named heading styles and respects a direct normal-text override', () => {
        const { model, view } = createView('A\rtext\rB\r\n', [
            { paragraphId: 'a', startIndex: 1, styleId: 'derived', headingCollapsed: true },
            { paragraphId: 'text', startIndex: 6 },
            { paragraphId: 'b', startIndex: 8, styleId: 'heading' },
        ]);
        model.getSnapshot().styles = {
            heading: { type: DocStyleType.paragraph, name: 'Heading', paragraphStyle: { namedStyleType: NamedStyleType.HEADING_2 } },
            derived: { type: DocStyleType.paragraph, name: 'Derived', basedOn: 'heading' },
        };
        view.reset(model);
        expect(view.getHeadingSections().map((heading) => heading.paragraphId)).toEqual(['a', 'b']);
        expect(view.getCollapsedHeadingAtOffset(4)?.paragraphId).toBe('a');
        model.getBody()!.paragraphs![0].paragraphStyle = { namedStyleType: NamedStyleType.NORMAL_TEXT };
        view.reset(model);
        expect(view.getCollapsedHeadingAtOffset(4)).toBeUndefined();
        view.dispose();
    });

    it('ignores stored collapse flags outside modern documents and on non-headings', () => {
        const { view, model } = createView('A\rB\r\n', [
            { paragraphId: 'a', startIndex: 1, headingCollapsed: true, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { paragraphId: 'b', startIndex: 3 },
        ], DocumentFlavor.TRADITIONAL);
        expect(view.getHeadingSections()).toEqual([]);
        expect(view.getCollapsedHeadingAtOffset(2)).toBeUndefined();
        const snapshot = model.getSnapshot() as IDocumentData;
        snapshot.documentStyle.documentFlavor = DocumentFlavor.MODERN;
        snapshot.body!.paragraphs![0].paragraphStyle!.namedStyleType = NamedStyleType.NORMAL_TEXT;
        view.reset(model);
        expect(view.getHeadingSections()).toEqual([]);
        expect(view.getCollapsedHeadingAtOffset(2)).toBeUndefined();
        view.dispose();
    });
});
