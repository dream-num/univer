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

import type { ICommand, IParagraph } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, UpdateDocsAttributeType } from '@univerjs/core';
import type { TextRange } from '@univerjs/engine-render';
import { getParagraphBySpan, hasListSpan, isFirstSpan, isIndentBySpan, isSameLine } from '@univerjs/engine-render';

import { DocSkeletonManagerService } from '../../services/doc-skeleton-manager.service';
import type { ITextActiveRange } from '../../services/text-selection-manager.service';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import { CutContentCommand } from './clipboard.inner.command';
import { DeleteCommand, DeleteDirection, UpdateCommand } from './core-editing.command';

export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = textSelectionManagerService.getActiveRange();
        const ranges = textSelectionManagerService.getSelections();
        const skeleton = docSkeletonManagerService.getCurrent()?.skeleton;

        let result;

        if (activeRange == null || skeleton == null || ranges == null) {
            return false;
        }

        const docDataModel = currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the first position of the first paragraph.
        if (startOffset === 0 && collapsed) {
            return true;
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
                return false;
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

            result = await commandService.executeCommand(UpdateCommand.id, {
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
                result = await commandService.executeCommand(DeleteCommand.id, {
                    unitId: docDataModel.getUnitId(),
                    range: activeRange,
                    segmentId,
                    direction: DeleteDirection.LEFT,
                    len: span.count,
                    textRanges,
                });
            } else {
                const textRanges = getTextRangesWhenDelete(activeRange, ranges);
                // If the selection is not closed, the effect of Delete and
                // BACKSPACE is the same as CUT, so the CUT command is executed.
                result = await commandService.executeCommand(CutContentCommand.id, {
                    segmentId,
                    textRanges,
                });
            }
        }

        return result;
    },
};

export const DeleteRightCommand: ICommand = {
    id: 'doc.command.delete-right',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = textSelectionManagerService.getActiveRange();
        const ranges = textSelectionManagerService.getSelections();

        const skeleton = docSkeletonManagerService.getCurrent()?.skeleton;

        let result;

        if (activeRange == null || skeleton == null || ranges == null) {
            return false;
        }

        const docDataModel = currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the last position of the last paragraph.
        if (startOffset === docDataModel.getBody()!.dataStream.length - 2 && collapsed) {
            return true;
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

            result = await commandService.executeCommand(DeleteCommand.id, {
                unitId: docDataModel.getUnitId(),
                range: activeRange,
                segmentId,
                direction: DeleteDirection.RIGHT,
                textRanges,
                len: needDeleteSpan.count,
            });
        } else {
            const textRanges = getTextRangesWhenDelete(activeRange, ranges);
            // If the selection is not closed, the effect of Delete and
            // BACKSPACE is the same as CUT, so the CUT command is executed.
            result = await commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges,
            });
        }

        return result;
    },
};

// get cursor position when BACKSPACE/DELETE excuse the CutContentCommand.
function getTextRangesWhenDelete(activeRange: ITextActiveRange, ranges: readonly TextRange[]) {
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
