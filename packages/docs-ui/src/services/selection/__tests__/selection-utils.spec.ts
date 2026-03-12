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

import { getOffsetRectForDom } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NodePositionConvertToRectRange } from '../convert-rect-range';
import { RectRange } from '../rect-range';
import {
    getCanvasOffsetByEngine,
    getParagraphInfoByGlyph,
    getRangeListFromSelection,
    getRectRangeFromCharIndex,
    getTextRangeFromCharIndex,
    serializeRectRange,
    serializeTextRange,
} from '../selection-utils';
import { TextRange } from '../text-range';

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();

    return {
        ...actual,
        getOffsetRectForDom: vi.fn(),
    };
});

function createNodePosition(path: Array<string | number>, glyph = 0) {
    return {
        path,
        page: 0,
        section: 0,
        column: 0,
        line: 0,
        divide: 0,
        glyph,
        isBack: false,
        segmentPage: -1,
        pageType: 0,
    } as never;
}

function createGlyphInCell(cellPage: object) {
    return {
        parent: {
            parent: {
                parent: {
                    parent: {
                        parent: cellPage,
                    },
                },
            },
        },
    } as never;
}

function createDocument() {
    return {
        getOffsetConfig: () => ({
            docsLeft: 0,
            docsTop: 0,
        }),
    } as never;
}

describe('selection utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(TextRange.prototype as unknown as Record<'_anchorBlink', () => void>, '_anchorBlink').mockImplementation(() => {});
        vi.spyOn(TextRange.prototype, 'refresh').mockImplementation(() => {});
        vi.spyOn(RectRange.prototype, 'refresh').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('creates text and rect ranges from char indexes', () => {
        const startPosition = { glyph: 0 };
        const endPosition = { glyph: 1 };
        const skeleton = {
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startPosition)
                .mockReturnValueOnce(endPosition)
                .mockReturnValueOnce(startPosition)
                .mockReturnValueOnce(endPosition),
        } as never;

        const textRange = getTextRangeFromCharIndex(1, 2, {} as never, createDocument(), skeleton, {} as never, '', -1);
        const rectRange = getRectRangeFromCharIndex(1, 2, {} as never, createDocument(), skeleton, {} as never, '', -1);

        expect(textRange).toBeInstanceOf(TextRange);
        expect(textRange?.anchorNodePosition).toEqual(startPosition);
        expect(textRange?.focusNodePosition).toEqual(endPosition);
        expect(rectRange).toBeInstanceOf(RectRange);
        expect(rectRange?.anchorNodePosition).toEqual(startPosition);
        expect(rectRange?.focusNodePosition).toEqual(endPosition);
    });

    it('routes same-cell and rect selections into the expected range buckets', () => {
        const sameCellAnchor = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0]);
        const sameCellFocus = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0], 1);
        const crossPageFocus = createNodePosition(['skeTables', 'table-1#-#1', 'rows', 0, 'cells', 0], 1);
        const rectAnchor = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0]);
        const rectFocus = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 1, 'cells', 0], 1);
        const sameCellPage = {} as { parent?: unknown };
        const sameCellRow = { index: 0, cells: [sameCellPage] };
        sameCellPage.parent = sameCellRow;

        const crossPageStartCell = {} as { parent?: unknown };
        const crossPageStartRow = { index: 0, cells: [crossPageStartCell] };
        crossPageStartCell.parent = crossPageStartRow;

        const crossPageEndCell = {} as { parent?: unknown };
        const crossPageEndRow = { index: 0, cells: [crossPageEndCell] };
        crossPageEndCell.parent = crossPageEndRow;

        const skeleton = {
            findGlyphByPosition: vi
                .fn()
                .mockReturnValueOnce(createGlyphInCell(sameCellPage))
                .mockReturnValueOnce(createGlyphInCell(sameCellPage))
                .mockReturnValueOnce(createGlyphInCell(crossPageStartCell))
                .mockReturnValueOnce(createGlyphInCell(crossPageEndCell))
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(null),
        } as never;
        const document = createDocument();

        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([
            {
                anchor: rectAnchor,
                focus: rectFocus,
            },
        ] as never);

        const sameCell = getRangeListFromSelection(sameCellAnchor, sameCellFocus, {} as never, document, skeleton, {} as never, '', -1);
        expect(sameCell?.textRanges).toHaveLength(1);
        expect(sameCell?.rectRanges).toHaveLength(0);
        expect(sameCell?.textRanges[0]).toBeInstanceOf(TextRange);

        const sameTable = getRangeListFromSelection(sameCellAnchor, crossPageFocus, {} as never, document, skeleton, {} as never, '', -1);
        expect(sameTable?.textRanges).toHaveLength(0);
        expect(sameTable?.rectRanges).toHaveLength(1);
        expect(sameTable?.rectRanges[0]).toBeInstanceOf(RectRange);

        const rectRange = getRangeListFromSelection(rectAnchor, rectFocus, {} as never, document, skeleton, {} as never, '', -1);
        expect(rectRange?.textRanges).toHaveLength(0);
        expect(rectRange?.rectRanges).toHaveLength(1);
        expect(rectRange?.rectRanges[0]).toBeInstanceOf(RectRange);
    });

    it('builds normal text ranges outside tables and skips when offsets are missing', () => {
        const startNode = { glyph: 10 };
        const endNode = { glyph: 20 };
        const paragraph = {
            startIndex: 0,
            endIndex: 10,
            children: [],
        };
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(4)
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(4),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{ children: [paragraph] }],
                }),
            }),
        } as never;

        const result = getRangeListFromSelection(
            createNodePosition(['body']),
            createNodePosition(['body'], 1),
            {} as never,
            createDocument(),
            skeleton,
            {} as never,
            '',
            -1
        );
        expect(result?.textRanges).toHaveLength(1);
        expect(result?.rectRanges).toHaveLength(0);
        expect(result?.textRanges[0]).toBeInstanceOf(TextRange);

        const missing = getRangeListFromSelection(
            createNodePosition(['body']),
            createNodePosition(['body'], 1),
            {} as never,
            createDocument(),
            skeleton,
            {} as never,
            '',
            -1
        );
        expect(missing).toBeUndefined();
    });

    it('reads canvas offsets, paragraph glyph info, and serializes ranges', () => {
        vi.mocked(getOffsetRectForDom).mockReturnValue({ left: 12, top: 34 } as never);

        expect(getCanvasOffsetByEngine({ getCanvasElement: () => ({}) } as never)).toEqual({ left: 12, top: 34 });
        expect(getCanvasOffsetByEngine(null)).toEqual({ left: 0, top: 0 });

        const glyphA: Record<string, unknown> = { count: 1, content: 'A' };
        const glyphB: Record<string, unknown> = { count: 2, content: 'BC' };
        const paragraphLine1 = { paragraphIndex: 1, st: 3, divides: [{ glyphGroup: [glyphA] }] };
        const paragraphLine2 = { paragraphIndex: 1, st: 3, divides: [{ glyphGroup: [glyphB] }] };
        const column = { lines: [paragraphLine1, paragraphLine2] };
        const line = { paragraphIndex: 1, parent: column };
        glyphA.parent = { parent: line };
        glyphB.parent = { parent: line };

        expect(getParagraphInfoByGlyph(glyphB as never)).toEqual({
            st: 3,
            ed: 1,
            content: 'ABC',
            nodeIndex: 2,
        });
        expect(getParagraphInfoByGlyph({ parent: null } as never)).toBeUndefined();

        const textRange = {
            startOffset: 1,
            endOffset: 3,
            collapsed: false,
            rangeType: 'TEXT',
            startNodePosition: { glyph: 0 },
            endNodePosition: { glyph: 1 },
            direction: 'FORWARD',
            segmentId: 'body',
            segmentPage: -1,
            isActive: () => true,
        } as never;
        expect(serializeTextRange(textRange)).toMatchObject({
            startOffset: 1,
            endOffset: 3,
            isActive: true,
            segmentId: 'body',
        });

        const rectRange = {
            startOffset: 1,
            endOffset: 3,
            collapsed: false,
            rangeType: 'RECT',
            startNodePosition: { glyph: 0 },
            endNodePosition: { glyph: 1 },
            direction: 'FORWARD',
            segmentId: 'body',
            segmentPage: -1,
            startRow: 0,
            startColumn: 1,
            endRow: 2,
            endColumn: 3,
            tableId: 'table-1',
            spanEntireRow: true,
            spanEntireColumn: false,
            spanEntireTable: false,
            isActive: () => false,
        } as never;
        expect(serializeRectRange(rectRange)).toMatchObject({
            tableId: 'table-1',
            startRow: 0,
            endColumn: 3,
            isActive: false,
        });
    });
});
