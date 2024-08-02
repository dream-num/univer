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

import type {
    DocumentDataModel,
    ICommand,
    IDocumentBody,
    IMutationInfo,
    ITextRange,
    JSONXActions,
} from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    TextX,
    TextXActionType,
} from '@univerjs/core';
import type { DocumentViewModel, ITextRangeWithStyle, RectRange } from '@univerjs/engine-render';

import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { getCommandSkeleton, getRichTextEditPath } from '../util';
import { getRetainAndDeleteAndExcludeLineBreak } from '../../basics/replace';
import { getDeleteRowContentActionParams, getDeleteRowsActionsParams, getDeleteTableActionParams } from './table/table';

export interface IInnerPasteCommandParams {
    segmentId: string;
    body: IDocumentBody;
    textRanges: ITextRangeWithStyle[];
}

// Actually, the command is to handle paste event.
export const InnerPasteCommand: ICommand<IInnerPasteCommandParams> = {
    id: 'doc.command.inner-paste',
    type: CommandType.COMMAND,

    handler: async (accessor, params: IInnerPasteCommandParams) => {
        const { segmentId, textRanges, body } = params;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getCurrentTextRanges();
        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
        if (docDataModel == null || originBody == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        for (const selection of selections) {
            const { startOffset, endOffset, collapsed } = selection;

            const len = startOffset - memoryCursor.cursor;

            if (collapsed) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len,
                    segmentId,
                });
            } else {
                const { dos } = getRetainAndDeleteFromReplace(selection, segmentId, memoryCursor.cursor, originBody);
                textX.push(...dos);
            }

            textX.push({
                t: TextXActionType.INSERT,
                body,
                len: body.dataStream.length,
                line: 0,
                segmentId,
            });

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
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

function getCutActionsFromTextRanges(
    selections: ITextRange[],
    docDataModel: DocumentDataModel,
    segmentId: string
) {
    const originBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const rawActions: JSONXActions = [];

    if (originBody == null) {
        return rawActions;
    }

    const memoryCursor = new MemoryCursor();
    memoryCursor.reset();

    for (const selection of selections) {
        const { startOffset, endOffset, collapsed } = selection;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        const len = startOffset - memoryCursor.cursor;

        if (collapsed) {
            textX.push({
                t: TextXActionType.RETAIN,
                len,
                segmentId,
            });
        } else {
            textX.push(...getRetainAndDeleteAndExcludeLineBreak(selection, originBody, segmentId, memoryCursor.cursor));
        }

        memoryCursor.reset();
        memoryCursor.moveCursor(endOffset);
    }

    const path = getRichTextEditPath(docDataModel, segmentId);
    rawActions.push(jsonX.editOp(textX.serialize(), path)!);

    const removedCustomBlockIds = getCustomBlockIdsInSelections(originBody, selections);
    const drawings = docDataModel.getDrawings() ?? {};
    const drawingOrder = docDataModel.getDrawingsOrder() ?? [];
    const sortedRemovedCustomBlockIds = removedCustomBlockIds.sort((a, b) => {
        if (drawingOrder.indexOf(a) > drawingOrder.indexOf(b)) {
            return -1;
        } else if (drawingOrder.indexOf(a) < drawingOrder.indexOf(b)) {
            return 1;
        }

        return 0;
    });

    if (sortedRemovedCustomBlockIds.length > 0) {
        for (const blockId of sortedRemovedCustomBlockIds) {
            const drawing = drawings[blockId];
            const drawingIndex = drawingOrder.indexOf(blockId);
            if (drawing == null || drawingIndex < 0) {
                continue;
            }

            const removeDrawingAction = jsonX.removeOp(['drawings', blockId], drawing);
            const removeDrawingOrderAction = jsonX.removeOp(['drawingsOrder', drawingIndex], blockId);

            rawActions.push(removeDrawingAction!);
            rawActions.push(removeDrawingOrderAction!);
        }
    }

    return rawActions.reduce((acc, cur) => {
        return JSONX.compose(acc, cur as JSONXActions);
    }, null as JSONXActions);
}

// eslint-disable-next-line max-lines-per-function
function getCutActionsFromRectRanges(
    ranges: RectRange[],
    docDataModel: DocumentDataModel,
    viewModel: DocumentViewModel,
    segmentId: string
): JSONXActions {
    const rawActions: JSONXActions = [];
    const segmentBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

    if (segmentBody == null) {
        return rawActions;
    }

    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const memoryCursor = new MemoryCursor();
    memoryCursor.reset();

    for (const range of ranges) {
        const { startOffset, endOffset, spanEntireRow, spanEntireTable } = range;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        if (spanEntireTable) {
            // Remove entire table.
            const actionParams = getDeleteTableActionParams({ startOffset, endOffset, segmentId }, viewModel);
            if (actionParams == null) {
                continue;
            }

            const { offset, len, tableId } = actionParams;
            if (offset - memoryCursor.cursor > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: offset - memoryCursor.cursor,
                    segmentId,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len,
                line: 0,
                segmentId,
            });

            const action = jsonX.removeOp(['tableSource', tableId]);
            rawActions.push(action!);

            memoryCursor.moveCursorTo(offset + len);
        } else if (spanEntireRow) {
            // Remove selected rows.
            const actionParams = getDeleteRowsActionsParams({ startOffset, endOffset, segmentId }, viewModel);
            if (actionParams == null) {
                continue;
            }

            const { offset, rowIndexes, len, tableId } = actionParams;

            if (offset - memoryCursor.cursor > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: offset - memoryCursor.cursor,
                    segmentId,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len,
                line: 0,
                segmentId,
            });

            // Step 3: delete table rows;
            for (const index of rowIndexes.reverse()) {
                const action = jsonX.removeOp(['tableSource', tableId, 'tableRows', index]);
                rawActions.push(action!);
            }

            memoryCursor.moveCursorTo(offset + len);
        } else {
            // Only delete content in rect range.
            const actionParams = getDeleteRowContentActionParams({ startOffset, endOffset, segmentId }, viewModel);
            if (actionParams == null) {
                continue;
            }

            const { offsets } = actionParams;

            for (const offset of offsets) {
                const { retain, delete: delLen } = offset;
                if (retain - memoryCursor.cursor > 0) {
                    textX.push({
                        t: TextXActionType.RETAIN,
                        len: retain - memoryCursor.cursor,
                        segmentId,
                    });
                }

                textX.push({
                    t: TextXActionType.DELETE,
                    len: delLen,
                    line: 0,
                    segmentId,
                });

                memoryCursor.moveCursorTo(retain + delLen);
            }
        }
    }

    const path = getRichTextEditPath(docDataModel, segmentId);
    rawActions.push(jsonX.editOp(textX.serialize(), path)!);

    return rawActions.reduce((acc, cur) => {
        return JSONX.compose(acc, cur as JSONXActions);
    }, null as JSONXActions);
}

export interface IInnerCutCommandParams {
    segmentId: string;
    textRanges: ITextRangeWithStyle[];
    selections?: ITextRange[];
}

const INNER_CUT_COMMAND_ID = 'doc.command.inner-cut';

export const CutContentCommand: ICommand<IInnerCutCommandParams> = {
    id: INNER_CUT_COMMAND_ID,
    type: CommandType.COMMAND,

    handler: async (accessor, params: IInnerCutCommandParams) => {
        const { segmentId, textRanges } = params;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = params.selections ?? textSelectionManagerService.getCurrentTextRanges();
        const rectRanges = textSelectionManagerService.getCurrentRectRanges();

        if (
            (!Array.isArray(selections) || selections.length === 0)
            && (!Array.isArray(rectRanges) || rectRanges.length === 0)
        ) {
            return false;
        }

        const unitId = univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
        if (!unitId) {
            return false;
        }

        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        if (docDataModel == null) {
            return false;
        }

        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);

        if (docSkeletonManagerService == null) {
            return false;
        }

        const viewModel = docSkeletonManagerService.getViewModel();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        if (Array.isArray(selections) && selections?.length !== 0) {
            doMutation.params.actions = getCutActionsFromTextRanges(selections, docDataModel, segmentId);
        }

        if (Array.isArray(rectRanges) && rectRanges?.length !== 0) {
            const actions = getCutActionsFromRectRanges(rectRanges, docDataModel, viewModel, segmentId);
            if (doMutation.params.actions?.length === 0 || doMutation.params.actions == null) {
                doMutation.params.actions = actions;
            } else {
                doMutation.params.actions = JSONX.compose(
                    doMutation.params.actions,
                    JSONX.transform(actions, doMutation.params.actions, 'right')!
                ) as JSONXActions;
            }
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

function getCustomBlockIdsInSelections(body: IDocumentBody, selections: ITextRange[]): string[] {
    const customBlockIds: string[] = [];
    const { customBlocks = [] } = body;

    for (const selection of selections) {
        const { startOffset, endOffset } = selection;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        for (const customBlock of customBlocks) {
            const { startIndex } = customBlock;

            if (startIndex >= startOffset && startIndex < endOffset) {
                customBlockIds.push(customBlock.blockId);
            }
        }
    }

    return customBlockIds;
}

