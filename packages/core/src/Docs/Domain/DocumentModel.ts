import { DocContext } from '../../Basics';
import { Command, IActionData } from '../../Command';
import { IDocumentData, ITextRun, ITextSelectionRange } from '../../Interfaces';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';
import { getDocsUpdateBody } from '../Apply/Common';
import { Nullable, Tools } from '../../Shared';
import { DocumentBodyModel } from './DocumentBodyModel';

interface IDrawingUpdateConfig {
    left: number;
    top: number;
    height: number;
    width: number;
}

export type DocumentModelOrSimple = DocumentModelSimple | DocumentModel;

export class DocumentModelSimple {
    snapshot: IDocumentData;

    headerTreeMap: Map<string, DocumentBodyModel>;

    footerTreeMap: Map<string, DocumentBodyModel>;

    bodyModel: DocumentBodyModel;

    constructor(snapshot: IDocumentData) {
        this.snapshot = snapshot;

        if (this.snapshot.body != null) {
            this.bodyModel = DocumentBodyModel.create(this.snapshot.body);
        }
    }

    get drawings() {
        return this.snapshot.drawings;
    }

    get documentStyle() {
        return this.snapshot.documentStyle;
    }

    get lists() {
        return this.snapshot.lists;
    }

    getSnapshot() {
        return this.snapshot;
    }

    updateDocumentDataPageSize(width?: number, height?: number) {
        const documentStyle = this.snapshot.documentStyle;
        if (!documentStyle.pageSize) {
            width = width ?? Infinity;
            height = height ?? Infinity;
            documentStyle.pageSize = {
                width,
                height,
            };
            return;
        }

        if (width !== undefined) {
            documentStyle.pageSize.width = width;
        }

        if (height !== undefined) {
            documentStyle.pageSize.height = height;
        }
    }

    updateDrawing(id: string, config: IDrawingUpdateConfig) {
        const drawings = this.drawings;
        if (!drawings) {
            return;
        }

        const drawing = drawings[id];

        if (!drawing) {
            return;
        }

        const objectProperties = drawing.objectProperties;

        objectProperties.size.width = config.width;
        objectProperties.size.height = config.height;

        objectProperties.positionH.posOffset = config.left;
        objectProperties.positionV.posOffset = config.top;
    }
}

export class DocumentModel extends DocumentModelSimple {
    private _context: DocContext;

    private _unitId: string;

    constructor(snapshot: IDocumentData, context: DocContext) {
        super(snapshot);
        this._context = context;
        this._unitId = this.snapshot.id ?? Tools.generateRandomId(6);

        this.initializeRowColTree();
    }

    getUnitId(): string {
        return this._unitId;
    }

    insertText(
        text: string | ITextRun,
        range: ITextSelectionRange,
        segmentId?: string
    ): DocumentModel {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();
        const insertTextAction = {
            actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
            ...range,
            text,
            segmentId,
        };
        const command = new Command(
            {
                DocumentUnit: this,
            },
            insertTextAction,
            this._addTextIndexAdustAction(range, segmentId)
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
            ...deleteTextActionList,
            this._addTextIndexAdustAction(range, segmentId)
        );
        _commandManager.invoke(command);
        return this;
    }

    updateText(newText: string, oldText: string, start: number, segmentId?: string) {
        const { _context } = this;
        const _commandManager = _context.getCommandManager();

        // const deleteTextAction = {
        //     actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
        //     text: oldText,
        //     start: start + oldText.length,
        //     length: oldText.length,
        //     segmentId,
        // };
        const deleteTextActionList: IActionData[] = [];

        if (oldText.length > 0) {
            deleteTextActionList.push(
                ...this._getDeleteTextAction(
                    {
                        cursorStart: start,
                        isStartBack: false,
                        isCollapse: false,
                        cursorEnd: start + oldText.length,
                        isEndBack: false,
                    },
                    segmentId
                )
            );
        }

        // const insertTextAction = {
        //     actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
        //     text: newText,
        //     start,
        //     length: newText.length,
        //     segmentId,
        // };

        const insertTextAction = {
            actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
            cursorStart: start,
            isStartBack: false,
            text: newText,
            segmentId,
        };

        const command = new Command(
            {
                DocumentUnit: this,
            },
            ...deleteTextActionList,
            insertTextAction,
            this._addTextIndexAdustAction(
                {
                    cursorStart: start,
                    cursorEnd: start + Math.max(oldText.length, newText.length),
                    isCollapse: false,
                    isEndBack: false,
                    isStartBack: false,
                },
                segmentId
            )
        );
        _commandManager.invoke(command);
        return this;
    }

    private initializeRowColTree() {
        this.headerTreeMap = new Map();
        this.footerTreeMap = new Map();

        const { headers, footers } = this.snapshot;

        if (headers) {
            for (let headerId in headers) {
                const header = headers[headerId];
                this.headerTreeMap.set(
                    headerId,
                    DocumentBodyModel.create(header.body)
                );
            }
        }

        if (footers) {
            for (let footerId in footers) {
                const footer = footers[footerId];
                this.footerTreeMap.set(
                    footerId,
                    DocumentBodyModel.create(footer.body)
                );
            }
        }
    }

    private _addTextIndexAdustAction(
        range: ITextSelectionRange,
        segmentId?: string
    ) {
        const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = range;
        return {
            actionName: DOC_ACTION_NAMES.TEXT_INDEX_ADJUST_ACTION_NAME,
            cursorStart,
            cursorEnd,
            isCollapse,
            isEndBack,
            isStartBack,
            segmentId,
        };
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

        // actionList.push({
        //     actionName: DOC_ACTION_NAMES.TEXT_INDEX_ADJUST_ACTION_NAME,
        //     cursorStart,
        //     cursorEnd,
        //     isCollapse,
        //     isEndBack,
        //     isStartBack,
        //     segmentId,
        // });

        return actionList;
    }

    private _getDeleteTextActionCollapse(
        range: ITextSelectionRange,
        segmentId?: string
    ) {
        const snapshot = this.snapshot;

        const body = getDocsUpdateBody(snapshot, segmentId);

        if (body == null) {
            return [];
        }
        const { cursorStart, isCollapse, isStartBack } = range;

        // const actionList = [];

        let startBlockId: Nullable<string> = null;

        let endBlockId: Nullable<string> = null;

        let preBlockId: Nullable<string> = null;

        // const { blockElements } = body;

        // for (let blockElement of blockElements) {
        //     if (blockElement == null) {
        //         continue;
        //     }

        //     const { blockType, st, ed, blockId } = blockElement;

        //     if (blockType === BlockType.PARAGRAPH) {
        //         if (cursorStart > ed || cursorStart < st) {
        //             continue;
        //         }

        //         if (cursorStart === st && isStartBack) {
        //             if (blockElement.paragraph?.bullet) {
        //                 // bullet
        //                 actionList.push({
        //                     actionName: DOC_ACTION_NAMES.DELETE_BULLET_ACTION_NAME,
        //                     blockId,
        //                     blockElement,
        //                     segmentId,
        //                 });
        //             } else {
        //                 startBlockId = preBlockId;
        //                 endBlockId = blockId;
        //             }
        //         } else {
        //             // textRun
        //             actionList.push({
        //                 actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
        //                 cursorStart,
        //                 cursorEnd: cursorStart,
        //                 isCollapse: true,
        //                 isEndBack: isStartBack,
        //                 isStartBack,
        //                 segmentId,
        //             });
        //         }
        //     }

        //     preBlockId = blockId;
        // }

        // if (
        //     startBlockId != null &&
        //     endBlockId != null &&
        //     startBlockId !== endBlockId
        // ) {
        //     actionList.push({
        //         actionName: DOC_ACTION_NAMES.MERGE_PARAGRAPH_ACTION_NAME,
        //         startBlockId,
        //         endBlockId,
        //         segmentId,
        //         cursorStart,
        //         isStartBack,
        //     });
        // }

        return [];
    }

    private _getDeleteTextActionRange(
        range: ITextSelectionRange,
        segmentId?: string
    ) {
        const snapshot = this.snapshot;

        const body = getDocsUpdateBody(snapshot, segmentId);

        if (body == null) {
            return [];
        }

        const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = range;

        const actionList = [];

        let startBlockId: Nullable<string> = null;

        let endBlockId: Nullable<string> = null;

        return [];

        // const { blockElements } = body;

        // for (let blockElement of blockElements) {
        //     if (blockElement == null) {
        //         continue;
        //     }

        //     const { blockType, st, ed, blockId } = blockElement;

        //     if (blockType === BlockType.PARAGRAPH) {
        //         if (cursorStart > ed || cursorEnd < st) {
        //             continue;
        //         }

        //         let start = st;

        //         let end = ed;

        //         let isStartBackCurrent = isStartBack;

        //         let isEndBackCurrent = isEndBack;

        //         if (st <= cursorStart && ed >= cursorStart) {
        //             startBlockId = blockId;
        //             start = cursorStart;
        //         } else {
        //             isStartBackCurrent = true;
        //         }

        //         if (st <= cursorEnd && ed >= cursorEnd) {
        //             endBlockId = blockId;
        //             end = cursorEnd;
        //         } else {
        //             isEndBackCurrent = false;
        //         }

        //         if (
        //             (cursorStart < st || (cursorStart === st && isStartBack)) &&
        //             (cursorEnd > ed || (cursorEnd === ed && !isEndBack)) &&
        //             !isCollapse
        //         ) {
        //             // Paragraph
        //             actionList.push({
        //                 actionName: DOC_ACTION_NAMES.DELETE_PARAGRAPH_ACTION_NAME,
        //                 cursorStart: st,
        //                 cursorEnd: ed,
        //                 isCollapse: false,
        //                 isEndBack: false,
        //                 isStartBack: true,
        //                 blockId,
        //                 blockElement,
        //                 segmentId,
        //             });
        //         } else {
        //             // textRun
        //             actionList.push({
        //                 actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
        //                 cursorStart: start,
        //                 cursorEnd: end,
        //                 isCollapse,
        //                 isEndBack: isEndBackCurrent,
        //                 isStartBack: isStartBackCurrent,
        //                 segmentId,
        //             });
        //         }
        //     }
        // }

        // if (
        //     startBlockId != null &&
        //     endBlockId != null &&
        //     startBlockId !== endBlockId
        // ) {
        //     actionList.push({
        //         actionName: DOC_ACTION_NAMES.MERGE_PARAGRAPH_ACTION_NAME,
        //         startBlockId,
        //         endBlockId,
        //         segmentId,
        //         cursorStart,
        //         isStartBack,
        //     });
        // }

        // return actionList;
    }
}
