import {
    CommandType,
    createEmptyDocSnapshot,
    ICommand,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
    IDocumentData,
    ITextRange,
    IUndoRedoService,
    IUniverInstanceService,
    UpdateDocsAttributeType,
} from '@univerjs/core';

import {
    IDeleteMutationParams,
    IRetainMutationParams,
    IRichTextEditingMutationParams,
    RichTextEditingMutation,
} from '../mutations/core-editing.mutation';

export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const BreakLineCommand: ICommand = {
    id: 'doc.command.break-line',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export interface IInsertCommandParams {
    unitId: string;
    body: IDocumentBody;
    range: ITextRange;
    segmentId?: string;
}

/**
 * The command to insert text. The changed range could be non-collapsed.
 */
export const InsertCommand: ICommand<IInsertCommandParams> = {
    id: 'doc.command.insert-text',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IInsertCommandParams) => {
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);

        const { range, segmentId, body, unitId } = params;
        const { startOffset, collapsed } = range;

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (collapsed) {
            doMutation.params!.mutations.push({
                t: 'r',
                len: startOffset,
                segmentId,
            });
        } else {
            doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        doMutation.params!.mutations.push({
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

export interface IDeleteCommandParams {
    unitId: string;
    range: ITextRange;
    segmentId?: string;
}

/**
 * The command to delete text. mainly used in BACKSPACE.
 */
export const DeleteCommand: ICommand<IDeleteCommandParams> = {
    id: 'doc.command.delete-text',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            throw new Error();
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { range, segmentId, unitId } = params;
        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));

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
    segmentId?: string;
}

/**
 * The command to update text properties.
 */
export const UpdateCommand: ICommand<IUpdateCommandParams> = {
    id: 'doc.command.update-text',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            throw new Error();
        }

        const { range, segmentId, updateBody, coverType, unitId } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const { startOffset, endOffset } = range;

        doMutation.params!.mutations.push({
            t: 'r',
            len: startOffset,
            segmentId,
        });

        doMutation.params!.mutations.push({
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

export interface IIMEInputCommandParams {
    newText: string;
    oldTextLen: number;
    range: ITextRange;
    segmentId?: string;
    unitId: string;
}

export const IMEInputCommand: ICommand<IIMEInputCommandParams> = {
    id: 'doc.command.ime-input',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IIMEInputCommandParams) => {
        const { unitId, newText, oldTextLen, range, segmentId } = params;
        const commandService = accessor.get(ICommandService);

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

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        if (!result) {
            return false;
        }

        return true;
    },
};

export interface ICoverCommandParams {
    unitId: string;

    snapshot?: IDocumentData;
    clearUndoRedoStack?: boolean;
}

export const CoverCommand: ICommand<ICoverCommandParams> = {
    id: 'doc.command-cover-content',
    type: CommandType.COMMAND,
    handler: async (accessor, params: ICoverCommandParams) => {
        const { unitId, snapshot, clearUndoRedoStack } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getUniverDocInstance(unitId);

        if (!doc) {
            return false;
        }

        doc.reset(snapshot || createEmptyDocSnapshot());

        if (clearUndoRedoStack) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.clearUndoRedo(unitId);
        }

        return true;
    },
};

export function getRetainAndDeleteFromReplace(
    range: ITextRange,
    segmentId: string = '',
    memoryCursor: number = 0
): Array<IRetainMutationParams | IDeleteMutationParams> {
    const { startOffset, endOffset, collapsed } = range;
    const dos: Array<IRetainMutationParams | IDeleteMutationParams> = [];

    const textStart = startOffset + (collapsed ? -1 : 0) - memoryCursor;
    const textEnd = endOffset - 1 - memoryCursor;

    if (textStart > 0) {
        dos.push({
            t: 'r',
            len: textStart,
            segmentId,
        });
    }

    dos.push({
        t: 'd',
        len: textEnd - textStart + 1,
        line: 0,
        segmentId,
    });

    return dos;
}
