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
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { CustomDecorationType, Disposable, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DOC_INTERCEPTOR_POINT, DocInterceptorService, RichTextEditingMutation } from '@univerjs/docs';
import { DocRenderController } from '@univerjs/docs-ui';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';

export class DocThreadCommentRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocInterceptorService) private readonly _docInterceptorService: DocInterceptorService,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @Inject(DocRenderController) private readonly _docRenderController: DocRenderController,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._interceptorViewModel();
        this._initReRender();
        this._initSyncComments();
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
        this._docInterceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_DECORATION, {
            handler: (data, pos, next) => {
                if (!data) {
                    return next(data);
                }
                const { unitId, index, customDecorations } = pos;
                const activeComment = this._threadCommentPanelService.activeCommentId;
                const { commentId, unitId: commentUnitID } = activeComment || {};
                const activeCustomDecoration = customDecorations.find((i) => i.id === commentId);
                const comment = this._threadCommentModel.getComment(unitId, DEFAULT_DOC_SUBUNIT_ID, data.id);
                if (!comment) {
                    return next({
                        ...data,
                        show: false,
                    });
                }

                const isActiveIndex = activeCustomDecoration && index >= activeCustomDecoration.startIndex && index <= activeCustomDecoration.endIndex;
                const isActive = commentUnitID === unitId && data.id === commentId;
                return next({
                    ...data,
                    active: isActive || isActiveIndex,
                    show: !comment.resolved,
                });
            },
        });
    }

    private _initSyncComments() {
        const unitId = this._context.unit.getUnitId();
        const subUnitId = DEFAULT_DOC_SUBUNIT_ID;
        const threadIds = this._context.unit.getBody()?.customDecorations?.filter((i) => i.type === CustomDecorationType.COMMENT).map((i) => i.id) ?? [];
        threadIds.forEach((id) => {
            const comment = this._threadCommentModel.getComment(unitId, subUnitId, id);
            if (!comment) {
                this._threadCommentModel.addComment(unitId, subUnitId, { id, threadId: id, ref: '', dT: '', personId: '', text: { dataStream: '' }, unitId, subUnitId });
            }
        });
        threadIds.length && this._threadCommentModel.syncThreadComments(this._context.unit.getUnitId(), DEFAULT_DOC_SUBUNIT_ID, threadIds);

        let prevThreadIds: string[] = threadIds.sort();
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === RichTextEditingMutation.id) {
                const params = commandInfo.params as IRichTextEditingMutationParams;
                if (params.unitId !== this._context.unit.getUnitId()) {
                    return;
                }

                const currentThreadIds = this._context.unit.getBody()?.customDecorations?.filter((i) => i.type === CustomDecorationType.COMMENT).map((i) => i.id) ?? [];
                const currentThreadIdsSorted = currentThreadIds.sort();
                if (JSON.stringify(prevThreadIds) !== JSON.stringify(currentThreadIdsSorted)) {
                    const preIds = new Set(prevThreadIds);
                    const currentIds = new Set(currentThreadIdsSorted);
                    const addIds = new Set<string>();
                    const deleteIds = new Set<string>();

                    currentThreadIds.forEach((id) => {
                        if (!preIds.has(id)) {
                            addIds.add(id);
                        }
                    });

                    prevThreadIds.forEach((id) => {
                        if (!currentIds.has(id)) {
                            deleteIds.add(id);
                        }
                    });

                    prevThreadIds = currentThreadIdsSorted;
                    addIds.forEach((id) => {
                        const comment = this._threadCommentModel.getComment(unitId, subUnitId, id);
                        if (!comment) {
                            this._threadCommentModel.addComment(unitId, subUnitId, { id, threadId: id, ref: '', dT: '', personId: '', text: { dataStream: '' }, unitId, subUnitId });
                        }
                    });

                    // deleteIds.forEach((id) => {
                    //     this._threadCommentModel.deleteThread(unitId, subUnitId, id);
                    // });

                    this._threadCommentModel.syncThreadComments(unitId, subUnitId, [...addIds]);
                }
            }
        }));
    }
}
