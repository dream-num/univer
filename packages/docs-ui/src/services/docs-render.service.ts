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

import type { DocumentDataModel } from '@univerjs/core';
import type { ICanvasColorService } from '@univerjs/engine-render';
import { DocumentFlavor, isInternalEditorID, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';

const DOC_MAIN_CANVAS_ID = 'univer-doc-main-canvas';
const DOC_TRADITIONAL_WORKSPACE_BACKGROUND_COLOR = '#fafafa';
const DOC_MODERN_WORKSPACE_BACKGROUND_COLOR = '#fff';
const DOC_EDITOR_DEFAULT_BACKGROUND_COLOR = 'transparent';

export interface IResolveDocsCanvasBackgroundOptions {
    documentFlavor?: DocumentFlavor;
    canvasColorService?: ICanvasColorService;
    editorBackgroundColor?: string;
    isEditor?: boolean;
}

export interface IResolvedDocsCanvasBackground {
    canvasElementBackgroundColor: string;
    docBackgroundFillColor?: string;
}

export function resolveDocsCanvasBackground(options: IResolveDocsCanvasBackgroundOptions): IResolvedDocsCanvasBackground {
    const { documentFlavor, canvasColorService, editorBackgroundColor, isEditor } = options;
    const backgroundColor = editorBackgroundColor ?? getDefaultDocsCanvasBackgroundColor(documentFlavor, isEditor);

    if (isEditor) {
        return {
            canvasElementBackgroundColor: backgroundColor,
            docBackgroundFillColor: DOC_EDITOR_DEFAULT_BACKGROUND_COLOR,
        };
    }

    return {
        canvasElementBackgroundColor: canvasColorService?.getRenderColor(backgroundColor) ?? backgroundColor,
        docBackgroundFillColor: undefined,
    };
}

function getDefaultDocsCanvasBackgroundColor(documentFlavor?: DocumentFlavor, isEditor?: boolean) {
    if (isEditor) {
        return DOC_EDITOR_DEFAULT_BACKGROUND_COLOR;
    }

    return documentFlavor === DocumentFlavor.MODERN
        ? DOC_MODERN_WORKSPACE_BACKGROUND_COLOR
        : DOC_TRADITIONAL_WORKSPACE_BACKGROUND_COLOR;
}

export function getDocsCanvasBackgroundColor(documentFlavor?: DocumentFlavor, canvasColorService?: ICanvasColorService, editorBackgroundColor?: string, isEditor?: boolean) {
    return resolveDocsCanvasBackground({
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
            .forEach((documentModel) => this._createRenderer(documentModel));

        this._instanceSrv.getTypeOfUnitAdded$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((event) => this._createRenderer(event.unit));

        this._instanceSrv.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((doc) => this._disposeRenderer(doc));
    }

    private _createRenderer(doc: DocumentDataModel) {
        const unitId = doc.getUnitId();
        this._renderManagerService.created$.subscribe((renderer) => {
            if (renderer.unitId === unitId) {
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
        });

        if (!this._renderManagerService.has(unitId)) {
            this._createRenderWithId(unitId);
        }
    }

    private _createRenderWithId(unitId: string) {
        this._renderManagerService.createRender(unitId);
    }

    private _disposeRenderer(doc: DocumentDataModel) {
        const unitId = doc.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }
}
