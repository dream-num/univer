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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { DOC_INTERCEPTOR_POINT, DocInterceptorService } from '@univerjs/docs';
import { DocRenderController } from '@univerjs/docs-ui';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { Inject } from '@wendellhu/redi';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';

@OnLifecycle(LifecycleStages.Starting, DocThreadCommentRenderController)
export class DocThreadCommentRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocInterceptorService) private readonly _docInterceptorService: DocInterceptorService,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @Inject(DocRenderController) private readonly _docRenderController: DocRenderController,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel
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
                this._docRenderController.reRender(unitId);
            }
        }));

        this.disposeWithMe(this._threadCommentModel.commentUpdate$.subscribe((update) => {
            if (update.type === 'resolve') {
                this._docRenderController.reRender(update.unitId);
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
                const { commentId, unitId: commentUnitID } = activeComment || {};
                const activeCustomRange = customRanges.find((i) => i.rangeId === commentId);
                const comment = this._threadCommentModel.getComment(unitId, DEFAULT_DOC_SUBUNIT_ID, data.rangeId);
                if (!comment) {
                    return next({
                        ...data,
                        show: false,
                    });
                }

                const isActiveIndex = activeCustomRange && index >= activeCustomRange.startIndex && index <= activeCustomRange.endIndex;
                const isActive = commentUnitID === unitId && data.rangeId === commentId;
                return next({
                    ...data,
                    active: isActive || isActiveIndex,
                    show: !comment.resolved,
                });
            },
        });
    }
}
