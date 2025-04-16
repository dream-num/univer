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

import type { IAccessor, ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IInsertDrawingCommandParams } from './interfaces';
import {
    BuildTextUtils,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    TextX,
    TextXActionType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getCustomBlockIdsInSelections, getRichTextEditPath } from '@univerjs/docs-ui';

/**
 * The command to insert new drawings
 */
export const InsertDocDrawingCommand: ICommand = {
    id: 'doc.command.insert-doc-image',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params?: IInsertDrawingCommandParams) => {
        if (params == null) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const activeTextRange = docSelectionManagerService.getActiveTextRange();
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (activeTextRange == null || documentDataModel == null) {
            return false;
        }

        const unitId = documentDataModel.getUnitId();
        const { drawings } = params;
        const { collapsed, startOffset, segmentId } = activeTextRange;
        const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

        if (body == null) {
            return false;
        }

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];
        const drawingOrderLength = documentDataModel.getSnapshot().drawingsOrder?.length ?? 0;
        let removeDrawingLen = 0;

        // Step 1: Insert placeholder `\b` in dataStream and add drawing to customBlocks.
        if (collapsed) {
            if (startOffset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: startOffset,
                });
            }
        } else {
            const dos = BuildTextUtils.selection.delete([activeTextRange], body, 0, null, false);
            textX.push(...dos);

            const removedCustomBlockIds = getCustomBlockIdsInSelections(body, [activeTextRange]);
            const drawings = documentDataModel.getDrawings() ?? {};
            const drawingOrder = documentDataModel.getDrawingsOrder() ?? [];
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

                    removeDrawingLen++;
                }
            }
        }

        textX.push({
            t: TextXActionType.INSERT,
            body: {
                dataStream: '\b'.repeat(drawings.length),
                customBlocks: drawings.map((drawing, i) => ({
                    startIndex: i,
                    blockId: drawing.drawingId,
                })),
            },
            len: drawings.length,
        });

        const path = getRichTextEditPath(documentDataModel, segmentId);
        const placeHolderAction = jsonX.editOp(textX.serialize(), path);

        rawActions.push(placeHolderAction!);

        // Step 2: add drawing to drawings and drawingsOrder fields.
        for (const drawing of drawings) {
            const { drawingId } = drawing;
            const addDrawingAction = jsonX.insertOp(['drawings', drawingId], drawing);
            const addDrawingOrderAction = jsonX.insertOp(['drawingsOrder', drawingOrderLength - removeDrawingLen], drawingId);

            rawActions.push(addDrawingAction!);
            rawActions.push(addDrawingOrderAction!);
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: [],
            },
        };

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
