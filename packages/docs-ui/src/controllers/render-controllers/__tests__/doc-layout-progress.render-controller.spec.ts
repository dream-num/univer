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

import type { IDocumentLayoutProgress } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    DOC_LAYOUT_PROGRESS_CANCEL_GRACE_MS,
    DOC_LAYOUT_PROGRESS_DELAY_MS,
    DocLayoutProgressRenderController,
    resolveDocLayoutProgressPercent,
} from '../doc-layout-progress.render-controller';

function createProgress(overrides: Partial<IDocumentLayoutProgress> = {}): IDocumentLayoutProgress {
    return {
        anchorReady: true,
        cancelled: false,
        complete: false,
        didPublish: true,
        didPublishAnchor: true,
        elapsedTime: 10,
        estimatedHeight: 1_000,
        estimatedPageCount: 10,
        generation: 1,
        laidOutThrough: 20,
        maxBlockDuration: 1,
        mode: 'paginated',
        pageCount: 2,
        processedBlockCount: 20,
        publicationRevision: 1,
        publishedPageCount: 2,
        reason: 'initial',
        stableLaidOutThrough: 20,
        totalBlockCount: 100,
        ...overrides,
    };
}

function createController(initiallyComplete = false) {
    const layoutProgress$ = new Subject<IDocumentLayoutProgress>();
    const skeleton = {
        hasCompleteLayout: () => initiallyComplete,
        layoutProgress$,
    };
    const currentSkeleton$ = new BehaviorSubject(skeleton);
    const setProgress = vi.fn();
    const clearProgress = vi.fn();
    const controller = new DocLayoutProgressRenderController(
        {
            unitId: 'doc-1',
        } as never,
        { currentSkeleton$ } as never,
        { clearProgress, setProgress } as never
    );
    clearProgress.mockClear();

    return { clearProgress, controller, layoutProgress$, setProgress };
}

describe('document layout progress', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('publishes footer progress only after a slow initial layout exceeds two seconds', () => {
        vi.useFakeTimers();
        const { clearProgress, controller, layoutProgress$, setProgress } = createController();

        layoutProgress$.next(createProgress());
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS - 1);
        expect(setProgress).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(setProgress).toHaveBeenLastCalledWith('doc-1', 20);

        layoutProgress$.next(createProgress({ processedBlockCount: 10 }));
        expect(setProgress).toHaveBeenLastCalledWith('doc-1', 20);

        layoutProgress$.next(createProgress({ complete: true, processedBlockCount: 100 }));
        expect(clearProgress).toHaveBeenCalledOnce();
        controller.dispose();
    });

    it('does not flash for fast initial layout or fast edits', () => {
        vi.useFakeTimers();
        const { controller, layoutProgress$, setProgress } = createController();

        layoutProgress$.next(createProgress());
        vi.advanceTimersByTime(500);
        layoutProgress$.next(createProgress({ complete: true, processedBlockCount: 100 }));
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS);
        layoutProgress$.next(createProgress({ reason: 'edit' }));
        vi.advanceTimersByTime(500);
        layoutProgress$.next(createProgress({ reason: 'edit', complete: true }));
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS);

        expect(setProgress).not.toHaveBeenCalled();
        controller.dispose();
    });

    it('shows progress for a slow edit after the initial layout has completed', () => {
        vi.useFakeTimers();
        const { controller, layoutProgress$, setProgress, clearProgress } = createController(true);

        layoutProgress$.next(createProgress({ reason: 'edit', processedBlockCount: 10, publishedPageCount: 1 }));
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS - 1);
        expect(setProgress).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(setProgress).toHaveBeenLastCalledWith('doc-1', 10);

        layoutProgress$.next(createProgress({ reason: 'edit', processedBlockCount: 60 }));
        expect(setProgress).toHaveBeenLastCalledWith('doc-1', 60);
        layoutProgress$.next(createProgress({ reason: 'edit', complete: true }));
        expect(clearProgress).toHaveBeenCalledOnce();
        controller.dispose();
    });

    it('keeps the original delay across a cancelled Main to Worker handoff', () => {
        vi.useFakeTimers();
        const { controller, layoutProgress$, setProgress } = createController();

        layoutProgress$.next(createProgress());
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS - 100);
        layoutProgress$.next(createProgress({ cancelled: true }));
        vi.advanceTimersByTime(100);
        expect(setProgress).not.toHaveBeenCalled();

        layoutProgress$.next(createProgress({ generation: 2, processedBlockCount: 30 }));
        expect(setProgress).toHaveBeenLastCalledWith('doc-1', 30);
        controller.dispose();
    });

    it('clears visible progress when a cancelled generation has no successor', () => {
        vi.useFakeTimers();
        const { clearProgress, controller, layoutProgress$, setProgress } = createController();

        layoutProgress$.next(createProgress());
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS);
        expect(setProgress).toHaveBeenCalledOnce();

        layoutProgress$.next(createProgress({ cancelled: true }));
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_CANCEL_GRACE_MS - 1);
        expect(clearProgress).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(clearProgress).toHaveBeenCalledOnce();

        controller.dispose();
    });

    it('starts a fresh delay after an abandoned edit without a successor', () => {
        vi.useFakeTimers();
        const { controller, layoutProgress$, setProgress } = createController(true);
        layoutProgress$.next(createProgress({ reason: 'edit' }));
        vi.advanceTimersByTime(500);
        layoutProgress$.next(createProgress({ reason: 'edit', cancelled: true }));
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_CANCEL_GRACE_MS + DOC_LAYOUT_PROGRESS_DELAY_MS);

        layoutProgress$.next(createProgress({ reason: 'edit', generation: 2 }));
        vi.advanceTimersByTime(DOC_LAYOUT_PROGRESS_DELAY_MS - 1);
        expect(setProgress).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(setProgress).toHaveBeenCalledOnce();
        controller.dispose();
    });

    it('advances with reused page publications without treating a continuous page as completed work', () => {
        expect(resolveDocLayoutProgressPercent(createProgress({
            reason: 'edit',
            processedBlockCount: 1,
            publishedPageCount: 8,
        }))).toBe(80);
        expect(resolveDocLayoutProgressPercent(createProgress({
            mode: 'continuous',
            processedBlockCount: 1,
            publishedPageCount: 1,
            pageCount: 1,
            estimatedPageCount: 1,
        }))).toBe(1);
    });

    it('calculates bounded progress from blocks and falls back to pages', () => {
        expect(resolveDocLayoutProgressPercent(createProgress({ processedBlockCount: 25 }))).toBe(25);
        expect(resolveDocLayoutProgressPercent(createProgress({ processedBlockCount: 200 }))).toBe(99);
        expect(resolveDocLayoutProgressPercent(createProgress({
            estimatedPageCount: 8,
            pageCount: 4,
            processedBlockCount: 0,
            publishedPageCount: 2,
            totalBlockCount: 0,
        }))).toBe(25);
        expect(resolveDocLayoutProgressPercent(createProgress({ complete: true }))).toBe(100);
    });
});
