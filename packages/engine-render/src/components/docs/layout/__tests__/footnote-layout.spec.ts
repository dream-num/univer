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

import type { IDocumentNote } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '../../../../basics/i-document-skeleton-cached';
import { BaselineOffset, BooleanNumber, CustomRangeType, DataStreamTreeTokenType, DocumentFlavor } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentSkeletonPageType, PageLayoutType } from '../../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../../basics/vector2';
import { createParagraphLayoutTestBed } from '../block/paragraph/__tests__/create-paragraph-layout-test-bed';
import { DocumentSkeleton } from '../doc-skeleton';
import { hydrateDocumentSkeletonPage, serializeDocumentSkeletonPage } from '../document-layout-page-patch';
import { layoutFootnoteBody } from '../footnote-layout';
import { resolveFootnoteReferences } from '../footnote-numbering';
import { FontCache } from '../shaping-engine/font-cache';

function createNoteTestBed(pageHeight = 600, noteOverrides: Partial<IDocumentNote> = {}) {
    const dataStream = `${Array.from({ length: 30 }, (_, i) => `Explanation ${i + 1} with enough text to wrap onto another line.\r`).join('')}\n`;
    const paragraphs = [...dataStream.matchAll(/\r/g)].map((match, i) => ({
        paragraphId: `note-paragraph-${i}`,
        startIndex: match.index!,
    }));
    return createParagraphLayoutTestBed('Reference\uFFFC', {
        documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 400, height: pageHeight } },
        body: {
            customRanges: [{
                rangeId: 'reference',
                rangeType: CustomRangeType.FOOTNOTE,
                startIndex: 9,
                endIndex: 9,
                wholeEntity: true,
                properties: { noteId: 'note' },
            }],
        },
        noteSettings: { footnote: { numberFormat: 'upperRoman', startNumber: 8 } },
        notes: {
            note: { type: 'footnote' as const, noteId: 'note', body: {
                dataStream,
                paragraphs,
                sectionBreaks: [{ sectionId: 'note-body', startIndex: dataStream.length - 1 }],
            }, ...noteOverrides },
        },
    });
}

function getPageGlyphs(page: IDocumentSkeletonPage) {
    return page.sections.flatMap((section) => section.columns.flatMap((column) =>
        column.lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup))));
}

describe('footnote body layout', () => {
    beforeEach(() => {
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 5,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 8,
            actualBoundingBoxDescent: 2,
        }) as TextMetrics);
    });

    afterEach(() => vi.restoreAllMocks());

    it.each([false, true])('fills the remaining body space with table rows after an earlier footnote (incremental: %s)', (incremental) => {
        const T = DataStreamTreeTokenType;
        const prefix = `Reference\uFFFC\r${'Filler\r'.repeat(7)}`;
        const tableStream = `${T.TABLE_START}${Array.from({ length: 10 }, (_, index) => `${T.TABLE_ROW_START}${T.TABLE_CELL_START}Row ${index}\r\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}`).join('')}${T.TABLE_END}`;
        const dataStream = `${prefix}${tableStream}\rAfter\r\n`;
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 400, height: 160 }, marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10 },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].filter((match) => match.index !== prefix.length + tableStream.length).map((match, index) => ({ paragraphId: `p-${index}`, startIndex: match.index })),
                sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, index) => ({ sectionId: `s-${index}`, startIndex: match.index })),
                tables: [{ tableId: 'table', startIndex: prefix.length, endIndex: prefix.length + tableStream.length }],
                customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: 9, endIndex: 9, wholeEntity: true, properties: { noteId: 'note' } }],
            },
            tableSource: { table: {
                tableId: 'table',
                align: 0,
                indent: { v: 0 },
                textWrap: 0,
                size: { type: 0, width: { v: 200 } },
                cellMargin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } },
                tableColumns: [{ size: { type: 0, width: { v: 200 } } }],
                tableRows: Array.from({ length: 10 }, () => ({ tableCells: [{}], trHeight: { val: { v: 0 }, hRule: 0 } })),
            } },
            notes: { note: { type: 'footnote' as const, noteId: 'note', body: { dataStream: 'Explanation\r\n', paragraphs: [{ paragraphId: 'note-p', startIndex: 11 }], sectionBreaks: [{ sectionId: 'note-section', startIndex: 12 }] } } },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let step = 0; step < 1000 && !progress.complete; step++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress.complete).toBe(true);
            } else {
                skeleton.calculate();
            }
            const pages = skeleton.getSkeletonData()!.pages;
            expect(pages[0].notes?.map((note) => note.noteId)).toEqual(['note']);
            const firstTable = [...pages[0].skeTables.values()][0];
            expect(firstTable).toBeDefined();
            expect(firstTable.rows[0].index).toBe(0);
            expect(firstTable.rows.length).toBeLessThan(10);
            expect(pages[0].marginTop + firstTable.top + firstTable.height).toBeLessThanOrEqual(pages[0].footnoteDecorations![0].top + 0.01);
            const rows = pages.flatMap((page) => [...page.skeTables.values()].flatMap((table) => table.rows));
            expect(rows.map((row) => row.index)).toEqual(Array.from({ length: 10 }, (_, index) => index));
        } finally {
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([1, 32].flatMap((repeatCount) => [false, true].flatMap((incremental) => ['keepLines', 'keepNext', 'widowControl'].map((constraint) => ({ repeatCount, incremental, constraint })))))('reflows page-local note markers for $constraint across $repeatCount paragraphs (incremental: $incremental)', ({ repeatCount, incremental, constraint }) => {
        const prefix = constraint === 'keepNext' ? 'Filler filler filler filler\rHeading \uFFFC\r' : 'Filler \uFFFC filler filler filler\r';
        const kept = constraint !== 'widowControl' ? 'One \uFFFC two three four five six seven eight nine ten.\r' : 'One two three four five six seven eight nine \uFFFC ten eleven twelve thirteen.\r';
        const dataStream = `${`${prefix}${kept}`.repeat(repeatCount)}\n`;
        const references = [...dataStream.matchAll(/\uFFFC/g)].map((match, index) => ({ index: match.index!, id: `note-${index}` }));
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 120, height: constraint === 'widowControl' ? 128 : 120 }, marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10 },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `p-${index}`, paragraphStyle: constraint === 'keepNext'
                    ? { keepNext: index % 3 === 1 ? BooleanNumber.TRUE : BooleanNumber.FALSE, keepLines: index % 3 === 2 ? BooleanNumber.TRUE : BooleanNumber.FALSE }
                    : { [constraint]: index % 2 === 1 ? BooleanNumber.TRUE : BooleanNumber.FALSE } })),
                sectionBreaks: [{ sectionId: 'main', startIndex: dataStream.length - 1 }],
                customRanges: references.map(({ index, id }) => ({ rangeId: `ref-${id}`, rangeType: CustomRangeType.FOOTNOTE, startIndex: index, endIndex: index, wholeEntity: true, properties: { noteId: id } })),
            },
            noteSettings: { footnote: { restart: 'eachPage', startNumber: 9 } },
            notes: Object.fromEntries(references.map(({ id }) => [id, { type: 'footnote' as const, noteId: id, body: { dataStream: 'Note\r\n', paragraphs: [{ startIndex: 4, paragraphId: 'note-text' }], sectionBreaks: [{ startIndex: 5, sectionId: 'note-section' }] } }])),
        });
        try {
            const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let step = 0; step < 20_000 && !progress.complete; step++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress).toMatchObject({ complete: true, cancelled: false });
            } else {
                skeleton.calculate();
            }
            const pages = skeleton.getSkeletonData()!.pages;
            expect(pages.flatMap(getPageGlyphs).filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('')).toBe(dataStream);
            const referenceWidth = pages.flatMap(getPageGlyphs).find((glyph) => glyph.noteId === 'note-0')!.bBox.width;
            for (const page of pages) {
                const refs = getPageGlyphs(page).filter((glyph) => glyph.noteId);
                expect(refs.map((glyph) => glyph.content)).toEqual(refs.map((_, index) => String(9 + index)));
                for (const glyph of refs) {
                    if (glyph.content === '9') {
                        expect(glyph.bBox.width).toBeCloseTo(referenceWidth);
                    }
                    const note = page.notes?.find((fragment) => fragment.noteId === glyph.noteId && !fragment.continued);
                    expect(note).toBeDefined();
                    expect(getPageGlyphs(note!.page).find((item) => item.count === 0)?.content).toBe(glyph.content);
                }
                for (const section of page.sections) {
                    for (const column of section.columns) {
                        for (const line of column.lines) {
                            for (const divide of line.divides) {
                                for (let index = 1; index < divide.glyphGroup.length; index++) {
                                    const previous = divide.glyphGroup[index - 1];
                                    expect(divide.glyphGroup[index].left).toBeCloseTo(previous.left + previous.width);
                                }
                            }
                        }
                    }
                }
            }
            if (constraint === 'keepNext') {
                for (let index = 0; index < references.length; index += 2) {
                    const headingPage = pages.find((page) => getPageGlyphs(page).some((glyph) => glyph.noteId === references[index].id));
                    const followingPage = pages.find((page) => getPageGlyphs(page).some((glyph) => glyph.noteId === references[index + 1].id));
                    expect(headingPage).toBe(followingPage);
                }
            }
            const paragraphEnds = [...dataStream.matchAll(/\r/g)].filter((_, index) => constraint === 'keepNext' ? index % 3 === 2 : index % 2 === 1).map((match) => match.index!);
            for (const end of paragraphEnds) {
                const counts = pages.map((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)).filter((line) => line.paragraphIndex === end).length).filter((count) => count > 0);
                if (constraint !== 'widowControl') {
                    expect(counts).toHaveLength(1);
                } else {
                    expect(counts.every((count) => count >= 2)).toBe(true);
                }
            }
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('places a table-first footnote marker in its first cell without consuming an editable character', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}First\r\n${T.TABLE_CELL_END}${T.TABLE_CELL_START}Second\r\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${tableStream}After\r\n`;
        const bed = createNoteTestBed(600, {
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `note-${index}` })),
                sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'note-section' }],
                tables: [{ tableId: 'note-table', startIndex: 0, endIndex: tableStream.length }],
            },
            tableSource: {
                'note-table': {
                    tableId: 'note-table',
                    align: 0,
                    indent: { v: 0 },
                    textWrap: 0,
                    position: { positionH: { relativeFrom: 0 }, positionV: { relativeFrom: 0 } },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: 0, width: { v: 300 } },
                    tableRows: [{ tableCells: [{}, {}], trHeight: { val: { v: 0 }, hRule: 0 } }],
                    tableColumns: [{ size: { type: 0, width: { v: 150 } } }, { size: { type: 0, width: { v: 150 } } }],
                },
            },
        });
        try {
            const pages = layoutFootnoteBody(bed.ctx, resolveFootnoteReferences(bed.dataModel.getSnapshot()).get(9)!, bed.sectionBreakConfig, {
                width: 320,
                firstPageHeight: 200,
                continuationPageHeight: 200,
            });
            const cells = pages.flatMap((page) => [...page.skeTables.values()].flatMap((table) => table.rows.flatMap((row) => row.cells)));
            expect(cells).toHaveLength(2);
            const first = getPageGlyphs(cells[0]);
            expect(first[0]).toMatchObject({ content: 'VIII', raw: '', count: 0 });
            expect(first.slice(1).map((glyph) => glyph.raw).join('')).toBe('First\r\n');
            expect(first[1].left).toBeCloseTo(first[0].left + first[0].width, 5);
            expect(getPageGlyphs(cells[1]).map((glyph) => glyph.raw).join('')).toBe('Second\r\n');
            expect([...pages.flatMap(getPageGlyphs), ...cells.flatMap(getPageGlyphs)].filter((glyph) => glyph.content === 'VIII')).toHaveLength(1);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('keeps the reference font separate from editable footnote text', () => {
        const bed = createNoteTestBed(600, {
            referenceTextStyle: { fs: 8, va: BaselineOffset.SUPERSCRIPT },
            body: {
                dataStream: 'Explanation\r\n',
                paragraphs: [{ startIndex: 11, paragraphId: 'note-text' }],
                sectionBreaks: [{ startIndex: 12, sectionId: 'note-section' }],
                textRuns: [{ st: 0, ed: 11, ts: { fs: 9.5 } }],
            },
        });
        const pages = layoutFootnoteBody(bed.ctx, resolveFootnoteReferences(bed.dataModel.getSnapshot()).get(9)!, bed.sectionBreakConfig, {
            width: 320,
            columnCount: 1,
            firstPageHeight: 100,
            continuationPageHeight: 100,
        });
        try {
            const [marker, text] = getPageGlyphs(pages[0]);
            expect(marker).toMatchObject({ count: 0, ts: { fs: 8, va: BaselineOffset.SUPERSCRIPT } });
            expect(marker.fontStyle?.originFontSize).toBe(8);
            expect(marker.fontStyle?.fontSize).toBeLessThan(8);
            expect(text.ts?.fs).toBe(9.5);
            expect(text.ts?.va).not.toBe(BaselineOffset.SUPERSCRIPT);
            expect(text.fontStyle?.fontSize).toBe(9.5);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([1, 100])('lays out two notes in shared columns with a %i-length first note', (repeatCount) => {
        const noteText = 'Explanation with several words to wrap across lines.';
        const body = {
            dataStream: `${noteText}\r\n`,
            paragraphs: [{ paragraphId: 'p', startIndex: noteText.length }],
            sectionBreaks: [{ sectionId: 's', startIndex: noteText.length + 1 }],
        };
        const firstText = noteText.repeat(repeatCount);
        const firstBody = { dataStream: `${firstText}\r\n`, paragraphs: [{ paragraphId: 'first', startIndex: firstText.length }], sectionBreaks: [{ sectionId: 'first-section', startIndex: firstText.length + 1 }] };
        const bed = createParagraphLayoutTestBed('\uFFFC\uFFFC', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            noteSettings: { footnote: { columnCount: 2 } },
            body: { customRanges: [0, 1].map((index) => ({
                rangeType: CustomRangeType.FOOTNOTE,
                rangeId: `ref-${index}`,
                startIndex: index,
                endIndex: index,
                wholeEntity: true,
                properties: { noteId: `note-${index}` },
            })) },
            notes: {
                'note-0': { type: 'footnote' as const, noteId: 'note-0', body: firstBody },
                'note-1': { type: 'footnote' as const, noteId: 'note-1', body: structuredClone(body) },
            },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const pages = skeleton.getSkeletonData()!.pages;
            const notes = pages[0].notes!;
            if (repeatCount > 1) {
                const allNotes = pages.flatMap((page) => page.notes ?? []);
                expect(allNotes.length).toBeGreaterThan(2);
                expect(allNotes[allNotes.length - 1].noteId).toBe('note-1');
                expect(allNotes[allNotes.length - 1].continued).toBe(false);
                for (const [id, expected] of [['note-0', firstBody.dataStream], ['note-1', body.dataStream]]) {
                    const raw = allNotes.filter((note) => note.noteId === id).flatMap((note) =>
                        note.page.sections.flatMap((section) => section.columns.flatMap((column) =>
                            column.lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup.filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw)))))).join('');
                    expect(raw).toBe(expected);
                }
                return;
            }
            expect(notes).toHaveLength(2);
            expect(notes[0].page.sections[0].columns[0].lines.length).toBeGreaterThan(0);
            expect(notes[1].page.sections[0].columns[1].lines.length).toBeGreaterThan(0);
            expect(notes[0].top).toBe(notes[1].top);
            const column = notes[1].page.sections[0].columns[1];
            const line = column.lines[0];
            const divide = line.divides[0];
            const glyph = divide.glyphGroup.find((item) => item.count > 0)!;
            const point = Vector2.create(notes[1].left + column.left + divide.left + divide.paddingLeft + glyph.left + 1, notes[1].top + line.top + 1);
            expect(skeleton.findNodeByCoord(point, PageLayoutType.VERTICAL, 0, 0)?.segmentId).toBe('note-1');
            for (const note of notes) {
                const glyphs = note.page.sections.flatMap((section) => section.columns.flatMap((column) =>
                    column.lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup))));
                expect(glyphs.filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('')).toBe(body.dataStream);
                expect(note.page.st).toBe(0);
            }
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([1, 2, 3, 4])('continues rich paragraphs through %i columns without changing note character offsets', (columnCount) => {
        const bed = createNoteTestBed();
        const snapshot = bed.dataModel.getSnapshot();
        const reference = resolveFootnoteReferences(snapshot).get(9)!;
        const pages = layoutFootnoteBody(bed.ctx, reference, bed.sectionBreakConfig, {
            width: 320,
            columnCount,
            firstPageHeight: 45,
            continuationPageHeight: 100,
        });
        expect(pages.length).toBeGreaterThan(2);
        expect(pages.every((page) => page.sections[0].columns.length === columnCount)).toBe(true);
        expect(pages.every((page) => page.type === DocumentSkeletonPageType.FOOTNOTE && page.segmentId === 'note')).toBe(true);
        expect(pages[0].height).toBeLessThanOrEqual(47);
        expect(pages.slice(1).every((page) => page.height <= 102)).toBe(true);
        const glyphs = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap(
            (column) => column.lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup))
        )));
        expect(glyphs[0]).toMatchObject({ content: 'VIII', raw: '', count: 0 });
        expect(glyphs.filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('')).toBe(snapshot.notes!.note.body.dataStream);
        expect(pages[0].st).toBe(0);
        for (let index = 1; index < pages.length; index++) {
            expect(pages[index].st).toBe(pages[index - 1].ed + 1);
        }
        expect(snapshot.notes!.note.body.dataStream.startsWith('Explanation')).toBe(true);
        bed.viewModel.dispose();
        bed.dataModel.dispose();
    });

    it.each([
        { prefixCount: 0, rowCount: 1, referenceRow: 0 },
        { prefixCount: 11, rowCount: 1, referenceRow: 0 },
        { prefixCount: 14, rowCount: 1, referenceRow: 0 },
        { prefixCount: 0, rowCount: 20, referenceRow: 0 },
        { prefixCount: 0, rowCount: 20, referenceRow: 5 },
        { prefixCount: 0, rowCount: 20, referenceRow: 19 },
        { prefixCount: 0, rowCount: 20, referenceRow: 0, noteParagraphs: 30 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, referenceParagraph: 10 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, referenceParagraph: 19 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, columnCount: 2, referenceColumn: 1 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, noteParagraphs: 30 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, referenceParagraphs: [0, 10, 19] },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, referenceParagraphs: [0, 10, 19], restartEachPage: true },
        { prefixCount: 0, rowCount: 20, referenceRow: 0, referenceRows: [0, 4, 8, 12, 16, 19], restartEachPage: true, cantSplit: true, noteParagraphs: 1 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, referenceParagraphs: [0, 10, 19], restartEachPage: true, startNumber: 9 },
        { prefixCount: 7, rowCount: 12, referenceRow: 0, referenceRows: [0, 3, 6, 9, 11], restartEachPage: true, cantSplit: true, noteParagraphs: 1, exactRowHeight: 30 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, referenceParagraphs: [0, 10, 19], referenceColumns: [0, 1], columnCount: 2, restartEachPage: true, noteParagraphs: 1 },
        { prefixCount: 0, rowCount: 1, referenceRow: 0, cellParagraphs: 20, columnCount: 2, referenceColumns: [0, 1] },
    ].flatMap((sample, caseIndex) => [false, true].map((incremental) => ({ ...sample, incremental, caseIndex }))))('keeps table references with their notes (case $caseIndex, incremental: $incremental)', ({ prefixCount, rowCount, referenceRow, incremental, noteParagraphs = 4, cellParagraphs = 1, referenceParagraph = 0, columnCount = 1, referenceColumn = 0, referenceParagraphs = [referenceParagraph], referenceColumns = [referenceColumn], restartEachPage = false, startNumber = 1, cantSplit = false, referenceRows = [referenceRow], exactRowHeight = 0 }) => {
        const T = DataStreamTreeTokenType;
        const cellText = (row: number, column: number) => `${Array.from({ length: cellParagraphs }, (_, paragraph) =>
            `Cell${referenceRows.includes(row) && referenceColumns.includes(column) && referenceParagraphs.includes(paragraph) ? '\uFFFC' : ''}${T.PARAGRAPH}`).join('')}${T.SECTION_BREAK}`;
        const tableStream = `${T.TABLE_START}${Array.from({ length: rowCount }, (_, index) => `${T.TABLE_ROW_START}${Array.from({ length: columnCount }, (_, column) => `${T.TABLE_CELL_START}${cellText(index, column)}${T.TABLE_CELL_END}`).join('')}${T.TABLE_ROW_END}`).join('')}${T.TABLE_END}`;
        const prefix = 'Intro\r'.repeat(prefixCount);
        const dataStream = `${prefix}${tableStream}\r\n`;
        const noteStream = `${'Explanation\r'.repeat(noteParagraphs)}\n`;
        const references = [...dataStream.matchAll(/\uFFFC/g)].map((match, index) => ({ index: match.index!, id: `note-${index}` }));
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 400, height: 200 } },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `p-${index}` })),
                sectionBreaks: [{ sectionId: 'main', startIndex: dataStream.length - 1 }],
                tables: [{ tableId: 'table', startIndex: prefix.length, endIndex: prefix.length + tableStream.length }],
                customRanges: references.map(({ index, id }) => ({ rangeId: `ref-${id}`, rangeType: CustomRangeType.FOOTNOTE, startIndex: index, endIndex: index, wholeEntity: true, properties: { noteId: id } })),
            },
            tableSource: {
                table: {
                    tableId: 'table',
                    align: 0,
                    indent: { v: 0 },
                    textWrap: 0,
                    size: { type: 0, width: { v: 300 } },
                    tableRows: Array.from({ length: rowCount }, () => ({ cantSplit: cantSplit ? 1 : 0, tableCells: Array.from({ length: columnCount }, () => ({ size: { type: 0, width: { v: 300 / columnCount } } })), trHeight: { val: { v: exactRowHeight }, hRule: exactRowHeight > 0 ? 2 : 0 } })),
                    tableColumns: Array.from({ length: columnCount }, () => ({ size: { type: 0, width: { v: 300 / columnCount } } })),
                },
            },
            noteSettings: { footnote: restartEachPage ? { restart: 'eachPage', startNumber } : undefined },
            notes: Object.fromEntries(references.map(({ id }) => [id, { type: 'footnote' as const, noteId: id, body: {
                dataStream: noteStream,
                paragraphs: [...noteStream.matchAll(/\r/g)].map((match, index) => ({ paragraphId: `note-${index}`, startIndex: match.index! })),
                sectionBreaks: [{ sectionId: 'note-section', startIndex: noteStream.length - 1 }],
            } }])),
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let step = 0; step < 20_000 && !progress.complete; step++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress).toMatchObject({ complete: true, cancelled: false });
            } else {
                skeleton.calculate();
            }
            const pages = skeleton.getSkeletonData()!.pages;
            if (prefixCount === 0 && rowCount === 1 && cellParagraphs === 1) {
                expect(pages).toHaveLength(1);
            } else {
                expect(pages.length).toBeGreaterThan(1);
            }
            const tablePages = pages.filter((page) => page.skeTables.size > 0);
            if (restartEachPage) {
                const markerWidths = new Map<string, number>();
                for (const page of tablePages) {
                    const refs = [...page.skeTables.values()].flatMap((table) => table.rows.flatMap((row) => row.cells.flatMap(getPageGlyphs))).filter((glyph) => glyph.noteId);
                    expect(refs.map((glyph) => glyph.content)).toEqual(refs.map((_, index) => String(index + startNumber)));
                    for (const glyph of refs) {
                        const previousWidth = markerWidths.get(glyph.content);
                        if (previousWidth != null) {
                            expect(glyph.width).toBeCloseTo(previousWidth);
                        }
                        markerWidths.set(glyph.content, glyph.width);
                        const note = page.notes?.find((fragment) => fragment.noteId === glyph.noteId && !fragment.continued);
                        expect(note).toBeDefined();
                        expect(getPageGlyphs(note!.page).find((item) => item.count === 0)?.content).toBe(glyph.content);
                    }
                }
            }

            const rows = tablePages.flatMap((page) => [...page.skeTables.values()].flatMap((table) => table.rows));
            expect(new Set(rows.map((row) => row.index)).size).toBe(rowCount);
            for (let column = 0; column < columnCount; column++) {
                const text = rows.flatMap((row) => getPageGlyphs(row.cells[column])).filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('');
                expect(text).toBe(Array.from({ length: rowCount }, (_, row) => cellText(row, column)).join(''));
            }
            const page = tablePages.find((page) => [...page.skeTables.values()].some((table) =>
                table.rows.some((row) => row.cells.some((cell) => getPageGlyphs(cell).some((glyph) => glyph.noteId === 'note-0')))))!;
            expect(page.notes!.some((note) => note.noteId === 'note-0')).toBe(true);
            const fragments = pages.flatMap((page) => page.notes ?? []);
            expect(fragments[0].continued).toBe(false);
            for (const { id } of references) {
                const noteFragments = fragments.filter((fragment) => fragment.noteId === id);
                expect(noteFragments[0].continued).toBe(false);
                expect(noteFragments.slice(1).every((fragment) => fragment.continued)).toBe(true);
                expect(noteFragments.flatMap((fragment) => getPageGlyphs(fragment.page)).filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('')).toBe(noteStream);
            }
            const table = [...page.skeTables.values()][0];
            expect(page.marginTop + table.top + table.height).toBeLessThanOrEqual(page.footnoteDecorations![0].top + 0.01);
            for (const tablePage of tablePages) {
                if (tablePage.footnoteHeight) {
                    const bottom = Math.max(...[...tablePage.skeTables.values()].map((table) => table.top + table.height));
                    expect(tablePage.marginTop + bottom).toBeLessThanOrEqual(tablePage.footnoteDecorations![0].top + 0.01);
                }
            }
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each(['pageBottom', 'beneathText'] as const)('positions a short note at %s without changing its text', (position) => {
        const body = {
            dataStream: 'Explanation\r\n',
            paragraphs: [{ paragraphId: 'np', startIndex: 11 }],
            sectionBreaks: [{ sectionId: 'ns', startIndex: 12 }],
        };
        const bed = createNoteTestBed(600, { body });
        bed.dataModel.getSnapshot().noteSettings = { footnote: { position } };
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const pages = skeleton.getSkeletonData()!.pages;
            expect(pages).toHaveLength(1);
            const page = pages[0];
            const note = page.notes![0];
            const separator = page.footnoteDecorations![0];
            const bodyLine = page.sections[0].columns[0].lines[0];
            const bodyBottom = page.marginTop + bodyLine.top + bodyLine.lineHeight;
            expect(note.top).toBeCloseTo(separator.top + separator.page.height);
            if (position === 'beneathText') {
                expect(separator.top).toBeCloseTo(bodyBottom);
                expect(note.top + note.page.height).toBeLessThan(page.pageHeight - page.marginBottom - 100);
            } else {
                expect(note.top + note.page.height).toBeCloseTo(page.pageHeight - page.marginBottom);
                expect(separator.top).toBeGreaterThan(bodyBottom + 100);
            }
            expect(getPageGlyphs(note.page).filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('')).toBe(body.dataStream);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('reserves custom separator and continuation notice paragraphs and publishes them to the Worker consumer', () => {
        const bed = createNoteTestBed(200);
        const makeBody = (text: string) => ({
            dataStream: `${text}\r\n`,
            paragraphs: [{ paragraphId: 'decoration', startIndex: text.length, paragraphStyle: { spaceBelow: { v: 17 } } }],
            sectionBreaks: [{ sectionId: 'decoration', startIndex: text.length + 1 }],
        });
        bed.dataModel.getSnapshot().noteSettings = { footnote: {
            separator: makeBody('Notes'),
            continuationSeparator: makeBody('Notes continued'),
            continuationNotice: makeBody('Continued on the following page'),
        } };
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const pages = skeleton.getSkeletonData()!.pages;
            expect(pages.length).toBeGreaterThan(1);
            for (let index = 0; index < pages.length; index++) {
                const page = pages[index];
                const decorations = page.footnoteDecorations!;
                const separator = decorations[0];
                expect(separator.kind).toBe(index === 0 ? 'separator' : 'continuationSeparator');
                expect(getPageGlyphs(separator.page).map((glyph) => glyph.raw).join('')).toBe(index === 0 ? 'Notes\r\n' : 'Notes continued\r\n');
                expect(page.notes![0].top).toBeCloseTo(separator.top + separator.page.height);
                const lastLine = separator.page.sections[0].columns[0].lines.slice(-1)[0];
                expect(separator.page.height).toBeCloseTo(lastLine.top + lastLine.lineHeight + 17);
                const notice = decorations.find((decoration) => decoration.kind === 'continuationNotice');
                expect(Boolean(notice)).toBe(index < pages.length - 1);
                if (notice) {
                    const noteBottom = Math.max(...page.notes!.map((note) => note.top + note.page.height));
                    expect(notice.top).toBeCloseTo(noteBottom);
                    expect(notice.top + notice.page.height).toBeLessThanOrEqual(page.pageHeight - page.marginBottom + 0.01);
                }
                const patch = serializeDocumentSkeletonPage(page, true);
                expect(() => JSON.stringify(patch)).not.toThrow();
                const restored = hydrateDocumentSkeletonPage(patch, undefined, bed.dataModel.getSnapshot());
                const restoredPage = restored.footnoteDecorations![0].page;
                expect(restoredPage.sections[0].parent).toBe(restoredPage);
                expect(getPageGlyphs(restoredPage).map((glyph) => glyph.raw)).toEqual(getPageGlyphs(separator.page).map((glyph) => glyph.raw));
            }
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([10, 11, 12, 13, 14, 15])('does not carry a speculative note when its reference line moves after %i paragraphs', (prefixCount) => {
        const prefix = 'Intro\r'.repeat(prefixCount);
        const dataStream = `${prefix}\uFFFC ${'A paragraph that wraps over several lines. '.repeat(8)}\r\n`;
        const noteStream = 'A short explanation.\r\n';
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 400, height: 200 } },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `p-${index}` })),
                sectionBreaks: [{ sectionId: 'main', startIndex: dataStream.length - 1 }],
                customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: prefix.length, endIndex: prefix.length, wholeEntity: true, properties: { noteId: 'note' } }],
            },
            notes: { note: { type: 'footnote' as const, noteId: 'note', body: {
                dataStream: noteStream,
                paragraphs: [{ paragraphId: 'note-text', startIndex: noteStream.length - 2 }],
                sectionBreaks: [{ sectionId: 'note-section', startIndex: noteStream.length - 1 }],
            } } },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const pages = skeleton.getSkeletonData()!.pages;
            const fragments = pages.flatMap((page) => page.notes ?? []);
            expect(fragments).toHaveLength(1);
            expect(fragments.flatMap((fragment) => getPageGlyphs(fragment.page)).filter((glyph) => glyph.count > 0).map((glyph) => glyph.raw).join('')).toBe(noteStream);
            expect(pages.find((page) => getPageGlyphs(page).some((glyph) => glyph.noteId === 'note'))?.notes).toHaveLength(1);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('uses short and full-width default separator marks on first and continued pages', () => {
        const bed = createNoteTestBed(200);
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const pages = skeleton.getSkeletonData()!.pages;
            expect(pages.length).toBeGreaterThan(1);
            for (const [index, page] of pages.entries()) {
                const separator = page.footnoteDecorations![0];
                const marker = getPageGlyphs(separator.page).find((glyph) => glyph.footnoteSeparator)!;
                expect(marker.raw).toBe('\uFFFC');
                expect(marker.count).toBe(1);
                expect(marker.width).toBe(index === 0 ? 192 : page.pageWidth - page.marginLeft - page.marginRight);
            }
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('publishes note fragments without parent cycles and restores their local hit-test hierarchy', () => {
        const bed = createNoteTestBed();
        const reference = resolveFootnoteReferences(bed.dataModel.getSnapshot()).get(9)!;
        const pages = layoutFootnoteBody(bed.ctx, reference, bed.sectionBreakConfig, {
            width: 180,
            firstPageHeight: 100,
            continuationPageHeight: 100,
        });
        bed.curPage.notes = [{
            noteId: 'note',
            referenceIndex: 9,
            continued: false,
            left: 20,
            top: 400,
            page: pages[0],
        }];
        const patch = serializeDocumentSkeletonPage(bed.curPage, true);
        expect(() => JSON.stringify(patch)).not.toThrow();
        const restored = hydrateDocumentSkeletonPage(patch, undefined, bed.dataModel.getSnapshot());
        const notePage = restored.notes![0].page;
        const section = notePage.sections[0];
        const column = section.columns[0];
        const line = column.lines[0];
        const divide = line.divides[0];
        expect(section.parent).toBe(notePage);
        expect(column.parent).toBe(section);
        expect(line.parent).toBe(column);
        expect(divide.glyphGroup[0].parent).toBe(divide);
        expect(notePage.st).toBe(0);
        expect(restored.notes![0].top).toBe(400);
        bed.viewModel.dispose();
        bed.dataModel.dispose();
    });
});
