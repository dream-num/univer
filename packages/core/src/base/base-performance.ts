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

export type BasePerformanceDetails = Record<string, unknown>;

interface IBasePerformanceGlobal {
    __UNIVER_BASE_PERF__?: boolean;
}

let measurementIndex = 0;

export function isBasePerformanceTracingEnabled(): boolean {
    const globalObject = globalThis as typeof globalThis & IBasePerformanceGlobal;
    if (globalObject.__UNIVER_BASE_PERF__ === true) {
        return true;
    }

    try {
        const locationSearch = typeof location === 'undefined' ? '' : location.search;
        const searchParams = new URLSearchParams(locationSearch);
        if (searchParams.get('basePerf') === '1' || searchParams.get('basePerf') === 'true' || searchParams.get('base-perf') === '1') {
            return true;
        }
    } catch {
        // Ignore URL parsing failures in non-browser runtimes.
    }

    try {
        const value = typeof localStorage === 'undefined' ? null : localStorage.getItem('univer.basePerf');
        return value === '1' || value === 'true';
    } catch {
        return false;
    }
}

export function traceBasePerformance<T>(label: string, fn: () => T, details?: BasePerformanceDetails): T {
    if (!isBasePerformanceTracingEnabled()) {
        return fn();
    }

    const start = now();
    const markId = `base-core-perf-${measurementIndex++}`;
    mark(`${markId}:start`);
    try {
        return fn();
    } finally {
        const duration = now() - start;
        mark(`${markId}:end`);
        measure(label, `${markId}:start`, `${markId}:end`);
        logBasePerformance(label, duration, details);
    }
}

export function logBasePerformance(label: string, duration: number, details?: BasePerformanceDetails): void {
    if (!isBasePerformanceTracingEnabled()) {
        return;
    }

    const roundedDuration = Math.round(duration * 100) / 100;
    const payload = details && Object.keys(details).length
        ? ` ${JSON.stringify(details)}`
        : '';
    // eslint-disable-next-line no-console
    console.info(`[BasePerf] ${label}: ${roundedDuration}ms${payload}`);
}

function now(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
}

function mark(name: string): void {
    try {
        if (typeof performance !== 'undefined') {
            performance.mark?.(name);
        }
    } catch {
        // Ignore unsupported performance APIs.
    }
}

function measure(name: string, start: string, end: string): void {
    try {
        if (typeof performance !== 'undefined') {
            performance.measure?.(`[BasePerf] ${name}`, start, end);
        }
    } catch {
        // Ignore unsupported performance APIs.
    }
}
