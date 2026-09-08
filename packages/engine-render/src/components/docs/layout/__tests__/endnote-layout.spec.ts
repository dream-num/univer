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

import type { IDocumentData, IDocumentNote } from '@univerjs/core';
import { CustomRangeType, DocumentFlavor } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createParagraphLayoutTestBed } from '../block/paragraph/__tests__/create-paragraph-layout-test-bed';
import { DocumentSkeleton } from '../doc-skeleton';
import { hydrateDocumentSkeletonPage, serializeDocumentSkeletonPage } from '../document-layout-page-patch';
import { resolveNoteReferences } from '../note-numbering';
import { FontCache } from '../shaping-engine/font-cache';

function body(text: string) {
    const dataStream = `${text}\r\n`;
    return { dataStream, paragraphs: [...dataStream.matchAll(/\r/g)].map((match, i) => ({ startIndex: match.index!, paragraphId: `p-${i}` })), sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, i) => ({ startIndex: match.index!, sectionId: `s-${i}` })) };
}

function snapshot(position: 'docEnd' | 'sectEnd', long = false) {
    const main = body('First \uFFFC foot \uFFFC\r\nSecond \uFFFC');
    const types = ['endnote', 'footnote', 'endnote'] as const;
    const notes: Record<string, IDocumentNote> = {};
    const customRanges = [...main.dataStream.matchAll(/\uFFFC/g)].map((match, i) => {
        const noteId = `note-${i}`;
        notes[noteId] = { noteId, type: types[i], body: body(long && i === 0 ? Array.from({ length: 60 }, (_, i) => `Long note paragraph ${i}`).join('\r') : `Note ${i}`) };
        return { rangeId: `ref-${i}`, rangeType: types[i] === 'endnote' ? CustomRangeType.ENDNOTE : CustomRangeType.FOOTNOTE, startIndex: match.index!, endIndex: match.index!, wholeEntity: true, properties: { noteId } };
    });
    return { documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 300, height: 180 }, marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10 }, body: { ...main, customRanges }, notes, noteSettings: { endnote: { position, numberFormat: 'lowerRoman' }, footnote: { startNumber: 3 } } } satisfies Partial<IDocumentData>;
}

describe('endnote pagination', () => {
    beforeEach(() => {
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({ width: text.length * 5, fontBoundingBoxAscent: 8, fontBoundingBoxDescent: 2, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }) as TextMetrics);
    });
    afterEach(() => vi.restoreAllMocks());

    it('numbers footnotes and endnotes independently', () => {
        const refs = [...resolveNoteReferences(snapshot('docEnd')).values()];
        expect(refs.map((ref) => ref.label)).toEqual(['i', '3', 'ii']);
    });

    it.each([false, true])('places section endnotes before the next section and document endnotes after it (incremental: %s)', (incremental) => {
        for (const position of ['sectEnd', 'docEnd'] as const) {
            const bed = createParagraphLayoutTestBed('', snapshot(position));
            const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
            try {
                if (incremental) {
                    const generation = skeleton.startIncrementalLayout();
                    let progress = skeleton.stepIncrementalLayout(generation, 0);
                    for (let i = 0; i < 1000 && !progress.complete; i++) {
                        progress = skeleton.stepIncrementalLayout(generation, 0);
                    }
                    expect(progress.complete).toBe(true);
                } else {
                    skeleton.calculate();
                }
                const pages = skeleton.getSkeletonData()!.pages;
                const firstNote = pages.flatMap((page, pageIndex) => (page.notes ?? []).map((note) => ({ ...note, pageIndex }))).find((note) => note.noteId === 'note-0')!;
                const secondSectionPage = pages.findIndex((page) => page.sections.some((section) => section.columns.some((column) => column.lines.some((line) => line.paragraphIndex > 16))));
                expect(firstNote).toBeDefined();
                expect(pages.flatMap((page) => page.notes ?? []).filter((note) => !note.continued).map((note) => note.noteId).sort()).toEqual(['note-0', 'note-1', 'note-2']);
                if (position === 'sectEnd') {
                    expect(firstNote.pageIndex).toBeLessThan(secondSectionPage);
                } else {
                    expect(firstNote.pageIndex).toBeGreaterThanOrEqual(secondSectionPage);
                }
                for (const page of pages) {
                    const restored = hydrateDocumentSkeletonPage(serializeDocumentSkeletonPage(page));
                    expect(restored.notes?.map((note) => note.noteId)).toEqual(page.notes?.map((note) => note.noteId));
                }
            } finally {
                skeleton.dispose();
                bed.viewModel.dispose();
                bed.dataModel.dispose();
            }
        }
    });

    it('defers suppressed section endnotes while retaining their numbering and reference order', () => {
        const data = snapshot('sectEnd');
        Object.assign(data.body.sectionBreaks[0], { suppressEndnotes: true });
        const bed = createParagraphLayoutTestBed('', data);
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const pages = skeleton.getSkeletonData()!.pages;
            const endnotes = pages.flatMap((page, pageIndex) => (page.notes ?? [])
                .filter((note) => note.noteType === 'endnote')
                .map((note) => ({ noteId: note.noteId, pageIndex })));
            expect(endnotes.map((note) => note.noteId)).toEqual(['note-0', 'note-2']);
            expect(endnotes[0].pageIndex).toBe(endnotes[1].pageIndex);
            expect(endnotes[0].pageIndex).toBeGreaterThan(0);
        } finally {
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([false, true])('splits long endnotes and keeps all content above the footer (incremental: %s)', (incremental) => {
        const bed = createParagraphLayoutTestBed('', snapshot('docEnd', true));
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let i = 0; i < 1000 && !progress.complete; i++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress.complete).toBe(true);
            } else {
                skeleton.calculate();
            }
            const pages = skeleton.getSkeletonData()!.pages;
            const notes = pages.flatMap((page) => page.notes ?? []).filter((note) => note.noteId === 'note-0');
            expect(notes.length).toBeGreaterThan(1);
            const text = notes.flatMap((note) => note.page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.raw ?? glyph.content)))))).join('');
            for (let i = 0; i < 60; i++) {
                expect(text).toContain(`Long note paragraph ${i}`);
            }
            expect(notes[0].continued).toBe(false);
            expect(notes.slice(1).every((note) => note.continued)).toBe(true);
            for (const page of pages) {
                for (const note of page.notes ?? []) {
                    expect(note.top + note.page.height).toBeLessThanOrEqual(page.pageHeight - page.marginBottom + 0.1);
                }
            }
        } finally {
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });
});
