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

import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, DocumentDataModel, DocumentFlavor } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SheetCellDocumentViewModel } from '../sheet-cell-document-view-model';

describe('SheetCellDocumentViewModel', () => {
    it.each(['header', 'footer', 'note'] as const)('retains cell line breaking in a %s after resetting the editor', (kind) => {
        const text = '오늘 전략을';
        const paragraph = { startIndex: text.length, paragraphId: 'story', paragraphStyle: { wordWrap: BooleanNumber.FALSE } };
        const body = { dataStream: `${text}\r\n`, paragraphs: [paragraph] };
        const snapshot: IDocumentData = {
            id: 'cell-with-story',
            body: { dataStream: 'Cell\r\n', paragraphs: [{ startIndex: 4, paragraphId: 'cell' }] },
            documentStyle: { documentFlavor: DocumentFlavor.UNSPECIFIED, textStyle: { lang: 'ko-KR' } },
            ...(kind === 'header' ? { headers: { story: { headerId: 'story', body } } } : {}),
            ...(kind === 'footer' ? { footers: { story: { footerId: 'story', body } } } : {}),
            ...(kind === 'note' ? { notes: { story: { noteId: 'story', type: 'footnote', body } } } : {}),
        };
        const model = new DocumentDataModel(snapshot);
        const before = JSON.stringify(model.getSnapshot());
        const viewModel = new SheetCellDocumentViewModel(model);
        try {
            for (const reset of [false, true]) {
                if (reset) {
                    viewModel.reset(model);
                }
                const story = viewModel.getSelfOrHeaderFooterViewModel('story');
                const breaker = story.createLineBreaker(text, paragraph.paragraphStyle, 0);
                const segments: string[] = [];
                let start = 0;
                for (let point = breaker.nextBreakPoint(); point; point = breaker.nextBreakPoint()) {
                    segments.push(text.slice(start, point.position));
                    start = point.position;
                }
                expect(segments).toEqual(['오', '늘 ', '전', '략', '을']);
            }
            expect(JSON.stringify(model.getSnapshot())).toBe(before);
        } finally {
            viewModel.dispose();
            model.dispose();
        }
    });
});
