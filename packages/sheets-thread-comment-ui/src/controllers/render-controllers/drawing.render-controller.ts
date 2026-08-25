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

import type { EventState, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IThreadCommentCanvasOutline, IThreadCommentCanvasUnderline } from '@univerjs/thread-comment-ui/render-objects/thread-comment-canvas-overlay';
import { ICommandService, Inject, RxDisposable, ThemeService, toDisposable } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { deserializeThreadCommentAnchor, ThreadCommentAnchorKind, ThreadCommentModel } from '@univerjs/thread-comment';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ThreadCommentCanvasOverlay } from '@univerjs/thread-comment-ui/render-objects/thread-comment-canvas-overlay';
import { OpenSheetCommentPanelOperation } from '../../commands/operations/comment.operation';

const SHEET_COMMENT_DRAWING_OVERLAY_KEY = 'sheet-thread-comment-drawing-overlay';
const SHEET_COMMENT_DRAWING_OVERLAY_LAYER_INDEX = 10_100;

export class SheetsThreadCommentDrawingRenderController extends RxDisposable implements IRenderModule {
    private readonly _overlay: ThreadCommentCanvasOverlay;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(ThreadCommentModel) private readonly _commentModel: ThreadCommentModel,
        @Inject(ThreadCommentPanelService) private readonly _panelService: ThreadCommentPanelService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
        this._overlay = new ThreadCommentCanvasOverlay(SHEET_COMMENT_DRAWING_OVERLAY_KEY, {
            ...this._getColors(),
            zoomRatio: 1,
            markers: [],
            underlines: [],
        });
        this._context.scene.addObject(this._overlay, SHEET_COMMENT_DRAWING_OVERLAY_LAYER_INDEX);
        this.disposeWithMe(toDisposable(this._overlay.onPointerDown$.subscribeEvent(
            (_event: IPointerEvent | IMouseEvent, state: EventState) => this._onOverlayPointerDown(state)
        )));
        this.disposeWithMe(toDisposable(
            this._context.engine.onTransformChange$.subscribeEvent(() => this._syncOverlay())
        ));
        this.disposeWithMe(this._context.unit.activeSheet$.subscribe(() => this._syncOverlay()));
        this.disposeWithMe(this._commentModel.commentUpdate$.subscribe((update) => {
            if (update.unitId === this._context.unitId) {
                this._syncOverlay();
            }
        }));
        [this._panelService.activeCommentId$, this._panelService.hoveredCommentId$]
            .forEach((observable) => this.disposeWithMe(observable.subscribe(() => this._syncOverlay())));
        [this._drawingManagerService.add$, this._drawingManagerService.update$, this._drawingManagerService.remove$]
            .forEach((observable) => this.disposeWithMe(observable.subscribe((drawings) => {
                if (drawings.some((drawing) => drawing.unitId === this._context.unitId)) {
                    this._syncOverlay();
                }
            })));
        this.disposeWithMe(this._themeService.currentTheme$.subscribe(() => this._syncOverlay()));
        this._syncOverlay();
    }

    private _onOverlayPointerDown(state: EventState): void {
        const commentId = this._overlay.hitCommentId;
        const subUnitId = this._context.unit.getActiveSheet()?.getSheetId();
        if (!commentId || !subUnitId) {
            return;
        }
        state.stopPropagation();
        this._panelService.setActiveComment({
            unitId: this._context.unitId,
            subUnitId,
            commentId,
            trigger: 'sheet-canvas',
        });
        this._commandService.executeCommand(OpenSheetCommentPanelOperation.id).catch(() => undefined);
    }

    private _syncOverlay(): void {
        const worksheet = this._context.unit.getActiveSheet();
        const subUnitId = worksheet?.getSheetId();
        if (!worksheet || !subUnitId) {
            this._overlay.updateState({ markers: [], underlines: [], focusedCommentIds: [], focusOutlines: [] });
            return;
        }
        const underlines = new Map<string, IThreadCommentCanvasUnderline>();
        this._commentModel.query({
            unitIds: [this._context.unitId],
            subUnitIds: [subUnitId],
            anchorKinds: [ThreadCommentAnchorKind.SHEET_DRAWING],
            resolved: false,
        }).forEach(({ root }) => {
            const anchor = deserializeThreadCommentAnchor(root.ref);
            if (anchor?.kind !== ThreadCommentAnchorKind.SHEET_DRAWING) {
                return;
            }
            const outline = this._getDrawingOutline(subUnitId, anchor.elementId);
            if (outline) {
                underlines.set(anchor.elementId, {
                    commentId: root.id,
                    left: outline.left,
                    top: outline.top + outline.height + 2 / worksheet.getZoomRatio(),
                    width: outline.width,
                });
            }
        });
        const focusedCommentIds: string[] = [];
        const focusOutlines = new Map<string, IThreadCommentCanvasOutline>();
        [this._panelService.activeCommentId, this._panelService.hoveredCommentId].forEach((target) => {
            if (!target || target.unitId !== this._context.unitId || target.subUnitId !== subUnitId) {
                return;
            }
            const comment = this._commentModel.getComment(target.unitId, target.subUnitId, target.commentId);
            const anchor = comment && deserializeThreadCommentAnchor(comment.ref);
            if (anchor?.kind !== ThreadCommentAnchorKind.SHEET_DRAWING) {
                return;
            }
            focusedCommentIds.push(target.commentId);
            const outline = this._getDrawingOutline(subUnitId, anchor.elementId);
            if (outline) {
                focusOutlines.set(anchor.elementId, outline);
            }
        });
        this._overlay.updateState({
            ...this._getColors(),
            zoomRatio: worksheet.getZoomRatio(),
            markers: [],
            underlines: Array.from(underlines.values()),
            focusedCommentIds,
            focusOutlines: Array.from(focusOutlines.values()),
        });
    }

    private _getDrawingOutline(subUnitId: string, drawingId: string): IThreadCommentCanvasOutline | null {
        const objectKey = getDrawingShapeKeyByDrawingSearch({ unitId: this._context.unitId, subUnitId, drawingId });
        const object = this._context.scene.getObjectIncludeInGroup?.(objectKey)
            ?? this._context.scene.getObject(objectKey);
        if (!object) {
            return null;
        }
        const bounds = object.getRealBound();
        return { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };
    }

    private _getColors(): { accentColor: string; foregroundColor: string; outlineColor: string } {
        return {
            accentColor: this._themeService.getColorFromTheme('yellow.400'),
            foregroundColor: this._themeService.getColorFromTheme('gray.900'),
            outlineColor: this._themeService.getColorFromTheme('white'),
        };
    }
}
