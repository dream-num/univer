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

import type { ICommandInfo, IParagraph } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { getParagraphBySpan, hasListSpan, isFirstSpan, isIndentBySpan, isSameLine } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';

import { CutContentCommand } from '../commands/commands/clipboard.inner.command';
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
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
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
        const activeRange = this._textSelectionManagerService.getActiveRange();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        if (activeRange == null || skeleton == null) {
            return;
        }

        const docDataModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the first position of the first paragraph.
        if (startOffset === 0 && collapsed) {
            return;
        }

        const preSpan = skeleton.findNodeByCharIndex(startOffset);

        // is in bullet list?
        const preIsBullet = hasListSpan(preSpan);
        // is in indented paragraph?
        const preIsIndent = isIndentBySpan(preSpan, docDataModel.body);

        let cursor = startOffset;

        // Get the deleted span.
        const span = skeleton.findNodeByCharIndex(startOffset - 1)!;

        const isUpdateParagraph =
            isFirstSpan(preSpan) && span !== preSpan && (preIsBullet === true || preIsIndent === true);

        if (isUpdateParagraph) {
            const paragraph = getParagraphBySpan(preSpan, docDataModel.body);

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

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            this._commandService.executeCommand(UpdateCommand.id, {
                unitId: docDataModel.getUnitId(),
                updateBody: {
                    dataStream: '',
                    paragraphs: [{ ...updateParagraph }],
                },
                range: {
                    startOffset: paragraphIndex,
                    endOffset: paragraphIndex + 1,
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

            if (collapsed === true) {
                cursor -= span.count;

                const textRanges = [
                    {
                        startOffset: cursor,
                        endOffset: cursor,
                        style,
                    },
                ];
                this._commandService.executeCommand(DeleteCommand.id, {
                    unitId: docDataModel.getUnitId(),
                    range: activeRange,
                    segmentId,
                    direction: DeleteDirection.LEFT,
                    len: span.count,
                    textRanges,
                });
            } else {
                const textRanges = this._getTextRangesWhenDelete();
                // If the selection is not closed, the effect of Delete and
                // BACKSPACE is the same as CUT, so the CUT command is executed.
                this._commandService.executeCommand(CutContentCommand.id, {
                    segmentId,
                    textRanges,
                });
            }
        }

        skeleton?.calculate();
    }

    // Use DELETE to delete right.
    private _handleDeleteRight() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        if (activeRange == null || skeleton == null) {
            return;
        }

        const docDataModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the last position of the last paragraph.
        if (startOffset === docDataModel.getBody()!.dataStream.length - 2 && collapsed) {
            return;
        }

        if (collapsed === true) {
            const textRanges = [
                {
                    startOffset,
                    endOffset: startOffset,
                    style,
                },
            ];

            const needDeleteSpan = skeleton.findNodeByCharIndex(startOffset)!;

            this._commandService.executeCommand(DeleteCommand.id, {
                unitId: docDataModel.getUnitId(),
                range: activeRange,
                segmentId,
                direction: DeleteDirection.RIGHT,
                textRanges,
                len: needDeleteSpan.count,
            });
        } else {
            const textRanges = this._getTextRangesWhenDelete();
            // If the selection is not closed, the effect of Delete and
            // BACKSPACE is the same as CUT, so the CUT command is executed.
            this._commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges,
            });
        }

        skeleton?.calculate();
    }

    // get cursor position when BACKSPACE/DELETE excuse the CutContentCommand.
    private _getTextRangesWhenDelete() {
        const activeRange = this._textSelectionManagerService.getActiveRange()!;
        const ranges = this._textSelectionManagerService.getSelections()!;

        let cursor = activeRange.endOffset;

        for (const range of ranges) {
            const { startOffset, endOffset } = range;

            if (startOffset == null || endOffset == null) {
                continue;
            }

            if (endOffset <= activeRange.endOffset) {
                cursor -= endOffset - startOffset;
            }
        }

        const textRanges = [
            {
                startOffset: cursor,
                endOffset: cursor,
                style: activeRange.style,
            },
        ];

        return textRanges;
    }
}
