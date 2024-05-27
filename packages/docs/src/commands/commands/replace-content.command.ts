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

import type { ICommand, IDocumentBody, IMutationInfo } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

interface IReplaceContentCommandParams {
    unitId: string;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

// Replace all content with new body, and reserve undo/redo stack.
export const ReplaceContentCommand: ICommand<IReplaceContentCommandParams> = {
    id: 'doc.command-replace-content',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IReplaceContentCommandParams) => {
        const { unitId, body, textRanges, segmentId = '' } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const prevBody = univerInstanceService.getUniverDocInstance(unitId)?.getSnapshot().body;
        const selections = textSelectionManagerService.getSelections();

        if (prevBody == null) {
            return false;
        }

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const doMutation = getMutationParams(unitId, segmentId, prevBody, body);

        doMutation.params.textRanges = textRanges;

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface ICoverContentCommandParams {
    unitId: string;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    segmentId?: string;
}

// Cover all content with new body, and clear undo/redo stack.
export const CoverContentCommand: ICommand<ICoverContentCommandParams> = {
    id: 'doc.command-cover-content',

    type: CommandType.COMMAND,

    handler: async (accessor, params: ICoverContentCommandParams) => {
        const { unitId, body, segmentId = '' } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const prevBody = univerInstanceService.getUniverDocInstance(unitId)?.getSnapshot().body;

        if (prevBody == null) {
            return false;
        }

        const doMutation = getMutationParams(unitId, segmentId, prevBody, body);

        // No need to set the cursor or selection.
        doMutation.params.noNeedSetTextRange = true;
        doMutation.params.noHistory = true;

        commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(
            doMutation.id,
            doMutation.params
        );

        undoRedoService.clearUndoRedo(unitId);

        return true;
    },
};

function getMutationParams(unitId: string, segmentId: string, prevBody: IDocumentBody, body: IDocumentBody) {
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: [],
        },
    };

    const textX = new TextX();
    const jsonX = JSONX.getInstance();

    const deleteLen = prevBody?.dataStream.length - 2;
    if (deleteLen > 0) {
        textX.push({
            t: TextXActionType.DELETE,
            len: deleteLen,
            line: 0,
            segmentId,
        });
    }

    if (body.dataStream.length > 0) {
        textX.push({
            t: TextXActionType.INSERT,
            body,
            len: body.dataStream.length,
            line: 0,
            segmentId,
        });
    }

    doMutation.params.actions = jsonX.editOp(textX.serialize());

    return doMutation;
}
