import { ITextRangeWithStyle } from '@univerjs/base-render';
import { CommandType, ICommand, ICommandInfo, ICommandService, ITextRange, IUndoRedoService } from '@univerjs/core';

import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../mutations/core-editing.mutation';

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

        console.log(result);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (isCompositionEnd) {
            if (result) {
                const undoMutationParams: IRichTextEditingMutationParams = {
                    unitId,
                    mutations: [],
                };

                const doMutationParams: IRichTextEditingMutationParams = {
                    unitId,
                    mutations: [],
                };

                if (range.collapsed) {
                    undoMutationParams.mutations.push({
                        t: 'r',
                        len: range.startOffset,
                        segmentId,
                    });
                    doMutationParams.mutations.push({
                        t: 'r',
                        len: range.startOffset,
                        segmentId,
                    });
                } else {
                    undoMutationParams.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
                    doMutationParams.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
                }

                if (newText.length) {
                    undoMutationParams.mutations.push({
                        t: 'd',
                        len: newText.length,
                        line: 0,
                        segmentId,
                    });

                    doMutationParams.mutations.push({
                        t: 'i',
                        body: {
                            dataStream: newText,
                        },
                        len: newText.length,
                        line: 0,
                        segmentId,
                    });
                }

                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    undoMutations: [{ id: RichTextEditingMutation.id, params: undoMutationParams }],
                    redoMutations: [{ id: RichTextEditingMutation.id, params: doMutationParams }],
                    undo() {
                        commandService.syncExecuteCommand(RichTextEditingMutation.id, undoMutationParams);

                        textSelectionManagerService.replaceTextRanges([range]);

                        return true;
                    },
                    redo() {
                        commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutationParams);

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
