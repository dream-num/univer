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

export interface ISheetRenderMetricBucket {
    count: number;
    maxMs: number;
    totalMs: number;
}

export interface ISheetRenderMetricSample {
    detail?: Record<string, number | string | boolean | null | undefined>;
    durationMs: number;
    name: string;
    ts: number;
}

export interface ISheetRenderProfile {
    counters: Record<string, number>;
    samples: ISheetRenderMetricSample[];
    totals: Record<string, ISheetRenderMetricBucket>;
    clear: () => void;
    summary: () => {
        counters: Record<string, number>;
        samples: ISheetRenderMetricSample[];
        totals: Record<string, ISheetRenderMetricBucket>;
    };
}

interface ISheetRenderProfileGlobal {
    __UNIVER_SHEET_RENDER_PROFILE__?: ISheetRenderProfile;
    __UNIVER_SHEET_RENDER_PROFILING__?: boolean;
}

const MAX_SAMPLES = 2000;

export function getSheetRenderProfilerNow() {
    return globalThis.performance?.now?.() ?? Date.now();
}

export function getSheetRenderProfile(): ISheetRenderProfile | null {
    const host = globalThis as typeof globalThis & ISheetRenderProfileGlobal;
    if (!host.__UNIVER_SHEET_RENDER_PROFILING__) {
        return null;
    }

    if (!host.__UNIVER_SHEET_RENDER_PROFILE__) {
        const profile: ISheetRenderProfile = {
            counters: {},
            samples: [],
            totals: {},
            clear() {
                profile.counters = {};
                profile.samples = [];
                profile.totals = {};
            },
            summary() {
                const totals: Record<string, ISheetRenderMetricBucket> = {};
                Object.entries(profile.totals).forEach(([key, value]) => {
                    totals[key] = { ...value };
                });
                return {
                    counters: { ...profile.counters },
                    samples: profile.samples.slice(-40).map((sample) => ({
                        ...sample,
                        detail: sample.detail ? { ...sample.detail } : undefined,
                    })),
                    totals,
                };
            },
        };
        host.__UNIVER_SHEET_RENDER_PROFILE__ = profile;
    }

    return host.__UNIVER_SHEET_RENDER_PROFILE__;
}

export function incrementSheetRenderCounter(name: string, count = 1) {
    const profile = getSheetRenderProfile();
    if (!profile) {
        return;
    }

    profile.counters[name] = (profile.counters[name] ?? 0) + count;
}

export function recordSheetRenderMetric(
    name: string,
    durationMs: number,
    detail?: ISheetRenderMetricSample['detail']
) {
    const profile = getSheetRenderProfile();
    if (!profile) {
        return;
    }

    const bucket = profile.totals[name] ?? { count: 0, maxMs: 0, totalMs: 0 };
    bucket.count += 1;
    bucket.totalMs += durationMs;
    bucket.maxMs = Math.max(bucket.maxMs, durationMs);
    profile.totals[name] = bucket;

    profile.samples.push({
        detail,
        durationMs,
        name,
        ts: getSheetRenderProfilerNow(),
    });

    if (profile.samples.length > MAX_SAMPLES) {
        profile.samples.splice(0, profile.samples.length - MAX_SAMPLES);
    }
}
