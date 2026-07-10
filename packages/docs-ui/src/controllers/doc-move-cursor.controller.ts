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

import type { DocumentDataModel, ICommandInfo, Nullable } from '@univerjs/core';
import type {
    DocumentSkeleton,
    IDocumentSkeletonCached,
    IDocumentSkeletonColumnGroup,
    IDocumentSkeletonColumnGroupColumn,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonTable,
    INodePosition,
    INodeSearch,
} from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';
import type { DocCursorMoveGranularity, IMoveCursorOperationParams } from '../commands/operations/doc-cursor.operation';
import {
    DataStreamTreeTokenType,
    Direction,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    RANGE_DIRECTION,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentSkeletonPageType, IRenderManagerService, LineType } from '@univerjs/engine-render';
import { getDocObject } from '../basics/component-tools';
import {
    findTableAfterLine,
    findTableBeforeLine,
    firstLineInCell,
    lastLineInCell,
} from '../basics/table';
import { MoveCursorOperation, MoveSelectionOperation } from '../commands/operations/doc-cursor.operation';
import { NodePositionConvertToCursor } from '../services/selection/convert-text-range';
import { getParagraphInfoByGlyph } from '../services/selection/selection-utils';
import { getNextWordBoundaryOffset } from '../services/selection/word-boundary';
import { DocBackScrollRenderController } from './render-controllers/back-scroll.render-controller';

interface IWholeEntityRange {
    wholeEntity?: boolean;
    startIndex: number;
    endIndex: number;
}

interface ILineSearchTarget {
    line: IDocumentSkeletonLine;
    offsetLeft: number;
}

export class DocMoveCursorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._commandExecutedListener();
    }

    override dispose(): void {
        super.dispose();

        this._onInputSubscription?.unsubscribe();
    }

    private _commandExecutedListener() {
        const updateCommandList = [MoveCursorOperation.id, MoveSelectionOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                const param = command.params as IMoveCursorOperationParams;

                switch (command.id) {
                    case MoveCursorOperation.id: {
                        return this._handleMoveCursor(param.direction, param.granularity ?? 'character');
                    }

                    case MoveSelectionOperation.id: {
                        return this._handleShiftMoveSelection(param.direction, param.granularity ?? 'character');
                    }

                    default: {
                        throw new Error('Unknown command');
                    }
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _handleShiftMoveSelection(direction: Direction, granularity: DocCursorMoveGranularity = 'character') {
        const activeRange = this._textSelectionManagerService.getActiveTextRange();
        const allRanges = this._textSelectionManagerService.getTextRanges()!;
        const docDataModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (docDataModel == null) {
            return;
        }

        const skeleton = this._renderManagerService.getRenderById(docDataModel.getUnitId())
            ?.with(DocSkeletonManagerService)
            .getSkeleton();
        const docObject = this._getDocObject();

        if (activeRange == null || skeleton == null || docObject == null) {
            return;
        }

        const {
            startOffset,
            endOffset,
            style,
            collapsed,
            direction: rangeDirection,
            segmentId,
            startNodePosition,
            endNodePosition,
            segmentPage,
        } = activeRange;
        const normalizedSegmentId = segmentId ?? '';
        const normalizedSegmentPage = segmentPage ?? -1;

        if (allRanges.length > 1) {
            let min = Number.POSITIVE_INFINITY;
            let max = Number.NEGATIVE_INFINITY;

            for (const range of allRanges) {
                min = Math.min(min, range.startOffset!);
                max = Math.max(max, range.endOffset!);
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: direction === Direction.LEFT || direction === Direction.UP ? max : min,
                    endOffset: direction === Direction.LEFT || direction === Direction.UP ? min : max,
                    style,
                },
            ], false);

            return;
        }

        const anchorOffset = collapsed
            ? startOffset
            : rangeDirection === RANGE_DIRECTION.FORWARD
                ? startOffset
                : endOffset;

        let focusOffset = collapsed
            ? endOffset
            : rangeDirection === RANGE_DIRECTION.FORWARD
                ? endOffset
                : startOffset;
        const body = docDataModel.getSelfOrHeaderFooterModel(normalizedSegmentId)?.getBody();

        if (body == null) {
            return;
        }

        const dataStreamLength = body.dataStream.length ?? Number.POSITIVE_INFINITY;
        const customRanges = docDataModel.getCustomRanges() ?? [];

        if (granularity !== 'character') {
            const nextOffset = this._getCursorOffsetByGranularity(
                skeleton,
                focusOffset,
                direction,
                granularity,
                normalizedSegmentId,
                normalizedSegmentPage,
                dataStreamLength,
                body.dataStream
            );

            if (nextOffset == null || nextOffset === focusOffset) {
                return;
            }

            const normalizedNextOffset = this._normalizeRenderableCursorOffset(
                skeleton,
                body.dataStream,
                customRanges,
                nextOffset,
                direction,
                normalizedSegmentId,
                normalizedSegmentPage
            );

            if (normalizedNextOffset == null || normalizedNextOffset === focusOffset) {
                return;
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: anchorOffset,
                    endOffset: normalizedNextOffset,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), normalizedNextOffset);

            return;
        }

        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            const preGlyph = skeleton.findNodeByCharIndex(focusOffset - 1, segmentId, segmentPage);
            const curGlyph = skeleton.findNodeByCharIndex(focusOffset, segmentId, segmentPage)!;

            focusOffset =
                direction === Direction.RIGHT ? focusOffset + curGlyph.count : focusOffset - (preGlyph?.count ?? 0);

            focusOffset = Math.min(dataStreamLength - 2, Math.max(0, focusOffset));

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: anchorOffset,
                    endOffset: focusOffset,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), focusOffset);
        } else {
            const focusGlyph = skeleton.findNodeByCharIndex(focusOffset, segmentId, segmentPage);
            const documentOffsetConfig = docObject.document.getOffsetConfig();
            const focusNodePosition = collapsed ? startNodePosition : rangeDirection === RANGE_DIRECTION.FORWARD ? endNodePosition : startNodePosition;

            const newPos = this._getTopOrBottomPosition(skeleton, focusGlyph, focusNodePosition, direction === Direction.DOWN, true);

            if (newPos == null) {
                // move selection
                const newFocusOffset = this._normalizeRenderableCursorOffset(
                    skeleton,
                    body.dataStream,
                    customRanges,
                    direction === Direction.UP ? 0 : dataStreamLength - 2,
                    direction,
                    normalizedSegmentId,
                    normalizedSegmentPage
                );

                if (newFocusOffset == null || newFocusOffset === focusOffset) {
                    return;
                }

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: anchorOffset,
                        endOffset: newFocusOffset,
                        style,
                    },
                ], false);

                return;
            }

            const newActiveRange = new NodePositionConvertToCursor(documentOffsetConfig, skeleton).getRangePointData(
                newPos,
                newPos
            ).cursorList[0];
            const newFocusOffset = this._normalizeRenderableCursorOffset(
                skeleton,
                body.dataStream,
                customRanges,
                newActiveRange.endOffset,
                direction,
                normalizedSegmentId,
                normalizedSegmentPage
            );

            if (newFocusOffset == null || newFocusOffset === focusOffset) {
                return;
            }

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: anchorOffset,
                    endOffset: newFocusOffset,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), newFocusOffset);
        }
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _handleMoveCursor(direction: Direction, granularity: DocCursorMoveGranularity = 'character') {
        const activeRange = this._textSelectionManagerService.getActiveTextRange();
        const allRanges = this._textSelectionManagerService.getTextRanges();
        const docDataModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (docDataModel == null) {
            return false;
        }

        const skeleton = this._renderManagerService.getRenderById(docDataModel.getUnitId())
            ?.with(DocSkeletonManagerService)
            .getSkeleton();
        const docObject = this._getDocObject();
        if (activeRange == null || skeleton == null || docObject == null || allRanges == null) {
            return;
        }

        const { startOffset, endOffset, style, collapsed, segmentId, startNodePosition, endNodePosition, segmentPage } = activeRange;
        const normalizedSegmentId = segmentId ?? '';
        const normalizedSegmentPage = segmentPage ?? -1;
        const body = docDataModel.getSelfOrHeaderFooterModel(normalizedSegmentId)?.getBody();

        if (body == null) {
            return;
        }

        const dataStreamLength = body.dataStream.length ?? Number.POSITIVE_INFINITY;
        const customRanges = docDataModel.getCustomRanges() ?? [];

        if (granularity !== 'character') {
            let cursorOffset: number;

            if (!activeRange.collapsed || allRanges.length > 1) {
                let min = Number.POSITIVE_INFINITY;
                let max = Number.NEGATIVE_INFINITY;

                for (const range of allRanges) {
                    min = Math.min(min, range.startOffset!);
                    max = Math.max(max, range.endOffset!);
                }

                cursorOffset = direction === Direction.LEFT || direction === Direction.UP ? min : max;
            } else {
                cursorOffset = direction === Direction.LEFT || direction === Direction.UP ? startOffset : endOffset;
            }

            let cursor = this._getCursorOffsetByGranularity(
                skeleton,
                cursorOffset,
                direction,
                granularity,
                normalizedSegmentId,
                normalizedSegmentPage,
                dataStreamLength,
                body.dataStream
            );

            if (cursor == null) {
                return;
            }

            cursor = this._normalizeRenderableCursorOffset(
                skeleton,
                body.dataStream,
                customRanges,
                cursor,
                direction,
                normalizedSegmentId,
                normalizedSegmentPage
            );

            if (cursor == null) {
                return;
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), cursor);

            return;
        }

        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            let cursor: number;

            if (!activeRange.collapsed || allRanges.length > 1) {
                let min = Number.POSITIVE_INFINITY;
                let max = Number.NEGATIVE_INFINITY;

                for (const range of allRanges) {
                    min = Math.min(min, range.startOffset!);
                    max = Math.max(max, range.endOffset!);
                }

                cursor = direction === Direction.LEFT ? min : max;
            } else {
                const preSpan = skeleton.findNodeByCharIndex(startOffset - 1, segmentId, segmentPage);
                const curSpan = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage)!;
                const nextGlyph = skeleton.findNodeByCharIndex(startOffset + 1, segmentId, segmentPage);

                if (direction === Direction.LEFT) {
                    cursor = Math.max(0, startOffset - (preSpan?.count ?? 1));
                } else {
                    // -1 because the length of the string will be 1 larger than the index, and the reason for subtracting another 1 is because it ends in \n
                    cursor = Math.min(dataStreamLength - 2, endOffset + curSpan.count + (nextGlyph?.streamType === DataStreamTreeTokenType.SECTION_BREAK ? 1 : 0));
                }
            }
            const skipTokens: string[] = [
                ...this._getCursorSkipTokens(),
            ];
            if (direction === Direction.LEFT) {
                while (skipTokens.includes(body.dataStream[cursor])) {
                    cursor--;
                }
            } else {
                while (skipTokens.includes(body.dataStream[cursor])) {
                    cursor++;
                }
            }

            cursor = this._normalizeCursorOffset(body.dataStream, customRanges, cursor, direction);
            const normalizedCursor = this._normalizeRenderableCursorOffset(
                skeleton,
                body.dataStream,
                customRanges,
                cursor,
                direction,
                normalizedSegmentId,
                normalizedSegmentPage
            );

            if (normalizedCursor == null) {
                return;
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: normalizedCursor,
                    endOffset: normalizedCursor,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), normalizedCursor);
        } else {
            const startNode = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage);
            const endNode = skeleton.findNodeByCharIndex(endOffset, segmentId, segmentPage);

            const documentOffsetConfig = docObject.document.getOffsetConfig();

            const newPos = this._getTopOrBottomPosition(
                skeleton,
                direction === Direction.UP ? startNode : (collapsed ? startNode : endNode),
                direction === Direction.UP ? startNodePosition : (collapsed ? startNodePosition : endNodePosition),
                direction === Direction.DOWN
            );

            if (newPos == null) {
                let cursor;

                if (collapsed) {
                    // Move cursor to the beginning place when arrow up at first line,
                    // and move cursor to the end place when arrow down at last line.
                    cursor = this._normalizeRenderableCursorOffset(
                        skeleton,
                        body.dataStream,
                        customRanges,
                        direction === Direction.UP ? 0 : dataStreamLength - 2,
                        direction,
                        normalizedSegmentId,
                        normalizedSegmentPage
                    );
                } else {
                    // Handle at the startOffset at first line when arrow up,
                    // and endOffset at the last line when arrow down.
                    cursor = this._normalizeRenderableCursorOffset(
                        skeleton,
                        body.dataStream,
                        customRanges,
                        direction === Direction.UP ? startOffset : endOffset,
                        direction,
                        normalizedSegmentId,
                        normalizedSegmentPage
                    );
                }

                if (cursor == null) {
                    return;
                }

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: cursor,
                        endOffset: cursor,
                        style,
                    },
                ], false);

                return;
            }

            const newActiveRange = new NodePositionConvertToCursor(documentOffsetConfig, skeleton).getRangePointData(
                newPos,
                newPos
            ).cursorList[0];
            const cursor = this._normalizeRenderableCursorOffset(
                skeleton,
                body.dataStream,
                customRanges,
                newActiveRange.endOffset,
                direction,
                normalizedSegmentId,
                normalizedSegmentPage
            );

            if (cursor == null) {
                return;
            }

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), cursor);
        }
    }

    private _getCursorOffsetByGranularity(
        skeleton: DocumentSkeleton,
        focusOffset: number,
        direction: Direction,
        granularity: DocCursorMoveGranularity,
        segmentId: string,
        segmentPage: number,
        dataStreamLength: number,
        dataStream = ''
    ): Nullable<number> {
        switch (granularity) {
            case 'document':
                return direction === Direction.LEFT || direction === Direction.UP ? 0 : dataStreamLength - 2;
            case 'paragraph':
                return this._getParagraphBoundaryOffset(dataStream, focusOffset, direction);
            case 'line':
                return this._getLineBoundaryOffset(skeleton, focusOffset, direction, segmentId, segmentPage, dataStreamLength);
            case 'word':
                return this._getWordBoundaryOffset(skeleton, focusOffset, direction, segmentId, segmentPage, dataStreamLength);
            case 'character':
            default:
                return null;
        }
    }

    private _getParagraphBoundaryOffset(
        dataStream: string,
        focusOffset: number,
        direction: Direction
    ): Nullable<number> {
        if (direction !== Direction.UP && direction !== Direction.DOWN) {
            return;
        }

        if (dataStream.length === 0) {
            return 0;
        }

        const cursor = Math.min(Math.max(0, focusOffset), dataStream.length - 1);

        if (direction === Direction.UP) {
            const currentParagraphStart = this._getCurrentParagraphStartOffset(dataStream, cursor);
            if (cursor > currentParagraphStart) {
                return currentParagraphStart;
            }

            return this._getCurrentParagraphStartOffset(dataStream, Math.max(0, currentParagraphStart - 1));
        }

        const nextParagraphEnd = dataStream.indexOf(DataStreamTreeTokenType.PARAGRAPH, cursor);

        return nextParagraphEnd === -1 ? dataStream.length - 1 : nextParagraphEnd + 1;
    }

    private _getCurrentParagraphStartOffset(dataStream: string, cursor: number): number {
        for (let index = Math.min(cursor - 1, dataStream.length - 1); index >= 0; index--) {
            const token = dataStream[index];
            if (token === DataStreamTreeTokenType.PARAGRAPH || token === DataStreamTreeTokenType.SECTION_BREAK) {
                return index + 1;
            }
        }

        return 0;
    }

    private _getWordBoundaryOffset(
        skeleton: DocumentSkeleton,
        focusOffset: number,
        direction: Direction,
        segmentId: string,
        segmentPage: number,
        dataStreamLength: number
    ): Nullable<number> {
        if (direction !== Direction.LEFT && direction !== Direction.RIGHT) {
            return;
        }

        const glyph = skeleton.findNodeByCharIndex(focusOffset, segmentId, segmentPage)
            ?? skeleton.findNodeByCharIndex(Math.max(0, focusOffset - 1), segmentId, segmentPage);

        if (glyph == null) {
            return direction === Direction.LEFT ? 0 : dataStreamLength - 2;
        }

        const paragraphInfo = getParagraphInfoByGlyph(glyph);

        if (paragraphInfo == null) {
            return;
        }

        const nodeIndex = Math.min(Math.max(0, focusOffset - paragraphInfo.st), paragraphInfo.content.length);
        const nextOffset = getNextWordBoundaryOffset(paragraphInfo.content, nodeIndex, paragraphInfo.st, direction);

        if (nextOffset == null) {
            return;
        }

        return Math.min(dataStreamLength - 2, Math.max(0, nextOffset));
    }

    private _getLineBoundaryOffset(
        skeleton: DocumentSkeleton,
        focusOffset: number,
        direction: Direction,
        segmentId: string,
        segmentPage: number,
        dataStreamLength: number
    ): Nullable<number> {
        if (direction !== Direction.LEFT && direction !== Direction.RIGHT) {
            return;
        }

        const glyph = skeleton.findNodeByCharIndex(focusOffset, segmentId, segmentPage)
            ?? skeleton.findNodeByCharIndex(Math.max(0, focusOffset - 1), segmentId, segmentPage);
        const line = glyph?.parent?.parent;

        if (line == null) {
            return direction === Direction.LEFT ? 0 : dataStreamLength - 2;
        }

        const boundaryGlyph = direction === Direction.LEFT
            ? this._getFirstCursorGlyphInLine(line)
            : this._getLastCursorGlyphInLine(line);
        const boundaryPosition = boundaryGlyph == null
            ? undefined
            : skeleton.findPositionByGlyph(boundaryGlyph, segmentPage);

        if (boundaryPosition == null) {
            return direction === Direction.LEFT ? 0 : dataStreamLength - 2;
        }

        const cursor = skeleton.findCharIndexByPosition({
            ...boundaryPosition,
            isBack: direction === Direction.LEFT,
        });

        if (cursor == null) {
            return;
        }

        return Math.min(dataStreamLength - 2, Math.max(0, cursor));
    }

    private _getFirstCursorGlyphInLine(line: IDocumentSkeletonLine): Nullable<IDocumentSkeletonGlyph> {
        for (const divide of line.divides) {
            for (const glyph of divide.glyphGroup) {
                if (this._isCursorAddressableGlyph(glyph)) {
                    return glyph;
                }
            }
        }
    }

    private _getLastCursorGlyphInLine(line: IDocumentSkeletonLine): Nullable<IDocumentSkeletonGlyph> {
        for (let divideIndex = line.divides.length - 1; divideIndex >= 0; divideIndex--) {
            const divide = line.divides[divideIndex];
            for (let glyphIndex = divide.glyphGroup.length - 1; glyphIndex >= 0; glyphIndex--) {
                const glyph = divide.glyphGroup[glyphIndex];
                if (this._isCursorAddressableGlyph(glyph)) {
                    return glyph;
                }
            }
        }
    }

    private _isCursorAddressableGlyph(glyph: IDocumentSkeletonGlyph): boolean {
        return glyph.count > 0 && !this._getCursorSkipTokens(true).includes(glyph.streamType);
    }

    private _normalizeCursorOffset(
        dataStream: string,
        customRanges: IWholeEntityRange[],
        cursor: number,
        direction: Direction
    ): number {
        cursor = Math.max(0, cursor);

        const skipTokens = this._getCursorSkipTokens();

        if (direction === Direction.LEFT || direction === Direction.UP) {
            while (cursor > 0 && skipTokens.includes(dataStream[cursor])) {
                cursor--;
            }
        } else {
            while (cursor < dataStream.length - 1 && skipTokens.includes(dataStream[cursor])) {
                cursor++;
            }
        }

        return this._normalizeWholeEntityRanges(customRanges, cursor, direction);
    }

    private _normalizeRenderableCursorOffset(
        skeleton: DocumentSkeleton,
        dataStream: string,
        customRanges: IWholeEntityRange[],
        cursor: number,
        direction: Direction,
        segmentId: string,
        segmentPage: number
    ): Nullable<number> {
        const boundedCursor = Math.min(Math.max(0, cursor), Math.max(0, dataStream.length - 1));
        const primaryCursor = this._findNearestRenderableCursorOffset(
            skeleton,
            dataStream,
            customRanges,
            boundedCursor,
            direction,
            segmentId,
            segmentPage
        );

        if (primaryCursor != null) {
            return primaryCursor;
        }

        const fallbackDirection = direction === Direction.LEFT || direction === Direction.UP ? Direction.DOWN : Direction.UP;

        return this._findNearestRenderableCursorOffset(
            skeleton,
            dataStream,
            customRanges,
            boundedCursor,
            fallbackDirection,
            segmentId,
            segmentPage
        );
    }

    private _findNearestRenderableCursorOffset(
        skeleton: DocumentSkeleton,
        dataStream: string,
        customRanges: IWholeEntityRange[],
        cursor: number,
        direction: Direction,
        segmentId: string,
        segmentPage: number
    ): Nullable<number> {
        const step = direction === Direction.LEFT || direction === Direction.UP ? -1 : 1;
        let current = Math.min(Math.max(0, cursor), Math.max(0, dataStream.length - 1));
        const visited = new Set<number>();

        while (current >= 0 && current < dataStream.length && !visited.has(current)) {
            visited.add(current);

            const normalizedCursor = this._normalizeCursorOffset(dataStream, customRanges, current, direction);

            if (normalizedCursor < 0 || normalizedCursor >= dataStream.length) {
                return;
            }

            if (this._isRenderableCursorOffset(skeleton, dataStream, normalizedCursor, segmentId, segmentPage)) {
                return normalizedCursor;
            }

            current = normalizedCursor + step;
        }
    }

    private _isRenderableCursorOffset(
        skeleton: DocumentSkeleton,
        dataStream: string,
        cursor: number,
        segmentId: string,
        segmentPage: number
    ): boolean {
        if (cursor < 0 || cursor >= dataStream.length) {
            return false;
        }

        if (this._getNonRenderableCursorTokens().includes(dataStream[cursor])) {
            return false;
        }

        return skeleton.findNodePositionByCharIndex(cursor, true, segmentId, segmentPage) != null;
    }

    private _normalizeWholeEntityRanges(
        customRanges: IWholeEntityRange[],
        cursor: number,
        direction: Direction
    ): number {
        const relativeRanges = customRanges.filter((range) => range.wholeEntity && range.startIndex < cursor && range.endIndex >= cursor);
        relativeRanges.forEach((range) => {
            if (direction === Direction.LEFT || direction === Direction.UP) {
                cursor = Math.min(range.startIndex, cursor);
            } else {
                cursor = Math.max(range.endIndex + 1, cursor);
            }
        });

        return cursor;
    }

    private _getCursorSkipTokens(includeParagraph = false): string[] {
        const tokens = [
            DataStreamTreeTokenType.TABLE_START,
            DataStreamTreeTokenType.TABLE_END,
            DataStreamTreeTokenType.TABLE_ROW_START,
            DataStreamTreeTokenType.TABLE_ROW_END,
            DataStreamTreeTokenType.TABLE_CELL_START,
            DataStreamTreeTokenType.TABLE_CELL_END,
            DataStreamTreeTokenType.SECTION_BREAK,
            DataStreamTreeTokenType.BLOCK_START,
            DataStreamTreeTokenType.BLOCK_END,
        ];

        if (includeParagraph) {
            tokens.push(DataStreamTreeTokenType.PARAGRAPH);
        }

        return tokens;
    }

    private _getNonRenderableCursorTokens(): string[] {
        return [
            ...this._getCursorSkipTokens(),
            DataStreamTreeTokenType.COLUMN_GROUP_START,
            DataStreamTreeTokenType.COLUMN_GROUP_END,
            DataStreamTreeTokenType.COLUMN_START,
            DataStreamTreeTokenType.COLUMN_END,
        ];
    }

    private _getTopOrBottomPosition(
        docSkeleton: DocumentSkeleton,
        glyph: Nullable<IDocumentSkeletonGlyph>,
        nodePosition: Nullable<INodePosition>,
        direction: boolean,
        skipCellContent = false
    ): Nullable<INodePosition> {
        if (glyph == null || nodePosition == null) {
            return;
        }

        const offsetLeft = this._getGlyphLeftOffsetInLine(glyph);

        const target = this._getNextOrPrevLineTarget(glyph, direction, offsetLeft, skipCellContent);

        if (target == null) {
            return;
        }

        const position: Nullable<INodeSearch> = this._matchPositionByLeftOffset(docSkeleton, target.line, target.offsetLeft, nodePosition);

        if (position == null) {
            return;
        }

        // TODO: @JOCS, hardcode isBack to true, `_getTopOrBottomPosition` need to rewrite.
        return { ...position, isBack: true };
    }

    private _getGlyphLeftOffsetInLine(glyph: IDocumentSkeletonGlyph) {
        const divide = glyph.parent;

        if (divide == null) {
            return Number.NEGATIVE_INFINITY;
        }

        const divideLeft = divide.left;
        const { left } = glyph;
        const start = divideLeft + left;

        return start;
    }

    private _matchPositionByLeftOffset(docSkeleton: DocumentSkeleton, line: IDocumentSkeletonLine, offsetLeft: number, nodePosition: INodePosition) {
        const nearestNode: {
            glyph?: IDocumentSkeletonGlyph;
            distance: number;
        } = {
            distance: Number.POSITIVE_INFINITY,
        };
        const nearestEmptyParagraphNode: {
            glyph?: IDocumentSkeletonGlyph;
            distance: number;
        } = {
            distance: Number.POSITIVE_INFINITY,
        };

        for (const divide of line.divides) {
            const divideLeft = divide.left;

            for (const glyph of divide.glyphGroup) {
                if (!this._isCursorAddressableGlyph(glyph)) {
                    if (glyph.streamType === DataStreamTreeTokenType.PARAGRAPH && glyph.count > 0) {
                        const { left } = glyph;
                        const leftSide = divideLeft + left;
                        const distance = Math.abs(offsetLeft - leftSide);

                        if (distance < nearestEmptyParagraphNode.distance) {
                            nearestEmptyParagraphNode.glyph = glyph;
                            nearestEmptyParagraphNode.distance = distance;
                        }
                    }
                    continue;
                }
                const { left } = glyph;
                const leftSide = divideLeft + left;

                const distance = Math.abs(offsetLeft - leftSide);

                if (distance < nearestNode.distance) {
                    nearestNode.glyph = glyph;
                    nearestNode.distance = distance;
                }
            }
        }

        const nearestGlyph = nearestNode.glyph ?? nearestEmptyParagraphNode.glyph;

        if (nearestGlyph == null) {
            return;
        }

        const { segmentPage } = nodePosition;

        return docSkeleton.findPositionByGlyph(nearestGlyph, segmentPage);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _getNextOrPrevLineTarget(
        glyph: IDocumentSkeletonGlyph,
        direction: boolean,
        offsetLeft: number,
        skipCellContent = false
    ): Nullable<ILineSearchTarget> {
        const divide = glyph.parent;
        const line = divide?.parent;
        const column = line?.parent;
        const section = column?.parent;
        const page = section?.parent;

        if (divide == null || line == null || column == null || section == null || page == null) {
            return;
        }

        const currentLineIndex = column.lines.indexOf(line);

        if (currentLineIndex === -1) {
            return;
        }

        let newLine: IDocumentSkeletonLine;

        if (this._isTableCellContentPage(page) && skipCellContent) {
            const tableCellTarget = this._getAdjacentTableCellLineTarget(page, direction, offsetLeft);

            if (tableCellTarget != null) {
                return tableCellTarget;
            }
        }

        if (direction === true) {
            newLine = column.lines[currentLineIndex + 1];
            const tableTarget = this._getTableLineTargetFromPageLine(line, page, direction, offsetLeft);

            if (tableTarget != null) {
                return tableTarget;
            }
        } else {
            newLine = column.lines[currentLineIndex - 1];
            const tableTarget = this._getTableLineTargetFromPageLine(line, page, direction, offsetLeft);

            if (tableTarget != null) {
                return tableTarget;
            }
        }

        const columnGroupTarget = this._getColumnGroupLineTargetFromBlockLine(newLine, page, direction, offsetLeft);
        if (columnGroupTarget != null) {
            return columnGroupTarget;
        }

        if (newLine != null) {
            return { line: newLine, offsetLeft };
        }

        const currentColumnIndex = section.columns.indexOf(column);

        if (currentColumnIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = section.columns[currentColumnIndex + 1]?.lines[0];
        } else {
            const prevColumnLines = section.columns?.[currentColumnIndex - 1]?.lines;
            newLine = prevColumnLines?.[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return { line: newLine, offsetLeft };
        }

        const currentSectionIndex = page.sections.indexOf(section);

        if (currentSectionIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = page.sections[currentSectionIndex - 1]?.columns[0]?.lines[0];
        } else {
            const prevColumns = page.sections?.[currentSectionIndex - 1]?.columns;
            const column = prevColumns?.[prevColumns.length - 1];
            const prevColumnLines = column?.lines;
            newLine = prevColumnLines?.[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return { line: newLine, offsetLeft };
        }

        if (this._isColumnGroupContentPage(page)) {
            // A column page is nested under a column-group column, not under the
            // document skeleton. Stop here even when the host has no adjacent line.
            return this._getColumnGroupExitLineTarget(page, direction, offsetLeft);
        }

        if (this._isTableCellContentPage(page)) {
            return this._getAdjacentTableCellLineTarget(page, direction, offsetLeft);
        }

        const skeleton: Nullable<IDocumentSkeletonCached> = page.parent as IDocumentSkeletonCached;

        if (skeleton?.pages == null) {
            return;
        }

        const currentPageIndex = skeleton.pages.indexOf(page);

        if (currentPageIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = skeleton.pages[currentPageIndex + 1]?.sections[0]?.columns[0]?.lines[0];
        } else {
            const prevSections = skeleton.pages[currentPageIndex - 1]?.sections;
            if (prevSections == null) {
                return;
            }
            const prevColumns = prevSections[prevSections.length - 1]?.columns;
            const column = prevColumns[prevColumns.length - 1];
            const prevColumnLines = column?.lines;
            newLine = prevColumnLines[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return { line: newLine, offsetLeft };
        }
    }

    private _getTableLineTargetFromPageLine(
        line: IDocumentSkeletonLine,
        page: IDocumentSkeletonPage,
        direction: boolean,
        offsetLeft: number
    ): Nullable<ILineSearchTarget> {
        const table = direction ? findTableAfterLine(line, page) : findTableBeforeLine(line, page);

        if (table == null) {
            return;
        }

        return this._getTableBoundaryLineTarget(table, direction, offsetLeft);
    }

    private _getTableBoundaryLineTarget(
        table: IDocumentSkeletonTable,
        direction: boolean,
        offsetLeft: number
    ): Nullable<ILineSearchTarget> {
        const rows = direction ? table.rows : [...table.rows].reverse();

        for (const row of rows) {
            if (row.isRepeatRow) {
                continue;
            }

            const target = this._getNearestTableCellLineTarget(row.cells, direction, offsetLeft);
            if (target != null) {
                return target;
            }
        }
    }

    private _getAdjacentTableCellLineTarget(
        cell: IDocumentSkeletonPage,
        direction: boolean,
        offsetLeft: number
    ): Nullable<ILineSearchTarget> {
        const row = cell.parent as Nullable<IDocumentSkeletonRow>;
        const table = row?.parent;

        if (row == null || table == null) {
            return;
        }

        const hostOffsetLeft = this._getTableCellHostOffsetLeft(cell) + offsetLeft;
        const adjacentRow = this._findAdjacentTableRow(table, row, direction);

        if (adjacentRow != null) {
            return this._getNearestTableCellLineTarget(adjacentRow.cells, direction, hostOffsetLeft);
        }

        const line = this._findLineAroundTable(table, direction);

        if (line == null) {
            return;
        }

        return { line, offsetLeft: hostOffsetLeft };
    }

    private _findAdjacentTableRow(
        table: IDocumentSkeletonTable,
        row: IDocumentSkeletonRow,
        direction: boolean
    ): Nullable<IDocumentSkeletonRow> {
        const currentRowIndex = table.rows.indexOf(row);
        if (currentRowIndex === -1) {
            return;
        }

        const step = direction ? 1 : -1;
        let rowIndex = currentRowIndex + step;

        while (rowIndex >= 0 && rowIndex < table.rows.length) {
            const adjacentRow = table.rows[rowIndex];
            if (!adjacentRow.isRepeatRow) {
                return adjacentRow;
            }

            rowIndex += step;
        }

        return this._findAdjacentTableSliceRow(table, direction);
    }

    private _findAdjacentTableSliceRow(
        table: IDocumentSkeletonTable,
        direction: boolean
    ): Nullable<IDocumentSkeletonRow> {
        if (!table.tableId.includes('#-#')) {
            return;
        }

        const [sourceTableId, sliceIndexText] = table.tableId.split('#-#');
        const sliceIndex = Number.parseInt(sliceIndexText);
        const tablePage = table.parent;
        const skeleton = tablePage?.parent as Nullable<IDocumentSkeletonCached>;

        if (!Number.isFinite(sliceIndex) || skeleton?.pages == null) {
            return;
        }

        const nextTableId = `${sourceTableId}#-#${sliceIndex + (direction ? 1 : -1)}`;
        for (const page of skeleton.pages) {
            const nextTable = page.skeTables?.get(nextTableId);
            const rows = nextTable == null ? [] : direction ? nextTable.rows : [...nextTable.rows].reverse();
            const row = rows.find((item) => !item.isRepeatRow);

            if (row != null) {
                return row;
            }
        }
    }

    private _getNearestTableCellLineTarget(
        cells: IDocumentSkeletonPage[],
        direction: boolean,
        hostOffsetLeft: number
    ): Nullable<ILineSearchTarget> {
        const candidates = cells
            .filter((cell) => !(cell as IDocumentSkeletonPage & { isMergedCellCovered?: boolean }).isMergedCellCovered)
            .map((cell) => ({
                cell,
                distance: this._getDistanceToTableCell(cell, hostOffsetLeft),
            }))
            .sort((a, b) => a.distance - b.distance);

        for (const candidate of candidates) {
            const line = direction ? firstLineInCell(candidate.cell) : lastLineInCell(candidate.cell);
            if (line != null) {
                return {
                    line,
                    offsetLeft: hostOffsetLeft - this._getTableCellHostOffsetLeft(candidate.cell),
                };
            }
        }
    }

    private _findLineAroundTable(
        table: IDocumentSkeletonTable,
        direction: boolean
    ): Nullable<IDocumentSkeletonLine> {
        const tablePage = table.parent;

        if (tablePage == null) {
            return;
        }

        const pages = (tablePage.parent as Nullable<IDocumentSkeletonCached>)?.pages ?? [tablePage];
        const lineMatcher = direction
            ? (line: IDocumentSkeletonLine) => line.st === table.ed + 1
            : (line: IDocumentSkeletonLine) => line.ed === table.st - 1;

        for (const page of pages) {
            for (const section of page.sections) {
                for (const column of section.columns) {
                    const lines = direction ? column.lines : [...column.lines].reverse();
                    const line = lines.find(lineMatcher);
                    if (line != null) {
                        return line;
                    }
                }
            }
        }
    }

    private _getDistanceToTableCell(cell: IDocumentSkeletonPage, offsetLeft: number): number {
        const left = this._getTableCellHostOffsetLeft(cell);
        const right = left + this._getTableCellContentWidth(cell);

        if (offsetLeft >= left && offsetLeft <= right) {
            return 0;
        }

        return Math.min(Math.abs(offsetLeft - left), Math.abs(offsetLeft - right));
    }

    private _getTableCellHostOffsetLeft(cell: IDocumentSkeletonPage): number {
        const row = cell.parent as Nullable<IDocumentSkeletonRow>;
        const table = row?.parent;

        return (table?.left ?? 0) + (cell.left ?? 0) + (cell.marginLeft ?? 0);
    }

    private _getTableCellContentWidth(cell: IDocumentSkeletonPage): number {
        return Math.max(0, (cell.pageWidth ?? 0) - (cell.marginLeft ?? 0) - (cell.marginRight ?? 0));
    }

    private _isTableCellContentPage(page: IDocumentSkeletonPage): boolean {
        const row = page.parent as Nullable<IDocumentSkeletonRow>;
        const table = row?.parent;

        return page.type === DocumentSkeletonPageType.CELL && row != null && table?.rows?.includes(row) === true && row.cells.includes(page);
    }

    private _getColumnGroupLineTargetFromBlockLine(
        line: Nullable<IDocumentSkeletonLine>,
        page: IDocumentSkeletonPage,
        direction: boolean,
        offsetLeft: number
    ): Nullable<ILineSearchTarget> {
        if (line == null || line.type !== LineType.BLOCK) {
            return;
        }

        const columnGroup = this._findColumnGroupByBlockLine(page, line);
        if (columnGroup == null) {
            return;
        }

        return this._getColumnGroupContentLineTarget(columnGroup, direction, offsetLeft);
    }

    private _getColumnGroupContentLineTarget(
        columnGroup: IDocumentSkeletonColumnGroup,
        direction: boolean,
        offsetLeft: number
    ): Nullable<ILineSearchTarget> {
        const candidates = columnGroup.columns
            .map((column) => ({
                column,
                distance: this._getDistanceToColumnGroupColumn(column, offsetLeft),
            }))
            .sort((a, b) => a.distance - b.distance);

        for (const candidate of candidates) {
            const line = this._getColumnGroupColumnBoundaryLine(candidate.column, direction);
            if (line != null) {
                return {
                    line,
                    offsetLeft: offsetLeft - candidate.column.left,
                };
            }
        }
    }

    private _getColumnGroupExitLineTarget(
        page: IDocumentSkeletonPage,
        direction: boolean,
        offsetLeft: number
    ): Nullable<ILineSearchTarget> {
        const columnGroupColumn = page.parent as Nullable<IDocumentSkeletonColumnGroupColumn>;
        const columnGroup = columnGroupColumn?.parent;
        const hostPage = columnGroup?.parent;

        if (columnGroupColumn == null || columnGroup == null || hostPage == null) {
            return;
        }

        const blockLine = this._findColumnGroupBlockLine(columnGroup);
        const line = blockLine == null ? undefined : this._getAdjacentLineAroundBlockLine(blockLine, direction);

        if (line == null) {
            return;
        }

        return {
            line,
            offsetLeft: columnGroupColumn.left + offsetLeft,
        };
    }

    private _findColumnGroupByBlockLine(
        page: IDocumentSkeletonPage,
        line: IDocumentSkeletonLine
    ): Nullable<IDocumentSkeletonColumnGroup> {
        for (const columnGroup of page.skeColumnGroups?.values() ?? []) {
            if (line.paragraphIndex === columnGroup.ed || (line.st <= columnGroup.ed && line.ed >= columnGroup.st)) {
                return columnGroup;
            }
        }
    }

    private _findColumnGroupBlockLine(columnGroup: IDocumentSkeletonColumnGroup): Nullable<IDocumentSkeletonLine> {
        const page = columnGroup.parent;
        if (page == null) {
            return;
        }

        for (const section of page.sections) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    if (line.type === LineType.BLOCK && this._findColumnGroupByBlockLine(page, line) === columnGroup) {
                        return line;
                    }
                }
            }
        }
    }

    private _getAdjacentLineAroundBlockLine(
        line: IDocumentSkeletonLine,
        direction: boolean
    ): Nullable<IDocumentSkeletonLine> {
        const column = line.parent;
        const section = column?.parent;
        const page = section?.parent;

        if (column == null || section == null || page == null) {
            return;
        }

        const lineIndex = column.lines.indexOf(line);
        if (lineIndex === -1) {
            return;
        }

        const sameColumnLine = column.lines[direction ? lineIndex + 1 : lineIndex - 1];
        if (sameColumnLine != null) {
            return sameColumnLine;
        }

        const columnIndex = section.columns.indexOf(column);
        if (columnIndex === -1) {
            return;
        }

        if (direction) {
            return section.columns[columnIndex + 1]?.lines[0];
        }

        const prevColumnLines = section.columns[columnIndex - 1]?.lines;
        return prevColumnLines?.[prevColumnLines.length - 1];
    }

    private _getColumnGroupColumnBoundaryLine(
        column: IDocumentSkeletonColumnGroupColumn,
        direction: boolean
    ): Nullable<IDocumentSkeletonLine> {
        const sections = direction ? column.page.sections : [...column.page.sections].reverse();

        for (const section of sections) {
            const columns = direction ? section.columns : [...section.columns].reverse();
            for (const skeletonColumn of columns) {
                const lines = direction ? skeletonColumn.lines : [...skeletonColumn.lines].reverse();
                const line = lines.find((item) => item.type !== LineType.BLOCK);
                if (line != null) {
                    return line;
                }
            }
        }
    }

    private _getDistanceToColumnGroupColumn(column: IDocumentSkeletonColumnGroupColumn, offsetLeft: number): number {
        if (offsetLeft >= column.left && offsetLeft <= column.left + column.width) {
            return 0;
        }

        return Math.min(Math.abs(offsetLeft - column.left), Math.abs(offsetLeft - column.left - column.width));
    }

    private _isColumnGroupContentPage(page: IDocumentSkeletonPage): boolean {
        const parent = page.parent as Nullable<IDocumentSkeletonColumnGroupColumn>;

        return parent?.page === page && parent.parent?.columns?.includes(parent) === true;
    }

    private _scrollToFocusNodePosition(unitId: string, offset: number) {
        const backScrollController = this._renderManagerService.getRenderById(unitId)?.with(DocBackScrollRenderController);
        if (backScrollController == null) {
            return;
        }

        // Scroll to the offset.
        backScrollController.scrollToRange({
            startOffset: offset,
            endOffset: offset,
            collapsed: true,
        });
    }

    private _getDocObject() {
        return getDocObject(this._univerInstanceService, this._renderManagerService);
    }
}
