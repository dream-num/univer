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

// @vitest-environment jsdom

import type { IDocLayoutMountIdentity, IDocLayoutStartResult } from '@univerjs/docs';
import type { IDocumentLayoutProgress } from '@univerjs/engine-render';
import type { DocumentLayoutSchedulingSkeleton } from '../doc-layout-coordinator.service';
import { DocLayoutSessionStatus } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocLayoutCoordinatorService } from '../doc-layout-coordinator.service';

function createProgress(overrides: Partial<IDocumentLayoutProgress>): IDocumentLayoutProgress {
    return {
        generation: 1,
        publicationRevision: 0,
        didPublish: false,
        didPublishAnchor: false,
        publishedPageCount: 0,
        reason: 'edit',
        mode: 'paginated',
        complete: false,
        cancelled: false,
        anchorReady: false,
        laidOutThrough: 0,
        stableLaidOutThrough: 0,
        pageCount: 1,
        processedBlockCount: 1,
        totalBlockCount: 10,
        estimatedPageCount: 1,
        estimatedHeight: 800,
        elapsedTime: 1,
        maxBlockDuration: 1,
        interactionWindowComplete: false,
        ...overrides,
    };
}

describe('DocLayoutCoordinatorService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
        vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) =>
            window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 10 }), 0));
        vi.stubGlobal('cancelIdleCallback', (id: number) => window.clearTimeout(id));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('uses foreground slices until the anchor is ready and then finishes in idle slices', () => {
        const steps = [
            createProgress({ anchorReady: false }),
            createProgress({ anchorReady: true, laidOutThrough: 40 }),
            createProgress({ anchorReady: true, laidOutThrough: 100, complete: true }),
        ];
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => steps.shift()!),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const onProgress = vi.fn();
        const onComplete = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'edit', anchor: 30 }, { onProgress, onComplete });
        vi.runAllTimers();

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(3);
        expect(onProgress).toHaveBeenCalledTimes(3);
        expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ complete: true }));
        coordinator.dispose();
    });

    it('cancels the active generation when a main-thread layout step throws', () => {
        const error = new Error('layout failed');
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => {
                throw error;
            }),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        expect(() => coordinator.schedule(skeleton, { reason: 'edit', anchor: 1 }, { onProgress: vi.fn() })).toThrow(error);
        expect(skeleton.cancelIncrementalLayout).toHaveBeenCalledWith(1);
        expect(coordinator.hasScheduledLayout()).toBe(false);
        coordinator.dispose();
    });

    it('finishes the edited anchor synchronously one atomic block at a time', () => {
        const requestAnimationFrameSpy = vi.fn((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
        const steps = [
            createProgress({ anchorReady: false, laidOutThrough: 10 }),
            createProgress({ anchorReady: false, laidOutThrough: 20 }),
            createProgress({ anchorReady: true, laidOutThrough: 40 }),
            createProgress({ anchorReady: true, laidOutThrough: 80, complete: true }),
        ];
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => steps.shift()!),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'edit', anchor: 30 }, { onProgress: vi.fn() });

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(3);
        expect(skeleton.stepIncrementalLayout).toHaveBeenNthCalledWith(1, 1, 0);
        expect(skeleton.stepIncrementalLayout).toHaveBeenNthCalledWith(2, 1, 0);
        expect(skeleton.stepIncrementalLayout).toHaveBeenNthCalledWith(3, 1, 0);
        vi.runAllTimers();

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(4);
        expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
        coordinator.dispose();
    });

    it('yields a distant edited anchor to the next visual frame after four synchronous atomic blocks', () => {
        const requestAnimationFrameSpy = vi.fn((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
        const steps = [
            ...Array.from({ length: 6 }, (_, index) => createProgress({
                anchorReady: index === 5,
                laidOutThrough: (index + 1) * 10,
            })),
            createProgress({ anchorReady: true, laidOutThrough: 100, complete: true }),
        ];
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => steps.shift()!),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'edit', anchor: 90 }, { onProgress: vi.fn() });

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(4);
        expect(skeleton.stepIncrementalLayout).toHaveBeenNthCalledWith(4, 1, 0);
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
        vi.runAllTimers();

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(7);
        expect(skeleton.stepIncrementalLayout).toHaveBeenNthCalledWith(5, 1, 8);
        coordinator.dispose();
    });

    it('defers metadata-only edit layout until the next visual frame', () => {
        const requestAnimationFrameSpy = vi.fn((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => createProgress({ complete: true, anchorReady: true })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, {
            reason: 'edit',
            anchor: 0,
            deferForeground: true,
        }, { onProgress: vi.fn() });

        expect(skeleton.stepIncrementalLayout).not.toHaveBeenCalled();
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
        vi.runAllTimers();
        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(1);
        coordinator.dispose();
    });

    it('lets the shell paint once before starting an initial layout', () => {
        const requestAnimationFrameSpy = vi.fn((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => createProgress({ reason: 'initial', complete: true, anchorReady: true })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'initial' }, { onProgress: vi.fn() });
        vi.runAllTimers();

        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
        coordinator.dispose();
    });

    it('keeps a bounded interaction window on the main thread before handing off the tail', () => {
        const requestAnimationFrameSpy = vi.fn((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
        const steps = [
            createProgress({
                anchorReady: true,
                didPublish: true,
                didPublishAnchor: true,
                publishedPageCount: 3,
                pageCount: 20,
            }),
            createProgress({
                anchorReady: true,
                didPublish: true,
                publishedPageCount: 4,
                pageCount: 20,
            }),
            createProgress({
                anchorReady: true,
                didPublish: true,
                publishedPageCount: 5,
                pageCount: 20,
            }),
            createProgress({
                anchorReady: true,
                didPublish: true,
                publishedPageCount: 7,
                pageCount: 20,
            }),
        ];
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => steps.shift()!),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const onForegroundReady = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, {
            reason: 'edit',
            anchor: 30,
            foregroundWindowSize: 5,
            foregroundBudgetMs: 1_000,
        }, {
            onProgress: vi.fn(),
            onForegroundReady,
        });

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(1);
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
        vi.runAllTimers();

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(4);
        expect(onForegroundReady).toHaveBeenCalledTimes(1);
        expect(onForegroundReady).toHaveBeenCalledWith(expect.objectContaining({ publishedPageCount: 7 }));
        coordinator.dispose();
    });

    it('clamps the main-thread interaction window to three through five pages', () => {
        const createSchedulingSkeleton = () => {
            const steps = Array.from({ length: 10 }, (_, index) => createProgress({
                anchorReady: true,
                didPublish: true,
                didPublishAnchor: index === 0,
                publishedPageCount: index + 1,
                pageCount: 20,
            }));
            return {
                startIncrementalLayout: vi.fn(() => 1),
                stepIncrementalLayout: vi.fn(() => steps.shift()!),
                cancelIncrementalLayout: vi.fn(),
            } satisfies DocumentLayoutSchedulingSkeleton;
        };
        const coordinator = new DocLayoutCoordinatorService();
        const oversizedSkeleton = createSchedulingSkeleton();
        const undersizedSkeleton = createSchedulingSkeleton();

        coordinator.schedule(oversizedSkeleton, {
            reason: 'edit',
            anchor: 30,
            foregroundWindowSize: 100,
            foregroundBudgetMs: 1_000,
        }, {
            onProgress: vi.fn(),
            onForegroundReady: vi.fn(),
        });
        vi.runAllTimers();
        expect(oversizedSkeleton.stepIncrementalLayout).toHaveBeenCalledTimes(5);

        coordinator.schedule(undersizedSkeleton, {
            reason: 'edit',
            anchor: 30,
            foregroundWindowSize: 1,
            foregroundBudgetMs: 1_000,
        }, {
            onProgress: vi.fn(),
            onForegroundReady: vi.fn(),
        });
        vi.runAllTimers();
        expect(undersizedSkeleton.stepIncrementalLayout).toHaveBeenCalledTimes(3);

        coordinator.dispose();
    });

    it('hands off immediately when Main seals a page whose last paragraph continues in Worker', () => {
        const progress = createProgress({
            anchorReady: true,
            didPublish: true,
            didPublishAnchor: true,
            publishedPageCount: 3,
            pageCount: 20,
            interactionWindowComplete: true,
        });
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => progress),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const onForegroundReady = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, {
            reason: 'edit',
            anchor: 30,
            foregroundWindowSize: 5,
            foregroundBudgetMs: 1_000,
        }, {
            onProgress: vi.fn(),
            onForegroundReady,
        });

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(1);
        expect(skeleton.cancelIncrementalLayout).toHaveBeenCalledWith(1);
        expect(onForegroundReady).toHaveBeenCalledWith(progress);
        coordinator.dispose();
    });

    it('hands a completed Main edit to Worker before publishing completion', () => {
        const progress = createProgress({
            anchorReady: true,
            didPublish: true,
            didPublishAnchor: true,
            publishedPageCount: 3,
            pageCount: 3,
            complete: true,
        });
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => progress),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const onProgress = vi.fn();
        const onComplete = vi.fn();
        const onForegroundReady = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, {
            reason: 'edit',
            anchor: 30,
        }, {
            onProgress,
            onComplete,
            onForegroundReady,
        });

        expect(skeleton.cancelIncrementalLayout).toHaveBeenCalledWith(1);
        expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ complete: false }));
        expect(onForegroundReady).toHaveBeenCalledWith(progress);
        expect(onComplete).not.toHaveBeenCalled();
        coordinator.dispose();
    });

    it('counts continuous blocks instead of physical pages for the Modern interaction window', () => {
        const steps = [20, 21, 22, 24].map((processedBlockCount, index) => createProgress({
            mode: 'continuous',
            anchorReady: true,
            didPublish: true,
            didPublishAnchor: index === 0,
            publishedPageCount: 1,
            processedBlockCount,
            totalBlockCount: 100,
        }));
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => steps.shift()!),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const onForegroundReady = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, {
            reason: 'edit',
            anchor: 300,
            foregroundWindowSize: 5,
            foregroundBudgetMs: 1_000,
        }, {
            onProgress: vi.fn(),
            onForegroundReady,
        });
        vi.runAllTimers();

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(4);
        expect(onForegroundReady).toHaveBeenCalledWith(expect.objectContaining({
            mode: 'continuous',
            processedBlockCount: 24,
        }));
        coordinator.dispose();
    });

    it('protects the visible Modern suffix through its viewport offset before Worker handoff', () => {
        const steps = [
            createProgress({
                mode: 'continuous',
                anchorReady: true,
                didPublish: true,
                didPublishAnchor: true,
                processedBlockCount: 20,
                stableLaidOutThrough: 320,
            }),
            createProgress({
                mode: 'continuous',
                anchorReady: true,
                didPublish: true,
                processedBlockCount: 21,
                stableLaidOutThrough: 480,
            }),
            createProgress({
                mode: 'continuous',
                anchorReady: true,
                didPublish: true,
                processedBlockCount: 22,
                stableLaidOutThrough: 720,
            }),
        ];
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn(() => steps.shift()!),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const onForegroundReady = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, {
            reason: 'edit',
            anchor: 300,
            foregroundEndOffset: 720,
            foregroundBudgetMs: 1_000,
        }, {
            onProgress: vi.fn(),
            onForegroundReady,
        });
        vi.runAllTimers();

        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledTimes(3);
        expect(onForegroundReady).toHaveBeenCalledWith(expect.objectContaining({
            mode: 'continuous',
            processedBlockCount: 22,
            stableLaidOutThrough: 720,
        }));
        coordinator.dispose();
    });

    it('cancels the previous generation when a new edit is scheduled', () => {
        const skeleton = {
            startIncrementalLayout: vi.fn()
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(2),
            stepIncrementalLayout: vi.fn()
                .mockReturnValueOnce(createProgress({ generation: 1, anchorReady: true }))
                .mockReturnValueOnce(createProgress({ generation: 2, complete: true, anchorReady: true })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'edit', anchor: 10 }, { onProgress: vi.fn() });
        coordinator.schedule(skeleton, { reason: 'edit', anchor: 11 }, { onProgress: vi.fn() });

        expect(skeleton.cancelIncrementalLayout).toHaveBeenCalledWith(1);
        vi.runAllTimers();
        expect(skeleton.stepIncrementalLayout).toHaveBeenCalledWith(2, 0);
        coordinator.dispose();
    });

    it('crosses a timer boundary before chaining background idle work', () => {
        const requestIdle = vi.fn((callback: IdleRequestCallback) =>
            window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 10 }), 0));
        vi.stubGlobal('requestIdleCallback', requestIdle);
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn()
                .mockReturnValueOnce(createProgress({ anchorReady: true }))
                .mockReturnValueOnce(createProgress({ anchorReady: true, complete: true })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'initial' }, { onProgress: vi.fn() });

        expect(requestIdle).not.toHaveBeenCalled();
        vi.advanceTimersByTime(3);
        expect(requestIdle).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(requestIdle).toHaveBeenCalledTimes(1);

        vi.runAllTimers();
        coordinator.dispose();
    });

    it('publishes at most one already-computed page per background task before calculating more', () => {
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn()
                .mockReturnValueOnce(createProgress({
                    anchorReady: true,
                    didPublish: true,
                    publishedPageCount: 1,
                }))
                .mockReturnValueOnce(createProgress({
                    anchorReady: true,
                    didPublish: true,
                    publishedPageCount: 3,
                }))
                .mockReturnValueOnce(createProgress({
                    anchorReady: true,
                    complete: true,
                    didPublish: true,
                    publishedPageCount: 4,
                })),
            publishIncrementalLayoutBacklog: vi.fn()
                .mockReturnValueOnce(createProgress({
                    anchorReady: true,
                    didPublish: true,
                    publishedPageCount: 2,
                }))
                .mockReturnValue(createProgress({
                    anchorReady: true,
                    didPublish: false,
                    publishedPageCount: 2,
                })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const publications: number[] = [];
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'initial' }, {
            onProgress: (progress) => publications.push(progress.publishedPageCount),
        });
        vi.runAllTimers();

        expect(publications).toEqual([1, 2, 3, 4]);
        expect(skeleton.publishIncrementalLayoutBacklog).toHaveBeenCalledTimes(3);
        coordinator.dispose();
    });

    it('resumes an edited document tail after the input quiet period', () => {
        const requestIdle = vi.fn((callback: IdleRequestCallback) =>
            window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 10 }), 0));
        vi.stubGlobal('requestIdleCallback', requestIdle);
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn()
                .mockReturnValueOnce(createProgress({ anchorReady: true }))
                .mockReturnValueOnce(createProgress({ anchorReady: true, complete: true })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'edit', anchor: 100 }, { onProgress: vi.fn() });

        vi.advanceTimersByTime(119);
        expect(requestIdle).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(requestIdle).toHaveBeenCalledTimes(1);

        vi.runAllTimers();
        coordinator.dispose();
    });

    it('defers an active background tail when the user interacts', () => {
        const requestIdle = vi.fn((callback: IdleRequestCallback) =>
            window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 10 }), 0));
        vi.stubGlobal('requestIdleCallback', requestIdle);
        const skeleton = {
            startIncrementalLayout: vi.fn(() => 1),
            stepIncrementalLayout: vi.fn()
                .mockReturnValueOnce(createProgress({ anchorReady: true }))
                .mockReturnValueOnce(createProgress({ anchorReady: true, complete: true })),
            cancelIncrementalLayout: vi.fn(),
        } satisfies DocumentLayoutSchedulingSkeleton;
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.schedule(skeleton, { reason: 'initial' }, { onProgress: vi.fn() });
        coordinator.deferBackgroundWork();

        vi.advanceTimersByTime(3);
        expect(requestIdle).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(requestIdle).toHaveBeenCalledTimes(1);

        vi.runAllTimers();
        coordinator.dispose();
    });

    it('keeps Worker background layout moving when the browser has no idle period', async () => {
        const requestIdle = vi.fn(() => 1);
        vi.stubGlobal('requestIdleCallback', requestIdle);
        let identity: IDocLayoutMountIdentity = {
            unitId: 'doc-worker-background',
            mountId: '',
            mountEpoch: 0,
            viewportEpoch: 0,
        };
        const executorService = {
            startLayout: vi.fn(async (requestIdentity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => {
                identity = requestIdentity;
                return {
                    status: DocLayoutSessionStatus.ACCEPTED,
                    step: {
                        ...requestIdentity,
                        progress: createProgress({
                            generation: 7,
                            mode: 'continuous',
                            didPublish: true,
                            anchorReady: true,
                            processedBlockCount: 63,
                            totalBlockCount: 6_264,
                        }),
                        publication: null,
                        modelRevision: 3,
                        metricsRevision: 5,
                    },
                };
            }),
            stepLayout: vi.fn(async () => ({
                ...identity,
                progress: createProgress({
                    generation: 7,
                    mode: 'continuous',
                    didPublish: true,
                    anchorReady: true,
                    complete: true,
                    processedBlockCount: 6_264,
                    totalBlockCount: 6_264,
                }),
                publication: null,
                modelRevision: 3,
                metricsRevision: 5,
            })),
            publishBacklog: vi.fn(async () => ({
                ...identity,
                progress: createProgress({
                    generation: 7,
                    mode: 'continuous',
                    anchorReady: true,
                    processedBlockCount: 63,
                    totalBlockCount: 6_264,
                }),
                publication: null,
                modelRevision: 3,
                metricsRevision: 5,
            })),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.scheduleWorker(
            'doc-worker-background',
            { beginExternalLayout: vi.fn(), cancelExternalLayout: vi.fn() },
            executorService,
            { reason: 'initial' },
            undefined,
            { onProgress: vi.fn() },
            vi.fn()
        );
        await vi.runAllTimersAsync();

        expect(requestIdle).not.toHaveBeenCalled();
        expect(executorService.stepLayout).toHaveBeenCalledTimes(1);
        coordinator.dispose();
    });

    it('does not advance Worker computation past an unpublished backlog while input is pending', async () => {
        const isInputPending = vi.fn()
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);
        vi.stubGlobal('navigator', {
            scheduling: { isInputPending },
        });
        let identity: IDocLayoutMountIdentity = {
            unitId: 'doc-worker-pending-input',
            mountId: '',
            mountEpoch: 0,
            viewportEpoch: 0,
        };
        const executorService = {
            startLayout: vi.fn(async (requestIdentity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => {
                identity = requestIdentity;
                return {
                    status: DocLayoutSessionStatus.ACCEPTED,
                    step: {
                        ...requestIdentity,
                        progress: createProgress({
                            generation: 7,
                            didPublish: true,
                            anchorReady: true,
                            publishedPageCount: 1,
                            pageCount: 3,
                        }),
                        publication: null,
                        modelRevision: 3,
                        metricsRevision: 5,
                    },
                };
            }),
            stepLayout: vi.fn(async () => ({
                ...identity,
                progress: createProgress({
                    generation: 7,
                    didPublish: true,
                    anchorReady: true,
                    complete: true,
                    publishedPageCount: 3,
                    pageCount: 3,
                }),
                publication: null,
                modelRevision: 3,
                metricsRevision: 5,
            })),
            publishBacklog: vi.fn(async () => ({
                ...identity,
                progress: createProgress({
                    generation: 7,
                    didPublish: true,
                    anchorReady: true,
                    complete: true,
                    publishedPageCount: 2,
                    pageCount: 2,
                }),
                publication: null,
                modelRevision: 3,
                metricsRevision: 5,
            })),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.scheduleWorker(
            'doc-worker-pending-input',
            { beginExternalLayout: vi.fn(), cancelExternalLayout: vi.fn() },
            executorService,
            { reason: 'initial' },
            undefined,
            { onProgress: vi.fn() },
            vi.fn()
        );
        await vi.runAllTimersAsync();

        expect(executorService.publishBacklog).toHaveBeenCalledTimes(1);
        expect(executorService.stepLayout).not.toHaveBeenCalled();
        coordinator.dispose();
    });

    it('keeps an external presentation barrier until Worker pages are published', async () => {
        const requestAnimationFrameSpy = vi.fn((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0));
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
        const firstProgress = createProgress({
            generation: 7,
            didPublish: true,
            anchorReady: true,
            didPublishAnchor: true,
            publishedPageCount: 1,
        });
        const progress = [
            createProgress({
                generation: 7,
                didPublish: true,
                anchorReady: true,
                complete: true,
                publishedPageCount: 2,
                pageCount: 2,
            }),
        ];
        let identity: IDocLayoutMountIdentity = {
            unitId: 'doc-1',
            mountId: '',
            mountEpoch: 0,
            viewportEpoch: 0,
        };
        const executorService = {
            startLayout: vi.fn(async (requestIdentity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => {
                identity = requestIdentity;
                return {
                    status: DocLayoutSessionStatus.ACCEPTED,
                    step: {
                        ...requestIdentity,
                        progress: firstProgress,
                        publication: null,
                        modelRevision: 3,
                        metricsRevision: 5,
                    },
                };
            }),
            stepLayout: vi.fn(async () => ({
                ...identity,
                progress: progress.shift()!,
                publication: null,
                modelRevision: 3,
                metricsRevision: 5,
            })),
            publishBacklog: vi.fn(async () => ({
                ...identity,
                progress: createProgress({
                    generation: 7,
                    anchorReady: true,
                    didPublish: false,
                    publishedPageCount: 1,
                }),
                publication: null,
                modelRevision: 3,
                metricsRevision: 5,
            })),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const skeleton = {
            beginExternalLayout: vi.fn(),
            cancelExternalLayout: vi.fn(),
        };
        const onProgress = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.scheduleWorker(
            'doc-1',
            skeleton,
            executorService,
            { reason: 'edit', anchor: 12 },
            undefined,
            { onProgress },
            vi.fn()
        );

        expect(skeleton.beginExternalLayout).toHaveBeenCalledWith({
            reason: 'edit',
            protectedRange: undefined,
        });
        await vi.runAllTimersAsync();
        expect(executorService.startLayout).toHaveBeenCalledTimes(1);
        expect(executorService.startLayout).toHaveBeenCalledWith(
            {
                unitId: 'doc-1',
                mountId: expect.stringMatching(/^docs-layout-mount-/),
                mountEpoch: 1,
                viewportEpoch: 1,
            },
            { reason: 'edit', anchor: 12 },
            32
        );
        expect(executorService.publishBacklog).toHaveBeenCalledTimes(1);
        expect(executorService.stepLayout).toHaveBeenCalledTimes(1);
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2);
        expect(onProgress).toHaveBeenCalledTimes(2);
        expect(skeleton.cancelExternalLayout).not.toHaveBeenCalled();
        coordinator.dispose();
        expect(executorService.disposeLayoutMount).toHaveBeenCalledWith({
            unitId: 'doc-1',
            mountId: expect.stringMatching(/^docs-layout-mount-/),
            mountEpoch: 1,
            viewportEpoch: 1,
        });
    });

    it('commits a Worker publication only inside the configured visual frame', async () => {
        const visualFrames: Array<() => void> = [];
        const scheduleVisualFrame = vi.fn((callback: () => void) => {
            visualFrames.push(callback);
            return () => {
                const index = visualFrames.indexOf(callback);
                if (index >= 0) {
                    visualFrames.splice(index, 1);
                }
            };
        });
        const executorService = {
            startLayout: vi.fn(async (identity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => ({
                status: DocLayoutSessionStatus.ACCEPTED,
                step: {
                    ...identity,
                    progress: createProgress({
                        generation: 11,
                        didPublish: true,
                        anchorReady: true,
                        complete: true,
                    }),
                    publication: null,
                    modelRevision: 0,
                    metricsRevision: 1,
                },
            })),
            stepLayout: vi.fn(),
            publishBacklog: vi.fn(),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const skeleton = {
            beginExternalLayout: vi.fn(),
            cancelExternalLayout: vi.fn(),
        };
        const onProgress = vi.fn();
        const coordinator = new DocLayoutCoordinatorService(scheduleVisualFrame);

        coordinator.scheduleWorker(
            'doc-frame-commit',
            skeleton,
            executorService,
            { reason: 'initial' },
            undefined,
            { onProgress },
            vi.fn()
        );
        await vi.waitFor(() => expect(scheduleVisualFrame).toHaveBeenCalledTimes(1));

        expect(onProgress).not.toHaveBeenCalled();
        coordinator.setWorkerPresentationPaused(true);
        coordinator.setWorkerPresentationPaused(false);
        expect(scheduleVisualFrame).toHaveBeenCalledTimes(1);
        visualFrames.shift()?.();
        await Promise.resolve();

        expect(onProgress).toHaveBeenCalledTimes(1);
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({ generation: 11, complete: true }),
            null
        );
        coordinator.dispose();
    });

    it('keeps an in-flight Worker publication when scrolling defers background work', async () => {
        const visualFrames: Array<() => void> = [];
        const scheduleVisualFrame = vi.fn((callback: () => void) => {
            visualFrames.push(callback);
            return () => {
                const index = visualFrames.indexOf(callback);
                if (index >= 0) {
                    visualFrames.splice(index, 1);
                }
            };
        });
        const executorService = {
            startLayout: vi.fn(async (identity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => ({
                status: DocLayoutSessionStatus.ACCEPTED,
                step: {
                    ...identity,
                    progress: createProgress({
                        generation: 13,
                        didPublish: true,
                        anchorReady: true,
                        publishedPageCount: 1,
                        pageCount: 3,
                    }),
                    publication: null,
                    modelRevision: 0,
                    metricsRevision: 1,
                },
            })),
            stepLayout: vi.fn(),
            publishBacklog: vi.fn(async (identity: IDocLayoutMountIdentity) => ({
                ...identity,
                progress: createProgress({
                    generation: 13,
                    didPublish: true,
                    anchorReady: true,
                    publishedPageCount: 2,
                    pageCount: 3,
                }),
                publication: null,
                modelRevision: 0,
                metricsRevision: 1,
            })),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const onProgress = vi.fn();
        const coordinator = new DocLayoutCoordinatorService(scheduleVisualFrame);

        coordinator.scheduleWorker(
            'doc-scroll-publication',
            { beginExternalLayout: vi.fn(), cancelExternalLayout: vi.fn() },
            executorService,
            { reason: 'initial' },
            undefined,
            { onProgress },
            vi.fn()
        );
        await vi.waitFor(() => expect(visualFrames).toHaveLength(1));
        visualFrames.shift()?.();
        await Promise.resolve();
        await vi.advanceTimersByTimeAsync(4);
        await vi.waitFor(() => expect(visualFrames).toHaveLength(1));

        coordinator.deferBackgroundWork();

        expect(visualFrames).toHaveLength(1);
        expect(onProgress).toHaveBeenCalledTimes(1);
        visualFrames.shift()?.();
        await Promise.resolve();

        expect(onProgress).toHaveBeenCalledTimes(2);
        coordinator.dispose();
    });

    it('holds a Worker publication until the document interaction releases it', async () => {
        const visualFrames: Array<() => void> = [];
        const scheduleVisualFrame = vi.fn((callback: () => void) => {
            visualFrames.push(callback);
            return () => {
                const index = visualFrames.indexOf(callback);
                if (index >= 0) {
                    visualFrames.splice(index, 1);
                }
            };
        });
        const executorService = {
            startLayout: vi.fn(async (identity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => ({
                status: DocLayoutSessionStatus.ACCEPTED,
                step: {
                    ...identity,
                    progress: createProgress({
                        generation: 12,
                        didPublish: true,
                        anchorReady: true,
                        complete: true,
                    }),
                    publication: null,
                    modelRevision: 0,
                    metricsRevision: 1,
                },
            })),
            stepLayout: vi.fn(),
            publishBacklog: vi.fn(),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const skeleton = {
            beginExternalLayout: vi.fn(),
            cancelExternalLayout: vi.fn(),
        };
        const onProgress = vi.fn();
        const coordinator = new DocLayoutCoordinatorService(scheduleVisualFrame);

        coordinator.setWorkerPresentationPaused(true);
        coordinator.scheduleWorker(
            'doc-interaction-publication',
            skeleton,
            executorService,
            { reason: 'edit', anchor: 5 },
            undefined,
            { onProgress },
            vi.fn()
        );
        await vi.waitFor(() => expect(executorService.startLayout).toHaveBeenCalledTimes(1));

        expect(scheduleVisualFrame).not.toHaveBeenCalled();
        expect(onProgress).not.toHaveBeenCalled();

        coordinator.setWorkerPresentationPaused(false);
        expect(scheduleVisualFrame).toHaveBeenCalledTimes(1);
        visualFrames.shift()?.();
        await Promise.resolve();

        expect(onProgress).toHaveBeenCalledTimes(1);
        coordinator.dispose();
    });

    it('ignores a late Worker start result after the mounted document is disposed', async () => {
        let resolveStart: (result: IDocLayoutStartResult) => void = () => {};
        let startIdentity: IDocLayoutMountIdentity = {
            unitId: 'doc-late',
            mountId: '',
            mountEpoch: 0,
            viewportEpoch: 0,
        };
        const executorService = {
            startLayout: vi.fn((requestIdentity: IDocLayoutMountIdentity) => {
                startIdentity = requestIdentity;
                return new Promise<IDocLayoutStartResult>((resolve) => {
                    resolveStart = resolve;
                });
            }),
            stepLayout: vi.fn(),
            publishBacklog: vi.fn(),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const skeleton = {
            beginExternalLayout: vi.fn(),
            cancelExternalLayout: vi.fn(),
        };
        const onProgress = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.scheduleWorker(
            'doc-late',
            skeleton,
            executorService,
            { reason: 'initial' },
            undefined,
            { onProgress },
            vi.fn()
        );
        coordinator.dispose();
        resolveStart({
            status: DocLayoutSessionStatus.ACCEPTED,
            step: {
                ...startIdentity,
                progress: createProgress({ generation: 9, didPublish: true, anchorReady: true }),
                publication: null,
                modelRevision: 0,
                metricsRevision: 1,
            },
        });
        await Promise.resolve();
        await Promise.resolve();

        expect(onProgress).not.toHaveBeenCalled();
        expect(skeleton.cancelExternalLayout).toHaveBeenCalledTimes(1);
        expect(executorService.disposeLayoutMount).toHaveBeenCalledWith(startIdentity);
        expect(executorService.cancelLayout).toHaveBeenCalledWith({
            ...startIdentity,
            generation: 9,
        });
    });

    it('closes the external presentation barrier when a Worker publication is rejected', async () => {
        const publicationError = new Error('continuation checkpoint mismatch');
        const executorService = {
            startLayout: vi.fn(async (identity: IDocLayoutMountIdentity): Promise<IDocLayoutStartResult> => ({
                status: DocLayoutSessionStatus.ACCEPTED,
                step: {
                    ...identity,
                    progress: createProgress({ generation: 9, didPublish: true, anchorReady: true }),
                    publication: null,
                    modelRevision: 0,
                    metricsRevision: 1,
                },
            })),
            stepLayout: vi.fn(),
            publishBacklog: vi.fn(),
            getLayoutPage: vi.fn(),
            cancelLayout: vi.fn(async () => {}),
            disposeLayoutMount: vi.fn(async () => {}),
        };
        const skeleton = {
            beginExternalLayout: vi.fn(),
            cancelExternalLayout: vi.fn(),
        };
        const onError = vi.fn();
        const coordinator = new DocLayoutCoordinatorService();

        coordinator.scheduleWorker(
            'doc-rejected',
            skeleton,
            executorService,
            { reason: 'edit' },
            undefined,
            { onProgress: () => { throw publicationError; } },
            onError
        );
        await vi.runAllTimersAsync();
        await vi.waitFor(() => {
            expect(skeleton.cancelExternalLayout).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(publicationError);
        });
        coordinator.dispose();
    });
});
