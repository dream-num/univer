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
    ICommand,
    IDeleteAction,
    IDocumentBody,
    IMutationInfo,
    IRetainAction,
    ITextRange,
    JSONXActions,
} from '@univerjs/core';
import {
    CommandType,
    getDocsUpdateBody,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    TextX,
    TextXActionType,
} from '@univerjs/core';
import type { ITextRangeWithStyle, TextRange } from '@univerjs/engine-render';

import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { isIntersecting, shouldDeleteCustomRange } from '../../basics/custom-range';
import { getDeleteSelection } from '../../basics/selection';
import { getRichTextEditPath } from '../util';

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
        const { segmentId, textRanges } = params;
        const body = params.body;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();
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

export interface IInnerCutCommandParams {
    segmentId: string;
    textRanges: ITextRangeWithStyle[];
}

export const CutContentCommand: ICommand<IInnerCutCommandParams> = {
    id: 'doc.command.inner-cut',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: IInnerCutCommandParams) => {
        const { segmentId, textRanges } = params;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const unitId = univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
        if (!unitId) {
            return false;
        }

        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const originBody = getDocsUpdateBody(docDataModel!.getSnapshot(), segmentId);
        if (docDataModel == null || originBody == null) {
            return false;
        }

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
        const rawActions: JSONXActions = [];

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
            if (drawingOrder.indexOf(a) - drawingOrder.indexOf(b)) {
                return 1;
            } else if (drawingOrder.indexOf(b) - drawingOrder.indexOf(a)) {
                return -1;
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

function getCustomBlockIdsInSelections(body: IDocumentBody, selections: TextRange[]): string[] {
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

// If the selection contains line breaks,
// paragraph information needs to be preserved when performing the CUT operation
// eslint-disable-next-line max-lines-per-function
function getRetainAndDeleteAndExcludeLineBreak(
    selection: ITextRange,
    body: IDocumentBody,
    segmentId: string = '',
    memoryCursor: number = 0
): Array<IRetainAction | IDeleteAction> {
    const { startOffset, endOffset } = getDeleteSelection(selection, body);
    const dos: Array<IRetainAction | IDeleteAction> = [];

    const { paragraphs = [], dataStream } = body;

    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;

    const paragraphInRange = paragraphs?.find(
        (p) => p.startIndex - memoryCursor >= textStart && p.startIndex - memoryCursor <= textEnd
    );

    const relativeCustomRanges = body.customRanges?.filter((customRange) => isIntersecting(customRange.startIndex, customRange.endIndex, startOffset, endOffset));
    const toDeleteRanges = new Set(relativeCustomRanges?.filter((customRange) => shouldDeleteCustomRange(startOffset, endOffset - startOffset, customRange, dataStream)));
    const retainPoints = new Set<number>();

    relativeCustomRanges?.forEach((range) => {
        if (toDeleteRanges.has(range)) {
            return;
        }

        if (range.startIndex - memoryCursor >= textStart &&
            range.startIndex - memoryCursor <= textEnd &&
            range.endIndex - memoryCursor > textEnd) {
            retainPoints.add(range.startIndex);
        }
        if (range.endIndex - memoryCursor >= textStart &&
            range.endIndex - memoryCursor <= textEnd &&
            range.startIndex < textStart) {
            retainPoints.add(range.endIndex);
        }
    });

    if (textStart > 0) {
        dos.push({
            t: TextXActionType.RETAIN,
            len: textStart,
            segmentId,
        });
    }

    if (paragraphInRange && paragraphInRange.startIndex - memoryCursor > textStart) {
        const paragraphIndex = paragraphInRange.startIndex - memoryCursor;
        retainPoints.add(paragraphIndex);
    }

    const sortedRetains = [...retainPoints].sort((pre, aft) => pre - aft);

    let cursor = textStart;
    sortedRetains.forEach((pos) => {
        const len = pos - cursor;
        if (len > 0) {
            dos.push({
                t: TextXActionType.DELETE,
                len,
                line: 0,
                segmentId,
            });
        }
        dos.push({
            t: TextXActionType.RETAIN,
            len: 1,
            segmentId,
        });
        cursor = pos + 1;
    });

    if (cursor < textEnd) {
        dos.push({
            t: TextXActionType.DELETE,
            len: textEnd - cursor,
            line: 0,
            segmentId,
        });
    }
    return dos;
}
