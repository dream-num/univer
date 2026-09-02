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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type { IDocumentLayoutProgress, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject, RxDisposable } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { EMPTY, switchMap, takeUntil } from 'rxjs';
import { DocLayoutProgressService } from '../../services/doc-layout-progress.service';

export const DOC_LAYOUT_PROGRESS_DELAY_MS = 2_000;
export const DOC_LAYOUT_PROGRESS_CANCEL_GRACE_MS = 1_000;

export function resolveDocLayoutProgressPercent(progress: IDocumentLayoutProgress): number {
    if (progress.complete) {
        return 100;
    }

    if (progress.totalBlockCount > 0) {
        return Math.min(99, Math.max(0, Math.floor(progress.processedBlockCount / progress.totalBlockCount * 100)));
    }

    const estimatedPageCount = Math.max(progress.estimatedPageCount, progress.pageCount);
    if (estimatedPageCount > 0) {
        return Math.min(99, Math.max(0, Math.floor(progress.publishedPageCount / estimatedPageCount * 100)));
    }

    return 0;
}

export class DocLayoutProgressRenderController extends RxDisposable implements IRenderModule {
    private _visible = false;
    private _delayTimer: Nullable<ReturnType<typeof setTimeout>> = null;
    private _cancelTimer: Nullable<ReturnType<typeof setTimeout>> = null;
    private _latestProgress: Nullable<IDocumentLayoutProgress> = null;
    private _layoutStartedAt: Nullable<number> = null;
    private _maxProgress = 0;
    private _hasCompletedInitialLayout = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocLayoutProgressService) private readonly _docLayoutProgressService: DocLayoutProgressService
    ) {
        super();

        this._docSkeletonManagerService.currentSkeleton$.pipe(
            switchMap((skeleton) => {
                this._reset(skeleton?.hasCompleteLayout() ?? false);
                return skeleton?.layoutProgress$ ?? EMPTY;
            }),
            takeUntil(this.dispose$)
        ).subscribe((progress) => this._handleProgress(progress));
    }

    override dispose(): void {
        this._reset(true);
        super.dispose();
    }

    private _handleProgress(progress: IDocumentLayoutProgress): void {
        if (progress.cancelled) {
            this._latestProgress = null;
            this._scheduleCancelledClear();
            return;
        }

        this._clearCancelTimer();

        if (progress.complete) {
            this._reset(true);
            return;
        }

        if (this._hasCompletedInitialLayout) {
            return;
        }

        this._latestProgress = progress;
        this._layoutStartedAt ??= Date.now();
        this._maxProgress = Math.max(this._maxProgress, resolveDocLayoutProgressPercent(progress));
        if (this._visible) {
            this._docLayoutProgressService.setProgress(this._context.unitId, this._maxProgress);
        }
        this._scheduleShow();
    }

    private _scheduleShow(): void {
        if (this._visible || this._delayTimer != null || this._layoutStartedAt == null) {
            return;
        }

        const remainingDelay = Math.max(0, DOC_LAYOUT_PROGRESS_DELAY_MS - (Date.now() - this._layoutStartedAt));
        if (remainingDelay === 0) {
            this._show();
            return;
        }

        this._delayTimer = setTimeout(() => {
            this._delayTimer = null;
            this._show();
        }, remainingDelay);
    }

    private _show(): void {
        if (
            this._visible ||
            this._latestProgress == null ||
            this._latestProgress.complete ||
            this._hasCompletedInitialLayout
        ) {
            return;
        }

        this._visible = true;
        this._docLayoutProgressService.setProgress(this._context.unitId, this._maxProgress);
    }

    private _scheduleCancelledClear(): void {
        if (!this._visible || this._cancelTimer != null) {
            return;
        }

        this._cancelTimer = setTimeout(() => {
            this._cancelTimer = null;
            if (this._latestProgress != null) {
                return;
            }
            this._visible = false;
            this._docLayoutProgressService.clearProgress(this._context.unitId);
        }, DOC_LAYOUT_PROGRESS_CANCEL_GRACE_MS);
    }

    private _clearCancelTimer(): void {
        if (this._cancelTimer != null) {
            clearTimeout(this._cancelTimer);
            this._cancelTimer = null;
        }
    }

    private _reset(hasCompletedInitialLayout: boolean): void {
        if (this._delayTimer != null) {
            clearTimeout(this._delayTimer);
            this._delayTimer = null;
        }
        this._clearCancelTimer();
        this._docLayoutProgressService.clearProgress(this._context.unitId);
        this._visible = false;
        this._latestProgress = null;
        this._layoutStartedAt = null;
        this._maxProgress = 0;
        this._hasCompletedInitialLayout = hasCompletedInitialLayout;
    }
}
