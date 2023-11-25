import { ITextRangeWithStyle } from '@univerjs/base-render';
import {
    CommandType,
    getDocsUpdateBody,
    ICommand,
    ICommandService,
    IDeleteMutationParams,
    IDocumentBody,
    IMutationInfo,
    IRetainMutationParams,
    ITextRange,
    IUndoRedoService,
    IUniverInstanceService,
    MemoryCursor,
} from '@univerjs/core';

import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../mutations/core-editing.mutation';

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
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const docsModel = currentUniverService.getCurrentUniverDocInstance();
        const unitId = docsModel.getUnitId();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        for (const selection of selections) {
            const { startOffset, endOffset, collapsed } = selection;

            const len = startOffset - memoryCursor.cursor;

            if (collapsed) {
                doMutation.params!.mutations.push({
                    t: 'r',
                    len,
                    segmentId,
                });
            } else {
                doMutation.params!.mutations.push(
                    ...getRetainAndDeleteFromReplace(selection, segmentId, memoryCursor.cursor)
                );
            }

            doMutation.params!.mutations.push({
                t: 'i',
                body,
                len: body.dataStream.length,
                line: 0,
                segmentId,
            });

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

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

export interface IInnerCutCommandParams {
    segmentId: string;
    textRanges: ITextRangeWithStyle[];
}

export const CutContentCommand: ICommand<IInnerCutCommandParams> = {
    id: 'doc.command.inner-cut',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IInnerCutCommandParams) => {
        const { segmentId, textRanges } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const unitId = currentUniverService.getCurrentUniverDocInstance().getUnitId();

        const documentModel = currentUniverService.getUniverDocInstance(unitId);

        const originBody = getDocsUpdateBody(documentModel!.snapshot, segmentId);

        if (originBody == null) {
            return false;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        for (const selection of selections) {
            const { startOffset, endOffset, collapsed } = selection;

            const len = startOffset - memoryCursor.cursor;

            if (collapsed) {
                doMutation.params!.mutations.push({
                    t: 'r',
                    len,
                    segmentId,
                });
            } else {
                doMutation.params!.mutations.push(
                    ...getRetainAndDeleteAndExcludeLineBreak(selection, originBody, segmentId, memoryCursor.cursor)
                );
            }

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

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

// If the selection contains line breaks,
// paragraph information needs to be preserved when performing the CUT operation
function getRetainAndDeleteAndExcludeLineBreak(
    range: ITextRange,
    body: IDocumentBody,
    segmentId: string = '',
    memoryCursor: number = 0
): Array<IRetainMutationParams | IDeleteMutationParams> {
    const { startOffset, endOffset } = range;
    const dos: Array<IRetainMutationParams | IDeleteMutationParams> = [];

    const { paragraphs = [] } = body;

    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;

    const paragraphInRange = paragraphs?.find(
        (p) => p.startIndex - memoryCursor >= textStart && p.startIndex - memoryCursor <= textEnd
    );

    if (textStart > 0) {
        dos.push({
            t: 'r',
            len: textStart,
            segmentId,
        });
    }

    if (paragraphInRange && paragraphInRange.startIndex - memoryCursor > textStart) {
        const paragraphIndex = paragraphInRange.startIndex - memoryCursor;

        dos.push({
            t: 'd',
            len: paragraphIndex - textStart,
            line: 0,
            segmentId,
        });

        dos.push({
            t: 'r',
            len: 1,
            segmentId,
        });

        if (textEnd > paragraphIndex + 1) {
            dos.push({
                t: 'd',
                len: textEnd - paragraphIndex - 1,
                line: 0,
                segmentId,
            });
        }
    } else {
        dos.push({
            t: 'd',
            len: textEnd - textStart,
            line: 0,
            segmentId,
        });
    }

    return dos;
}
