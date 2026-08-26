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

import type { DocumentDataModel, EventState } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IThreadCommentCanvasOutline, IThreadCommentCanvasUnderline } from '@univerjs/thread-comment-ui';
import {
    CustomDecorationType,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DOC_INTERCEPTOR_POINT, DocInterceptorService, RichTextEditingMutation } from '@univerjs/docs';
import { DEFAULT_DOC_SUBUNIT_ID } from '@univerjs/docs-thread-comment';
import { DocRenderController } from '@univerjs/docs-ui';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { deserializeThreadCommentAnchor, ThreadCommentAnchorKind, ThreadCommentModel } from '@univerjs/thread-comment';
import { ThreadCommentCanvasOverlay, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { pairwise, startWith } from 'rxjs';
import { ShowCommentPanelOperation } from '../../commands/operations/show-comment-panel.operation';

const DOC_COMMENT_DRAWING_OVERLAY_KEY = 'doc-thread-comment-drawing-overlay';
const DOC_COMMENT_DRAWING_OVERLAY_LAYER_INDEX = 10_100;

export class DocThreadCommentRenderController extends Disposable implements IRenderModule {
    private readonly _drawingOverlay: ThreadCommentCanvasOverlay;
    private readonly _drawingCommentSubUnits = new Map<string, string>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocInterceptorService) private readonly _docInterceptorService: DocInterceptorService,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @Inject(DocRenderController) private readonly _docRenderController: DocRenderController,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._drawingOverlay = new ThreadCommentCanvasOverlay(DOC_COMMENT_DRAWING_OVERLAY_KEY, {
            ...this._getDrawingOverlayColors(),
            zoomRatio: 1,
            markers: [],
            underlines: [],
        });
        this._context.scene.addObject(this._drawingOverlay, DOC_COMMENT_DRAWING_OVERLAY_LAYER_INDEX);

        this._interceptorViewModel();
        this._initReRender();
        this._initSyncComments();
        this._initDrawingOverlay();
    }

    private _initReRender() {
        [
            this._threadCommentPanelService.activeCommentId$,
            this._threadCommentPanelService.hoveredCommentId$,
        ].forEach((observable) => this.disposeWithMe(observable.pipe(
            startWith(undefined),
            pairwise()
        ).subscribe(([previous, current]) => {
            const currentUnitId = this._univerInstanceService
                .getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)
                ?.getUnitId();
            new Set([previous?.unitId, current?.unitId, currentUnitId]).forEach((unitId) => {
                if (unitId) {
                    this._docRenderController.reRender(unitId);
                }
            });
        })));

        this.disposeWithMe(this._threadCommentModel.commentUpdate$.subscribe((update) => {
            if (update.type === 'resolve') {
                this._docRenderController.reRender(update.unitId);
            }
            if (update.unitId === this._context.unitId) {
                this._syncDrawingOverlay();
            }
        }));
    }

    private _initDrawingOverlay(): void {
        this.disposeWithMe(toDisposable(this._drawingOverlay.onPointerDown$.subscribeEvent(
            (_event: IPointerEvent | IMouseEvent, state: EventState) => {
                const commentId = this._drawingOverlay.hitCommentId;
                const subUnitId = commentId && this._drawingCommentSubUnits.get(commentId);
                if (!commentId || !subUnitId) {
                    return;
                }
                state.stopPropagation();
                this._commandService.executeCommand(ShowCommentPanelOperation.id, {
                    activeComment: { unitId: this._context.unitId, subUnitId, commentId, trigger: 'doc-canvas' },
                });
            }
        )));
        this.disposeWithMe(toDisposable(
            this._context.engine.onTransformChange$.subscribeEvent(() => this._syncDrawingOverlay())
        ));
        [this._threadCommentPanelService.activeCommentId$, this._threadCommentPanelService.hoveredCommentId$]
            .forEach((observable) => this.disposeWithMe(observable.subscribe(() => this._syncDrawingOverlay())));
        [this._drawingManagerService.add$, this._drawingManagerService.update$, this._drawingManagerService.remove$]
            .forEach((observable) => this.disposeWithMe(observable.subscribe((drawings) => {
                if (drawings.some((drawing) => drawing.unitId === this._context.unitId)) {
                    this._syncDrawingOverlay();
                }
            })));
        this.disposeWithMe(this._themeService.currentTheme$.subscribe(() => this._syncDrawingOverlay()));
        this._syncDrawingOverlay();
    }

    private _syncDrawingOverlay(): void {
        const underlines = new Map<string, IThreadCommentCanvasUnderline>();
        this._drawingCommentSubUnits.clear();
        this._threadCommentModel.query({
            unitIds: [this._context.unitId],
            anchorKinds: [ThreadCommentAnchorKind.DOC_DRAWING],
            resolved: false,
        }).forEach(({ root, subUnitId }) => {
            const anchor = deserializeThreadCommentAnchor(root.ref);
            if (anchor?.kind !== ThreadCommentAnchorKind.DOC_DRAWING) {
                return;
            }
            const outline = this._getDrawingOutline(anchor.pageId ?? subUnitId, anchor.elementId);
            if (!outline) {
                return;
            }
            this._drawingCommentSubUnits.set(root.id, subUnitId);
            underlines.set(`${anchor.pageId ?? subUnitId}\0${anchor.elementId}`, {
                commentId: root.id,
                left: outline.left,
                top: outline.top + outline.height + 2,
                width: outline.width,
            });
        });
        const focusedCommentIds: string[] = [];
        const focusOutlines = new Map<string, IThreadCommentCanvasOutline>();
        [this._threadCommentPanelService.activeCommentId, this._threadCommentPanelService.hoveredCommentId]
            .forEach((target) => {
                if (!target || target.unitId !== this._context.unitId) {
                    return;
                }
                const comment = this._threadCommentModel.getComment(target.unitId, target.subUnitId, target.commentId);
                const anchor = comment && deserializeThreadCommentAnchor(comment.ref);
                if (anchor?.kind !== ThreadCommentAnchorKind.DOC_DRAWING) {
                    return;
                }
                focusedCommentIds.push(target.commentId);
                const outline = this._getDrawingOutline(anchor.pageId ?? target.subUnitId, anchor.elementId);
                if (outline) {
                    focusOutlines.set(`${anchor.pageId ?? target.subUnitId}\0${anchor.elementId}`, outline);
                }
            });
        this._drawingOverlay.updateState({
            ...this._getDrawingOverlayColors(),
            markers: [],
            underlines: Array.from(underlines.values()),
            focusedCommentIds,
            focusOutlines: Array.from(focusOutlines.values()),
        });
    }

    private _getDrawingOutline(subUnitId: string, drawingId: string): IThreadCommentCanvasOutline | null {
        const objectKey = getDrawingShapeKeyByDrawingSearch({
            unitId: this._context.unitId,
            subUnitId,
            drawingId,
        });
        const object = this._context.scene.getObjectIncludeInGroup?.(objectKey)
            ?? this._context.scene.getObject(objectKey);
        if (!object) {
            return null;
        }
        const bounds = object.getRealBound();
        return { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };
    }

    private _getDrawingOverlayColors(): { accentColor: string; foregroundColor: string; outlineColor: string } {
        return {
            accentColor: this._themeService.getColorFromTheme('yellow.400'),
            foregroundColor: this._themeService.getColorFromTheme('gray.900'),
            outlineColor: this._themeService.getColorFromTheme('white'),
        };
    }

    private _interceptorViewModel() {
        this._docInterceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_DECORATION, {
            handler: (data, pos, next) => {
                if (!data) {
                    return next(data);
                }
                const { unitId } = pos;
                const focusedComments = [
                    this._threadCommentPanelService.activeCommentId,
                    this._threadCommentPanelService.hoveredCommentId,
                ];
                const comment = this._threadCommentModel.getComment(unitId, DEFAULT_DOC_SUBUNIT_ID, data.id);
                if (!comment) {
                    return next({
                        ...data,
                        show: false,
                    });
                }

                const isActive = focusedComments.some((focusedComment) => (
                    focusedComment?.unitId === unitId
                    && focusedComment.subUnitId === DEFAULT_DOC_SUBUNIT_ID
                    && focusedComment.commentId === data.id
                ));
                return next({
                    ...data,
                    active: isActive,
                    show: !comment.resolved,
                });
            },
        });
    }

    private _initSyncComments() {
        const unitId = this._context.unit.getUnitId();
        const subUnitId = DEFAULT_DOC_SUBUNIT_ID;
        const threadIds = this._context.unit.getBody()?.customDecorations?.filter((i) => i.type === CustomDecorationType.COMMENT).map((i) => i.id) ?? [];
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
                    const addIds = new Set<string>();

                    currentThreadIds.forEach((id) => {
                        if (!preIds.has(id)) {
                            addIds.add(id);
                        }
                    });

                    prevThreadIds = currentThreadIdsSorted;
                    this._threadCommentModel.syncThreadComments(unitId, subUnitId, [...addIds]);
                }
            }
        }));
    }
}
