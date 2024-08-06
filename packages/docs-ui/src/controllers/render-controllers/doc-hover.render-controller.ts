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

import { Disposable, fromEventSubject, Inject } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { VIEWPORT_KEY } from '@univerjs/docs';
import { debounceTime } from 'rxjs';
import { DocHoverManagerService } from '../../services/doc-hover-manager.service';

export class DocHoverRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @Inject(DocHoverManagerService) private readonly _docHoverManagerService: DocHoverManagerService
    ) {
        super();

        this._initPointerDown();
        this._initScroll();
    }

    private _initPointerDown() {
        this.disposeWithMe(
            fromEventSubject(this._context.scene.onPointerMove$)
                .pipe(debounceTime(200))
                .subscribe((evt) => {
                    this._docHoverManagerService.onMouseMove(evt);
                })
        );
    }

    private _initScroll() {
        const viewMain = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewMain) {
            this.disposeWithMe(fromEventSubject(viewMain.onScrollAfter$).pipe(debounceTime(60)).subscribe(() => {
                this._docHoverManagerService.endScroll();
            }));

            this.disposeWithMe(viewMain.onScrollBefore$.subscribeEvent(() => {
                this._docHoverManagerService.startScroll();
            }));
        }
    }
}
