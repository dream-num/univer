import {
    CommandType,
    getTextIndexByCursor,
    ICommand,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
    ITextSelectionRange,
    IUndoRedoService,
    UpdateDocsAttributeType,
} from '@univerjs/core';

import { InputController } from '../../Controller/InputController';
import { IDeleteMutationParams, IRetainMutationParams, IRichTextEditingMutationParams, RichTextEditingMutation } from '../mutations/core-editing.mutation';

export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const inputController = accessor.get(InputController);
        inputController.deleteLeft();
        return true;
    },
};

export const BreakLineCommand: ICommand = {
    id: 'doc.command.break-line',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const inputController = accessor.get(InputController);
        inputController.breakLine();
        return true;
    },
};

export interface IInsertCommandParams {
    unitId: string;
    body: IDocumentBody;
    range: ITextSelectionRange;
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
        const { cursorStart, cursorEnd, isEndBack, isStartBack, isCollapse } = range;
        const textStart = getTextIndexByCursor(cursorStart, isStartBack);

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const undoMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (isCollapse) {
            doMutation.params!.mutations.push({
                t: 'r',
                len: textStart + 1,
                segmentId,
            });
        } else {
            doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        doMutation.params!.mutations.push({
            t: 'i',
            body,
            len: body.dataStream.length,
            line: 0, // FIXME: line shouldn't be 0 here?
            segmentId,
        });

        // TODO@wzhudev: prepare undo mutation

        const result = await commandService.executeCommand(doMutation.id, doMutation.params);
        if (!result) {
            // NOTE: maybe we should throw an error here?
            return false;
        }

        undoRedoService.pushUndoRedo({
            URI: 'doc',
            undo() {
                console.log('TODO: undo doc mutations');
                return true;
            },
            redo() {
                console.log('TODO: redo doc mutations');
                return true;
            },
        });

        return true;
    },
};

export interface IDeleteCommandParams {
    unitId: string;
    range: ITextSelectionRange;
    segmentId?: string;
}

/**
 * The command to delete text.
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

        // TODO@wzhudev: prepare undo mutation

        const result = await commandService.executeCommand(doMutation.id, doMutation.params);
        if (!result) {
            // NOTE: maybe we should throw an error here?
            return false;
        }

        undoRedoService.pushUndoRedo({
            URI: 'doc',
            undo() {
                console.log('TODO: undo doc mutations');
                return true;
            },
            redo() {
                console.log('TODO: redo doc mutations');
                return true;
            },
        });

        return true;
    },
};

export interface IUpdateCommandParams {
    unitId: string;
    updateBody: IDocumentBody;
    range: ITextSelectionRange;
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

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { range, segmentId, updateBody, coverType, unitId } = params;
        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const { cursorStart, cursorEnd, isEndBack, isStartBack, isCollapse } = range;
        const textStart = getTextIndexByCursor(cursorStart, isStartBack);
        const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

        doMutation.params!.mutations.push({
            t: 'r',
            len: textStart + 1,
            segmentId,
        });

        doMutation.params!.mutations.push({
            t: 'r',
            body: updateBody,
            len: textEnd - textStart + 1,
            segmentId,
            coverType,
        });

        // TODO@wzhudev: prepare undo mutation

        const result = await commandService.executeCommand(doMutation.id, doMutation.params);
        if (!result) {
            // NOTE: maybe we should throw an error here?
            return false;
        }

        undoRedoService.pushUndoRedo({
            URI: 'doc',
            undo() {
                console.log('TODO: undo doc mutations');
                return true;
            },
            redo() {
                console.log('TODO: redo doc mutations');
                return true;
            },
        });

        return true;
    },
};

export interface IIMEInputCommandParams {
    newText: string;
    oldTextLen: number;
    start: number;
    segmentId?: string;
    unitId: string;
}

export const IMEInputCommand: ICommand<IIMEInputCommandParams> = {
    id: 'doc.command.ime-input',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IIMEInputCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { unitId, newText, oldTextLen, start, segmentId } = params;
        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        doMutation.params!.mutations.push({
            t: 'r',
            len: start + 1,
            segmentId,
        });

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

        // TODO@wzhudev: prepare undo mutation

        const result = await commandService.executeCommand(doMutation.id, doMutation.params);
        if (!result) {
            // NOTE: maybe we should throw an error here?
            return false;
        }

        undoRedoService.pushUndoRedo({
            URI: 'doc',
            undo() {
                console.log('TODO: undo doc mutations');
                return true;
            },
            redo() {
                console.log('TODO: redo doc mutations');
                return true;
            },
        });

        return true;
    },
};

function getRetainAndDeleteFromReplace(range: ITextSelectionRange, segmentId?: string): Array<IRetainMutationParams | IDeleteMutationParams> {
    const { cursorStart, cursorEnd, isEndBack, isStartBack, isCollapse } = range;
    const dos: Array<IRetainMutationParams | IDeleteMutationParams> = [];

    const textStart = getTextIndexByCursor(cursorStart, isStartBack) + (isCollapse ? 0 : 1);
    const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

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
