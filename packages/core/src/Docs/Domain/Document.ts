import { nanoid } from 'nanoid';
import { DocContext } from '../../Basics';
import { Command } from '../../Command';
import { IDocumentData } from '../../Interfaces';
import { DEFAULT_DOC } from '../../Const';

export class Document {
    private _config: IDocumentData;

    private _context: DocContext;

    private _unitId: string;

    constructor(config: Partial<IDocumentData>, context: DocContext) {
        this._context = context;
        this._config = { ...DEFAULT_DOC, ...config };
        this._unitId = this._config.documentId ?? nanoid(6);
    }

    getUnitId(): string {
        return this._unitId;
    }

    insertText(text: string): Document {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();
        const insertTextAction = {
            actionName: 'InsertTextAction',
            text,
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
}
