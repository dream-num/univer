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
        const { segmentId, body, textRanges } = params;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();
        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const docsModel = univerInstanceService.getCurrentUniverDocInstance();
        if (!docsModel) {
            return false;
        }

        const unitId = docsModel.getUnitId();

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
                textX.push(...getRetainAndDeleteFromReplace(selection, segmentId, memoryCursor.cursor));
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

        doMutation.params.actions = jsonX.editOp(textX.serialize());

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

        const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const originBody = getDocsUpdateBody(documentDataModel!.getSnapshot(), segmentId);
        if (originBody == null || documentDataModel == null) {
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

        for (const selection of selections as TextRange[]) {
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

        rawActions.push(jsonX.editOp(textX.serialize())!);

        const removedCustomBlockIds = getCustomBlockIdsInSelections(originBody, selections);

        if (removedCustomBlockIds.length > 0) {
            for (const blockId of removedCustomBlockIds) {
                const drawing = (documentDataModel.getDrawings() ?? {})[blockId];
                const drawingOrder = documentDataModel.getDrawingsOrder();
                const drawingIndex = drawingOrder!.indexOf(blockId);

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
function getRetainAndDeleteAndExcludeLineBreak(
    range: TextRange,
    body: IDocumentBody,
    segmentId: string = '',
    memoryCursor: number = 0
): Array<IRetainAction | IDeleteAction> {
    const startOffset = range.startOffset!;
    const endOffset = range.endOffset!;
    const dos: Array<IRetainAction | IDeleteAction> = [];

    const { paragraphs = [] } = body;

    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;

    const paragraphInRange = paragraphs?.find(
        (p) => p.startIndex - memoryCursor >= textStart && p.startIndex - memoryCursor <= textEnd
    );

    if (textStart > 0) {
        dos.push({
            t: TextXActionType.RETAIN,
            len: textStart,
            segmentId,
        });
    }

    if (paragraphInRange && paragraphInRange.startIndex - memoryCursor > textStart) {
        const paragraphIndex = paragraphInRange.startIndex - memoryCursor;

        dos.push({
            t: TextXActionType.DELETE,
            len: paragraphIndex - textStart,
            line: 0,
            segmentId,
        });

        dos.push({
            t: TextXActionType.RETAIN,
            len: 1,
            segmentId,
        });

        if (textEnd > paragraphIndex + 1) {
            dos.push({
                t: TextXActionType.DELETE,
                len: textEnd - paragraphIndex - 1,
                line: 0,
                segmentId,
            });
        }
    } else {
        dos.push({
            t: TextXActionType.DELETE,
            len: textEnd - textStart,
            line: 0,
            segmentId,
        });
    }

    return dos;
}
