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
import { Disposable, Inject } from '@univerjs/core';
import { DOC_INTERCEPTOR_POINT, DocInterceptorService } from '@univerjs/docs';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export class DocHyperLinkRenderController extends Disposable implements IRenderModule {
    constructor(
        _context: IRenderContext<DocumentDataModel>,
        @Inject(DocInterceptorService) private readonly _docInterceptorService: DocInterceptorService,
        @Inject(DocHyperLinkPopupService) private readonly _hyperLinkService: DocHyperLinkPopupService
    ) {
        super();

        // Hyperlink underline/color no longer depend on popup activation. Opening
        // or closing the popup must not schedule a document layout generation.
        this._init();
    }

    private _init() {
        this._docInterceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
            handler: (data, pos, next) => {
                if (!data) {
                    return next(data);
                }
                const { unitId, index } = pos;
                const activeLink = this._hyperLinkService.showing;

                if (!activeLink) {
                    return next({
                        ...data,
                        active: false,
                    });
                }
                const { linkId, unitId: linkUnitId, startIndex, endIndex } = activeLink;
                const isActive = linkUnitId === unitId && data.rangeId === linkId && index >= startIndex && index <= endIndex;

                return next({
                    ...data,
                    active: isActive,
                });
            },
        });
    }
}
