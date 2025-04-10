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

import type { DocumentDataModel, INeedCheckDisposable, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { DocCanvasPopManagerService, DocEventManagerService } from '@univerjs/docs-ui';
import { combineLatest } from 'rxjs';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { QuickInsertButton } from '../views/menu';

export class DocQuickInsertMenuController extends Disposable implements IRenderModule {
    private _popup: Nullable<{ startIndex: number; disposable: INeedCheckDisposable }> = null;
    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private _docEventManagerService: DocEventManagerService,
        @Inject(DocQuickInsertPopupService) private _docQuickInsertPopupService: DocQuickInsertPopupService,
        @Inject(DocCanvasPopManagerService) private _docCanvasPopManagerService: DocCanvasPopManagerService
    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(combineLatest([this._docEventManagerService.hoverParagraphLeft$, this._docEventManagerService.hoverParagraph$]).subscribe(([left, paragraph]) => {
            const p = left ?? paragraph;
            if (!p) {
                this._hideMenu(true);
                return;
            }

            if (p.paragraphStart === p.paragraphEnd && p.startIndex !== this._popup?.startIndex) {
                this._hideMenu(true);
                const disposable = this._docCanvasPopManagerService.attachPopupToRect(p.firstLine, {
                    componentKey: QuickInsertButton.componentKey,
                    direction: 'left-center',
                }, this._context.unit.getUnitId());

                this._popup = {
                    startIndex: p.startIndex,
                    disposable,
                };
            } else {
                this._hideMenu(true);
            }
        }));
    }

    private _hideMenu(force: boolean) {
        if (this._popup && (force || this._popup.disposable.canDispose())) {
            this._popup.disposable.dispose();
            this._popup = null;
        }
    }
}
