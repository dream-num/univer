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

import type { ICommandInfo, Nullable } from '@univerjs/core';
import type {
    DocumentSkeleton,
    IDocumentSkeletonCached,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonTable,
    INodePosition,
    INodeSearch,
} from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';
import type { IMoveCursorOperationParams } from '../commands/operations/doc-cursor.operation';
import {
    DataStreamTreeTokenType,
    Direction,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    RANGE_DIRECTION,
} from '@univerjs/core';

import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentSkeletonPageType, IRenderManagerService } from '@univerjs/engine-render';
import { getDocObject } from '../basics/component-tools';
import { findAboveCell, findBellowCell, findLineBeforeAndAfterTable, findTableAfterLine, findTableBeforeLine, firstLineInCell, firstLineInTable, lastLineInCell, lastLineInTable } from '../basics/table';
import { MoveCursorOperation, MoveSelectionOperation } from '../commands/operations/doc-cursor.operation';
import { NodePositionConvertToCursor } from '../services/selection/convert-text-range';
import { DocBackScrollRenderController } from './render-controllers/back-scroll.render-controller';

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
                        return this._handleMoveCursor(param.direction);
                    }

                    case MoveSelectionOperation.id: {
                        return this._handleShiftMoveSelection(param.direction);
                    }

                    default: {
                        throw new Error('Unknown command');
                    }
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _handleShiftMoveSelection(direction: Direction) {
        const activeRange = this._textSelectionManagerService.getActiveTextRange();
        const allRanges = this._textSelectionManagerService.getTextRanges()!;
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
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
        const dataStreamLength = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()!.dataStream.length ?? Number.POSITIVE_INFINITY;

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
                const newFocusOffset = direction === Direction.UP ? 0 : dataStreamLength - 2;

                if (newFocusOffset === focusOffset) {
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

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: anchorOffset,
                    endOffset: newActiveRange.endOffset,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), newActiveRange.endOffset);
        }
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _handleMoveCursor(direction: Direction) {
        const activeRange = this._textSelectionManagerService.getActiveTextRange();
        const allRanges = this._textSelectionManagerService.getTextRanges();
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
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
        const body = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

        if (body == null) {
            return;
        }

        const dataStreamLength = body.dataStream.length ?? Number.POSITIVE_INFINITY;
        const customRanges = docDataModel.getCustomRanges() ?? [];

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
                DataStreamTreeTokenType.TABLE_START,
                DataStreamTreeTokenType.TABLE_END,
                DataStreamTreeTokenType.TABLE_ROW_START,
                DataStreamTreeTokenType.TABLE_ROW_END,
                DataStreamTreeTokenType.TABLE_CELL_START,
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.SECTION_BREAK,
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

            const relativeRanges = customRanges.filter((range) => range.wholeEntity && range.startIndex < cursor && range.endIndex >= cursor);
            relativeRanges.forEach((range) => {
                if (direction === Direction.LEFT) {
                    cursor = Math.min(range.startIndex, cursor);
                } else {
                    cursor = Math.max(range.endIndex + 1, cursor);
                }
            });

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: Math.max(0, cursor),
                    endOffset: Math.max(0, cursor),
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), cursor);
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
                    cursor = direction === Direction.UP ? 0 : dataStreamLength - 2;
                } else {
                    // Handle at the startOffset at first line when arrow up,
                    // and endOffset at the last line when arrow down.
                    cursor = direction === Direction.UP ? startOffset : endOffset;
                }

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: Math.max(0, cursor),
                        endOffset: Math.max(0, cursor),
                        style,
                    },
                ], false);

                return;
            }

            const newActiveRange = new NodePositionConvertToCursor(documentOffsetConfig, skeleton).getRangePointData(
                newPos,
                newPos
            ).cursorList[0];

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    ...newActiveRange,
                    style,
                },
            ], false);

            this._scrollToFocusNodePosition(docDataModel.getUnitId(), newActiveRange.endOffset);
        }
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

        const line = this._getNextOrPrevLine(glyph, direction, skipCellContent);

        if (line == null) {
            return;
        }

        const position: Nullable<INodeSearch> = this._matchPositionByLeftOffset(docSkeleton, line, offsetLeft, nodePosition);

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

        for (const divide of line.divides) {
            const divideLeft = divide.left;

            for (const glyph of divide.glyphGroup) {
                if (glyph.streamType === DataStreamTreeTokenType.SECTION_BREAK) {
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

        if (nearestNode.glyph == null) {
            return;
        }

        const { segmentPage } = nodePosition;

        return docSkeleton.findPositionByGlyph(nearestNode.glyph, segmentPage);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _getNextOrPrevLine(glyph: IDocumentSkeletonGlyph, direction: boolean, skipCellContent = false) {
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

        if (page.type === DocumentSkeletonPageType.CELL && skipCellContent) {
            const nLine = findAboveOrBellowCellLine(page, direction);

            if (nLine) {
                return nLine;
            }
        }

        if (direction === true) {
            newLine = column.lines[currentLineIndex + 1];
            const tableAfterLine = findTableAfterLine(line, page);

            if (tableAfterLine) {
                const firstLine = firstLineInTable(tableAfterLine);
                if (firstLine) {
                    newLine = firstLine;
                }
            }
        } else {
            newLine = column.lines[currentLineIndex - 1];
            // If the previous line is behind the table, find the last line of the table.
            const tableBeforeLine = findTableBeforeLine(line, page);
            if (tableBeforeLine) {
                const lastLine = lastLineInTable(tableBeforeLine);
                if (lastLine) {
                    newLine = lastLine;
                }
            }
        }

        if (newLine != null) {
            return newLine;
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
            return newLine;
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
            return newLine;
        }

        if (page.type === DocumentSkeletonPageType.CELL) {
            return findAboveOrBellowCellLine(page, direction);
        }

        const skeleton: Nullable<IDocumentSkeletonCached> = page.parent as IDocumentSkeletonCached;

        if (skeleton == null) {
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
            return newLine;
        }
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

function findAboveOrBellowCellLine(
    page: IDocumentSkeletonPage,
    direction: boolean
) {
    let newLine = null;
    if (direction === true) {
        const bellowCell = findBellowCell(page);
        if (bellowCell) {
            newLine = firstLineInCell(bellowCell);
        } else {
            const table = page.parent?.parent as IDocumentSkeletonTable;
            const { lineAfterTable } = findLineBeforeAndAfterTable(table);

            if (lineAfterTable) {
                newLine = lineAfterTable;
            }
        }
    } else {
        const aboveCell = findAboveCell(page);
        if (aboveCell) {
            newLine = lastLineInCell(aboveCell)!;
        } else {
            const table = page.parent?.parent as IDocumentSkeletonTable;
            const { lineBeforeTable } = findLineBeforeAndAfterTable(table);

            if (lineBeforeTable) {
                newLine = lineBeforeTable;
            }
        }
    }

    return newLine;
}
