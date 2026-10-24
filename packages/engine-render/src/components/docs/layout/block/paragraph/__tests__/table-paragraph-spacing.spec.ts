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

import {
    DataStreamTreeTokenType,
    DocumentFlavor,
    NamedStyleType,
    SpacingRule,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDocumentSkeletonLine } from '../../../../../../basics/i-document-skeleton-cached';
import { DocumentSkeleton } from '../../../doc-skeleton';
import { clearFontCreateConfigCache } from '../../../tools';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

interface ISpacingOptions {
    before?: number;
    after?: number;
    pageHeight?: number;
    rowCount?: number;
    incremental?: boolean;
}

function layoutTable(documentFlavor: DocumentFlavor, options: ISpacingOptions = {}) {
    const T = DataStreamTreeTokenType;
    const prefix = `Before${T.PARAGRAPH}`;
    const row = `${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}`;
    const tableStream = `${T.TABLE_START}${row.repeat(options.rowCount ?? 1)}${T.TABLE_END}`;
    const content = `${prefix}${tableStream}After`;
    const dataStream = `${content}${T.PARAGRAPH}${T.SECTION_BREAK}`;
    const beforeIndex = prefix.length - 1;
    const afterIndex = content.length;
    const paragraphs = [...dataStream.matchAll(/\r/g)].map((match) => ({
        startIndex: match.index,
        paragraphId: `p-${match.index}`,
        paragraphStyle: match.index === beforeIndex
            ? { namedStyleType: NamedStyleType.HEADING_1, ...(options.before == null ? {} : { spaceBelow: { v: options.before } }) }
            : match.index === afterIndex
                ? { namedStyleType: NamedStyleType.HEADING_2, ...(options.after == null ? {} : { spaceAbove: { v: options.after } }) }
                : { spacingRule: SpacingRule.EXACT, lineSpacing: 20 },
    }));
    const bed = createParagraphLayoutTestBed(content, {
        body: {
            paragraphs,
            sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match) => ({ startIndex: match.index })),
            tables: [{ tableId: 'between-headings', startIndex: prefix.length, endIndex: prefix.length + tableStream.length }],
        },
        tableSource: {
            'between-headings': {
                tableId: 'between-headings',
                align: TableAlignmentType.START,
                indent: { v: 0 },
                textWrap: TableTextWrapType.NONE,
                size: { type: TableSizeType.SPECIFIED, width: { v: 200 } },
                cellMargin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } },
                tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 200 } } }],
                tableRows: Array.from({ length: options.rowCount ?? 1 }, () => ({
                    tableCells: [{}],
                    trHeight: { val: { v: 20 }, hRule: TableRowHeightRule.EXACT },
                })),
            },
        },
        documentStyle: {
            documentFlavor,
            pageSize: { width: 400, height: options.pageHeight ?? 600 },
            marginTop: 20,
            marginBottom: 20,
            paragraphLineGapDefault: 0,
        },
    });
    const source = JSON.stringify(bed.dataModel.getSnapshot());
    const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
    try {
        if (options.incremental) {
            const generation = skeleton.startIncrementalLayout();
            let progress = skeleton.stepIncrementalLayout(generation, 0);
            for (let step = 0; step < 100 && !progress.complete; step++) {
                progress = skeleton.stepIncrementalLayout(generation, 0);
            }
            expect(progress.complete).toBe(true);
        } else {
            skeleton.calculate();
        }
        expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(source);
        const pages = skeleton.getSkeletonData()!.pages;
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        const before = lines.find((line) => line.paragraphIndex === beforeIndex)!;
        const after = lines.find((line) => line.paragraphIndex === afterIndex)!;
        const tables = pages.flatMap((page) => [...page.skeTables.values()]);
        return { before, after, tables, pages };
    } finally {
        skeleton.dispose();
        bed.viewModel.dispose();
        bed.dataModel.dispose();
    }
}

function contentBottom(line: IDocumentSkeletonLine): number {
    return (line.parent?.parent?.top ?? 0) + line.top + line.lineHeight - (line.marginBottom ?? 0);
}

describe('paragraph spacing around native inline tables', () => {
    beforeEach(() => {
        clearFontCreateConfigCache();
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(value: string) {
                        return {
                            width: value.length * 8,
                            fontBoundingBoxAscent: 10,
                            fontBoundingBoxDescent: 4,
                            actualBoundingBoxAscent: 10,
                            actualBoundingBoxDescent: 4,
                        };
                    },
                }),
            }),
        });
    });
    afterEach(() => vi.unstubAllGlobals());

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('keeps SDK heading defaults on their own side of a table (flavor: %s)', (flavor) => {
        const { before, after, tables } = layoutTable(flavor);
        expect(tables).toHaveLength(1);
        const table = tables[0];
        expect(table.top - contentBottom(before)).toBeCloseTo(10);
        expect(after.top + after.marginTop - table.top - table.height).toBeCloseTo(18);
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((flavor) =>
        [0, 10, 40].flatMap((before) => [0, 10, 40].map((after) => ({ flavor, before, after })))))('keeps independent spacing before=$before and after=$after (flavor: $flavor)', ({ flavor, before: beforeGap, after: afterGap }) => {
        const { before, after, tables } = layoutTable(flavor, { before: beforeGap, after: afterGap });
        const table = tables[0];
        expect(table.top - contentBottom(before)).toBeCloseTo(beforeGap);
        expect(after.top + after.marginTop - table.top - table.height).toBeCloseTo(afterGap);
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('matches incremental and complete table geometry (flavor: %s)', (flavor) => {
        const geometry = (incremental: boolean) => {
            const { before, after, tables } = layoutTable(flavor, { before: 40, after: 10, incremental });
            return { before: contentBottom(before), table: tables.map(({ top, height }) => ({ top, height })), after: after.top + after.marginTop };
        };
        expect(geometry(true)).toEqual(geometry(false));
    });

    it.each([false, true])('keeps before-spacing on the first table slice and after-spacing after the last slice (incremental: %s)', (incremental) => {
        const { before, after, tables, pages } = layoutTable(DocumentFlavor.TRADITIONAL, {
            before: 40,
            after: 10,
            pageHeight: 180,
            rowCount: 6,
            incremental,
        });
        expect(pages).toHaveLength(2);
        expect(tables).toHaveLength(2);
        expect(tables.reduce((total, table) => total + table.rows.length, 0)).toBe(6);
        expect(tables[0].top - contentBottom(before)).toBeCloseTo(40);
        expect(tables[1].top).toBe(0);
        expect(after.parent?.parent?.parent).toBe(tables[1].parent);
        expect(after.top + after.marginTop - tables[1].top - tables[1].height).toBeCloseTo(10);
    });
});
