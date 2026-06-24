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
