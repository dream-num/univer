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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, ITextRange } from '@univerjs/core';
import { BuildTextUtils, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { getRichTextEditPath } from '../util';

interface IReplaceContentCommandParams {
    unitId: string;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
    options: { [key: string]: boolean };
}

// Replace all content with new body, and reserve undo/redo stack.
export const ReplaceContentCommand: ICommand<IReplaceContentCommandParams> = {
    id: 'doc.command-replace-content',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IReplaceContentCommandParams) => {
        const { unitId, body, textRanges, segmentId = '', options } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const prevBody = docDataModel?.getSnapshot().body;
        const selections = docSelectionManagerService.getCurrentTextRanges();

        if (docDataModel == null || prevBody == null) {
            return false;
        }

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const doMutation = getMutationParams(unitId, segmentId, docDataModel, prevBody, body);

        doMutation.params.textRanges = textRanges;
        options && (doMutation.params.options = options);

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

        const docDatModel = univerInstanceService.getUniverDocInstance(unitId);

        const prevBody = docDatModel?.getSnapshot().body;

        if (docDatModel == null || prevBody == null) {
            return false;
        }

        const doMutation = getMutationParams(unitId, segmentId, docDatModel, prevBody, body);

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

function getMutationParams(unitId: string, segmentId: string, docDatModel: DocumentDataModel, prevBody: IDocumentBody, body: IDocumentBody) {
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

    const path = getRichTextEditPath(docDatModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

    return doMutation;
}

export interface IReplaceSelectionCommandParams {
    unitId: string;
    selection?: ITextRange;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    textRanges?: ITextRangeWithStyle[];
}

// TODO: implement
export const ReplaceSelectionCommand: ICommand<IReplaceSelectionCommandParams> = {
    id: 'doc.command.replace-selection',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, body: insertBody, textRanges } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        if (!docDataModel) {
            return false;
        }

        const body = docDataModel.getBody();
        const selection = params.selection ?? docSelectionManagerService.getActiveTextRange();
        if (!selection || !body) {
            return false;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                debounce: true,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        // delete
        textX.push(...BuildTextUtils.selection.getDeleteExculdeLastLineBreakActions(selection, body, '', 0, false));
        // insert
        textX.push({
            t: TextXActionType.INSERT,
            body: insertBody,
            len: insertBody.dataStream.length,
            line: 0,
        });
        doMutation.params.actions = jsonX.editOp(textX.serialize());

        return true;
    },
};
