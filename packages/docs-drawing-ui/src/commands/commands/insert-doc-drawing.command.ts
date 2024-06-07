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

import type { ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    TextX,
    TextXActionType,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { getRetainAndDeleteFromReplace, RichTextEditingMutation, TextSelectionManagerService } from '@univerjs/docs';
import type { IInsertDrawingCommandParams } from './interfaces';

/**
 * The command to insert new defined name
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
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const activeTextRange = textSelectionManagerService.getActiveRange();
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (activeTextRange == null || documentDataModel == null) {
            return false;
        }

        const unitId = documentDataModel.getUnitId();
        const { drawings } = params;
        const { collapsed, startOffset, segmentId, style } = activeTextRange;

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];
        const drawingOrderLength = documentDataModel.getSnapshot().drawingsOrder?.length ?? 0;

        // Step 1: Insert placeholder `\b` in dataStream and add drawing to customBlocks.
        if (collapsed) {
            if (startOffset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: startOffset,
                    segmentId,
                });
            }
        } else {
            textX.push(...getRetainAndDeleteFromReplace(activeTextRange, segmentId));
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
            line: 0,
            segmentId,
        });

        const placeHolderAction = jsonX.editOp(textX.serialize());

        rawActions.push(placeHolderAction!);

        // Step 2: add drawing to drawings and drawingsOrder fields.
        for (const drawing of drawings) {
            const { drawingId } = drawing;
            const addDrawingAction = jsonX.insertOp(['drawings', drawingId], drawing);
            const addDrawingOrderAction = jsonX.insertOp(['drawingsOrder', drawingOrderLength], drawingId);

            rawActions.push(addDrawingAction!);
            rawActions.push(addDrawingOrderAction!);
        }

        const textRanges = [
            {
                startOffset: startOffset + drawings.length,
                endOffset: startOffset + drawings.length,
                collapsed: true,
                style,
            },
        ];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
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
        // const sheetDrawingParams = drawings.map((param) => param.sheetDrawingParam);
        // const unitIds = drawings.map((param) => param.unitId);

        // execute do mutations and add undo mutations to undo stack if completed
        // const jsonOp = docDrawingService.getBatchAddOp(drawings) as IDrawingJsonUndo1;

        // const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        // const result = commandService.syncExecuteCommand(SetDocDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: DocDrawingApplyType.INSERT });

        // if (result) {
        //     undoRedoService.pushUndoRedo({
        //         unitID: unitId,
        //         undoMutations: [
        //             { id: SetDocDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DocDrawingApplyType.REMOVE } },
        //             { id: ClearDocDrawingTransformerOperation.id, params: unitIds },
        //         ],
        //         redoMutations: [
        //             { id: SetDocDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DocDrawingApplyType.INSERT } },
        //             { id: ClearDocDrawingTransformerOperation.id, params: unitIds },
        //         ],
        //     });

        //     return true;
        // }

        // return false;
    },
};
