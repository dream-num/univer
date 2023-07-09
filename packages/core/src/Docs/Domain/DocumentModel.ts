import { DocContext } from '../../Basics';
import { Command } from '../../Command';
import {
    CommonParameterAttribute,
    IDocumentBody,
    IDocumentData,
} from '../../Interfaces/IDocumentData';
import { ITextSelectionRange } from '../../Interfaces/ISelectionData';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';
import { Tools, getTextIndexByCursor } from '../../Shared';
import { DocumentBodyModel } from './DocumentBodyModel';
import { DEFAULT_DOC } from '../../Const';

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

    constructor(snapshot: Partial<IDocumentData>) {
        // this.snapshot = snapshot;
        this.snapshot = { ...DEFAULT_DOC, ...snapshot };

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

    constructor(snapshot: Partial<IDocumentData>, context: DocContext) {
        super(snapshot);
        this._context = context;
        this._unitId = this.snapshot.id ?? Tools.generateRandomId(6);

        this.initializeRowColTree();
    }

    getUnitId(): string {
        return this._unitId;
    }

    insert(
        body: IDocumentBody,
        range: ITextSelectionRange,
        segmentId?: string
    ): DocumentModel {
        const commandManager = this._context.getCommandManager();

        const { cursorStart, cursorEnd, isEndBack, isStartBack, isCollapse } = range;

        const textStart = getTextIndexByCursor(cursorStart, isStartBack);

        const actionList = [];

        if (isCollapse) {
            actionList.push({
                actionName: DOC_ACTION_NAMES.RETAIN_ACTION_NAME,
                len: textStart,
                segmentId,
            });
        } else {
            actionList.push(...this._getDeleteAction(range, segmentId));
        }

        actionList.push({
            actionName: DOC_ACTION_NAMES.INSERT_ACTION_NAME,
            body,
            len: body.dataStream.length,
            line: 0,
            segmentId,
        });

        const command = new Command(
            {
                DocumentUnit: this,
            },
            ...actionList
        );
        commandManager.invoke(command);
        return this;
    }

    delete(range: ITextSelectionRange, segmentId?: string): DocumentModel {
        const commandManager = this._context.getCommandManager();

        const deleteActionList = this._getDeleteAction(range, segmentId);

        const command = new Command(
            {
                DocumentUnit: this,
            },
            ...deleteActionList
        );
        commandManager.invoke(command);
        return this;
    }

    update(
        attribute: CommonParameterAttribute,
        range: ITextSelectionRange,
        segmentId?: string
    ) {
        const commandManager = this._context.getCommandManager();

        const { cursorStart, cursorEnd, isEndBack, isStartBack } = range;
        const actionList = [];

        const textStart = getTextIndexByCursor(cursorStart, isStartBack);

        const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

        actionList.push({
            actionName: DOC_ACTION_NAMES.RETAIN_ACTION_NAME,
            len: textStart,
            segmentId,
        });

        actionList.push({
            actionName: DOC_ACTION_NAMES.RETAIN_ACTION_NAME,
            len: textEnd - textStart + 1,
            attribute,
            segmentId,
        });

        const command = new Command(
            {
                DocumentUnit: this,
            },
            ...actionList
        );
        commandManager.invoke(command);
        return this;
    }

    IMEInput(
        newText: string,
        oldTextLen: number,
        start: number,
        segmentId?: string
    ) {
        const _commandManager = this._context.getCommandManager();

        const actionList = [];

        actionList.push({
            actionName: DOC_ACTION_NAMES.RETAIN_ACTION_NAME,
            len: start,
            segmentId,
        });

        actionList.push({
            actionName: DOC_ACTION_NAMES.DELETE_ACTION_NAME,
            len: oldTextLen,
            line: 0,
            segmentId,
        });

        actionList.push({
            actionName: DOC_ACTION_NAMES.INSERT_ACTION_NAME,
            body: {
                dataStream: newText,
            },
            len: newText.length,
            line: 0,
            segmentId,
        });

        const command = new Command(
            {
                DocumentUnit: this,
            },
            ...actionList
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

    private _getDeleteAction(range: ITextSelectionRange, segmentId?: string) {
        const { cursorStart, cursorEnd, isEndBack, isStartBack } = range;
        const actionList = [];

        const textStart = getTextIndexByCursor(cursorStart, isStartBack);

        const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

        if (textStart > 0) {
            actionList.push({
                actionName: DOC_ACTION_NAMES.RETAIN_ACTION_NAME,
                len: textStart,
                segmentId,
            });
        }

        actionList.push({
            actionName: DOC_ACTION_NAMES.DELETE_ACTION_NAME,
            len: textEnd - textStart + 1,
            line: 0,
            segmentId,
        });

        return actionList;
    }
}
