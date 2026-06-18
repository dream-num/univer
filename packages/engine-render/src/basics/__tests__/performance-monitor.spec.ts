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

import { describe, expect, it, vi } from 'vitest';
import { PerformanceMonitor, RollingAverage } from '../performance-monitor';

describe('performance monitor', () => {
    it('samples frame timing, fps and reset/disable lifecycle', () => {
        const monitor = new PerformanceMonitor(3);

        monitor.endFrame(0);
        monitor.endFrame(16);
        monitor.endFrame(33);
        monitor.endFrame(50);
        monitor.sampleFrame(1050);

        expect(monitor.instantaneousFrameTime).toBeGreaterThan(0);
        expect(monitor.instantaneousFPS).toBeGreaterThan(0);
        expect(monitor.averageFrameTime).toBeGreaterThan(0);
        expect(monitor.averageFrameTimeVariance).not.toBeNaN();
        expect(monitor.averageFPS).toBeGreaterThan(0);
        expect(monitor.isSaturated).toBe(true);
        expect(monitor.isEnabled).toBe(true);

        monitor.disable();
        monitor.sampleFrame(1100);
        expect(monitor.isEnabled).toBe(false);

        monitor.enable();
        monitor.endFrame(1200);
        monitor.reset();
        expect(monitor.instantaneousFrameTime).toBe(0);
        expect(monitor.isSaturated).toBe(false);

        monitor.dispose();
    });

    it('uses performance.now when available and Date.now as fallback', () => {
        const monitor = new PerformanceMonitor();
        const performanceNow = vi.spyOn(performance, 'now').mockReturnValue(123);

        expect(monitor.now()).toBe(123);
        performanceNow.mockRestore();

        const originalPerformance = globalThis.performance;
        const dateNow = vi.spyOn(Date, 'now').mockReturnValue(456);
        try {
            Object.defineProperty(globalThis, 'performance', {
                configurable: true,
                value: undefined,
            });
            expect(monitor.now()).toBe(456);
        } finally {
            Object.defineProperty(globalThis, 'performance', {
                configurable: true,
                value: originalPerformance,
            });
            dateNow.mockRestore();
        }
    });

    it('computes rolling history, saturation and wraparound variance', () => {
        const average = new RollingAverage(3);

        expect(average.history(0)).toBe(0);
        average.addFrameTime(10);
        average.calcAverageFrameTime();
        average.addFrameTime(20);
        average.calcAverageFrameTime();
        average.addFrameTime(30);
        average.calcAverageFrameTime();
        average.addFrameTime(40);
        average.calcAverageFrameTime();

        expect(average.isSaturated()).toBe(true);
        expect(average.history(0)).toBe(40);
        expect(average.history(1)).toBe(30);
        expect(average.history(3)).toBe(0);
        expect(average.averageFrameTime).not.toBeNaN();
        expect(average.variance).not.toBeNaN();

        average.reset();
        expect(average.history(0)).toBe(0);
        expect(average.averageFrameTime).toBeCloseTo(16.67, 2);
        expect(average.variance).toBe(0);
    });
});
