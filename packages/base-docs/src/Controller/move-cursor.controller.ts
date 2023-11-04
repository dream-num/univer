import {
    DocumentSkeleton,
    IDocumentSkeletonLine,
    IDocumentSkeletonSpan,
    INodePosition,
    INodeSearch,
    IRenderManagerService,
    ITextSelectionRenderManager,
    NodePositionConvertToCursor,
} from '@univerjs/base-render';
import {
    Direction,
    Disposable,
    getTextIndexByCursor,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getDocObject } from '../Basics/component-tools';
import { IMoveCursorOperationParams, MoveCursorOperation } from '../commands/operations/cursor.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, MoveCursorController)
export class MoveCursorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {}

    private _commandExecutedListener() {
        const updateCommandList = [MoveCursorOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                const param = command.params as IMoveCursorOperationParams;

                this._moveCursorFunction(param.direction);
            })
        );
    }

    private _moveCursorFunction(direction: Direction) {
        const activeRange = this._textSelectionRenderManager.getActiveRange();
        const allRanges = this._textSelectionRenderManager.getRanges();

        const activeSelection = this._textSelectionRenderManager.getActiveTextSelection();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        const docObject = this._getDocObject();

        if (activeRange == null || skeleton == null || activeSelection == null || docObject == null) {
            return;
        }

        const startNodePosition = activeSelection.getStart();

        const preSpan = skeleton.findSpanByPosition(startNodePosition);

        const documentOffsetConfig = docObject.document.getOffsetConfig();

        const { cursorStart, cursorEnd, isEndBack, isStartBack, style } = activeRange;

        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            let cursor;

            if (!activeRange.isCollapse || allRanges.length > 1) {
                let min = Infinity;
                let max = -Infinity;

                for (const range of allRanges) {
                    min = Math.min(min, getTextIndexByCursor(range!.cursorStart, range!.isStartBack) + 1);
                    max = Math.max(max, getTextIndexByCursor(range!.cursorEnd, range!.isEndBack) + 1);
                }

                cursor = direction === Direction.LEFT ? min : max;
            } else {
                if (direction === Direction.LEFT) {
                    cursor = Math.max(0, getTextIndexByCursor(cursorStart, isStartBack));
                } else {
                    const dataStreamLength = skeleton.getModel().getSnapshot().body?.dataStream?.length ?? Infinity;
                    cursor = Math.min(dataStreamLength - 2, getTextIndexByCursor(cursorEnd, isEndBack) + 2);
                }
            }

            this._textSelectionManagerService.replace([
                {
                    cursorStart: cursor,
                    cursorEnd: cursor,
                    isCollapse: true,
                    isEndBack: true,
                    isStartBack: true,
                    style,
                },
            ]);
        } else {
            const newPos = this._getTopOrBottomPosition(skeleton, preSpan, direction === Direction.DOWN);
            if (newPos == null) {
                return;
            }

            const newActiveRange = new NodePositionConvertToCursor(documentOffsetConfig, skeleton).getRangePointData(
                newPos,
                newPos
            ).cursorList[0];

            // move selection
            this._textSelectionManagerService.replace([
                {
                    ...newActiveRange,
                    style,
                },
            ]);
        }
    }

    private _getTopOrBottomPosition(
        docSkeleton: DocumentSkeleton,
        span: Nullable<IDocumentSkeletonSpan>,
        direction: boolean
    ): Nullable<INodePosition> {
        // const referenceSpan = docSkeleton.findSpanByPosition(this._currentNodePosition);
        const selectionRange = this._textSelectionManagerService.getFirst();
        if (selectionRange == null) {
            return;
        }
        const referenceSpan = docSkeleton.findNodeByCharIndex(selectionRange.cursorStart);
        if (referenceSpan == null || span == null) {
            return;
        }

        let isBack = selectionRange.isStartBack;

        const offsetLeft = this._getSpanLeftOffsetInLine(referenceSpan, isBack);

        const line = this._getNextOrPrevLine(span, direction);

        if (line == null) {
            return;
        }

        const position: Nullable<INodeSearch> = this._matchPositionByLeftOffset(docSkeleton, line, offsetLeft);

        isBack = isBack == null ? false : isBack;

        if (position == null) {
            return;
        }

        return { ...position, isBack };
    }

    private _getSpanLeftOffsetInLine(span: IDocumentSkeletonSpan, isBack: boolean) {
        const divide = span.parent;

        if (divide == null) {
            return -Infinity;
        }

        const divideLeft = divide.left;

        const { left, width } = span;

        const start = divideLeft + left;

        if (isBack === true) {
            return start;
        }

        return start + width;
    }

    private _matchPositionByLeftOffset(docSkeleton: DocumentSkeleton, line: IDocumentSkeletonLine, offsetLeft: number) {
        const nearestNode: {
            span?: IDocumentSkeletonSpan;
            distance: number;
        } = {
            distance: Infinity,
        };
        for (const divide of line.divides) {
            const divideLeft = divide.left;
            for (const span of divide.spanGroup) {
                const { left, width } = span;
                const leftSide = divideLeft + left;
                const rightSide = leftSide + width;
                if (offsetLeft >= leftSide && offsetLeft <= rightSide) {
                    return docSkeleton.findPositionBySpan(span);
                }

                const distance = Math.abs(offsetLeft - (leftSide + rightSide) / 2);
                if (distance < nearestNode.distance) {
                    nearestNode.span = span;
                    nearestNode.distance = distance;
                }
            }
        }

        if (nearestNode.span == null) {
            return;
        }

        return docSkeleton.findPositionBySpan(nearestNode.span);
    }

    private _getNextOrPrevLine(span: IDocumentSkeletonSpan, direction: boolean) {
        const divide = span.parent;
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
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
