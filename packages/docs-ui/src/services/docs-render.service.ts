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

import type { DocumentDataModel, Workbook } from '@univerjs/core';
import { IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';

const DOC_MAIN_CANVAS_ID = 'univer-doc-main-canvas';

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
            .subscribe((doc) => this._createRenderer(doc));

        this._instanceSrv.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((doc) => this._disposeRenderer(doc));
    }

    private _createRenderer(doc: DocumentDataModel) {
        const unitId = doc.getUnitId();
        const workbookId = this._instanceSrv.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_DOC)?.getUnitId();
        this._renderManagerService.created$.subscribe((renderer) => {
            if (renderer.unitId === workbookId) {
                renderer.engine.getCanvas().setId(DOC_MAIN_CANVAS_ID);
                renderer.engine.getCanvas().getContext().setId(DOC_MAIN_CANVAS_ID);
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
