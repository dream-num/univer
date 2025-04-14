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
import { BehaviorSubject, combineLatest } from 'rxjs';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { QuickInsertButtonComponentKey } from '../views/menu/const';

export class DocQuickInsertMenuController extends Disposable implements IRenderModule {
    private _popup$ = new BehaviorSubject<Nullable<{ startIndex: number; disposable: INeedCheckDisposable }>>(null);
    readonly popup$ = this._popup$.asObservable();
    get popup() {
        return this._popup$.value;
    }

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
        this.disposeWithMe(combineLatest([this._docEventManagerService.hoverParagraphLeftRealTime$, this._docEventManagerService.hoverParagraphRealTime$]).subscribe(([left, paragraph]) => {
            const p = left ?? paragraph;
            const isDisabled = this._context.unit.getDisabled();
            if (!p || isDisabled) {
                this._hideMenu(true);
                return;
            }
            if (p.paragraphStart === p.paragraphEnd) {
                if (this._docQuickInsertPopupService.editPopup || p.startIndex === this.popup?.startIndex) return;
                this._hideMenu(true);
                const disposable = this._docCanvasPopManagerService.attachPopupToRect(p.firstLine, {
                    componentKey: QuickInsertButtonComponentKey,
                    direction: 'left-center',
                }, this._context.unit.getUnitId());

                this._popup$.next({
                    startIndex: p.startIndex,
                    disposable,
                });
            } else {
                this._hideMenu(true);
            }
        }));
    }

    private _hideMenu(force: boolean) {
        if (this._docQuickInsertPopupService.editPopup) return;
        if (this.popup && (force || this.popup.disposable.canDispose())) {
            this.popup.disposable.dispose();
            this._popup$.next(null);
        }
    }
}
