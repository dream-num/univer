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

import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';
import type { IProgressStep } from '../progress/progress.service';
import { ProgressService } from '../progress/progress.service';

describe('ProgressService', () => {
    let service: ProgressService;

    beforeEach(() => {
        service = new ProgressService();
    });

    it('initializes with correct default values', () => {
        expect(service).toBeTruthy();

        const { result } = renderHook(() => ({
            progressChange$: service.progressChange$,
            progressVisible$: service.progressVisible$,
        }));

        expect(result.current.progressChange$).toBeDefined();
        expect(result.current.progressVisible$).toBeDefined();
    });

    it('pushTask should emit step change and handle task count', () => {
        const { result } = renderHook(() => ({
            progressChange$: service.progressChange$,
            progressVisible$: service.progressVisible$,
        }));

        const steps: IProgressStep[] = [];
        result.current.progressChange$.subscribe((step) => steps.push(step));
        const visibilities: boolean[] = [];
        result.current.progressVisible$.subscribe((visible) => visibilities.push(visible));

        act(() => {
            service.insertTaskCount(10);
            service.pushTask({ count: 5 });
        });
        expect(steps).toEqual([{ step: 0.5 }]);

        act(() => {
            service.pushTask({ count: 5 });
        });
        expect(steps).toEqual([{ step: 0.5 }, { step: 1 }]);
        expect(visibilities).toEqual([true, false]);
    });

    it('pushTask should emit step change and handle task count, exceeded the total number of tasks', () => {
        const { result } = renderHook(() => ({
            progressChange$: service.progressChange$,
            progressVisible$: service.progressVisible$,
        }));

        const steps: IProgressStep[] = [];
        result.current.progressChange$.subscribe((step) => steps.push(step));
        const visibilities: boolean[] = [];
        result.current.progressVisible$.subscribe((visible) => visibilities.push(visible));

        act(() => {
            service.insertTaskCount(10);
            service.pushTask({ count: 5 });
        });
        expect(steps).toEqual([{ step: 0.5 }]);

        act(() => {
            service.pushTask({ count: 10 });
        });
        expect(steps).toEqual([{ step: 0.5 }, { step: 1 }]);
        expect(visibilities).toEqual([true, false]);
    });

    it('insertTaskCount should make progress visible if task count was zero', () => {
        const { result } = renderHook(() => ({
            progressVisible$: service.progressVisible$,
        }));

        const visibilities: boolean[] = [];
        result.current.progressVisible$.subscribe((visible) => visibilities.push(visible));

        act(() => {
            service.insertTaskCount(1);
        });
        expect(visibilities).toEqual([true]);
    });

    it('complete should set progress to 100% and hide the progress bar', () => {
        const { result } = renderHook(() => ({
            progressChange$: service.progressChange$,
            progressVisible$: service.progressVisible$,
        }));

        const steps: IProgressStep[] = [];
        result.current.progressChange$.subscribe((step) => steps.push(step));
        const visibilities: boolean[] = [];
        result.current.progressVisible$.subscribe((visible) => visibilities.push(visible));

        act(() => {
            service.insertTaskCount(10);
            service.complete();
        });
        expect(steps).toEqual([{ step: 1 }]);
        expect(visibilities).toEqual([true, false]);
    });

    it('stop should hide the progress bar without completing', () => {
        const { result } = renderHook(() => ({
            progressVisible$: service.progressVisible$,
        }));

        const visibilities: boolean[] = [];
        result.current.progressVisible$.subscribe((visible) => visibilities.push(visible));

        act(() => {
            service.insertTaskCount(10);
            service.stop();
        });
        expect(visibilities).toEqual([true, false]);
    });

    it('dispose should complete all observables', () => {
        const { result } = renderHook(() => ({
            progressChange$: service.progressChange$,
            progressVisible$: service.progressVisible$,
        }));

        let changeCompleted = false;
        let visibleCompleted = false;

        const changeSubscription = result.current.progressChange$.subscribe({
            next: (step) => { /* empty */ },
            complete: () => {
                changeCompleted = true;
            },
        });

        const visibleSubscription = result.current.progressVisible$.subscribe({
            next: (visible) => { /* empty */ },
            complete: () => {
                visibleCompleted = true;
            },
        });

        act(() => {
            service.dispose();
        });

        // Assert that both subscriptions have been completed
        expect(changeCompleted).toBe(true);
        expect(visibleCompleted).toBe(true);

        // Cleanup subscriptions
        changeSubscription.unsubscribe();
        visibleSubscription.unsubscribe();
    });
});
