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

import { CustomRangeType, DocumentFlavor } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createParagraphLayoutTestBed } from '../block/paragraph/__tests__/create-paragraph-layout-test-bed';
import { DocumentSkeleton } from '../doc-skeleton';
import { FontCache } from '../shaping-engine/font-cache';

describe('pageless document notes', () => {
    beforeEach(() => {
        const context = {
            font: '',
            measureText: (text: string) => ({ width: text.length * 5, fontBoundingBoxAscent: 8, fontBoundingBoxDescent: 2, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        } as unknown as CanvasRenderingContext2D;
        vi.stubGlobal('document', { createElement: () => ({ getContext: () => context }) });
        Reflect.set(FontCache, '_context', null);
        FontCache.invalidateMetrics(() => true);
    });
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    it.each([false, true])('renders both note types at the end of the flow (incremental=%s)', (incremental) => {
        const bed = createParagraphLayoutTestBed('First\uFFFC second\uFFFC', {
            documentStyle: { documentFlavor: DocumentFlavor.MODERN },
            body: { customRanges: [
                { rangeId: 'foot-reference', rangeType: CustomRangeType.FOOTNOTE, startIndex: 5, endIndex: 5, properties: { noteId: 'foot' } },
                { rangeId: 'end-reference', rangeType: CustomRangeType.ENDNOTE, startIndex: 13, endIndex: 13, properties: { noteId: 'end' } },
            ] },
            notes: {
                foot: { type: 'footnote', noteId: 'foot', body: { dataStream: 'Footnote content\r\n', paragraphs: [{ paragraphId: 'foot-p', startIndex: 16 }], sectionBreaks: [{ sectionId: 'foot-s', startIndex: 17 }] } },
                end: { type: 'endnote', noteId: 'end', body: { dataStream: 'Endnote content\r\n', paragraphs: [{ paragraphId: 'end-p', startIndex: 15 }], sectionBreaks: [{ sectionId: 'end-s', startIndex: 16 }] } },
            },
        });
        const before = JSON.stringify(bed.dataModel.getSnapshot());
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let pass = 0; pass < 1000 && !progress.complete; pass++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress.complete).toBe(true);
            } else {
                skeleton.calculate();
            }
            const pages = skeleton.getSkeletonData()!.pages;
            const notes = pages.flatMap((page) => page.notes ?? []);
            expect(notes.map((note) => [note.noteId, note.noteType])).toEqual([['foot', 'footnote'], ['end', 'endnote']]);
            expect(notes[1].top).toBeGreaterThan(notes[0].top);
            expect(pages[pages.length - 1].height).toBeGreaterThan(notes[1].top);
            expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(before);
        } finally {
            skeleton.dispose();
            bed.dataModel.dispose();
        }
    });
});
