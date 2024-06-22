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

import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { DOC_INTERCEPTOR_POINT, DocInterceptorService } from '@univerjs/docs';
import { DocRenderController } from '@univerjs/docs-ui';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Starting, DocThreadCommentRenderController)
export class DocThreadCommentRenderController extends Disposable {
    constructor(
        @Inject(DocInterceptorService) private readonly _docInterceptorService: DocInterceptorService,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @Inject(DocRenderController) private readonly _docRenderController: DocRenderController,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._interceptorViewModel();
        this._initReRender();
    }

    private _initReRender() {
        this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe((activeComment) => {
            if (activeComment) {
                this._docRenderController.reRender(activeComment.unitId);
                return;
            }

            const unitId = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)?.getUnitId();
            if (unitId) {
                this._docRenderController.reRender(
                    unitId
                );
            }
        }));
    }

    private _interceptorViewModel() {
        this._docInterceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
            handler: (data, pos, next) => {
                if (!data) {
                    return next(data);
                }
                const { unitId, index, customRanges } = pos;
                const activeComment = this._threadCommentPanelService.activeCommentId;
                if (!activeComment) {
                    return next(data);
                }
                const activeCustomRange = customRanges.find((i) => i.rangeId === activeComment.commentId);
                const isActiveIndex = activeCustomRange && index >= activeCustomRange.startIndex && index <= activeCustomRange.endIndex;
                const isActive = activeComment.unitId === unitId && data.rangeId === activeComment.commentId;

                return next({
                    ...data,
                    active: isActive || isActiveIndex,
                });
            },
        });
    }
}
