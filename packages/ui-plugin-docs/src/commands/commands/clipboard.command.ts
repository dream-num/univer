import {
    getRetainAndDeleteFromReplace,
    IRichTextEditingMutationParams,
    MemoryCursor,
    RichTextEditingMutation,
    TextSelectionManagerService,
} from '@univerjs/base-docs';
import { CopyCommand, CutCommand, PasteCommand } from '@univerjs/base-ui';
import {
    CommandType,
    FOCUSING_DOC,
    ICommand,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
    IMultiCommand,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';

export const DocCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'doc.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1100,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    handler: async () => true,
};

export const DocCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'doc.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1100,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    handler: async () => true,
};

export const DocPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    name: 'doc.command.paste',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1100,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    handler: async () => true,
};

export interface IInnerPasteCommandParams {
    segmentId: string;
    body: IDocumentBody;
}

export const InnerPasteCommand: ICommand<IInnerPasteCommandParams> = {
    id: 'doc.command.inner-paste',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IInnerPasteCommandParams) => {
        const { segmentId, body } = params;
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

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
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
            console.log(startOffset, endOffset);

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

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
            });

            return true;
        }

        return false;
    },
};

export interface IInnerCutCommandParams {
    segmentId: string;
}

export const InnerCutCommand: ICommand<IInnerCutCommandParams> = {
    id: 'doc.command.inner-cut',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IInnerCutCommandParams) => {
        const { segmentId } = params;
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

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
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

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
            });

            return true;
        }

        return false;
    },
};
