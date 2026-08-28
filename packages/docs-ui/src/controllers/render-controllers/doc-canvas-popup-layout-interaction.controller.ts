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

import type { DocumentDataModel, IDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { DocLayoutInteractionService } from '../../services/doc-layout-interaction.service';
import { DocCanvasPopManagerService } from '../../services/doc-popup-manager.service';

/** Keeps a document skeleton stable while one of its canvas popups is mounted. */
export class DocCanvasPopupLayoutInteractionController extends Disposable implements IRenderModule {
    private _layoutInteraction: IDisposable | null = null;

    constructor(
        private readonly _context: Pick<IRenderContext<DocumentDataModel>, 'unitId'>,
        @Inject(DocCanvasPopManagerService) private readonly _canvasPopupManagerService: Pick<DocCanvasPopManagerService, 'popupUnits$'>,
        @Inject(DocLayoutInteractionService) private readonly _docLayoutInteractionService: DocLayoutInteractionService
    ) {
        super();

        this.disposeWithMe(this._canvasPopupManagerService.popupUnits$.subscribe((popupUnits) => {
            if (popupUnits.has(this._context.unitId)) {
                this._layoutInteraction ??= this._docLayoutInteractionService.beginInteraction();
            } else {
                this._endInteraction();
            }
        }));
    }

    override dispose(): void {
        this._endInteraction();
        super.dispose();
    }

    private _endInteraction(): void {
        this._layoutInteraction?.dispose();
        this._layoutInteraction = null;
    }
}
