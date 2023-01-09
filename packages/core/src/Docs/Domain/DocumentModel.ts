import { nanoid } from 'nanoid';
import { DocContext } from '../../Basics';
import { Command } from '../../Command';
import { BlockType, IDocumentData, ITextSelectionRange } from '../../Interfaces';
import { DEFAULT_DOC } from '../../Const';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';
import { getDocsUpdateBody } from '../Apply/Common';

export class DocumentModel {
    private _snapshot: IDocumentData;

    private _context: DocContext;

    private _unitId: string;

    constructor(snapshot: Partial<IDocumentData>, context: DocContext) {
        this._context = context;
        this._snapshot = { ...DEFAULT_DOC, ...snapshot };
        this._unitId = this._snapshot.id ?? nanoid(6);
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }

    insertText(
        text: string,
        range: ITextSelectionRange,
        segmentId?: string
    ): DocumentModel {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();
        const insertTextAction = {
            actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
            ...range,
            text,
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

    deleteText(range: ITextSelectionRange, segmentId?: string): DocumentModel {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();
        const deleteTextAction = {
            actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
            ...range,
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

    private _getDeleteTextAction(range: ITextSelectionRange, segmentId?: string) {
        const snapshot = this._snapshot;

        const body = getDocsUpdateBody(snapshot, segmentId);

        if (body == null) {
            return [];
        }

        const { blockElements, blockElementOrder } = body;

        const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = range;

        const actionList = [];

        for (let blockId of blockElementOrder) {
            const blockElement = blockElements[blockId];
            if (blockElement == null) {
                continue;
            }

            const { blockType, st, ed } = blockElement;

            if (blockType === BlockType.PARAGRAPH) {
                if (cursorStart > ed || cursorEnd < st) {
                    continue;
                }

                if (cursorStart === st && isCollapse && isStartBack) {
                    // bullet
                    actionList.push({
                        actionName: DOC_ACTION_NAMES.DELETE_BULLET_ACTION_NAME,
                        cursorStart: st,
                        cursorEnd: ed,
                        isCollapse: false,
                        isEndBack: false,
                        isStartBack: true,
                        blockId,
                        blockElement,
                        segmentId,
                    });
                } else if (
                    (cursorStart < st || (cursorStart === st && isStartBack)) &&
                    (cursorEnd > ed || (cursorEnd === ed && !isEndBack)) &&
                    !isCollapse
                ) {
                    // Paragraph
                    actionList.push({
                        actionName: DOC_ACTION_NAMES.DELETE_PARAGRAPH_ACTION_NAME,
                        cursorStart: st,
                        cursorEnd: ed,
                        isCollapse: false,
                        isEndBack: false,
                        isStartBack: true,
                        blockId,
                        blockElement,
                        segmentId,
                    });
                } else {
                    // textRun
                    actionList.push({
                        actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
                        ...range,
                        segmentId,
                    });
                }
            }
        }
    }
}
