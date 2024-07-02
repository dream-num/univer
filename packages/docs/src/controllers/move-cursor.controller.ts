/**
 * Copyright 2023-present DreamNum Inc.
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
import {
    Direction,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import type {
    DocumentSkeleton,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    INodePosition,
    INodeSearch,
} from '@univerjs/engine-render';
import { IRenderManagerService, NodePositionConvertToCursor, RANGE_DIRECTION } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';

import { getDocObject } from '../basics/component-tools';
import type { IMoveCursorOperationParams } from '../commands/operations/cursor.operation';
import { MoveCursorOperation, MoveSelectionOperation } from '../commands/operations/cursor.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, MoveCursorController)
export class MoveCursorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
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
        const activeRange = this._textSelectionManagerService.getActiveRange();
        const allRanges = this._textSelectionManagerService.getSelections()!;
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        if (!docDataModel) {
            return;
        }

        const skeleton = this._renderManagerService.getRenderById(docDataModel.getUnitId())
            ?.with(DocSkeletonManagerService).getSkeleton();
        const docObject = this._getDocObject();

        if (activeRange == null || skeleton == null || docObject == null) {
            return;
        }

        const {
            startOffset, endOffset, style, collapsed, direction: rangeDirection,
            segmentId, startNodePosition, endNodePosition, segmentPage,
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

        let focusOffset = collapsed ? endOffset : rangeDirection === RANGE_DIRECTION.FORWARD ? endOffset : startOffset;
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
        } else {
            const focusGlyph = skeleton.findNodeByCharIndex(focusOffset, segmentId, segmentPage);
            const documentOffsetConfig = docObject.document.getOffsetConfig();
            const focusNodePosition = collapsed ? startNodePosition : rangeDirection === RANGE_DIRECTION.FORWARD ? endNodePosition : startNodePosition;

            const newPos = this._getTopOrBottomPosition(skeleton, focusGlyph, focusNodePosition, direction === Direction.DOWN);

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
        }
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _handleMoveCursor(direction: Direction) {
        const activeRange = this._textSelectionManagerService.getActiveRange();
        const allRanges = this._textSelectionManagerService.getSelections();
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        if (!docDataModel) {
            return false;
        }

        const skeleton = this._renderManagerService.getRenderById(docDataModel.getUnitId())
            ?.with(DocSkeletonManagerService).getSkeleton();
        const docObject = this._getDocObject();

        if (activeRange == null || skeleton == null || docObject == null || allRanges == null) {
            return;
        }

        const { startOffset, endOffset, style, collapsed, segmentId, startNodePosition, endNodePosition, segmentPage } = activeRange;

        const dataStreamLength = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()!.dataStream.length ?? Number.POSITIVE_INFINITY;

        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            let cursor;

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

                if (direction === Direction.LEFT) {
                    cursor = Math.max(0, startOffset - (preSpan?.count ?? 0));
                } else {
                    // -1 because the length of the string will be 1 larger than the index, and the reason for subtracting another 1 is because it ends in \n
                    cursor = Math.min(dataStreamLength - 2, endOffset + curSpan.count);
                }
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ], false);
        } else {
            const startNode = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage);
            const endNode = skeleton.findNodeByCharIndex(endOffset, segmentId, segmentPage);

            const documentOffsetConfig = docObject.document.getOffsetConfig();

            const newPos = this._getTopOrBottomPosition(
                skeleton,
                direction === Direction.UP ? startNode : endNode,
                direction === Direction.UP ? startNodePosition : endNodePosition,
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

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    ...newActiveRange,
                    style,
                },
            ], false);
        }
    }

    private _getTopOrBottomPosition(
        docSkeleton: DocumentSkeleton,
        glyph: Nullable<IDocumentSkeletonGlyph>,
        nodePosition: Nullable<INodePosition>,
        direction: boolean
    ): Nullable<INodePosition> {
        if (glyph == null || nodePosition == null) {
            return;
        }

        const offsetLeft = this._getGlyphLeftOffsetInLine(glyph);

        const line = this._getNextOrPrevLine(glyph, direction);

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

    // eslint-disable-next-line max-lines-per-function
    private _getNextOrPrevLine(glyph: IDocumentSkeletonGlyph, direction: boolean) {
        const divide = glyph.parent;
        if (divide == null) {
            return;
        }

        const line = divide.parent;
        if (line == null) {
            return;
        }

        const column = line.parent;
        if (column == null) {
            return;
        }

        const currentLineIndex = column.lines.indexOf(line);

        if (currentLineIndex === -1) {
            return;
        }

        let newLine: IDocumentSkeletonLine;

        if (direction === true) {
            newLine = column.lines[currentLineIndex + 1];
        } else {
            newLine = column.lines[currentLineIndex - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const section = column.parent;

        if (section == null) {
            return;
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

        const page = section.parent;

        if (page == null) {
            return;
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

        const skeleton = page.parent;

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

    private _getDocObject() {
        return getDocObject(this._univerInstanceService, this._renderManagerService);
    }
}
