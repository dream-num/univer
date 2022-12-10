import { nanoid } from 'nanoid';
import { DocContext } from '../../Basics';
import { Command } from '../../Command';
import { IDocumentData } from '../../Interfaces';
import { DEFAULT_DOC } from '../../Const';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';

export class DocumentModel {
    private _snapshot: IDocumentData;

    private _context: DocContext;

    private _unitId: string;

    constructor(snapshot: Partial<IDocumentData>, context: DocContext) {
        this._context = context;
        this._snapshot = { ...DEFAULT_DOC, ...snapshot };
        this._unitId = this._snapshot.documentId ?? nanoid(6);
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }

    insertText(text: string, start: number, segmentId?: string): DocumentModel {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();
        const insertTextAction = {
            actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
            text,
            start,
            length: text.length,
            segmentId,
        };
        const command = new Command(
            {
                DocumentUnit: this,
            },
            insertTextAction
        );
        _commandManager.invoke(command);
        return this;
    }

    deleteText(text: string, start: number, segmentId?: string): DocumentModel {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();
        const deleteTextAction = {
            actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
            text,
            start,
            length: text.length,
            segmentId,
        };
        const command = new Command(
            {
                DocumentUnit: this,
            },
            deleteTextAction
        );
        _commandManager.invoke(command);
        return this;
    }

    updateText(newText: string, oldText: string, start: number, segmentId?: string) {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();

        const deleteTextAction = {
            actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
            text: oldText,
            start: start + oldText.length,
            length: oldText.length,
            segmentId,
        };
        const insertTextAction = {
            actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
            text: newText,
            start,
            length: newText.length,
            segmentId,
        };
        const command = new Command(
            {
                DocumentUnit: this,
            },
            deleteTextAction,
            insertTextAction
        );
        _commandManager.invoke(command);
        return this;
    }
}
