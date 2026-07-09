/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { DocumentDataModel, DocumentFlavor, ICreateUnitOptions } from '@univerjs/core';
import type { ICanvasColorService } from '@univerjs/engine-render';
import { isInternalEditorID, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import { resolveDocRenderBackground } from './doc-render-background';

const DOC_MAIN_CANVAS_ID = 'univer-doc-main-canvas';

export function getDocsCanvasBackgroundColor(documentFlavor?: DocumentFlavor, canvasColorService?: ICanvasColorService, editorBackgroundColor?: string, isEditor?: boolean) {
    return resolveDocRenderBackground({
        documentFlavor,
        canvasColorService,
        editorBackgroundColor,
        isEditor,
    }).canvasElementBackgroundColor;
}

export class DocsRenderService extends RxDisposable {
    constructor(
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._init();
    }

    private _init() {
        this._renderManagerService.createRender$
            .pipe(takeUntil(this.dispose$))
            .subscribe((unitId) => this._createRenderWithId(unitId));

        this._instanceSrv.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .forEach((documentModel) => this._createRenderer(documentModel, this._instanceSrv.getUnitCreateOptions(documentModel.getUnitId()) ?? undefined));

        this._instanceSrv.getTypeOfUnitAdded$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((event) => this._createRenderer(event.unit, event.options));

        this._instanceSrv.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((doc) => this._disposeRenderer(doc));
    }

    private _createRenderer(doc: DocumentDataModel, createUnitOptions?: ICreateUnitOptions) {
        if (createUnitOptions?.skipAutoRender) {
            return;
        }

        const unitId = doc.getUnitId();
        if (!this._renderManagerService.has(unitId)) {
            this._createRenderWithId(unitId, doc);
            return;
        }

        const renderer = this._renderManagerService.getRenderById(unitId);
        if (renderer) {
            this._syncRendererCanvas(renderer, doc);
        }
    }

    private _createRenderWithId(unitId: string, doc?: DocumentDataModel) {
        const renderer = this._renderManagerService.createRender(unitId);
        if (doc) {
            this._syncRendererCanvas(renderer, doc);
        }
    }

    private _syncRendererCanvas(renderer: ReturnType<IRenderManagerService['createRender']>, doc: DocumentDataModel): void {
        const unitId = doc.getUnitId();
        const documentFlavor = doc.getSnapshot().documentStyle.documentFlavor;
        const canvas = renderer.engine.getCanvas();
        canvas.setId(DOC_MAIN_CANVAS_ID);
        canvas.getContext().setId(DOC_MAIN_CANVAS_ID);
        canvas.getCanvasEle().style.backgroundColor = getDocsCanvasBackgroundColor(
            documentFlavor,
            renderer.engine.canvasColorService,
            undefined,
            isInternalEditorID(unitId)
        );
    }

    private _disposeRenderer(doc: DocumentDataModel) {
        const unitId = doc.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }
}
