import { MemoryCursor } from '../../common/memory-cursor';
import { getDocsUpdateBody, Nullable } from '../../shared';
import { UpdateDocsAttributeType } from '../../shared/command-enum';
import { Tools } from '../../shared/tools';
import { IDocumentBody, IDocumentData, IDocumentRenderConfig } from '../../types/interfaces/i-document-data';
import { IPaddingData } from '../../types/interfaces/i-style-data';
import { recoveryBody, updateAttributeByDelete } from './apply-utils/delete-apply';
import { updateAttributeByInsert } from './apply-utils/insert-apply';
import { updateAttribute } from './apply-utils/update-apply';
import { DocumentBodyModel } from './document-body-model';
import { DocMutationParams } from './document-model-types';

export const DEFAULT_DOC = {
    id: 'default_doc',
    documentStyle: {},
};

interface IDrawingUpdateConfig {
    left: number;
    top: number;
    height: number;
    width: number;
}

export type DocumentModelOrSimple = DocumentDataModelSimple | DocumentDataModel;

export class DocumentDataModelSimple {
    snapshot: IDocumentData;

    headerTreeMap!: Map<string, DocumentBodyModel>; // sub class should guarantee this is not null

    footerTreeMap!: Map<string, DocumentBodyModel>; // sub class should guarantee this is not null

    bodyModel!: DocumentBodyModel; // sub class should guarantee this is not null

    constructor(snapshot: Partial<IDocumentData>) {
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

    get body() {
        return this.snapshot.body;
    }

    get zoomRatio() {
        return this.snapshot.settings?.zoomRatio || 1;
    }

    dispose() {
        this.bodyModel.dispose();

        this.headerTreeMap.forEach((headerTree) => {
            headerTree.dispose();
        });

        this.footerTreeMap.forEach((footerTree) => {
            footerTree.dispose();
        });
    }

    getShouldRenderLoopImmediately() {
        const should = this.snapshot.shouldStartRenderingImmediately;

        return should !== false;
    }

    getContainer() {
        return this.snapshot.container;
    }

    getParentRenderUnitId() {
        return this.snapshot.parentRenderUnitId;
    }

    getBodyModel(segmentId?: string) {
        if (segmentId == null) {
            return this.bodyModel;
        }

        if (this.headerTreeMap.has(segmentId)) {
            return this.headerTreeMap.get(segmentId)!;
        }

        if (this.footerTreeMap.has(segmentId)) {
            return this.footerTreeMap.get(segmentId)!;
        }

        return this.bodyModel;
    }

    getSnapshot() {
        return this.snapshot;
    }

    updateDocumentId(unitId: string) {
        this.snapshot.id = unitId;
    }

    updateDocumentRenderConfig(config: IDocumentRenderConfig) {
        const { documentStyle } = this.snapshot;

        if (documentStyle.renderConfig == null) {
            documentStyle.renderConfig = config;
        } else {
            documentStyle.renderConfig = {
                ...documentStyle.renderConfig,
                ...config,
            };
        }
    }

    updateDocumentDataMargin(data: IPaddingData) {
        const { t, l, b, r } = data;
        const { documentStyle } = this.snapshot;

        if (t != null) {
            documentStyle.marginTop = t;
        }

        if (l != null) {
            documentStyle.marginLeft = l;
        }

        if (b != null) {
            documentStyle.marginBottom = b;
        }

        if (r != null) {
            documentStyle.marginRight = r;
        }
    }

    updateDocumentDataPageSize(width?: number, height?: number) {
        const { documentStyle } = this.snapshot;

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
        const { drawings } = this;
        const { width, height, left, top } = config;
        const drawing = drawings?.[id];

        if (!drawing) {
            return;
        }

        const objectTransform = drawing.objectTransform;

        objectTransform.size.width = width;
        objectTransform.size.height = height;

        objectTransform.positionH.posOffset = left;
        objectTransform.positionV.posOffset = top;
    }

    setZoomRatio(zoomRatio: number = 1) {
        if (this.snapshot.settings == null) {
            this.snapshot.settings = {
                zoomRatio,
            };
        } else {
            this.snapshot.settings.zoomRatio = 1;
        }
    }
}

export class DocumentDataModel extends DocumentDataModelSimple {
    private _unitId: string;

    constructor(snapshot: Partial<IDocumentData>) {
        super(snapshot);

        const UNIT_ID_LENGTH = 6;

        this._unitId = this.snapshot.id ?? Tools.generateRandomId(UNIT_ID_LENGTH);
        this._initializeHeaderFooterTree();
    }

    getRev(): number {
        return this.snapshot.rev ?? 0;
    }

    incrementRev(): void {
        this.snapshot.rev = this.getRev() + 1;
    }

    getSettings() {
        return this.snapshot.settings;
    }

    reset(snapshot: Partial<IDocumentData>) {
        if (snapshot.id && snapshot.id !== this._unitId) {
            throw new Error('Cannot reset a document model with a different unit id!');
        }

        this.snapshot = { ...DEFAULT_DOC, ...snapshot };
        this._initializeHeaderFooterTree();
        this.bodyModel.reset(snapshot.body ?? { dataStream: '\r\n' });
    }

    getUnitId(): string {
        return this._unitId;
    }

    apply(mutations: DocMutationParams[]) {
        const undoMutations: DocMutationParams[] = [];

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        mutations.forEach((mutation) => {
            // FIXME: @jocs Since updateApply modifies the mutation(used in undo/redo),
            // so make a deep copy here, does updateApply need to
            // be modified to have no side effects in the future?
            mutation = Tools.deepClone(mutation);

            if (mutation.t === 'r') {
                const { coverType, body, len, segmentId } = mutation;

                if (body != null) {
                    const documentBody = this._updateApply(body, len, memoryCursor.cursor, coverType, segmentId);

                    undoMutations.push({
                        ...mutation,
                        t: 'r',
                        coverType: UpdateDocsAttributeType.REPLACE,
                        body: documentBody,
                    });
                } else {
                    undoMutations.push({
                        ...mutation,
                        t: 'r',
                    });
                }

                memoryCursor.moveCursor(len);
            } else if (mutation.t === 'i') {
                const { body, len, segmentId, line } = mutation;

                this._insertApply(body!, len, memoryCursor.cursor, segmentId);
                memoryCursor.moveCursor(len);
                undoMutations.push({
                    t: 'd',
                    len,
                    line,
                    segmentId,
                });
            } else if (mutation.t === 'd') {
                const { len, segmentId } = mutation;
                const documentBody = this._deleteApply(len, memoryCursor.cursor, segmentId);

                undoMutations.push({
                    ...mutation,
                    t: 'i',
                    body: documentBody,
                });
            } else {
                throw new Error(`Unknown mutation type for mutation: ${mutation}.`);
            }
        });

        return undoMutations;
    }

    private _updateApply(
        updateBody: Nullable<IDocumentBody>,
        textLength: number,
        currentIndex: number,
        coverType = UpdateDocsAttributeType.COVER,
        segmentId?: string
    ): IDocumentBody {
        if (updateBody == null) {
            throw new Error('updateBody is none');
        }

        const doc = this.snapshot;

        const body = getDocsUpdateBody(doc, segmentId);

        if (body == null) {
            throw new Error('no body has changed');
        }

        return updateAttribute(body, updateBody, textLength, currentIndex, coverType);
    }

    private _deleteApply(textLength: number, currentIndex: number, segmentId?: string): IDocumentBody {
        const doc = this.snapshot;

        const bodyModel = this.getBodyModel(segmentId);

        const body = getDocsUpdateBody(doc, segmentId);

        if (body == null) {
            throw new Error('no body has changed');
        }

        if (textLength <= 0) {
            return { dataStream: '' };
        }

        bodyModel.delete(currentIndex, textLength);

        const deleBody = updateAttributeByDelete(body, textLength, currentIndex);

        recoveryBody(bodyModel, body, deleBody); // If the last paragraph in the document is deleted, restore an initial blank document.

        // console.log('删除的model打印', bodyModel, body, deleBody);

        return deleBody;
    }

    private _insertApply(insertBody: IDocumentBody, textLength: number, currentIndex: number, segmentId?: string) {
        const doc = this.snapshot;

        const bodyModel = this.getBodyModel(segmentId);

        const body = getDocsUpdateBody(doc, segmentId);

        if (textLength === 0) {
            return;
        }

        if (body == null) {
            throw new Error('no body has changed');
        }

        updateAttributeByInsert(body, insertBody, textLength, currentIndex);

        if (insertBody.dataStream.length > 1 && /\r/.test(insertBody.dataStream)) {
            // TODO: @JOCS, The DocumentDataModel needs to be rewritten to better support the
            // large area of updates that are brought about by the paste, abstract the
            // methods associated with the DocumentDataModel insertion, and support atomic operations
            bodyModel.reset(body);
        } else {
            bodyModel.insert(insertBody, currentIndex);
        }

        // console.log('插入的model打印', bodyModel, textLength, currentIndex);
    }

    override updateDocumentId(unitId: string) {
        super.updateDocumentId(unitId);

        this._unitId = unitId;
    }

    private _initializeHeaderFooterTree() {
        this.headerTreeMap = new Map();
        this.footerTreeMap = new Map();

        const { headers, footers } = this.snapshot;

        if (headers) {
            for (const headerId in headers) {
                const header = headers[headerId];
                this.headerTreeMap.set(headerId, DocumentBodyModel.create(header.body));
            }
        }

        if (footers) {
            for (const footerId in footers) {
                const footer = footers[footerId];
                this.footerTreeMap.set(footerId, DocumentBodyModel.create(footer.body));
            }
        }
    }
}
