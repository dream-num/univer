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

import { DataStreamTreeTokenType, Direction } from '@univerjs/core';
import { DocumentSkeletonPageType, LineType } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { DocMoveCursorController } from '../doc-move-cursor.controller';

function createControllerHarness() {
    return Object.create(DocMoveCursorController.prototype) as Record<string, (...args: unknown[]) => unknown>;
}

function createOffsetSkeleton(validOffsets: number[]) {
    const validOffsetSet = new Set(validOffsets);

    return {
        findNodePositionByCharIndex: vi.fn((offset: number) => validOffsetSet.has(offset) ? { offset } : undefined),
    };
}

describe('DocMoveCursorController movement helpers', () => {
    it('resolves Chinese word boundaries with the shared Segmenter behavior', () => {
        const controller = createControllerHarness();
        const line = { paragraphIndex: 0, st: 10, divides: [] as unknown[], parent: null as unknown };
        const column = { lines: [line] };
        line.parent = column;

        const glyphs = ['中', '文', '测', '试'].map((content) => ({
            count: 1,
            content,
            streamType: DataStreamTreeTokenType.LETTER,
        }));
        const divide = { st: 10, glyphGroup: glyphs, parent: line };
        line.divides = [divide];
        glyphs.forEach((glyph) => {
            Object.assign(glyph, { parent: divide });
        });

        const skeleton = {
            findNodeByCharIndex: vi.fn(() => glyphs[1]),
        };

        expect(controller._getWordBoundaryOffset(skeleton, 11, Direction.RIGHT, '', -1, 100)).toBe(12);
        expect(controller._getWordBoundaryOffset(skeleton, 13, Direction.LEFT, '', -1, 100)).toBe(12);
    });

    it('resolves visual line start and end from skeleton glyph positions', () => {
        const controller = createControllerHarness();
        const firstGlyph = {
            count: 1,
            content: 'A',
            streamType: DataStreamTreeTokenType.LETTER,
        };
        const paragraphGlyph = {
            count: 1,
            content: '\r',
            streamType: DataStreamTreeTokenType.PARAGRAPH,
        };
        const lastGlyph = {
            count: 1,
            content: 'B',
            streamType: DataStreamTreeTokenType.LETTER,
        };
        const line = { divides: [] as unknown[] };
        const divide = { st: 5, glyphGroup: [firstGlyph, lastGlyph, paragraphGlyph], parent: line };
        line.divides = [divide];
        [firstGlyph, lastGlyph, paragraphGlyph].forEach((glyph) => {
            Object.assign(glyph, { parent: divide });
        });

        const skeleton = {
            findNodeByCharIndex: vi.fn(() => lastGlyph),
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === firstGlyph ? 0 : 1 })),
            findCharIndexByPosition: vi.fn((position) => position.isBack ? 5 : 7),
        };

        expect(controller._getLineBoundaryOffset(skeleton, 6, Direction.LEFT, '', -1, 100)).toBe(5);
        expect(controller._getLineBoundaryOffset(skeleton, 6, Direction.RIGHT, '', -1, 100)).toBe(7);
    });

    it('ignores block range boundary glyphs when matching vertical cursor position', () => {
        const controller = createControllerHarness();
        const firstGlyph = {
            count: 1,
            content: 'A',
            left: 0,
            streamType: DataStreamTreeTokenType.LETTER,
        };
        const lastTextGlyph = {
            count: 1,
            content: 'B',
            left: 20,
            streamType: DataStreamTreeTokenType.LETTER,
        };
        const blockEndGlyph = {
            count: 1,
            content: DataStreamTreeTokenType.BLOCK_END,
            left: 88,
            streamType: DataStreamTreeTokenType.BLOCK_END,
        };
        const line = { divides: [] as unknown[] };
        const divide = { left: 0, glyphGroup: [firstGlyph, lastTextGlyph, blockEndGlyph], parent: line };
        line.divides = [divide];
        [firstGlyph, lastTextGlyph, blockEndGlyph].forEach((glyph) => {
            Object.assign(glyph, { parent: divide });
        });

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === lastTextGlyph ? 1 : -1 })),
        };

        expect(controller._matchPositionByLeftOffset(skeleton, line, 90, { segmentPage: -1 })).toEqual({ glyph: 1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(lastTextGlyph, -1);
    });

    it('uses a paragraph glyph as the vertical cursor target for empty paragraph lines', () => {
        const controller = createControllerHarness();
        const paragraphGlyph = {
            count: 1,
            content: DataStreamTreeTokenType.PARAGRAPH,
            left: 0,
            streamType: DataStreamTreeTokenType.PARAGRAPH,
        };
        const line = { divides: [] as unknown[] };
        const divide = { left: 0, glyphGroup: [paragraphGlyph], parent: line };
        line.divides = [divide];
        Object.assign(paragraphGlyph, { parent: divide });

        const skeleton = {
            findPositionByGlyph: vi.fn(() => ({ glyph: 0 })),
        };

        expect(controller._matchPositionByLeftOffset(skeleton, line, 0, { segmentPage: -1 })).toEqual({ glyph: 0 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(paragraphGlyph, -1);
    });

    it('enters the nearest column group column when moving vertically onto the block line', () => {
        const controller = createControllerHarness();
        const bodyGlyph = createGlyph('A', 118);
        const firstColumnGlyph = createGlyph('L', 0);
        const secondColumnGlyph = createGlyph('R', 16);
        const beforeLine = createLine([bodyGlyph], 10, 0);
        const blockLine = createBlockLine(11, 40);
        const bodyColumn = createColumn([beforeLine, blockLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const firstColumnPage = createPage([createColumn([createLine([firstColumnGlyph], 20, 0)])], DocumentSkeletonPageType.CELL);
        const secondColumnPage = createPage([createColumn([createLine([secondColumnGlyph], 30, 0)])], DocumentSkeletonPageType.CELL);
        const columnGroupColumnA = { columnId: 'a', left: 0, top: 0, width: 80, height: 20, st: 20, ed: 25, page: firstColumnPage };
        const columnGroupColumnB = { columnId: 'b', left: 100, top: 0, width: 80, height: 20, st: 30, ed: 35, page: secondColumnPage };
        const columnGroup = {
            columnGroupId: 'cg-1',
            columns: [columnGroupColumnA, columnGroupColumnB],
            ed: 40,
            height: 20,
            left: 0,
            st: 11,
            top: 10,
            width: 180,
        };
        Object.assign(columnGroupColumnA, { parent: columnGroup });
        Object.assign(columnGroupColumnB, { parent: columnGroup });
        Object.assign(firstColumnPage, { parent: columnGroupColumnA });
        Object.assign(secondColumnPage, { parent: columnGroupColumnB });
        Object.assign(columnGroup, { parent: bodyPage });
        bodyPage.skeColumnGroups.set('cg-1', columnGroup as never);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === secondColumnGlyph ? 'second' : 'other', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            bodyGlyph,
            { segmentPage: -1 },
            true
        )).toEqual({ glyph: 'second', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(secondColumnGlyph, -1);
    });

    it('leaves a column group column for the following body line when moving past its end', () => {
        const controller = createControllerHarness();
        const columnGlyph = createGlyph('C', 12);
        const afterGlyph = createGlyph('Z', 112);
        const blockLine = createBlockLine(11, 40);
        const afterLine = createLine([afterGlyph], 41, 0);
        const bodyColumn = createColumn([blockLine, afterLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const columnPage = createPage([createColumn([createLine([columnGlyph], 30, 0)])], DocumentSkeletonPageType.CELL);
        const columnGroupColumn = { columnId: 'b', left: 100, top: 0, width: 80, height: 20, st: 30, ed: 35, page: columnPage };
        const columnGroup = {
            columnGroupId: 'cg-1',
            columns: [columnGroupColumn],
            ed: 40,
            height: 20,
            left: 0,
            st: 11,
            top: 10,
            width: 180,
        };
        Object.assign(columnGroupColumn, { parent: columnGroup });
        Object.assign(columnPage, { parent: columnGroupColumn });
        Object.assign(columnGroup, { parent: bodyPage });
        bodyPage.skeColumnGroups.set('cg-1', columnGroup as never);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === afterGlyph ? 'after' : 'other', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            columnGlyph,
            { segmentPage: -1 },
            true
        )).toEqual({ glyph: 'after', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(afterGlyph, -1);
    });

    it('enters the nearest column group column from below when moving upward', () => {
        const controller = createControllerHarness();
        const afterGlyph = createGlyph('Z', 112);
        const columnGlyph = createGlyph('C', 12);
        const blockLine = createBlockLine(11, 40);
        const afterLine = createLine([afterGlyph], 41, 0);
        const bodyColumn = createColumn([blockLine, afterLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const columnPage = createPage([createColumn([createLine([columnGlyph], 30, 0)])], DocumentSkeletonPageType.CELL);
        const columnGroupColumn = { columnId: 'b', left: 100, top: 0, width: 80, height: 20, st: 30, ed: 35, page: columnPage };
        const columnGroup = createColumnGroup([columnGroupColumn], bodyPage);
        bodyPage.skeColumnGroups.set('cg-1', columnGroup as never);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === columnGlyph ? 'column' : 'other', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            afterGlyph,
            { segmentPage: -1 },
            false
        )).toEqual({ glyph: 'column', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(columnGlyph, -1);
    });

    it('leaves a column group column for the previous body line when moving above its start', () => {
        const controller = createControllerHarness();
        const beforeGlyph = createGlyph('A', 112);
        const columnGlyph = createGlyph('C', 12);
        const beforeLine = createLine([beforeGlyph], 10, 0);
        const blockLine = createBlockLine(11, 40);
        const bodyColumn = createColumn([beforeLine, blockLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const columnPage = createPage([createColumn([createLine([columnGlyph], 30, 0)])], DocumentSkeletonPageType.CELL);
        const columnGroupColumn = { columnId: 'b', left: 100, top: 0, width: 80, height: 20, st: 30, ed: 35, page: columnPage };
        const columnGroup = createColumnGroup([columnGroupColumn], bodyPage);
        bodyPage.skeColumnGroups.set('cg-1', columnGroup as never);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === beforeGlyph ? 'before' : 'other', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            columnGlyph,
            { segmentPage: -1 },
            false
        )).toEqual({ glyph: 'before', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(beforeGlyph, -1);
    });

    it('stops safely at a terminal column group when no following body line exists', () => {
        const controller = createControllerHarness();
        const columnGlyph = createGlyph('C', 12);
        const blockLine = createBlockLine(11, 40);
        const bodyColumn = createColumn([blockLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const columnPage = createPage([createColumn([createLine([columnGlyph], 30, 0)])], DocumentSkeletonPageType.CELL);
        const columnGroupColumn = { columnId: 'b', left: 100, top: 0, width: 80, height: 20, st: 30, ed: 35, page: columnPage };
        const columnGroup = createColumnGroup([columnGroupColumn], bodyPage);
        bodyPage.skeColumnGroups.set('cg-1', columnGroup as never);

        const skeleton = {
            findPositionByGlyph: vi.fn(),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            columnGlyph,
            { segmentPage: -1 },
            true
        )).toBeUndefined();
        expect(skeleton.findPositionByGlyph).not.toHaveBeenCalled();
    });

    it('enters the nearest docs table cell when moving vertically from a body line', () => {
        const controller = createControllerHarness();
        const bodyGlyph = createGlyph('A', 118);
        const firstCellGlyph = createGlyph('L', 8);
        const secondCellGlyph = createGlyph('R', 8);
        const beforeLine = createLine([bodyGlyph], 10, 0);
        const bodyColumn = createColumn([beforeLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const firstCell = createCellPage([createLine([firstCellGlyph], 20, 0)], 0, 80);
        const secondCell = createCellPage([createLine([secondCellGlyph], 30, 0)], 100, 80);
        createTable(bodyPage, [createTableRow([firstCell, secondCell], 0)], 12, 40);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === secondCellGlyph ? 'second' : 'other', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            bodyGlyph,
            { segmentPage: -1 },
            true
        )).toEqual({ glyph: 'second', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(secondCellGlyph, -1);
    });

    it('leaves a docs table cell with the cell-local cursor mapped back to the body line', () => {
        const controller = createControllerHarness();
        const cellGlyph = createGlyph('C', 12);
        const wrongBodyGlyph = createGlyph('W', 12);
        const rightBodyGlyph = createGlyph('R', 112);
        const afterLine = createLine([wrongBodyGlyph, rightBodyGlyph], 41, 0);
        const bodyColumn = createColumn([afterLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const cell = createCellPage([createLine([cellGlyph], 20, 0)], 100, 80);
        createTable(bodyPage, [createTableRow([cell], 0)], 12, 40);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === rightBodyGlyph ? 'right' : 'wrong', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            cellGlyph,
            { segmentPage: -1 },
            true
        )).toEqual({ glyph: 'right', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(rightBodyGlyph, -1);
    });

    it('moves to the nearest docs table cell when crossing a row boundary', () => {
        const controller = createControllerHarness();
        const currentGlyph = createGlyph('C', 5);
        const wrongCellGlyph = createGlyph('W', 8);
        const rightCellGlyph = createGlyph('R', 8);
        const bodyPage = createPage([createColumn([])], DocumentSkeletonPageType.BODY);
        const currentCell = createCellPage([createLine([currentGlyph], 20, 0)], 80, 20);
        const lowerLeftCell = createCellPage([createLine([wrongCellGlyph], 30, 0)], 0, 50);
        const lowerRightCell = createCellPage([createLine([rightCellGlyph], 40, 0)], 100, 50);
        createTable(bodyPage, [
            createTableRow([currentCell], 0),
            createTableRow([lowerLeftCell, lowerRightCell], 20),
        ], 12, 60);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === rightCellGlyph ? 'right' : 'wrong', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            currentGlyph,
            { segmentPage: -1 },
            true
        )).toEqual({ glyph: 'right', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(rightCellGlyph, -1);
    });

    it('enters the nearest docs table cell from below when moving upward', () => {
        const controller = createControllerHarness();
        const bodyGlyph = createGlyph('A', 118);
        const firstCellGlyph = createGlyph('L', 8);
        const secondCellGlyph = createGlyph('R', 8);
        const afterLine = createLine([bodyGlyph], 41, 0);
        const bodyColumn = createColumn([afterLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const firstCell = createCellPage([createLine([firstCellGlyph], 20, 0)], 0, 80);
        const secondCell = createCellPage([createLine([secondCellGlyph], 30, 0)], 100, 80);
        createTable(bodyPage, [createTableRow([firstCell, secondCell], 0)], 12, 40);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === secondCellGlyph ? 'second' : 'other', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            bodyGlyph,
            { segmentPage: -1 },
            false
        )).toEqual({ glyph: 'second', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(secondCellGlyph, -1);
    });

    it('leaves a docs table cell upward with the cell-local cursor mapped back to the body line', () => {
        const controller = createControllerHarness();
        const cellGlyph = createGlyph('C', 12);
        const wrongBodyGlyph = createGlyph('W', 12);
        const rightBodyGlyph = createGlyph('R', 112);
        const beforeLine = createLine([wrongBodyGlyph, rightBodyGlyph], 10, 0);
        const bodyColumn = createColumn([beforeLine]);
        const bodyPage = createPage([bodyColumn], DocumentSkeletonPageType.BODY);
        const cell = createCellPage([createLine([cellGlyph], 20, 0)], 100, 80);
        createTable(bodyPage, [createTableRow([cell], 0)], 13, 40);

        const skeleton = {
            findPositionByGlyph: vi.fn((glyph) => ({ glyph: glyph === rightBodyGlyph ? 'right' : 'wrong', segmentPage: -1 })),
        };

        expect(controller._getTopOrBottomPosition(
            skeleton,
            cellGlyph,
            { segmentPage: -1 },
            false
        )).toEqual({ glyph: 'right', isBack: true, segmentPage: -1 });
        expect(skeleton.findPositionByGlyph).toHaveBeenCalledWith(rightBodyGlyph, -1);
    });

    it('keeps column boundary tokens out of the default cursor skip list', () => {
        const controller = createControllerHarness();

        const skipTokens = controller._getCursorSkipTokens();

        expect(skipTokens).not.toContain(DataStreamTreeTokenType.COLUMN_GROUP_START);
        expect(skipTokens).not.toContain(DataStreamTreeTokenType.COLUMN_START);
        expect(skipTokens).not.toContain(DataStreamTreeTokenType.COLUMN_END);
        expect(skipTokens).not.toContain(DataStreamTreeTokenType.COLUMN_GROUP_END);
    });

    it('resolves document start and end offsets', () => {
        const controller = createControllerHarness();

        expect(controller._getCursorOffsetByGranularity({}, 8, Direction.UP, 'document', '', -1, 20)).toBe(0);
        expect(controller._getCursorOffsetByGranularity({}, 8, Direction.DOWN, 'document', '', -1, 20)).toBe(18);
    });

    it('resolves paragraph movement offsets from data-stream paragraph boundaries', () => {
        const controller = createControllerHarness();
        const dataStream = `Alpha${DataStreamTreeTokenType.PARAGRAPH}Beta${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;

        expect(controller._getParagraphBoundaryOffset(dataStream, 3, Direction.UP)).toBe(0);
        expect(controller._getParagraphBoundaryOffset(dataStream, 0, Direction.UP)).toBe(0);
        expect(controller._getParagraphBoundaryOffset(dataStream, 6, Direction.UP)).toBe(0);
        expect(controller._getParagraphBoundaryOffset(dataStream, 6, Direction.DOWN)).toBe(11);
        expect(controller._getParagraphBoundaryOffset(dataStream, 11, Direction.DOWN)).toBe(11);
    });

    it('normalizes document boundaries to renderable cursor offsets', () => {
        const controller = createControllerHarness();
        const dataStream = `${DataStreamTreeTokenType.BLOCK_START}A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.BLOCK_END}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const skeleton = createOffsetSkeleton([1]);

        expect(controller._normalizeRenderableCursorOffset(skeleton, dataStream, [], 0, Direction.UP, '', -1)).toBe(1);
        expect(controller._normalizeRenderableCursorOffset(skeleton, dataStream, [], dataStream.length - 2, Direction.DOWN, '', -1)).toBe(1);
    });

    it('keeps renderable cursor targets out of table and column structure tokens', () => {
        const controller = createControllerHarness();
        const tableStream = `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const columnStream = `${DataStreamTreeTokenType.COLUMN_GROUP_START}${DataStreamTreeTokenType.COLUMN_START}B${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.COLUMN_END}${DataStreamTreeTokenType.COLUMN_GROUP_END}${DataStreamTreeTokenType.SECTION_BREAK}`;

        expect(controller._normalizeRenderableCursorOffset(createOffsetSkeleton([3]), tableStream, [], 0, Direction.DOWN, '', -1)).toBe(3);
        expect(controller._normalizeRenderableCursorOffset(createOffsetSkeleton([2]), columnStream, [], 0, Direction.DOWN, '', -1)).toBe(2);
    });

    it('moves whole-entity custom range targets to renderable range boundaries', () => {
        const controller = createControllerHarness();
        const dataStream = `ABCD${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const customRanges = [{ wholeEntity: true, startIndex: 1, endIndex: 2 }];
        const skeleton = createOffsetSkeleton([0, 1, 3, 4]);

        expect(controller._normalizeRenderableCursorOffset(skeleton, dataStream, customRanges, 2, Direction.UP, '', -1)).toBe(1);
        expect(controller._normalizeRenderableCursorOffset(skeleton, dataStream, customRanges, 2, Direction.DOWN, '', -1)).toBe(3);
    });

    it('returns undefined when no renderable cursor target exists', () => {
        const controller = createControllerHarness();
        const dataStream = `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_END}${DataStreamTreeTokenType.SECTION_BREAK}`;

        expect(controller._normalizeRenderableCursorOffset(createOffsetSkeleton([]), dataStream, [], 0, Direction.DOWN, '', -1)).toBeUndefined();
    });
});

function createGlyph(content: string, left: number) {
    return {
        content,
        count: 1,
        left,
        streamType: DataStreamTreeTokenType.LETTER,
    };
}

function createLine(glyphs: unknown[], st: number, top: number) {
    const line = {
        divides: [] as unknown[],
        ed: st + glyphs.length,
        parent: null as unknown,
        st,
        top,
        type: LineType.PARAGRAPH,
    };
    const divide = { glyphGroup: glyphs, left: 0, parent: line };
    line.divides = [divide];
    glyphs.forEach((glyph) => Object.assign(glyph as object, { parent: divide }));

    return line;
}

function createBlockLine(st: number, ed: number) {
    return {
        divides: [],
        ed,
        parent: null as unknown,
        paragraphIndex: ed,
        st,
        type: LineType.BLOCK,
    };
}

function createColumn(lines: unknown[]) {
    const column = {
        lines,
        parent: null as unknown,
    };
    lines.forEach((line) => Object.assign(line as object, { parent: column }));

    return column;
}

function createPage(columns: unknown[], type: DocumentSkeletonPageType) {
    const section = {
        columns,
        parent: null as unknown,
    };
    const page = {
        sections: [section],
        skeColumnGroups: new Map(),
        skeTables: new Map(),
        type,
    };
    Object.assign(section, { parent: page });
    columns.forEach((column) => Object.assign(column as object, { parent: section }));

    return page;
}

function createCellPage(lines: unknown[], left: number, width: number) {
    return Object.assign(createPage([createColumn(lines)], DocumentSkeletonPageType.CELL), {
        left,
        marginLeft: 0,
        marginRight: 0,
        pageWidth: width,
    });
}

function createTableRow(cells: ReturnType<typeof createCellPage>[], top: number) {
    const row = {
        cells,
        height: 20,
        index: 0,
        isRepeatRow: false,
        parent: null as unknown,
        rowSource: {},
        st: 0,
        ed: 0,
        top,
    };
    cells.forEach((cell) => Object.assign(cell, { parent: row }));

    return row;
}

function createTable(
    page: ReturnType<typeof createPage>,
    rows: ReturnType<typeof createTableRow>[],
    st: number,
    ed: number
) {
    const table = {
        height: 40,
        left: 0,
        parent: page,
        rows,
        st,
        ed,
        tableId: 'table-1',
        tableSource: {},
        top: 0,
        width: 180,
    };
    rows.forEach((row, index) => Object.assign(row, { index, parent: table }));
    page.skeTables.set('table-1', table as never);

    return table;
}

function createColumnGroup(columns: object[], bodyPage: ReturnType<typeof createPage>) {
    const columnGroup = {
        columnGroupId: 'cg-1',
        columns,
        ed: 40,
        height: 20,
        left: 0,
        st: 11,
        top: 10,
        width: 180,
    };
    columns.forEach((column) => {
        const columnGroupColumn = column as { page: object; parent?: unknown };
        columnGroupColumn.parent = columnGroup;
        Object.assign(columnGroupColumn.page, { parent: columnGroupColumn });
    });
    Object.assign(columnGroup, { parent: bodyPage });

    return columnGroup;
}
