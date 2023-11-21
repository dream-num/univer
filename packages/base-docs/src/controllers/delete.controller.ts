import {
    getParagraphBySpan,
    hasListSpan,
    isFirstSpan,
    isIndentBySpan,
    isSameLine,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IParagraph,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    DeleteCommand,
    DeleteDirection,
    DeleteLeftCommand,
    DeleteRightCommand,
    UpdateCommand,
} from '../commands/commands/core-editing.command';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, DeleteController)
export class DeleteController extends Disposable {
    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {}

    private _commandExecutedListener() {
        const updateCommandList = [DeleteLeftCommand.id, DeleteRightCommand.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                switch (command.id) {
                    case DeleteLeftCommand.id:
                        this._handleDeleteLeft();
                        break;
                    case DeleteRightCommand.id:
                        this._handleDeleteRight();
                        break;
                    default:
                        throw new Error('Unknown command');
                }
            })
        );
    }

    // Use BACKSPACE to delete left.
    private _handleDeleteLeft() {
        const activeRange = this._textSelectionRenderManager.getActiveRange();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        if (activeRange == null || skeleton == null) {
            return;
        }

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the first position of the first paragraph.
        if (startOffset === 0 && collapsed) {
            return;
        }

        const preSpan = skeleton.findNodeByCharIndex(startOffset);

        // is in bullet list?
        const preIsBullet = hasListSpan(preSpan);
        // is in indented paragraph?
        const preIsIndent = isIndentBySpan(preSpan, docsModel.body);

        let cursor = startOffset;

        if (collapsed === true) {
            cursor--;
        }

        const span = skeleton.findNodeByCharIndex(cursor);

        const isUpdateParagraph =
            isFirstSpan(preSpan) && span !== preSpan && (preIsBullet === true || preIsIndent === true);

        if (isUpdateParagraph) {
            const paragraph = getParagraphBySpan(preSpan, docsModel.body);

            if (paragraph == null) {
                return;
            }

            cursor++;

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

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    collapsed: true,
                    style,
                },
            ];

            this._commandService.executeCommand(UpdateCommand.id, {
                unitId: docsModel.getUnitId(),
                updateBody: {
                    dataStream: '',
                    paragraphs: [{ ...updateParagraph }],
                },
                range: {
                    startOffset: paragraphIndex,
                    endOffset: paragraphIndex + 1,
                    collapsed: true,
                },
                textRanges,
                coverType: UpdateDocsAttributeType.REPLACE,
                segmentId,
            });
        } else {
            const { endNodePosition } = activeRange;

            if (endNodePosition != null) {
                const endSpan = skeleton.findSpanByPosition(endNodePosition);
                if (hasListSpan(endSpan) && !isSameLine(preSpan, endSpan)) {
                    activeRange.endOffset -= 1;
                }
            }

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    collapsed: true,
                    style,
                },
            ];

            this._commandService.executeCommand(DeleteCommand.id, {
                unitId: docsModel.getUnitId(),
                range: activeRange,
                segmentId,
                direction: DeleteDirection.LEFT,
                textRanges,
            });
        }

        skeleton?.calculate();
    }

    // Use DELETE to delete right.
    private _handleDeleteRight() {
        const activeRange = this._textSelectionRenderManager.getActiveRange();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        if (activeRange == null || skeleton == null) {
            return;
        }

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the last position of the last paragraph.
        if (startOffset === docsModel.getBodyModel().getBody().dataStream.length - 2 && collapsed) {
            return;
        }

        const textRanges = [
            {
                startOffset,
                endOffset: startOffset,
                collapsed: true,
                style,
            },
        ];

        this._commandService.executeCommand(DeleteCommand.id, {
            unitId: docsModel.getUnitId(),
            range: activeRange,
            segmentId,
            direction: DeleteDirection.RIGHT,
            textRanges,
        });

        skeleton?.calculate();
    }
}
