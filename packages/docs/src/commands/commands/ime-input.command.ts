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

import type { ICommand, ICommandInfo, ITextRange } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';

import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import { IMEInputManagerService } from '../../services/ime-input-manager.service';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export interface IIMEInputCommandParams {
    unitId: string;
    newText: string;
    oldTextLen: number;
    range: ITextRange;
    textRanges: ITextRangeWithStyle[];
    isCompositionEnd: boolean;
    segmentId?: string;
}

export const IMEInputCommand: ICommand<IIMEInputCommandParams> = {
    id: 'doc.command.ime-input',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IIMEInputCommandParams) => {
        const { unitId, newText, oldTextLen, range, segmentId, textRanges, isCompositionEnd } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const imeInputManagerService = accessor.get(IMEInputManagerService);

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (range.collapsed) {
            doMutation.params!.mutations.push({
                t: 'r',
                len: range.startOffset,
                segmentId,
            });
        } else {
            doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        if (oldTextLen > 0) {
            doMutation.params!.mutations.push({
                t: 'd',
                len: oldTextLen,
                line: 0,
                segmentId,
            });
        }

        doMutation.params!.mutations.push({
            t: 'i',
            body: {
                dataStream: newText,
            },
            len: newText.length,
            line: 0,
            segmentId,
        });

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        imeInputManagerService.pushUndoRedoMutationParams(result, doMutation.params!);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (isCompositionEnd) {
            if (result) {
                const historyParams = imeInputManagerService.fetchComposedUndoRedoMutationParams(newText);

                if (historyParams == null) {
                    return false;
                }

                const { undoMutationParams, redoMutationParams, previousActiveRange } = historyParams;

                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    undoMutations: [{ id: RichTextEditingMutation.id, params: undoMutationParams }],
                    redoMutations: [{ id: RichTextEditingMutation.id, params: redoMutationParams }],
                    undo() {
                        commandService.syncExecuteCommand(RichTextEditingMutation.id, undoMutationParams);

                        textSelectionManagerService.replaceTextRanges([previousActiveRange]);

                        return true;
                    },
                    redo() {
                        commandService.syncExecuteCommand(RichTextEditingMutation.id, redoMutationParams);

                        textSelectionManagerService.replaceTextRanges(textRanges);

                        return true;
                    },
                });

                return true;
            }
        } else {
            return !!result;
        }

        return false;
    },
};
