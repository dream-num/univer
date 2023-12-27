/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MemoryCursor } from '../../common/memory-cursor';
import type { Nullable } from '../../shared';
import { getDocsUpdateBody } from '../../shared';
import { UpdateDocsAttributeType } from '../../shared/command-enum';
import { Tools } from '../../shared/tools';
import type {
    IDocumentBody,
    IDocumentData,
    IDocumentRenderConfig,
    IParagraph,
    ITextRun,
} from '../../types/interfaces/i-document-data';
import { type IPaddingData } from '../../types/interfaces/i-style-data';
import { updateAttributeByDelete } from './apply-utils/delete-apply';
import { updateAttributeByInsert } from './apply-utils/insert-apply';
import { updateAttribute } from './apply-utils/update-apply';
import { type DocMutationParams } from './mutation-types';

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

class DocumentDataModelSimple {
    snapshot: IDocumentData;

    constructor(snapshot: Partial<IDocumentData>) {
        this.snapshot = { ...DEFAULT_DOC, ...snapshot };
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

    /**
     * @deprecated use getBody to instead.
     */
    get body() {
        return this.snapshot.body;
    }

    get zoomRatio() {
        return this.snapshot.settings?.zoomRatio || 1;
    }

    getBody() {
        return this.snapshot.body;
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

    headerModelMap: Map<string, DocumentDataModel> = new Map();

    footerModelMap: Map<string, DocumentDataModel> = new Map();

    constructor(snapshot: Partial<IDocumentData>) {
        super(snapshot);

        const UNIT_ID_LENGTH = 6;

        this._unitId = this.snapshot.id ?? Tools.generateRandomId(UNIT_ID_LENGTH);

        this._initializeHeaderFooterModel();
    }

    dispose() {
        this.headerModelMap.forEach((header) => {
            header.dispose();
        });

        this.footerModelMap.forEach((footer) => {
            footer.dispose();
        });
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

    // TODO: @JOCS do not use reset, please use apply to modify the snapshot.
    reset(snapshot: Partial<IDocumentData>) {
        if (snapshot.id && snapshot.id !== this._unitId) {
            throw new Error('Cannot reset a document model with a different unit id!');
        }

        this.snapshot = { ...DEFAULT_DOC, ...snapshot };
        this._initializeHeaderFooterModel();
    }

    getSelfOrHeaderFooterModel(segmentId?: string) {
        if (segmentId != null) {
            if (this.headerModelMap.has(segmentId)) {
                return this.headerModelMap.get(segmentId)!;
            }

            if (this.footerModelMap.has(segmentId)) {
                return this.footerModelMap.get(segmentId)!;
            }
        }

        return this as DocumentDataModel;
    }

    getUnitId(): string {
        return this._unitId;
    }

    apply(mutations: DocMutationParams[]) {
        const undoMutations: DocMutationParams[] = [];

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        mutations.forEach((mutation) => {
            // FIXME: @JOCS Since updateApply modifies the mutation(used in undo/redo),
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

    sliceBody(startOffset: number, endOffset: number): Nullable<IDocumentBody> {
        const body = this.getBody();

        if (body == null) {
            return;
        }

        const { dataStream, textRuns = [], paragraphs = [] } = body;

        const docBody: IDocumentBody = {
            dataStream: dataStream.slice(startOffset, endOffset),
        };

        const newTextRuns: ITextRun[] = [];

        for (const textRun of textRuns) {
            const clonedTextRun = Tools.deepClone(textRun);
            const { st, ed } = clonedTextRun;
            if (Tools.hasIntersectionBetweenTwoRanges(st, ed, startOffset, endOffset)) {
                if (startOffset >= st && startOffset <= ed) {
                    newTextRuns.push({
                        ...clonedTextRun,
                        st: startOffset,
                        ed: Math.min(endOffset, ed),
                    });
                } else if (endOffset >= st && endOffset <= ed) {
                    newTextRuns.push({
                        ...clonedTextRun,
                        st: Math.max(startOffset, st),
                        ed: endOffset,
                    });
                } else {
                    newTextRuns.push(clonedTextRun);
                }
            }
        }

        if (newTextRuns.length) {
            docBody.textRuns = newTextRuns.map((tr) => {
                const { st, ed } = tr;
                return {
                    ...tr,
                    st: st - startOffset,
                    ed: ed - startOffset,
                };
            });
        }

        const newParagraphs: IParagraph[] = [];

        for (const paragraph of paragraphs) {
            const { startIndex } = paragraph;
            if (startIndex >= startOffset && startIndex <= endOffset) {
                newParagraphs.push(Tools.deepClone(paragraph));
            }
        }

        if (newParagraphs.length) {
            docBody.paragraphs = newParagraphs.map((p) => ({
                ...p,
                startIndex: p.startIndex - startOffset,
            }));
        }

        return docBody;
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

        const body = getDocsUpdateBody(doc, segmentId);

        if (body == null) {
            throw new Error('no body has changed');
        }

        if (textLength <= 0) {
            return { dataStream: '' };
        }

        return updateAttributeByDelete(body, textLength, currentIndex);
    }

    private _insertApply(insertBody: IDocumentBody, textLength: number, currentIndex: number, segmentId?: string) {
        const doc = this.snapshot;

        const body = getDocsUpdateBody(doc, segmentId);

        if (textLength === 0) {
            return;
        }

        if (body == null) {
            throw new Error('no body has changed');
        }

        updateAttributeByInsert(body, insertBody, textLength, currentIndex);
    }

    private _initializeHeaderFooterModel() {
        const { headers, footers } = this.getSnapshot();

        if (headers) {
            for (const headerId in headers) {
                const header = headers[headerId];
                this.headerModelMap.set(headerId, new DocumentDataModel(header));
            }
        }

        if (footers) {
            for (const footerId in footers) {
                const footer = footers[footerId];
                this.footerModelMap.set(footerId, new DocumentDataModel(footer));
            }
        }
    }

    override updateDocumentId(unitId: string) {
        super.updateDocumentId(unitId);

        this._unitId = unitId;
    }
}
