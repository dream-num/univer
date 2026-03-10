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

import * as engineRender from '@univerjs/engine-render';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
    const textRangeMock = vi.fn(function (this: Record<string, unknown>, ...args: unknown[]) {
        this.args = args;
        this.rangeType = 'TEXT';
        this.startOffset = 1;
        this.endOffset = 3;
        this.collapsed = false;
        this.startNodePosition = { glyph: 0 };
        this.endNodePosition = { glyph: 1 };
        this.direction = 'FORWARD';
        this.segmentId = '';
        this.segmentPage = -1;
        this.isActive = () => true;
    });

    const rectRangeMock = vi.fn(function (this: Record<string, unknown>, ...args: unknown[]) {
        this.args = args;
        this.rangeType = 'RECT';
        this.startOffset = 1;
        this.endOffset = 3;
        this.collapsed = false;
        this.startNodePosition = { glyph: 0 };
        this.endNodePosition = { glyph: 1 };
        this.direction = 'FORWARD';
        this.segmentId = '';
        this.segmentPage = -1;
        this.startRow = 0;
        this.startColumn = 0;
        this.endRow = 1;
        this.endColumn = 2;
        this.tableId = 'table-1';
        this.spanEntireRow = false;
        this.spanEntireColumn = false;
        this.spanEntireTable = false;
        this.isActive = () => false;
    });

    return {
        textRangeMock,
        rectRangeMock,
        convertPositionsToRectRangesMock: vi.fn(() => [{ kind: 'rect' }]),
        isInSameTableCellDataMock: vi.fn(() => false),
        isInSameTableCellMock: vi.fn(() => false),
        isValidRectRangeMock: vi.fn(() => false),
    };
});

vi.mock('../text-range', () => ({
    TextRange: mocks.textRangeMock,
}));

vi.mock('../rect-range', () => ({
    RectRange: mocks.rectRangeMock,
    convertPositionsToRectRanges: mocks.convertPositionsToRectRangesMock,
}));

vi.mock('../convert-rect-range', () => ({
    isInSameTableCellData: mocks.isInSameTableCellDataMock,
    isInSameTableCell: mocks.isInSameTableCellMock,
    isValidRectRange: mocks.isValidRectRangeMock,
}));

const {
    getCanvasOffsetByEngine,
    getParagraphInfoByGlyph,
    getRangeListFromSelection,
    getRectRangeFromCharIndex,
    getTextRangeFromCharIndex,
    serializeRectRange,
    serializeTextRange,
} = await import('../selection-utils');

describe('selection utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.isInSameTableCellDataMock.mockReturnValue(false);
        mocks.isInSameTableCellMock.mockReturnValue(false);
        mocks.isValidRectRangeMock.mockReturnValue(false);
        mocks.convertPositionsToRectRangesMock.mockReturnValue([{ kind: 'rect' }]);
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

        getTextRangeFromCharIndex(1, 2, {} as never, {} as never, skeleton, {} as never, '', -1);
        getRectRangeFromCharIndex(1, 2, {} as never, {} as never, skeleton, {} as never, '', -1);

        expect(mocks.textRangeMock).toHaveBeenCalledWith({} as never, {} as never, skeleton, startPosition, endPosition, {} as never, '', -1);
        expect(mocks.rectRangeMock).toHaveBeenCalledWith({} as never, {} as never, skeleton, startPosition, endPosition, {} as never, '', -1);
    });

    it('routes same-cell and rect selections into the expected range buckets', () => {
        const anchor = { glyph: 0 } as never;
        const focus = { glyph: 1 } as never;
        const skeleton = {
            findCharIndexByPosition: vi.fn(),
            getViewModel: vi.fn(),
        } as never;

        mocks.isInSameTableCellDataMock.mockReturnValueOnce(true);
        mocks.isInSameTableCellMock.mockReturnValueOnce(true);

        const sameCell = getRangeListFromSelection(anchor, focus, {} as never, {} as never, skeleton, {} as never, '', -1);
        expect(sameCell?.textRanges).toHaveLength(1);
        expect(sameCell?.rectRanges).toHaveLength(0);

        mocks.isInSameTableCellDataMock.mockReturnValueOnce(true);
        mocks.isInSameTableCellMock.mockReturnValueOnce(false);

        const sameTable = getRangeListFromSelection(anchor, focus, {} as never, {} as never, skeleton, {} as never, '', -1);
        expect(sameTable?.textRanges).toHaveLength(0);
        expect(sameTable?.rectRanges).toEqual([{ kind: 'rect' }]);

        mocks.isValidRectRangeMock.mockReturnValueOnce(true);
        const rectRange = getRangeListFromSelection(anchor, focus, {} as never, {} as never, skeleton, {} as never, '', -1);
        expect(rectRange?.rectRanges).toEqual([{ kind: 'rect' }]);
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

        const result = getRangeListFromSelection({ glyph: 0 } as never, { glyph: 1 } as never, {} as never, {} as never, skeleton, {} as never, '', -1);
        expect(result?.textRanges).toHaveLength(1);
        expect(result?.rectRanges).toHaveLength(0);

        const missing = getRangeListFromSelection({ glyph: 0 } as never, { glyph: 1 } as never, {} as never, {} as never, skeleton, {} as never, '', -1);
        expect(missing).toBeUndefined();
    });

    it('reads canvas offsets, paragraph glyph info, and serializes ranges', () => {
        vi.spyOn(engineRender, 'getOffsetRectForDom').mockReturnValue({ left: 12, top: 34 } as never);

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
            rangeType: 'TEXT',
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
