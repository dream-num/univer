import { nanoid } from 'nanoid';
import { DocContext } from '../../Basics';
import { Command } from '../../Command';
import { BlockType, IDocumentData, ITextSelectionRange } from '../../Interfaces';
import { DEFAULT_DOC } from '../../Const';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';
import { getDocsUpdateBody } from '../Apply/Common';
import { Nullable } from '../../Shared';

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
        // const deleteTextAction = {
        //     actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
        //     ...range,
        //     segmentId,
        // };

        const deleteTextActionList = this._getDeleteTextAction(range, segmentId);
        const command = new Command(
            {
                DocumentUnit: this,
            },
            ...deleteTextActionList
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
        const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = range;
        let actionList = [];
        if (isCollapse) {
            actionList = this._getDeleteTextActionCollapse(range, segmentId);
        } else {
            actionList = this._getDeleteTextActionRange(range, segmentId);
        }

        if (actionList.length === 0) {
            return [];
        }

        actionList.push({
            actionName: DOC_ACTION_NAMES.TEXT_INDEX_ADJUST_ACTION_NAME,
            cursorStart,
            cursorEnd,
            isCollapse,
            isEndBack,
            isStartBack,
            segmentId,
        });

        return actionList;
    }

    private _getDeleteTextActionCollapse(
        range: ITextSelectionRange,
        segmentId?: string
    ) {
        const snapshot = this._snapshot;

        const body = getDocsUpdateBody(snapshot, segmentId);

        if (body == null) {
            return [];
        }

        const { blockElements } = body;

        const { cursorStart, isCollapse, isStartBack } = range;

        const actionList = [];

        let startBlockId: Nullable<string> = null;

        let endBlockId: Nullable<string> = null;

        let preBlockId: Nullable<string> = null;

        for (let blockElement of blockElements) {
            if (blockElement == null) {
                continue;
            }

            const { blockType, st, ed, blockId } = blockElement;

            if (blockType === BlockType.PARAGRAPH) {
                if (cursorStart > ed || cursorStart < st) {
                    continue;
                }

                if (cursorStart === st && isStartBack) {
                    if (blockElement.paragraph?.bullet) {
                        // bullet
                        actionList.push({
                            actionName: DOC_ACTION_NAMES.DELETE_BULLET_ACTION_NAME,
                            blockId,
                            blockElement,
                            segmentId,
                        });
                    } else {
                        startBlockId = preBlockId;
                        endBlockId = blockId;
                    }
                } else {
                    // textRun
                    actionList.push({
                        actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
                        cursorStart,
                        cursorEnd: cursorStart,
                        isCollapse: true,
                        isEndBack: isStartBack,
                        isStartBack,
                        segmentId,
                    });
                }
            }

            preBlockId = blockId;
        }

        if (
            startBlockId != null &&
            endBlockId != null &&
            startBlockId !== endBlockId
        ) {
            actionList.push({
                actionName: DOC_ACTION_NAMES.MERGE_PARAGRAPH_ACTION_NAME,
                startBlockId,
                endBlockId,
                segmentId,
                cursorStart,
                isStartBack,
            });
        }

        return actionList;
    }

    private _getDeleteTextActionRange(
        range: ITextSelectionRange,
        segmentId?: string
    ) {
        const snapshot = this._snapshot;

        const body = getDocsUpdateBody(snapshot, segmentId);

        if (body == null) {
            return [];
        }

        const { blockElements } = body;

        const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = range;

        const actionList = [];

        let startBlockId: Nullable<string> = null;

        let endBlockId: Nullable<string> = null;

        for (let blockElement of blockElements) {
            if (blockElement == null) {
                continue;
            }

            const { blockType, st, ed, blockId } = blockElement;

            if (blockType === BlockType.PARAGRAPH) {
                if (cursorStart > ed || cursorEnd < st) {
                    continue;
                }

                let start = st;

                let end = ed;

                let isStartBackCurrent = isStartBack;

                let isEndBackCurrent = isEndBack;

                if (st <= cursorStart && ed >= cursorStart) {
                    startBlockId = blockId;
                    start = cursorStart;
                } else {
                    isStartBackCurrent = true;
                }

                if (st <= cursorEnd && ed >= cursorEnd) {
                    endBlockId = blockId;
                    end = cursorEnd;
                } else {
                    isEndBackCurrent = false;
                }

                if (
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
                        cursorStart: start,
                        cursorEnd: end,
                        isCollapse,
                        isEndBack: isEndBackCurrent,
                        isStartBack: isStartBackCurrent,
                        segmentId,
                    });
                }
            }
        }

        if (
            startBlockId != null &&
            endBlockId != null &&
            startBlockId !== endBlockId
        ) {
            actionList.push({
                actionName: DOC_ACTION_NAMES.MERGE_PARAGRAPH_ACTION_NAME,
                startBlockId,
                endBlockId,
                segmentId,
                cursorStart,
                isStartBack,
            });
        }

        return actionList;
    }
}
