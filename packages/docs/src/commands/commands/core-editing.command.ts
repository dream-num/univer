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
    IDocumentBody,
    IDocumentData,
    IMutationInfo,
    ITextRange,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';

import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export interface IInsertCommandParams {
    unitId: string;
    body: IDocumentBody;
    range: ITextRange;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

/**
 * The command to insert text. The changed range could be non-collapsed, mainly use in line break and normal input.
 */
export const InsertCommand: ICommand<IInsertCommandParams> = {
    id: 'doc.command.insert-text',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IInsertCommandParams) => {
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const { range, segmentId, body, unitId, textRanges } = params;
        const { startOffset, collapsed } = range;

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (collapsed) {
            if (startOffset > 0) {
                doMutation.params.mutations.push({
                    t: 'r',
                    len: startOffset,
                    segmentId,
                });
            }
        } else {
            doMutation.params.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        doMutation.params.mutations.push({
            t: 'i',
            body,
            len: body.dataStream.length,
            line: 0,
            segmentId,
        });

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);

                    textSelectionManagerService.replaceTextRanges([range]);

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);

                    textSelectionManagerService.replaceTextRanges(textRanges);

                    return true;
                },
            });

            return true;
        }

        return false;
    },
};

export enum DeleteDirection {
    LEFT,
    RIGHT,
}

export interface IDeleteCommandParams {
    unitId: string;
    range: ITextRange;
    direction: DeleteDirection;
    textRanges: ITextRangeWithStyle[];
    len?: number;
    segmentId?: string;
}

/**
 * The command to delete text, mainly used in BACKSPACE and DELETE when collapsed is true. ONLY handle collapsed range!!!
 */
export const DeleteCommand: ICommand<IDeleteCommandParams> = {
    id: 'doc.command.delete-text',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IDeleteCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const { range, segmentId, unitId, direction, textRanges, len = 1 } = params;

        const { startOffset } = range;

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (startOffset > 0) {
            doMutation.params.mutations.push({
                t: 'r',
                len: direction === DeleteDirection.LEFT ? startOffset - len : startOffset,
                segmentId,
            });
        }

        doMutation.params.mutations.push({
            t: 'd',
            len,
            line: 0,
            segmentId,
        });

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);

                    textSelectionManagerService.replaceTextRanges([range]);

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);

                    textSelectionManagerService.replaceTextRanges(textRanges);

                    return true;
                },
            });
            return false;
        }

        return false;
    },
};

export interface IUpdateCommandParams {
    unitId: string;
    updateBody: IDocumentBody;
    range: ITextRange;
    coverType: UpdateDocsAttributeType;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

/**
 * The command to update text properties, mainly used in BACKSPACE.
 */
export const UpdateCommand: ICommand<IUpdateCommandParams> = {
    id: 'doc.command.update-text',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IUpdateCommandParams) => {
        const { range, segmentId, updateBody, coverType, unitId, textRanges } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const { startOffset, endOffset } = range;

        doMutation.params.mutations.push({
            t: 'r',
            len: startOffset,
            segmentId,
        });

        doMutation.params.mutations.push({
            t: 'r',
            body: updateBody,
            len: endOffset - startOffset,
            segmentId,
            coverType,
        });

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);

                    textSelectionManagerService.replaceTextRanges(textRanges);

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);

                    textSelectionManagerService.replaceTextRanges(textRanges);

                    return true;
                },
            });

            return true;
        }

        return false;
    },
};

export interface ICoverCommandParams {
    unitId: string;

    snapshot?: IDocumentData;
    clearUndoRedoStack?: boolean;
}
