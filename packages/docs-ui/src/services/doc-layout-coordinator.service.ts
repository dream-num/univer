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

import type { DocLayoutExecutorService, IDocLayoutMountIdentity, IDocLayoutPageResult, IDocLayoutStartOptions, IDocLayoutStepResult } from '@univerjs/docs';
import type { DocumentLayoutReason, DocumentSkeleton, IDocumentLayoutProgress, IDocumentLayoutProtectedRange } from '@univerjs/engine-render';
import { Disposable } from '@univerjs/core';
import { DocLayoutSessionStatus } from '@univerjs/docs';

const FOREGROUND_BUDGET_MS = 8;
const WORKER_FOREGROUND_BUDGET_MS = 32;
const WORKER_BACKGROUND_BUDGET_MS = 128;
const BACKGROUND_BUDGET_MS = 12;
const BACKGROUND_YIELD_MS = 4;
const BACKGROUND_RESUME_DELAY_MS = 4;
const EDIT_BACKGROUND_RESUME_DELAY_MS = 120;
const MIN_EDIT_FOREGROUND_WINDOW_SIZE = 3;
const MAX_EDIT_FOREGROUND_WINDOW_SIZE = 5;
const EDIT_FOREGROUND_WINDOW_SIZE = MAX_EDIT_FOREGROUND_WINDOW_SIZE;
const EDIT_FOREGROUND_BUDGET_MS = 28;
const MAX_SYNCHRONOUS_EDIT_STEPS = 4;
let docLayoutMountSequence = 0;

interface IInputPendingSchedulingHost {
    scheduling: {
        isInputPending: (options?: { includeContinuous?: boolean }) => boolean;
    };
}

function hasInputPendingScheduling(value: object): value is IInputPendingSchedulingHost {
    if (!('scheduling' in value)) {
        return false;
    }

    const scheduling = value.scheduling;
    return typeof scheduling === 'object' && scheduling != null &&
        'isInputPending' in scheduling && typeof scheduling.isInputPending === 'function';
}

function hasPendingUserInput(): boolean {
    if (typeof navigator === 'undefined') {
        return false;
    }

    return hasInputPendingScheduling(navigator) &&
        navigator.scheduling.isInputPending({ includeContinuous: true });
}

export interface IDocLayoutCoordinatorCallbacks {
    onProgress: (progress: IDocumentLayoutProgress, publication?: IDocLayoutStepResult['publication']) => void;
    onComplete?: (progress: IDocumentLayoutProgress) => void;
    onForegroundReady?: (progress: IDocumentLayoutProgress) => void;
}

interface IScheduledLayoutBase {
    callbacks: IDocLayoutCoordinatorCallbacks;
    backgroundResumeDelayMs: number;
    nextBackgroundDelayMs: number;
    anchorReady: boolean;
}

function getBackgroundResumeDelay(reason: DocumentLayoutReason): number {
    return reason === 'edit' ? EDIT_BACKGROUND_RESUME_DELAY_MS : BACKGROUND_RESUME_DELAY_MS;
}

function normalizeEditForegroundWindowSize(size: number | undefined): number {
    const normalizedSize = Math.floor(size ?? EDIT_FOREGROUND_WINDOW_SIZE);
    return Math.min(
        MAX_EDIT_FOREGROUND_WINDOW_SIZE,
        Math.max(MIN_EDIT_FOREGROUND_WINDOW_SIZE, normalizedSize)
    );
}

interface IScheduledMainThreadLayout extends IScheduledLayoutBase {
    executor: 'main-thread';
    skeleton: DocumentLayoutSchedulingSkeleton;
    generation: number;
    foregroundStarted: boolean;
    foregroundBudgetMs: number;
    foregroundElapsedMs: number;
    foregroundWindowSize: number;
    foregroundTargetProgressCount: number | null;
    foregroundEndOffset: number | null;
    waitForAnimationFrame: boolean;
}

export type DocumentLayoutSchedulingSkeleton = Pick<
    DocumentSkeleton,
    'startIncrementalLayout' | 'stepIncrementalLayout' | 'cancelIncrementalLayout'
> & Partial<Pick<DocumentSkeleton, 'publishIncrementalLayoutBacklog'>>;

type DocumentLayoutSchedulingOptions = NonNullable<Parameters<DocumentSkeleton['startIncrementalLayout']>[0]> & {
    deferForeground?: boolean;
    reason: DocumentLayoutReason;
    foregroundWindowSize?: number;
    foregroundBudgetMs?: number;
    foregroundEndOffset?: number;
};

type DocLayoutSchedulingExecutor = Pick<
    DocLayoutExecutorService,
    'startLayout' | 'stepLayout' | 'publishBacklog' | 'getLayoutPage' | 'cancelLayout' | 'disposeLayoutMount'
>;

type ExternalLayoutPresentation = Pick<DocumentSkeleton, 'beginExternalLayout' | 'cancelExternalLayout'>;

interface IScheduledWorkerLayout extends IScheduledLayoutBase {
    executor: 'worker';
    unitId: string;
    mountId: string;
    mountEpoch: number;
    viewportEpoch: number;
    skeleton: ExternalLayoutPresentation;
    executorService: DocLayoutSchedulingExecutor;
    options: IDocLayoutStartOptions;
    generation: number | null;
    modelRevision: number | null;
    metricsRevision: number | null;
    onError: (error: unknown) => void;
}

type IScheduledLayout = IScheduledMainThreadLayout | IScheduledWorkerLayout;

export type DocLayoutVisualFrameScheduler = (callback: () => void) => () => void;

function scheduleAnimationFrame(callback: () => void): () => void {
    if (typeof requestAnimationFrame === 'function') {
        const frameId = requestAnimationFrame(callback);
        return () => cancelAnimationFrame(frameId);
    }

    const timerId = setTimeout(callback, 0);
    return () => clearTimeout(timerId);
}

interface IPendingWorkerPresentation {
    cancel: () => void;
    resume: () => void;
}

/**
 * Cooperative presentation scheduler for interactive document layout.
 *
 * The coordinator owns only timing and cancellation. The selected executor owns
 * layout state; both executors publish the same generation/step contract.
 */
export class DocLayoutCoordinatorService extends Disposable {
    private readonly _mountId = `docs-layout-mount-${++docLayoutMountSequence}`;
    private _mountEpoch = 0;
    private _viewportEpoch = 0;
    private _workerMount: {
        unitId: string;
        executorService: DocLayoutSchedulingExecutor;
        onError: (error: unknown) => void;
        mountEpoch: number;
        viewportEpoch: number;
    } | null = null;

    private _scheduledLayout: IScheduledLayout | null = null;
    private _animationFrameId: number | null = null;
    private _idleCallbackId: number | null = null;
    private _fallbackTimerId: ReturnType<typeof setTimeout> | null = null;
    private _pendingWorkerPresentation: IPendingWorkerPresentation | null = null;
    private _workerPresentationPaused = false;

    constructor(
        private readonly _scheduleVisualFrame: DocLayoutVisualFrameScheduler = scheduleAnimationFrame
    ) {
        super();
    }

    schedule(
        skeleton: DocumentLayoutSchedulingSkeleton,
        options: DocumentLayoutSchedulingOptions,
        callbacks: IDocLayoutCoordinatorCallbacks
    ): number {
        this.cancel();

        const generation = skeleton.startIncrementalLayout(options);
        const backgroundResumeDelayMs = getBackgroundResumeDelay(options.reason);
        this._scheduledLayout = {
            executor: 'main-thread',
            skeleton,
            generation,
            callbacks,
            backgroundResumeDelayMs,
            nextBackgroundDelayMs: backgroundResumeDelayMs,
            anchorReady: false,
            foregroundStarted: false,
            foregroundBudgetMs: options.foregroundBudgetMs ?? EDIT_FOREGROUND_BUDGET_MS,
            foregroundElapsedMs: 0,
            foregroundWindowSize: normalizeEditForegroundWindowSize(options.foregroundWindowSize),
            foregroundTargetProgressCount: null,
            foregroundEndOffset: options.foregroundEndOffset ?? null,
            waitForAnimationFrame: options.reason !== 'edit' || options.deferForeground === true,
        };
        // Rich-text mutations update their logical selection in a microtask after the
        // command has completed. Advance a small edited prefix in the command turn so
        // ordinary caret edits retain their existing immediate visual publication.
        // A large table can contain hundreds of atomic blocks before its anchor becomes
        // publishable, so cap the synchronous prefix and finish that anchor across task
        // boundaries. The logical selection remains authoritative until the foreground
        // publication refreshes its render geometry.
        if (options.reason === 'edit' && options.deferForeground !== true) {
            this._scheduledLayout.foregroundStarted = true;
            let synchronousStepCount = 0;
            while (
                this._scheduledLayout != null &&
                !this._scheduledLayout.anchorReady &&
                synchronousStepCount < MAX_SYNCHRONOUS_EDIT_STEPS
            ) {
                this._runSlice(0, false, false);
                synchronousStepCount++;
            }
            const foregroundLayout = this._scheduledLayout;
            const shouldYieldContinuationToVisualFrame = foregroundLayout?.executor === 'main-thread' && (
                !foregroundLayout.anchorReady || foregroundLayout.callbacks.onForegroundReady != null
            );
            if (
                foregroundLayout?.executor === 'main-thread' &&
                !shouldYieldContinuationToVisualFrame &&
                foregroundLayout.anchorReady &&
                foregroundLayout.foregroundEndOffset != null &&
                foregroundLayout.foregroundElapsedMs < foregroundLayout.foregroundBudgetMs
            ) {
                this._runSlice(
                    foregroundLayout.foregroundBudgetMs - foregroundLayout.foregroundElapsedMs,
                    false,
                    false
                );
            }
            const scheduledLayout = this._scheduledLayout;
            if (scheduledLayout != null) {
                if (
                    scheduledLayout.executor === 'main-thread' &&
                    (!scheduledLayout.anchorReady || scheduledLayout.callbacks.onForegroundReady != null)
                ) {
                    // The command turn already published a bounded caret prefix.
                    // Let that input paint before finishing a distant anchor or the
                    // surrounding interaction window, which can contain a large
                    // table or another atomic block whose single step exceeds its
                    // nominal time budget.
                    scheduledLayout.foregroundStarted = false;
                    scheduledLayout.waitForAnimationFrame = true;
                }
                if (!scheduledLayout.anchorReady || scheduledLayout.callbacks.onForegroundReady != null) {
                    this._scheduleForeground();
                } else {
                    this._scheduleBackground();
                }
            }
        } else {
            // Initial layout and metadata-only edits yield one frame so the shell or
            // direct-manipulation preview can paint before pagination resumes.
            this._scheduleForeground();
        }

        return generation;
    }

    scheduleWorker(
        unitId: string,
        skeleton: ExternalLayoutPresentation,
        executorService: DocLayoutSchedulingExecutor,
        options: IDocLayoutStartOptions,
        protectedRange: IDocumentLayoutProtectedRange | undefined,
        callbacks: IDocLayoutCoordinatorCallbacks,
        onError: (error: unknown) => void
    ): void {
        this.cancel();
        const previousMount = this._workerMount;
        if (previousMount != null && (
            previousMount.unitId !== unitId ||
            previousMount.executorService !== executorService
        )) {
            previousMount.executorService.disposeLayoutMount({
                unitId: previousMount.unitId,
                mountId: this._mountId,
                mountEpoch: previousMount.mountEpoch,
                viewportEpoch: previousMount.viewportEpoch,
            }).catch(onError);
        }
        if (
            previousMount == null ||
            previousMount.unitId !== unitId ||
            previousMount.executorService !== executorService
        ) {
            this._mountEpoch++;
        }
        const viewportEpoch = ++this._viewportEpoch;
        this._workerMount = {
            unitId,
            executorService,
            onError,
            mountEpoch: this._mountEpoch,
            viewportEpoch,
        };
        skeleton.beginExternalLayout({
            reason: options.reason,
            protectedRange,
        });
        const backgroundResumeDelayMs = getBackgroundResumeDelay(options.reason);
        this._scheduledLayout = {
            executor: 'worker',
            unitId,
            mountId: this._mountId,
            mountEpoch: this._mountEpoch,
            viewportEpoch,
            skeleton,
            executorService,
            options,
            generation: null,
            modelRevision: null,
            metricsRevision: null,
            callbacks,
            onError,
            backgroundResumeDelayMs,
            nextBackgroundDelayMs: backgroundResumeDelayMs,
            anchorReady: false,
        };
        // Posting a Worker request is non-blocking, so start the synchronized
        // mutation + anchor-page transaction in the current command turn. Only
        // additional foreground slices cross task boundaries.
        this._runSlice(WORKER_FOREGROUND_BUDGET_MS, false);
    }

    async getWorkerPage(pageIndex: number): Promise<IDocLayoutPageResult | null> {
        const workerMount = this._workerMount;
        if (workerMount == null) {
            return null;
        }
        const result = await workerMount.executorService.getLayoutPage({
            unitId: workerMount.unitId,
            mountId: this._mountId,
            mountEpoch: workerMount.mountEpoch,
            viewportEpoch: workerMount.viewportEpoch,
            pageIndex,
        });
        if (
            this._workerMount !== workerMount ||
            result.unitId !== workerMount.unitId ||
            result.mountId !== this._mountId ||
            result.mountEpoch !== workerMount.mountEpoch ||
            result.viewportEpoch !== workerMount.viewportEpoch
        ) {
            return null;
        }
        return result;
    }

    deferBackgroundWork(): void {
        const scheduledLayout = this._scheduledLayout;
        if (scheduledLayout == null || !scheduledLayout.anchorReady) {
            return;
        }

        scheduledLayout.nextBackgroundDelayMs = scheduledLayout.backgroundResumeDelayMs;
        if (scheduledLayout.executor === 'worker') {
            // Worker computation does not block the Main thread. More importantly,
            // its transport cursor advances before the visual-frame publication is
            // committed. Cancelling that pending publication here would drop a page
            // permanently and make every later page index sparse on Main.
            return;
        }
        this._cancelCallbacks();
        this._scheduleBackground();
    }

    setWorkerPresentationPaused(paused: boolean): void {
        if (this._workerPresentationPaused === paused) {
            return;
        }

        this._workerPresentationPaused = paused;
        if (!paused) {
            this._pendingWorkerPresentation?.resume();
        }
    }

    hasScheduledLayout(): boolean {
        return this._scheduledLayout != null;
    }

    cancel(): void {
        const scheduledLayout = this._scheduledLayout;
        if (scheduledLayout != null) {
            if (scheduledLayout.executor === 'main-thread') {
                scheduledLayout.skeleton.cancelIncrementalLayout(scheduledLayout.generation);
            } else if (scheduledLayout.generation != null) {
                scheduledLayout.executorService.cancelLayout({
                    unitId: scheduledLayout.unitId,
                    mountId: scheduledLayout.mountId,
                    mountEpoch: scheduledLayout.mountEpoch,
                    viewportEpoch: scheduledLayout.viewportEpoch,
                    generation: scheduledLayout.generation,
                }).catch(scheduledLayout.onError);
            }
            if (scheduledLayout.executor === 'worker') {
                scheduledLayout.skeleton.cancelExternalLayout();
            }
        }
        this._scheduledLayout = null;
        this._cancelCallbacks();
    }

    override dispose(): void {
        this.cancel();
        const workerMount = this._workerMount;
        this._workerMount = null;
        if (workerMount != null) {
            workerMount.executorService.disposeLayoutMount({
                unitId: workerMount.unitId,
                mountId: this._mountId,
                mountEpoch: workerMount.mountEpoch,
                viewportEpoch: workerMount.viewportEpoch,
            }).catch(workerMount.onError);
        }
        super.dispose();
    }

    private _scheduleForeground(): void {
        if (
            this._scheduledLayout == null ||
            this._animationFrameId != null ||
            this._fallbackTimerId != null
        ) {
            return;
        }

        if (this._scheduledLayout.executor === 'worker') {
            // Worker computation cannot block input on the main thread. Advance the
            // priority page across zero-delay task boundaries instead of paying one
            // animation frame per RPC slice; each response still yields to queued
            // input before the next request, while the caret page can converge in a
            // single visual frame.
            this._fallbackTimerId = setTimeout(() => {
                this._fallbackTimerId = null;
                this._runSlice(WORKER_FOREGROUND_BUDGET_MS, false);
            }, 0);
            return;
        }

        const scheduledLayout = this._scheduledLayout;
        if (scheduledLayout.foregroundStarted || !scheduledLayout.waitForAnimationFrame) {
            this._fallbackTimerId = setTimeout(() => {
                this._fallbackTimerId = null;
                if (this._scheduledLayout !== scheduledLayout) {
                    return;
                }
                scheduledLayout.foregroundStarted = true;
                this._runSlice(FOREGROUND_BUDGET_MS, false);
            }, 0);
            return;
        }

        if (typeof requestAnimationFrame === 'function') {
            this._animationFrameId = requestAnimationFrame(() => {
                this._animationFrameId = null;
                if (this._scheduledLayout !== scheduledLayout) {
                    return;
                }
                scheduledLayout.foregroundStarted = true;
                this._runSlice(FOREGROUND_BUDGET_MS, false);
            });
            return;
        }

        this._fallbackTimerId = setTimeout(() => {
            this._fallbackTimerId = null;
            if (this._scheduledLayout !== scheduledLayout) {
                return;
            }
            scheduledLayout.foregroundStarted = true;
            this._runSlice(FOREGROUND_BUDGET_MS, false);
        }, 0);
    }

    private _scheduleBackground(): void {
        if (this._scheduledLayout == null || this._idleCallbackId != null || this._fallbackTimerId != null) {
            return;
        }

        // Always cross a timer boundary before requesting more idle work. Chaining
        // requestIdleCallback directly can consume every idle period while a long
        // document is opening, leaving input and browser tasks with no useful gap.
        const delay = this._scheduledLayout.nextBackgroundDelayMs;
        this._scheduledLayout.nextBackgroundDelayMs = BACKGROUND_YIELD_MS;
        this._fallbackTimerId = setTimeout(() => {
            this._fallbackTimerId = null;
            const scheduledLayout = this._scheduledLayout;
            if (scheduledLayout == null) {
                return;
            }

            // Worker computation does not consume the main thread's idle budget.
            // Waiting for requestIdleCallback here can starve forever while the
            // loading skeleton keeps Canvas animating. Preserve the timer boundary
            // and input-pending check, then let the Worker advance independently;
            // its geometry is still committed only inside a visual frame.
            if (scheduledLayout.executor === 'worker') {
                if (hasPendingUserInput()) {
                    this._scheduleBackground();
                    return;
                }
                this._runSlice(WORKER_BACKGROUND_BUDGET_MS, true);
                return;
            }

            if (typeof requestIdleCallback === 'function') {
                this._idleCallbackId = requestIdleCallback((deadline) => {
                    this._idleCallbackId = null;
                    if (hasPendingUserInput()) {
                        this._scheduleBackground();
                        return;
                    }

                    const availableTime = deadline.timeRemaining();
                    const budget = availableTime > 0
                        ? Math.min(BACKGROUND_BUDGET_MS, Math.max(1, availableTime))
                        : FOREGROUND_BUDGET_MS;
                    this._runSlice(budget, true);
                });
                return;
            }

            this._runSlice(FOREGROUND_BUDGET_MS, true);
        }, delay);
    }

    private _runSlice(
        budgetMs: number,
        publishOneBacklogPage: boolean,
        scheduleContinuation = true
    ): void {
        const scheduledLayout = this._scheduledLayout;
        if (scheduledLayout == null) {
            return;
        }

        if (scheduledLayout.executor === 'worker') {
            this._runWorkerSlice(scheduledLayout, budgetMs, publishOneBacklogPage).catch((error: unknown) => {
                if (this._scheduledLayout !== scheduledLayout) {
                    return;
                }
                scheduledLayout.skeleton.cancelExternalLayout();
                this._scheduledLayout = null;
                this._cancelCallbacks();
                scheduledLayout.onError(error);
            });
            return;
        }

        this._runMainThreadSlice(
            scheduledLayout,
            budgetMs,
            publishOneBacklogPage,
            scheduleContinuation
        );
    }

    private _runMainThreadSlice(
        scheduledLayout: IScheduledMainThreadLayout,
        budgetMs: number,
        publishOneBacklogPage: boolean,
        scheduleContinuation: boolean
    ): void {
        if (this._publishMainThreadBacklog(scheduledLayout, publishOneBacklogPage, scheduleContinuation)) {
            return;
        }

        const foregroundStepStartedAt = performance.now();
        const progress = scheduledLayout.skeleton.stepIncrementalLayout(scheduledLayout.generation, budgetMs);
        scheduledLayout.foregroundElapsedMs += performance.now() - foregroundStepStartedAt;
        if (this._scheduledLayout !== scheduledLayout) {
            return;
        }
        if (progress.cancelled) {
            this._scheduledLayout = null;
            this._cancelCallbacks();
            return;
        }

        scheduledLayout.anchorReady = progress.anchorReady;
        const publishedProgress = progress.complete && scheduledLayout.callbacks.onForegroundReady != null
            ? { ...progress, complete: false }
            : progress;
        scheduledLayout.callbacks.onProgress(publishedProgress);

        // A completed Main interaction pass still has to hand the committed model
        // revision to the Worker. Otherwise edits that fit inside one Main slice
        // leave the Worker baseline stale forever and the next canonical layout
        // starts from an obsolete document snapshot.
        if (this._finishForegroundWindow(scheduledLayout, progress, scheduleContinuation)) {
            return;
        }

        if (progress.complete) {
            this._scheduledLayout = null;
            scheduledLayout.callbacks.onComplete?.(progress);
            return;
        }

        if (scheduleContinuation) {
            if (scheduledLayout.anchorReady) {
                this._scheduleBackground();
            } else {
                this._scheduleForeground();
            }
        }
    }

    private _publishMainThreadBacklog(
        scheduledLayout: IScheduledMainThreadLayout,
        publishOneBacklogPage: boolean,
        scheduleContinuation: boolean
    ): boolean {
        if (
            !publishOneBacklogPage ||
            !scheduledLayout.anchorReady ||
            hasPendingUserInput() ||
            typeof scheduledLayout.skeleton.publishIncrementalLayoutBacklog !== 'function'
        ) {
            return false;
        }

        const backlogProgress = scheduledLayout.skeleton.publishIncrementalLayoutBacklog(
            scheduledLayout.generation
        );
        if (this._scheduledLayout !== scheduledLayout || backlogProgress.cancelled) {
            return true;
        }
        if (!backlogProgress.didPublish) {
            return false;
        }

        scheduledLayout.anchorReady = backlogProgress.anchorReady;
        scheduledLayout.callbacks.onProgress(backlogProgress);
        if (backlogProgress.complete) {
            this._scheduledLayout = null;
            scheduledLayout.callbacks.onComplete?.(backlogProgress);
            return true;
        }

        // A visual publication owns this task. Yield before exposing the next
        // page so Canvas can paint genuinely progressive pagination.
        if (scheduleContinuation) {
            this._scheduleBackground();
        }
        return true;
    }

    private _finishForegroundWindow(
        scheduledLayout: IScheduledMainThreadLayout,
        progress: IDocumentLayoutProgress,
        scheduleContinuation: boolean
    ): boolean {
        const onForegroundReady = scheduledLayout.callbacks.onForegroundReady;
        if (onForegroundReady == null) {
            return false;
        }

        if (progress.complete) {
            this._completeForegroundWindow(scheduledLayout, progress, onForegroundReady);
            return true;
        }

        const progressCount = progress.mode === 'continuous'
            ? progress.processedBlockCount
            : progress.publishedPageCount;
        if (progress.didPublishAnchor && progress.interactionWindowComplete) {
            this._completeForegroundWindow(scheduledLayout, progress, onForegroundReady);
            return true;
        }
        if (progress.didPublishAnchor && scheduledLayout.foregroundTargetProgressCount == null) {
            scheduledLayout.foregroundTargetProgressCount = progressCount +
                Math.max(0, scheduledLayout.foregroundWindowSize - 1);
        }
        const target = scheduledLayout.foregroundTargetProgressCount;
        if (target == null) {
            return false;
        }

        const foregroundReady = progress.mode === 'continuous' && scheduledLayout.foregroundEndOffset != null
            ? progress.stableLaidOutThrough >= scheduledLayout.foregroundEndOffset
            : progressCount >= target ||
                scheduledLayout.foregroundElapsedMs >= scheduledLayout.foregroundBudgetMs;
        if (!foregroundReady) {
            if (scheduleContinuation) {
                this._scheduleForeground();
            }
            return true;
        }

        // The budget is soft because a table or paragraph block is the smallest
        // atomic layout unit. For Modern, it limits only the synchronous command
        // turn; later foreground tasks still protect the viewport before handoff.
        this._completeForegroundWindow(scheduledLayout, progress, onForegroundReady);
        return true;
    }

    private _completeForegroundWindow(
        scheduledLayout: IScheduledMainThreadLayout,
        progress: IDocumentLayoutProgress,
        onForegroundReady: NonNullable<IDocLayoutCoordinatorCallbacks['onForegroundReady']>
    ): void {
        this._scheduledLayout = null;
        scheduledLayout.skeleton.cancelIncrementalLayout(scheduledLayout.generation);
        this._cancelCallbacks();
        onForegroundReady(progress);
    }

    private async _runWorkerSlice(
        scheduledLayout: IScheduledWorkerLayout,
        budgetMs: number,
        publishOneBacklogPage: boolean
    ): Promise<void> {
        if (scheduledLayout.generation == null && await this._startWorkerLayout(scheduledLayout, budgetMs)) {
            return;
        }

        if (await this._publishWorkerBacklog(scheduledLayout, publishOneBacklogPage)) {
            return;
        }

        const result = await scheduledLayout.executorService.stepLayout({
            ...this._getWorkerIdentity(scheduledLayout),
            generation: this._getWorkerGeneration(scheduledLayout),
            budgetMs,
        });
        this._assertWorkerResultIdentity(scheduledLayout, result);
        this._assertWorkerResultRevisions(scheduledLayout, result, 'step');
        if (this._scheduledLayout !== scheduledLayout || result.progress.cancelled) {
            return;
        }

        if (!await this._publishWorkerResult(scheduledLayout, result)) {
            return;
        }
        if (result.progress.complete) {
            return;
        }

        if (scheduledLayout.anchorReady) {
            this._scheduleBackground();
        } else {
            this._scheduleForeground();
        }
    }

    private async _startWorkerLayout(
        scheduledLayout: IScheduledWorkerLayout,
        budgetMs: number
    ): Promise<boolean> {
        const startResult = await scheduledLayout.executorService.startLayout(
            this._getWorkerIdentity(scheduledLayout),
            scheduledLayout.options,
            budgetMs
        );
        if (this._scheduledLayout !== scheduledLayout) {
            if (startResult?.status === DocLayoutSessionStatus.ACCEPTED) {
                await scheduledLayout.executorService.cancelLayout({
                    unitId: startResult.step.unitId,
                    mountId: startResult.step.mountId,
                    mountEpoch: startResult.step.mountEpoch,
                    viewportEpoch: startResult.step.viewportEpoch,
                    generation: startResult.step.progress.generation,
                });
            }
            return true;
        }
        if (startResult?.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('The document layout Worker could not start a synchronized session.');
        }

        this._assertWorkerResultIdentity(scheduledLayout, startResult.step);
        scheduledLayout.generation = startResult.step.progress.generation;
        scheduledLayout.modelRevision = startResult.step.modelRevision;
        scheduledLayout.metricsRevision = startResult.step.metricsRevision;
        if (startResult.step.progress.cancelled) {
            return true;
        }

        if (!await this._publishWorkerResult(scheduledLayout, startResult.step)) {
            return true;
        }
        if (startResult.step.progress.complete || scheduledLayout.anchorReady) {
            if (!startResult.step.progress.complete) {
                this._scheduleBackground();
            }
            return true;
        }
        return false;
    }

    private async _publishWorkerBacklog(
        scheduledLayout: IScheduledWorkerLayout,
        publishOneBacklogPage: boolean
    ): Promise<boolean> {
        if (!publishOneBacklogPage || !scheduledLayout.anchorReady) {
            return false;
        }
        if (hasPendingUserInput()) {
            // Do not advance the Worker past an unpublished page while input is
            // pending. Incremental layout can temporarily merge page fragments;
            // stepping here would advance the transport cursor beyond geometry
            // that has not been delivered and create a sparse Main skeleton.
            this._scheduleBackground();
            return true;
        }

        const backlogResult = await scheduledLayout.executorService.publishBacklog({
            ...this._getWorkerIdentity(scheduledLayout),
            generation: this._getWorkerGeneration(scheduledLayout),
        });
        this._assertWorkerResultIdentity(scheduledLayout, backlogResult);
        this._assertWorkerResultRevisions(scheduledLayout, backlogResult, 'backlog');
        if (this._scheduledLayout !== scheduledLayout || backlogResult.progress.cancelled) {
            return true;
        }
        if (!backlogResult.progress.didPublish) {
            return false;
        }

        if (!await this._publishWorkerResult(scheduledLayout, backlogResult)) {
            return true;
        }
        if (!backlogResult.progress.complete) {
            // Match the Main path: one visible page publication per task.
            this._scheduleBackground();
        }
        return true;
    }

    private _assertWorkerResultRevisions(
        scheduledLayout: IScheduledWorkerLayout,
        result: IDocLayoutStepResult,
        phase: 'backlog' | 'step'
    ): void {
        if (result.modelRevision !== scheduledLayout.modelRevision) {
            throw new Error(`The document layout Worker returned a stale ${phase} model revision.`);
        }
        if (result.metricsRevision !== scheduledLayout.metricsRevision) {
            throw new Error(`The document layout Worker returned stale ${phase} Custom Block metrics.`);
        }
    }

    private _publishWorkerResult(
        scheduledLayout: IScheduledWorkerLayout,
        result: IDocLayoutStepResult
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let settled = false;
            let cancelFrame: (() => void) | null = null;
            const settle = (committed: boolean) => {
                if (settled) {
                    return;
                }
                settled = true;
                resolve(committed);
            };
            const cancel = () => {
                cancelFrame?.();
                cancelFrame = null;
                settle(false);
            };
            const commit = () => {
                if (settled || cancelFrame != null) {
                    return;
                }
                if (this._workerPresentationPaused) {
                    this._pendingWorkerPresentation = { cancel, resume: commit };
                    return;
                }

                cancelFrame = this._scheduleVisualFrame(() => {
                    cancelFrame = null;
                    if (this._workerPresentationPaused) {
                        this._pendingWorkerPresentation = { cancel, resume: commit };
                        return;
                    }
                    this._pendingWorkerPresentation = null;
                    if (this._scheduledLayout !== scheduledLayout) {
                        settle(false);
                        return;
                    }

                    try {
                        scheduledLayout.anchorReady = result.progress.anchorReady;
                        scheduledLayout.callbacks.onProgress(result.progress, result.publication);
                        if (result.progress.complete) {
                            this._scheduledLayout = null;
                            scheduledLayout.callbacks.onComplete?.(result.progress);
                        }
                        settle(true);
                    } catch (error) {
                        if (!settled) {
                            settled = true;
                            reject(error);
                        }
                    }
                });
                this._pendingWorkerPresentation = { cancel, resume: commit };
            };
            commit();
        });
    }

    private _getWorkerIdentity(scheduledLayout: IScheduledWorkerLayout): IDocLayoutMountIdentity {
        return {
            unitId: scheduledLayout.unitId,
            mountId: scheduledLayout.mountId,
            mountEpoch: scheduledLayout.mountEpoch,
            viewportEpoch: scheduledLayout.viewportEpoch,
        };
    }

    private _getWorkerGeneration(scheduledLayout: IScheduledWorkerLayout): number {
        if (scheduledLayout.generation == null) {
            throw new Error('The document layout Worker session has not started.');
        }
        return scheduledLayout.generation;
    }

    private _assertWorkerResultIdentity(
        scheduledLayout: IScheduledWorkerLayout,
        result: IDocLayoutStepResult
    ): void {
        if (
            result.unitId !== scheduledLayout.unitId ||
            result.mountId !== scheduledLayout.mountId ||
            result.mountEpoch !== scheduledLayout.mountEpoch ||
            result.viewportEpoch !== scheduledLayout.viewportEpoch ||
            (scheduledLayout.generation != null && result.progress.generation !== scheduledLayout.generation)
        ) {
            throw new Error('The document layout Worker returned a stale publication identity.');
        }
    }

    private _cancelCallbacks(): void {
        if (this._animationFrameId != null && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(this._animationFrameId);
        }
        if (this._idleCallbackId != null && typeof cancelIdleCallback === 'function') {
            cancelIdleCallback(this._idleCallbackId);
        }
        if (this._fallbackTimerId != null) {
            clearTimeout(this._fallbackTimerId);
        }
        this._pendingWorkerPresentation?.cancel();

        this._animationFrameId = null;
        this._idleCallbackId = null;
        this._fallbackTimerId = null;
        this._pendingWorkerPresentation = null;
    }
}
