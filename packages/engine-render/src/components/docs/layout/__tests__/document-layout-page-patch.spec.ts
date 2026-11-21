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

import type { IDocumentData, ITable } from '@univerjs/core';
import {
    BooleanNumber,
    createDocumentModelWithStyle,
    DataStreamTreeTokenType,
    DocumentDataModel,
    DocumentFlavor,
    LocaleService,
    LocaleType,
    TableRowHeightRule,
    Univer,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocumentViewModel } from '../../view-model/document-view-model';
import { createParagraphLayoutTestBed } from '../block/paragraph/__tests__/create-paragraph-layout-test-bed';
import { cachePrecomputedTableSkeleton, createTableSkeleton } from '../block/table';
import { DocumentSkeleton } from '../doc-skeleton';
import {
    applyDocumentSkeletonContinuousBlock,
    hydrateDocumentSkeletonPage,
    serializeDocumentSkeletonContinuousBlock,
    serializeDocumentSkeletonPage,
} from '../document-layout-page-patch';

function normalizeSkeleton(value: unknown): unknown {
    if (value instanceof Map) {
        return [...value].map(([key, item]) => [key, normalizeSkeleton(item)]);
    }

    if (Array.isArray(value)) {
        return value.map(normalizeSkeleton);
    }

    if (value != null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => key !== 'parent')
                .map(([key, item]) => [key, normalizeSkeleton(item)])
        );
    }

    return value;
}

describe('document layout page patch', () => {
    it('serializes and applies a continuous replacement with 150,000 flow lines', () => {
        const model = createDocumentModelWithStyle('Old\\r', {});
        model.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const viewModel = new DocumentViewModel(model);
        const univer = new Univer({ locale: LocaleType.EN_US });
        const locale = univer.__getInjector().get(LocaleService);
        locale.setDirection('ltr');
        const skeleton = DocumentSkeleton.create(viewModel, locale);
        try {
            skeleton.calculate();
            const source = skeleton.getSkeletonData()!;
            const page = source.pages[0];
            const column = page.sections[0].columns[0];
            const initial = serializeDocumentSkeletonContinuousBlock(page, null);
            const target = { ...source, pages: [] };
            applyDocumentSkeletonContinuousBlock(target, initial.block, model.getSnapshot());
            const line = column.lines[0];
            const lineCount = 150_000;
            column.lines = Array.from({ length: lineCount }, (_, offset) => ({
                ...line,
                st: offset,
                ed: offset,
                divides: [],
            }));

            const replacement = serializeDocumentSkeletonContinuousBlock(page, initial.snapshot);
            const applied = applyDocumentSkeletonContinuousBlock(target, replacement.block, model.getSnapshot());
            const appliedColumn = applied.sections[0].columns[0];

            expect(appliedColumn.lines).toHaveLength(lineCount);
            expect(appliedColumn.lines[0].st).toBe(0);
            expect(appliedColumn.lines[75_000].ed).toBe(75_000);
            expect(appliedColumn.lines[lineCount - 1].ed).toBe(lineCount - 1);
            expect(appliedColumn.lines[lineCount - 1].parent).toBe(appliedColumn);
        } finally {
            skeleton.dispose();
            model.dispose();
            univer.dispose();
        }
    });

    it('retains geometry from earlier continuous sections and columns when the final column changes', () => {
        const model = createDocumentModelWithStyle('One\rTwo\rThree\r', {});
        model.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const univer = new Univer({ locale: LocaleType.EN_US });
        const locale = univer.__getInjector().get(LocaleService);
        locale.setDirection('ltr');
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(model), locale);
        try {
            skeleton.calculate();
            const data = skeleton.getSkeletonData()!;
            const page = data.pages[0];
            const section = page.sections[0];
            const column = section.columns[0];
            const [one, two, three] = column.lines;
            page.sections = [
                { ...section, columns: [{ ...column, lines: [one] }] },
                { ...section, columns: [{ ...column, lines: [two] }, { ...column, lines: [three] }] },
            ];
            for (const bodySection of page.sections) {
                bodySection.parent = page;
                for (const bodyColumn of bodySection.columns) {
                    bodyColumn.parent = bodySection;
                    for (const line of bodyColumn.lines) {
                        line.parent = bodyColumn;
                    }
                }
            }
            const initial = serializeDocumentSkeletonContinuousBlock(page, null);
            const target = { ...data, pages: [] };
            const applied = applyDocumentSkeletonContinuousBlock(target, initial.block, model.getSnapshot());
            const retainedSection = applied.sections[0];
            const retainedColumn = applied.sections[1].columns[0];
            const baseline = structuredClone(page);
            page.sections[1].columns[1].lines[0] = { ...three, top: three.top + 10 };

            const { block } = serializeDocumentSkeletonContinuousBlock(page, null, false, {
                base: { version: 'previous', page: baseline },
            });

            expect(block.flow).toMatchObject({ sectionIndex: 1, columnIndex: 1 });
            applyDocumentSkeletonContinuousBlock(target, block, model.getSnapshot());
            expect(applied.sections[0]).toBe(retainedSection);
            expect(applied.sections[1].columns[0]).toBe(retainedColumn);
            expect(applied.sections[1].columns[1].lines[0].top).toBe(three.top + 10);
        } finally {
            skeleton.dispose();
            model.dispose();
            univer.dispose();
        }
    });

    it.each(['header', 'footer'] as const)('keeps precomputed body tables out of a %s at the same stream offset', (kind) => {
        const T = DataStreamTreeTokenType;
        const story = (text: string, rowCount: number, rowHeight: number): Required<Pick<IDocumentData, 'body' | 'tableSource'>> => {
            const row = `${T.TABLE_ROW_START}${T.TABLE_CELL_START}${text}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}`;
            const tableText = `${T.TABLE_START}${row.repeat(rowCount)}${T.TABLE_END}`;
            const dataStream = `${tableText}${T.PARAGRAPH}${T.SECTION_BREAK}`;
            const table: ITable = {
                tableId: 'table-1',
                align: 0,
                indent: { v: 0 },
                textWrap: 0,
                position: { positionH: { relativeFrom: 0 }, positionV: { relativeFrom: 0 } },
                dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                size: { type: 1, width: { v: 240 } },
                cellMargin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } },
                tableColumns: [{ size: { type: 1, width: { v: 240 } } }],
                tableRows: Array.from({ length: rowCount }, () => ({
                    tableCells: [{}],
                    trHeight: { hRule: TableRowHeightRule.EXACT, val: { v: rowHeight } },
                })),
            };
            return {
                body: {
                    dataStream,
                    tables: [{ tableId: 'table-1', startIndex: 0, endIndex: tableText.length - 1 }],
                    paragraphs: Array.from(dataStream).flatMap((c, i) => c === T.PARAGRAPH ? [{ startIndex: i, paragraphId: `p-${i}` }] : []),
                    sectionBreaks: Array.from(dataStream).flatMap((c, i) => c === T.SECTION_BREAK ? [{ startIndex: i, sectionId: `s-${i}` }] : []),
                },
                tableSource: { 'table-1': table },
            };
        };
        const snapshot: IDocumentData = {
            id: 'segment-local-tables',
            ...story('Body', 4, 100),
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 300, height: 240 },
                marginLeft: 30,
                marginRight: 30,
                marginTop: 40,
                marginBottom: 40,
                marginHeader: 10,
                marginFooter: 10,
                useFirstPageHeaderFooter: BooleanNumber.TRUE,
                ...(kind === 'header'
                    ? { defaultHeaderId: 'regular', firstPageHeaderId: 'first' }
                    : { defaultFooterId: 'regular', firstPageFooterId: 'first' }),
            },
            ...(kind === 'header'
                ? { headers: {
                    first: { headerId: 'first', ...story('First', 1, 18) },
                    regular: { headerId: 'regular', ...story('Header', 1, 18) },
                } }
                : { footers: {
                    first: { footerId: 'first', ...story('First', 1, 18) },
                    regular: { footerId: 'regular', ...story('Footer', 1, 18) },
                } }),
        };
        const { ctx, curPage, viewModel, sectionBreakConfig } = createParagraphLayoutTestBed('', {
            ...snapshot,
            body: { ...snapshot.body },
            documentStyle: { ...snapshot.documentStyle },
        });
        try {
            const bodyNode = viewModel.getChildren()[0].children[0].children[0];
            const bodyTable = createTableSkeleton(ctx, curPage, viewModel, bodyNode, sectionBreakConfig)!;
            cachePrecomputedTableSkeleton(ctx, bodyNode, bodyTable);
            const resourceViewModel = viewModel.getSelfOrHeaderFooterViewModel('regular');
            const resourceNode = resourceViewModel.getChildren()[0].children[0].children[0];
            expect(resourceNode.startIndex).toBe(bodyNode.startIndex);
            const resourceTable = createTableSkeleton(ctx, curPage, resourceViewModel, resourceNode, sectionBreakConfig)!;
            expect(resourceTable.rows).toHaveLength(1);
            expect(resourceTable.height).toBe(18);
            expect(createTableSkeleton(ctx, curPage, viewModel, bodyNode, sectionBreakConfig)).toBe(bodyTable);
        } finally {
            viewModel.dispose();
        }
        const univer = new Univer();
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(snapshot)), univer.__getInjector().get(LocaleService));
        try {
            const generation = skeleton.startIncrementalLayout();
            let complete = false;
            for (let i = 0; i < 1000 && !complete; i++) {
                complete = skeleton.stepIncrementalLayout(generation, 1).complete;
            }
            expect(complete).toBe(true);
            const data = skeleton.getSkeletonData()!;
            expect(data.pages.length).toBeGreaterThan(1);
            const resources = kind === 'header' ? data.skeHeaders : data.skeFooters;
            const page = [...resources.get('regular')!.values()][0];
            const table = [...page.skeTables.values()][0];
            expect(table.rows).toHaveLength(1);
            expect(table.height).toBe(18);
            const hydrated = hydrateDocumentSkeletonPage(structuredClone(serializeDocumentSkeletonPage(page, true)), undefined, snapshot);
            expect([...hydrated.skeTables.values()][0].rows[0].rowSource).toBe(table.tableSource.tableRows[0]);
        } finally {
            skeleton.dispose();
            univer.dispose();
        }
    });

    it('survives structured clone and restores render parent links', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = createDocumentModelWithStyle(
            'Worker-safe page publication.\rSecond line.\r',
            {}
        );
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        documentModel.updateDocumentDataPageSize(240, 320);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        skeleton.calculate();

        const page = skeleton.getSkeletonData()?.pages[0];
        if (page == null) {
            throw new Error('Expected the document to produce a page.');
        }
        page.isNaturalPageOverflow = true;

        const patch = structuredClone(serializeDocumentSkeletonPage(page));
        const hydrated = hydrateDocumentSkeletonPage(patch);
        const firstSection = hydrated.sections[0];
        const firstColumn = firstSection?.columns[0];
        const firstLine = firstColumn?.lines[0];
        const firstDivide = firstLine?.divides[0];
        const firstGlyph = firstDivide?.glyphGroup[0];

        expect(JSON.stringify(patch)).not.toContain('"parent"');
        expect(normalizeSkeleton(hydrated)).toEqual(normalizeSkeleton(page));
        expect(hydrated.isNaturalPageOverflow).toBe(true);
        expect(firstSection?.parent).toBe(hydrated);
        expect(firstColumn?.parent).toBe(firstSection);
        expect(firstLine?.parent).toBe(firstColumn);
        expect(firstDivide?.parent).toBe(firstLine);
        expect(firstGlyph?.parent).toBe(firstDivide);

        skeleton.dispose();
        univer.dispose();
    });
});
