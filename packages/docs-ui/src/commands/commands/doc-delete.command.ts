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

import type { DocumentDataModel, ICommand, IMutationInfo, IParagraph, ITextRange, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import {
    BlockType,
    BuildTextUtils,
    CommandType,
    DataStreamTreeTokenType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    PositionedObjectLayoutType,
    TextX,
    TextXActionType,
    Tools,
    UniverInstanceType,
    UpdateDocsAttributeType,
} from '@univerjs/core';

import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getParagraphByGlyph, hasListGlyph, isFirstGlyph, isIndentByGlyph } from '@univerjs/engine-render';
import { DeleteDirection } from '../../types/delete-direction';
import { getCommandSkeleton, getRichTextEditPath } from '../util';
import { CutContentCommand } from './clipboard.inner.command';
import { DeleteCommand, UpdateCommand } from './core-editing.command';
import { getCurrentParagraph } from './util';

export interface IDeleteCustomBlockParams {
    direction: DeleteDirection;
    range: ITextRangeWithStyle;
    unitId: string;
    drawingId: string;
}

// The activeRange need collapsed.
export const DeleteCustomBlockCommand: ICommand<IDeleteCustomBlockParams> = {
    id: 'doc.command.delete-custom-block',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IDeleteCustomBlockParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = docSelectionManagerService.getActiveTextRange();
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (activeRange == null || documentDataModel == null) {
            return false;
        }

        const { direction, range, unitId, drawingId } = params;

        const { startOffset, segmentId, style } = activeRange;

        const cursor = direction === DeleteDirection.LEFT ? startOffset - 1 : startOffset;

        const textRanges = [
            {
                startOffset: cursor,
                endOffset: cursor,
                style,
            },
        ] as ITextRangeWithStyle[];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                prevTextRanges: [range],
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        if (startOffset > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: direction === DeleteDirection.LEFT ? startOffset - 1 : startOffset,
            });
        }

        textX.push({
            t: TextXActionType.DELETE,
            len: 1,
        });

        const path = getRichTextEditPath(documentDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        const drawing = (documentDataModel.getDrawings() ?? {})[drawingId];
        const drawingOrder = documentDataModel.getDrawingsOrder();
        const drawingIndex = drawingOrder!.indexOf(drawingId);

        const removeDrawingAction = jsonX.removeOp(['drawings', drawingId], drawing);
        const removeDrawingOrderAction = jsonX.removeOp(['drawingsOrder', drawingIndex], drawingId);

        rawActions.push(removeDrawingAction!);
        rawActions.push(removeDrawingOrderAction!);

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface IMergeTwoParagraphParams {
    direction: DeleteDirection;
    range: ITextRangeWithStyle;
}

export const MergeTwoParagraphCommand: ICommand<IMergeTwoParagraphParams> = {
    id: 'doc.command.merge-two-paragraph',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: IMergeTwoParagraphParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const { direction, range } = params;

        const activeRange = docSelectionManagerService.getActiveTextRange();
        const ranges = docSelectionManagerService.getTextRanges();

        if (activeRange == null || ranges == null) {
            return false;
        }
        const { segmentId, style } = activeRange;
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
        if (docDataModel == null || originBody == null) {
            return false;
        }

        const dataStream = originBody.dataStream;
        const actualRange = activeRange;
        const unitId = docDataModel.getUnitId();

        const { startOffset, collapsed } = actualRange;
        if (!collapsed) {
            return false;
        }

        const startIndex = direction === DeleteDirection.LEFT ? startOffset : startOffset + 1;

        let curParagraph;
        let nextParagraph;

        for (const paragraph of originBody.paragraphs!) {
            if (paragraph.startIndex >= startIndex) {
                nextParagraph = paragraph;
                break;
            }
            curParagraph = paragraph;
        }

        if (curParagraph == null || nextParagraph == null) {
            return false;
        }

        const cursor = direction === DeleteDirection.LEFT ? startOffset - 1 : startOffset;

        const textRanges = [
            {
                startOffset: cursor,
                endOffset: cursor,
                style,
            },
        ] as ITextRangeWithStyle[];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                prevTextRanges: [range],
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (curParagraph.startIndex > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: curParagraph.startIndex,
            });
        }

        textX.push({
            t: TextXActionType.DELETE,
            len: 1,
        });

        if (nextParagraph.startIndex > curParagraph.startIndex + 1) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: nextParagraph.startIndex - curParagraph.startIndex - 1,
            });
        }
        const tokens = Object.values(DataStreamTreeTokenType) as string[];
        const lastToken = dataStream[curParagraph.startIndex - 1];
        if ((lastToken && !tokens.includes(lastToken)) || lastToken === ' ') {
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            ...Tools.deepClone(curParagraph),
                            startIndex: 0,
                        },
                    ],
                },
            });
        }

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export const RemoveHorizontalLineCommand: ICommand = {
    id: 'doc.command.remove-horizontal-line',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = docSelectionManagerService.getActiveTextRange();
        const ranges = docSelectionManagerService.getTextRanges();

        if (activeRange == null || ranges == null) {
            return false;
        }
        const { segmentId, style } = activeRange;
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
        if (docDataModel == null || originBody == null) {
            return false;
        }

        const actualRange = activeRange;
        const unitId = docDataModel.getUnitId();

        const { startOffset, collapsed } = actualRange;
        if (!collapsed) {
            return false;
        }

        const paragraph = originBody.paragraphs?.find((p) => p.startIndex === startOffset - 1);

        if (paragraph == null) {
            return false;
        }

        const textRanges = [
            {
                startOffset,
                endOffset: startOffset,
                style,
            },
        ] as ITextRangeWithStyle[];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (paragraph.startIndex > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: paragraph.startIndex,
            });
        }

        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: {
                dataStream: '',
                paragraphs: [
                    {
                        ...Tools.deepClone({
                            ...paragraph,
                            paragraphStyle: {
                                ...paragraph.paragraphStyle,
                                borderBottom: undefined,
                            },
                        }),
                        startIndex: 0,
                    },
                ],
            },
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export function getCursorWhenDelete(textRanges: Readonly<Nullable<ITextRangeWithStyle[]>>, rectRanges: readonly IRectRangeWithStyle[]): number {
    let cursor = 0;

    if (textRanges == null || textRanges.length === 0) {
        if (typeof rectRanges[0].startOffset === 'number') {
            // Put the cursor at the first rect range start.
            const rectRange = rectRanges[0]!;
            const { spanEntireRow, spanEntireTable } = rectRange;

            if (spanEntireTable) {
                // Put the cursor at the first line of deleted table paragraph.
                cursor = rectRange.startOffset! - 3; // 3 is TABLE START, ROW START, CELL START.
            } else if (spanEntireRow) {
                // Put the cursor at the last row's end cell before deleted rows.
                if (rectRange.startRow > 0) {
                    cursor = rectRange.startOffset! - 6; // 6 is ROW START, CELL START, CELL END, ROW END, \r, \n.
                } else {
                    cursor = rectRange.startOffset!;
                }
            } else {
                cursor = rectRanges[0].startOffset;
            }
        }
    } else if (textRanges.length > 0 && rectRanges.length > 0) {
        const textRange = textRanges[0]!;
        const rectRange = rectRanges[0]!;

        if (textRange.startOffset != null && rectRange.startOffset != null) {
            if (textRange.startOffset < rectRange.startOffset) {
                // Put the cursor at the first text range start.
                cursor = textRange.startOffset;
            } else if (textRange.startOffset >= rectRange.startOffset) {
                const { spanEntireRow, spanEntireTable } = rectRange;

                if (spanEntireTable) {
                    // Put the cursor at the first line of deleted table paragraph.
                    cursor = rectRange.startOffset - 3; // 3 is TABLE START, ROW START, CELL START.
                } else if (spanEntireRow) {
                    // Put the cursor at the last row's end cell before deleted rows.
                    cursor = rectRange.startOffset - 6; // 6 is ROW START, CELL START, CELL END, ROW END, \r, \n.
                }
            }
        }
    }

    return cursor;
}

// Handle BACKSPACE key.
export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',

    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: async (accessor) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        let result = true;

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (docDataModel == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);
        const activeRange = docSelectionManagerService.getActiveTextRange();
        const rectRanges = docSelectionManagerService.getRectRanges();
        const ranges = docSelectionManagerService.getTextRanges();
        const skeleton = docSkeletonManagerService?.getSkeleton();

        if (skeleton == null) {
            return false;
        }

        if (rectRanges?.length) {
            const cursor = getCursorWhenDelete(ranges, rectRanges);
            const segmentId = rectRanges[0].segmentId;
            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                },
            ];
            return commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges,
            });
        }

        if (activeRange == null || ranges == null) {
            return false;
        }

        const { segmentId, style, segmentPage } = activeRange;

        const body = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

        if (body == null) {
            return false;
        }

        const actualRange = activeRange;
        const { startOffset, collapsed } = actualRange;
        const curGlyph = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage);

        // is in bullet list?
        const isBullet = hasListGlyph(curGlyph);
        // is in indented paragraph?
        const isIndent = isIndentByGlyph(curGlyph, body);

        let cursor = startOffset;

        // Get the deleted glyph. It maybe null or undefined when the curGlyph is first glyph in skeleton.
        const preGlyph = skeleton.findNodeByCharIndex(startOffset - 1, segmentId, segmentPage);

        const isUpdateParagraph =
            isFirstGlyph(curGlyph) && preGlyph !== curGlyph && (isBullet === true || isIndent === true);

        if (isUpdateParagraph && collapsed) {
            const paragraph = getParagraphByGlyph(curGlyph, body);

            if (paragraph == null) {
                return false;
            }

            const paragraphIndex = paragraph?.startIndex;

            const updateParagraph: IParagraph = { startIndex: 0 };

            const paragraphStyle = paragraph.paragraphStyle;

            if (isBullet === true) {
                const paragraphStyle = paragraph.paragraphStyle;

                if (paragraphStyle) {
                    updateParagraph.paragraphStyle = paragraphStyle;
                    // TODO: It maybe need to update codes bellow when we support nested list.
                    const { hanging } = paragraphStyle;
                    if (hanging) {
                        updateParagraph.paragraphStyle.indentStart = hanging;
                        updateParagraph.paragraphStyle.hanging = undefined;
                    }
                }
            } else if (isIndent === true) {
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
            if (collapsed === true) {
                // No need to delete when the cursor is at the first position of the first paragraph.
                if (preGlyph == null) {
                    return true;
                }
                if (preGlyph.content === '\r') {
                    const paragraph = body.paragraphs?.find((p) => p.startIndex === startOffset - 1);

                    if (paragraph?.paragraphStyle?.borderBottom) {
                        result = await commandService.executeCommand(RemoveHorizontalLineCommand.id);
                    } else {
                        result = await commandService.executeCommand(MergeTwoParagraphCommand.id, {
                            direction: DeleteDirection.LEFT,
                            range: actualRange,
                        });
                    }
                } else if (preGlyph.streamType === '\b') {
                    const drawing = docDataModel.getSnapshot().drawings?.[preGlyph.drawingId ?? ''];

                    if (drawing == null) {
                        return true;
                    }

                    const customBlock = docDataModel.getBody()?.customBlocks?.find((block) => block.blockId === preGlyph.drawingId);

                    const isInlineDrawingOrCustom = drawing.layoutType === PositionedObjectLayoutType.INLINE || customBlock?.blockType === BlockType.CUSTOM;

                    if (isInlineDrawingOrCustom) {
                        const unitId = docDataModel.getUnitId();
                        result = await commandService.executeCommand(DeleteCustomBlockCommand.id, {
                            direction: DeleteDirection.LEFT,
                            range: activeRange,
                            unitId,
                            drawingId: preGlyph.drawingId,
                        });
                    } else {
                        const prePreGlyph = skeleton.findNodeByCharIndex(startOffset - 2);

                        if (prePreGlyph == null) {
                            return true;
                        }

                        cursor -= preGlyph.count;
                        cursor -= prePreGlyph.count;

                        const textRanges = [
                            {
                                startOffset: cursor,
                                endOffset: cursor,
                                style,
                            },
                        ];

                        result = await commandService.executeCommand(DeleteCommand.id, {
                            unitId: docDataModel.getUnitId(),
                            range: {
                                ...activeRange,
                                startOffset: activeRange.startOffset - 1,
                                endOffset: activeRange.endOffset - 1,
                            },
                            segmentId,
                            direction: DeleteDirection.LEFT,
                            len: prePreGlyph.count,
                            textRanges,
                        });
                    }
                } else {
                    cursor -= preGlyph.count;
                    result = await commandService.executeCommand(DeleteCommand.id, {
                        unitId: docDataModel.getUnitId(),
                        range: actualRange,
                        segmentId,
                        direction: DeleteDirection.LEFT,
                        len: preGlyph.count,
                    });
                }
            } else {
                const textRanges = getTextRangesWhenDelete(actualRange, [actualRange]);
                // If the selection is not closed, the effect of Delete and
                // BACKSPACE is the same as CUT, so the CUT command is executed.
                result = await commandService.executeCommand(CutContentCommand.id, {
                    segmentId,
                    textRanges,
                    selections: [actualRange],
                });
            }
        }

        return result;
    },
};

// handle Delete key
export const DeleteRightCommand: ICommand = {
    id: 'doc.command.delete-right',
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: async (accessor) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (!docDataModel) {
            return false;
        }

        const docSkeletonManagerService = getCommandSkeleton(accessor, docDataModel.getUnitId());
        const commandService = accessor.get(ICommandService);

        const activeRange = docSelectionManagerService.getActiveTextRange();
        const rectRanges = docSelectionManagerService.getRectRanges();
        const ranges = docSelectionManagerService.getTextRanges();
        const skeleton = docSkeletonManagerService?.getSkeleton();

        if (rectRanges?.length) {
            const cursor = getCursorWhenDelete(ranges, rectRanges);
            const segmentId = rectRanges[0].segmentId;
            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                },
            ];
            return commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges,
            });
        }

        if (activeRange == null || skeleton == null || ranges == null) {
            return false;
        }

        const { segmentId, style, segmentPage } = activeRange;

        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
        if (!docDataModel || !body) {
            return false;
        }

        const actualRange = activeRange;
        const { startOffset, endOffset, collapsed } = actualRange;
        // No need to delete when the cursor is at the last position of the last paragraph.
        if (startOffset === body.dataStream.length - 2 && collapsed) {
            return true;
        }

        let result: boolean = false;
        if (collapsed === true) {
            const needDeleteGlyph = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage)!;
            const nextGlyph = skeleton.findNodeByCharIndex(startOffset + 1);

            // Handle delete key at cell content end.
            if (needDeleteGlyph.streamType === DataStreamTreeTokenType.PARAGRAPH && nextGlyph?.streamType === DataStreamTreeTokenType.SECTION_BREAK) {
                return false;
            }

            if (needDeleteGlyph.content === '\r') {
                result = await commandService.executeCommand(MergeTwoParagraphCommand.id, {
                    direction: DeleteDirection.RIGHT,
                    range: activeRange,
                });
            } else if (needDeleteGlyph.streamType === '\b') {
                const drawing = docDataModel.getSnapshot().drawings?.[needDeleteGlyph.drawingId ?? ''];

                if (drawing == null) {
                    return true;
                }

                const isInlineDrawing = drawing.layoutType === PositionedObjectLayoutType.INLINE;

                if (isInlineDrawing) {
                    const unitId = docDataModel.getUnitId();
                    result = await commandService.executeCommand(DeleteCustomBlockCommand.id, {
                        direction: DeleteDirection.RIGHT,
                        range: activeRange,
                        unitId,
                        drawingId: needDeleteGlyph.drawingId,
                    });
                } else {
                    if (nextGlyph == null) {
                        return true;
                    }

                    const textRanges = [
                        {
                            startOffset: startOffset + 1,
                            endOffset: startOffset + 1,
                            style,
                        },
                    ];

                    result = await commandService.executeCommand(DeleteCommand.id, {
                        unitId: docDataModel.getUnitId(),
                        range: {
                            ...activeRange,
                            startOffset: startOffset + 1,
                            endOffset: endOffset + 1,
                        },
                        segmentId,
                        direction: DeleteDirection.RIGHT,
                        textRanges,
                        len: nextGlyph.count,
                    });
                }
            } else {
                const textRanges = [
                    {
                        startOffset,
                        endOffset: startOffset,
                        style,
                    },
                ];

                result = await commandService.executeCommand(DeleteCommand.id, {
                    unitId: docDataModel.getUnitId(),
                    range: actualRange,
                    segmentId,
                    direction: DeleteDirection.RIGHT,
                    textRanges,
                    len: needDeleteGlyph.count,
                });
            }
        } else {
            const textRanges = getTextRangesWhenDelete(actualRange, [actualRange]);

            // If the selection is not closed, the effect of Delete and
            // BACKSPACE is the same as CUT, so the CUT command is executed.
            result = await commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges,
                selections: [actualRange],
            });
        }

        return result;
    },
};

// get cursor position when BACKSPACE/DELETE excuse the CutContentCommand.
function getTextRangesWhenDelete(activeRange: ITextRangeWithStyle, ranges: readonly ITextRange[]) {
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

export const DeleteCurrentParagraphCommand: ICommand = {
    id: 'doc.command.delete-current-paragraph',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!docDataModel) {
            return false;
        }

        const dataStream = docDataModel.getBody()?.dataStream ?? '';
        const paragraph = getCurrentParagraph(accessor);

        if (!paragraph) {
            return false;
        }

        const actions = BuildTextUtils.selection.delete(
            [{
                startOffset: paragraph.paragraphStart,
                endOffset: dataStream[paragraph.paragraphEnd + 1] === '\n'
                    ? paragraph.paragraphEnd
                    : paragraph.paragraphEnd + 1,
                collapsed: false,
            }],
            docDataModel.getBody()!,
            0,
            undefined,
            true
        );

        const path = getRichTextEditPath(docDataModel);

        const params: IRichTextEditingMutationParams = {
            unitId: docDataModel.getUnitId(),
            actions: JSONX.getInstance().editOp(actions, path),
            textRanges: [{
                startOffset: paragraph.paragraphStart,
                endOffset: paragraph.paragraphStart,
                collapsed: true,
            }],
        };

        return commandService.syncExecuteCommand(RichTextEditingMutation.id, params);
    },
};
