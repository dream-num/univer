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

import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, DOCS_ZEN_EDITOR_UNIT_ID_KEY, fromEventSubject, Inject, isInternalEditorID } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { animationFrameScheduler, filter, throttleTime } from 'rxjs';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';

// REFACTOR: @JOCS, move to new-docs package.
export class DocResizeRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService
    ) {
        super();

        const unitId = this._context.unitId;
        if (isInternalEditorID(unitId) && unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) return this;

        this._initResize();
    }

    private _initResize() {
        this.disposeWithMe(
            fromEventSubject(this._context.engine.onTransformChange$).pipe(
                filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize),
                throttleTime(0, animationFrameScheduler)
            ).subscribe(() => {
                this._docPageLayoutService.calculatePagePosition();
                this._textSelectionManagerService.refreshSelection();
            })
        );
    }
}
