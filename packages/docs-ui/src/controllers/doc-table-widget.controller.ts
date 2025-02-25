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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, ILogService, Inject } from '@univerjs/core';
import { DocEventManagerService } from '../services/event/doc-event-manager.service';

export class DocTableWidgetController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @Inject(ILogService) private readonly _logService: ILogService
    ) {
        super();

        this._initTableEvent();
    }

    private _initTableEvent() {
        this.disposeWithMe(
            this._docEventManagerService.hoverTableColumnGrid$.subscribe((grid) => {
                this._logService.log('===hoverTableColumnGrid', grid, this._docEventManagerService.getTableBounds());
            })
        );

        this.disposeWithMe(
            this._docEventManagerService.hoverTableRowGrid$.subscribe((grid) => {
                this._logService.log('===hoverTableRowGrid', grid);
            })
        );
    }
}
