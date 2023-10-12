import {
    getParagraphBySpan,
    hasListSpan,
    IRenderManagerService,
    isFirstSpan,
    isIndentBySpan,
    isSameLine,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    ICurrentUniverService,
    IParagraph,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getDocObject } from '../Basics/component-tools';
import { DeleteCommand, DeleteLeftCommand, UpdateCommand } from '../commands/commands/core-editing.command';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, DeleteLeftInputController)
export class DeleteLeftInputController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
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
        const updateCommandList = [DeleteLeftCommand.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this._deleteFunction();
            })
        );
    }

    private _deleteFunction() {
        const activeRange = this._textSelectionRenderManager.getActiveRange();

        const activeSelection = this._textSelectionRenderManager.getActiveTextSelection();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        if (activeRange == null || skeleton == null || activeSelection == null) {
            return;
        }

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance();
        const startNodePosition = activeSelection.getStart();
        const preSpan = skeleton.findSpanByPosition(startNodePosition);

        const preIsBullet = hasListSpan(preSpan);

        const preIsIndent = isIndentBySpan(preSpan, docsModel.body);

        const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack, segmentId, style } = activeRange;

        let cursor = cursorStart;

        if (isStartBack === true) {
            cursor -= 1;
        }

        if (isCollapse === false) {
            cursor += 1;
        }

        const span = skeleton.findNodeByCharIndex(cursor);

        const isUpdateParagraph =
            isFirstSpan(preSpan) && span !== preSpan && (preIsBullet === true || preIsIndent === true);
        if (isUpdateParagraph) {
            const paragraph = getParagraphBySpan(preSpan, docsModel.body);

            if (paragraph == null) {
                return;
            }

            const paragraphIndex = paragraph?.startIndex;

            const updateParagraph: IParagraph = { startIndex: 0 };

            const paragraphStyle = paragraph.paragraphStyle;
            if (preIsBullet === true) {
                const paragraphStyle = paragraph.paragraphStyle;
                if (paragraphStyle) {
                    updateParagraph.paragraphStyle = paragraphStyle;
                }
            } else if (preIsIndent === true) {
                const bullet = paragraph.bullet;
                if (bullet) {
                    updateParagraph.bullet = bullet;
                }
                if (paragraphStyle != null) {
                    updateParagraph.paragraphStyle = { ...paragraphStyle };
                    delete updateParagraph.paragraphStyle.hanging;
                    delete updateParagraph.paragraphStyle.indentStart;
                }
            }

            this._commandService.executeCommand(UpdateCommand.id, {
                unitId: docsModel.getUnitId(),
                body: {
                    dataStream: '',
                    paragraphs: [{ ...updateParagraph }],
                },
                range: {
                    cursorStart: paragraphIndex,
                    cursorEnd: paragraphIndex,
                    isEndBack: false,
                    isStartBack: false,
                    isCollapse: true,
                },
                segmentId,
            });
        } else {
            const endNodePosition = activeSelection?.getEnd();
            if (endNodePosition != null) {
                const endSpan = skeleton.findSpanByPosition(endNodePosition);
                if (hasListSpan(endSpan) && !isSameLine(preSpan, endSpan)) {
                    activeRange.cursorEnd -= 1;
                }
            }

            this._commandService.executeCommand(DeleteCommand.id, {
                unitId: docsModel.getUnitId(),
                range: activeRange,
                segmentId,
            });
        }

        skeleton?.calculate();

        let isBack = false;

        if (isUpdateParagraph) {
            isBack = true;
            cursor++;
        } else if (isFirstSpan(span)) {
            isBack = true;
        } else {
            cursor--;
        }

        // move selection
        this._textSelectionManagerService.replace([
            {
                cursorStart: cursor,
                cursorEnd: cursor,
                isCollapse: true,
                isEndBack: isBack,
                isStartBack: isBack,
                style,
            },
        ]);
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
