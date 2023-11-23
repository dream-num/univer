import { ITextRangeWithStyle } from '@univerjs/base-render';
import {
    CommandType,
    ICommand,
    ICommandService,
    IDocumentBody,
    IMutationInfo,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../mutations/core-editing.mutation';

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
        const undoRedoService = accessor.get(IUndoRedoService);

        const prevBody = univerInstanceService.getCurrentUniverDocInstance().getSnapshot().body;
        const selections = textSelectionManagerService.getSelections();

        if (prevBody == null) {
            return false;
        }

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        doMutation.params.mutations.push({
            t: 'd',
            len: prevBody?.dataStream.length - 2,
            line: 0,
            segmentId,
        });

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

                    textSelectionManagerService.replaceTextRanges(selections);

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
