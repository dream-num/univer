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
    IDocumentStyle,
} from '../../types/interfaces/i-document-data';
import type { IPaddingData } from '../../types/interfaces/i-style-data';
import { updateAttributeByDelete } from './apply-utils/delete-apply';
import { updateAttributeByInsert } from './apply-utils/insert-apply';
import { updateAttribute } from './apply-utils/update-apply';
import { type TextXAction, TextXActionType } from './action-types';
import { getBodySlice } from './text-x/utils';
import { getEmptySnapshot } from './empty-snapshot';

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

    updateDocumentStyle(config: IDocumentStyle) {
        if (this.snapshot.documentStyle == null) {
            this.snapshot.documentStyle = config;
        } else {
            this.snapshot.documentStyle = {
                ...this.snapshot.documentStyle,
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
            width = width ?? Number.POSITIVE_INFINITY;
            height = height ?? Number.POSITIVE_INFINITY;

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
        if (Tools.isEmptyObject(snapshot)) {
            snapshot = getEmptySnapshot();
        }
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
        return this.snapshot.rev ?? 1;
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

    apply(actions: TextXAction[]) {
        const undoMutations: TextXAction[] = [];

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        actions.forEach((action) => {
            // FIXME: @JOCS Since updateApply modifies the action(used in undo/redo),
            // so make a deep copy here, does updateApply need to
            // be modified to have no side effects in the future?
            action = Tools.deepClone(action);

            if (action.t === TextXActionType.RETAIN) {
                const { coverType, body, len, segmentId } = action;

                if (body != null) {
                    const documentBody = this._updateApply(body, len, memoryCursor.cursor, coverType, segmentId);

                    undoMutations.push({
                        ...action,
                        t: TextXActionType.RETAIN,
                        coverType: UpdateDocsAttributeType.REPLACE,
                        body: documentBody,
                    });
                } else {
                    undoMutations.push({
                        ...action,
                        t: TextXActionType.RETAIN,
                    });
                }

                memoryCursor.moveCursor(len);
            } else if (action.t === TextXActionType.INSERT) {
                const { body, len, segmentId, line } = action;

                this._insertApply(body!, len, memoryCursor.cursor, segmentId);
                memoryCursor.moveCursor(len);
                undoMutations.push({
                    t: TextXActionType.DELETE,
                    len,
                    line,
                    segmentId,
                });
            } else if (action.t === TextXActionType.DELETE) {
                const { len, segmentId } = action;
                const documentBody = this._deleteApply(len, memoryCursor.cursor, segmentId);

                undoMutations.push({
                    ...action,
                    t: TextXActionType.INSERT,
                    body: documentBody,
                });
            } else {
                throw new Error(`Unknown action type for action: ${action}.`);
            }
        });

        return undoMutations;
    }

    sliceBody(startOffset: number, endOffset: number): Nullable<IDocumentBody> {
        const body = this.getBody();

        if (body == null) {
            return;
        }

        return getBodySlice(body, startOffset, endOffset);
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
