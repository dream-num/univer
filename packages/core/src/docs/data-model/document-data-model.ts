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

import type { Nullable } from '../../shared';
import { Tools } from '../../shared/tools';
import type {
    IDocumentBody,
    IDocumentData,
    IDocumentRenderConfig,
    IDocumentStyle,
    IDrawings,
} from '../../types/interfaces/i-document-data';
import type { IPaddingData } from '../../types/interfaces/i-style-data';
import { UnitModel, UniverInstanceType } from '../../common/unit';
import { getBodySlice } from './text-x/utils';
import { getEmptySnapshot } from './empty-snapshot';
import type { JSONXActions } from './json-x/json-x';
import { JSONX } from './json-x/json-x';

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

class DocumentDataModelSimple extends UnitModel<IDocumentData, UniverInstanceType.UNIVER_DOC> {
    override type: UniverInstanceType.UNIVER_DOC = UniverInstanceType.UNIVER_DOC;

    override getUnitId(): string {
        throw new Error('Method not implemented.');
    }

    protected snapshot: IDocumentData;

    constructor(snapshot: Partial<IDocumentData>) {
        super();

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

    get zoomRatio() {
        return this.snapshot.settings?.zoomRatio || 1;
    }

    resetDrawing(drawings: IDrawings, drawingsOrder: string[]) {
        this.snapshot.drawings = drawings;
        this.snapshot.drawingsOrder = drawingsOrder;
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

        const objectTransform = drawing.docTransform;

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
        super(Tools.isEmptyObject(snapshot) ? getEmptySnapshot() : snapshot);

        const UNIT_ID_LENGTH = 6;

        this._unitId = this.snapshot.id ?? Tools.generateRandomId(UNIT_ID_LENGTH);

        this._initializeHeaderFooterModel();
    }

    override dispose() {
        this.headerModelMap.forEach((header) => {
            header.dispose();
        });

        this.footerModelMap.forEach((footer) => {
            footer.dispose();
        });
    }

    getDrawings() {
        return this.snapshot.drawings;
    }

    getDrawingsOrder() {
        return this.snapshot.drawingsOrder;
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

    override getUnitId() {
        return this._unitId;
    }

    apply(actions: JSONXActions) {
        if (JSONX.isNoop(actions)) {
            return;
        }

        this.snapshot = JSONX.apply(this.snapshot, actions) as unknown as IDocumentData;

        // FIXME: @JOCS, ANY better solution to find action that create or delete header/footer?
        if (actions?.some((a) => Array.isArray(a) && (a?.[0] === 'headers' || a?.[0] === 'footers'))) {
            this.headerModelMap.clear();
            this.footerModelMap.clear();
            this._initializeHeaderFooterModel();
        }

        return this.snapshot;
    }

    sliceBody(startOffset: number, endOffset: number): Nullable<IDocumentBody> {
        const body = this.getBody();

        if (body == null) {
            return;
        }

        return getBodySlice(body, startOffset, endOffset);
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
