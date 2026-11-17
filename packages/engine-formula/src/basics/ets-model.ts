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

import { normalINV } from './statistical';

// Additive error, trend, and seasonality. Candidate order breaks equal-loss ties.
type Weights = readonly [number, number, number];

const NONSEASONAL: readonly Weights[] = [
    [0.9, 0.001, 0],
    [0.75, 0.001, 0],
    [0.5, 0.001, 0],
    [0.25, 0.001, 0],
    [0.126, 0.001, 0],
    [0.1, 0.001, 0],
    [0.002, 0.001, 0],
    [0.833333, 0.0833333, 0],
    [0.166667, 0.0833333, 0],
    [0.998, 0.099, 0],
    [0.1, 0.099, 0],
    [0.126, 0.125, 0],
    [0.666667, 0.166667, 0],
    [0.333333, 0.166667, 0],
    [0.998, 0.249, 0],
    [0.25, 0.249, 0],
    [0.5, 0.25, 0],
    [0.998, 0.499, 0],
    [0.5, 0.499, 0],
    [0.666667, 0.5, 0],
    [0.998, 0.749, 0],
    [0.75, 0.749, 0],
    [0.833333, 0.75, 0],
    [0.998, 0.899, 0],
    [0.9, 0.899, 0],
];

const SEASONAL: readonly Weights[] = [
    [0.751, 0.001, 0.001],
    [0.501, 0.001, 0.001],
    [0.251, 0.001, 0.001],
    [0.126, 0.001, 0.001],
    [0.998, 0.099, 0.001],
    [0.126, 0.125, 0.001],
    [0.998, 0.249, 0.001],
    [0.5, 0.25, 0.001],
    [0.251, 0.25, 0.001],
    [0.998, 0.499, 0.001],
    [0.501, 0.5, 0.001],
    [0.998, 0.749, 0.001],
    [0.751, 0.75, 0.001],
    [0.998, 0.899, 0.001],
    [0.833333, 0.0833333, 0.0833333],
    [0.166667, 0.0833333, 0.0833333],
    [0.833333, 0.75, 0.0833333],
    [0.9, 0.001, 0.099],
    [0.9, 0.899, 0.099],
    [0.002, 0.001, 0.125],
    [0.666667, 0.166667, 0.166667],
    [0.333333, 0.166667, 0.166667],
    [0.666667, 0.5, 0.166667],
    [0.75, 0.001, 0.249],
    [0.75, 0.749, 0.249],
    [0.251, 0.001, 0.25],
    [0.002, 0.001, 0.25],
    [0.5, 0.25, 0.25],
    [0.251, 0.25, 0.25],
    [0.5, 0.001, 0.499],
    [0.5, 0.499, 0.499],
    [0.002, 0.001, 0.5],
    [0.333333, 0.166667, 0.5],
    [0.25, 0.001, 0.749],
    [0.25, 0.249, 0.749],
    [0.002, 0.001, 0.75],
    [0.166667, 0.0833333, 0.75],
    [0.1, 0.001, 0.899],
    [0.1, 0.099, 0.899],
];

export function etsSlope(values: readonly number[], seasons: readonly number[]): number {
    const n = values.length;
    const center = (n - 1) / 2;
    let covariance = 0;
    for (let i = 0; i < n; i++) {
        covariance += (i - center) * (values[i] - seasons[i % seasons.length]);
    }
    return covariance / (n * (n * n - 1) / 12);
}

function lagCorrelation(changes: readonly number[], lag: number): number {
    let left = 0;
    let right = 0;
    let product = 0;
    for (let i = lag; i < changes.length; i++) {
        const a = changes[i - lag];
        const b = changes[i];
        left += a * a;
        right += b * b;
        product += a * b;
    }
    return left === 0 || right === 0 ? 0 : product / Math.sqrt(left * right);
}

export function detectEtsPeriod(values: readonly number[]): number {
    if (values.length < 6) return 0;
    const differences = values.slice(1).map((value, i) => value - values[i]);
    const mean = differences.reduce((sum, value) => sum + value, 0) / differences.length;
    const changes = differences.map((value) => value - mean);

    // Evaluate local peaks in the autocorrelation of the centered first differences.
    let previous = lagCorrelation(changes, 1);
    let current = lagCorrelation(changes, 2);
    if (previous < -0.25 && current > 0.09) return 2;
    for (let lag = 2; lag <= Math.min(Math.floor(values.length / 2), 64); lag++) {
        const next = lagCorrelation(changes, lag + 1);
        if (current >= 0.65 && current > previous && current >= next) return lag;
        previous = current;
        current = next;
    }
    return 0;
}

interface IState {
    level: number;
    trend: number;
    seasons: number[];
}

function initialize(values: readonly number[], period: number): IState {
    const seasons: number[] = Array.from({ length: Math.max(1, period) }, () => 0);
    if (period > 1) {
        const length = Math.min(values.length, 5 * period);
        const width = 2 * period;
        const offset = Math.floor(period / 2) - 1;
        let window = values.slice(0, width).reduce((sum, value) => sum + value, 0);
        const counts: number[] = Array.from({ length: period }, () => 0);
        for (let i = 0; i + width < length; i++) {
            const phase = (i + offset) % period;
            seasons[phase] += values[i + offset] - window / width;
            counts[phase]++;
            window -= values[i];
            window += values[i + width];
        }
        if (counts.includes(0)) {
            const previous = values.slice(0, period).reduce((sum, value) => sum + value, 0);
            const next = values.slice(period, width).reduce((sum, value) => sum + value, 0);
            const trend = (next - previous) / (period * period);
            for (let i = 0; i < period; i++) {
                seasons[i] = (values[i] + values[i + period] - (2 * i + period) * trend) / 2;
            }
        } else {
            for (let i = 0; i < period; i++) {
                seasons[i] /= counts[i];
            }
        }
        const mean = seasons.reduce((sum, value) => sum + value, 0) / period;
        for (let i = 0; i < period; i++) seasons[i] -= mean;
    }
    const trend = etsSlope(values, seasons);
    return { level: values[0] - seasons[0] - trend, trend, seasons };
}

function advance(state: IState, phase: number, error: number, weights: Weights): void {
    state.level = state.level + state.trend + weights[0] * error;
    state.trend += weights[1] * error;
    state.seasons[phase] += weights[2] * error;
}

export interface IEtsModel {
    statistic(metric: number): number;
    project(index: number): number;
    confidenceWidth(horizon: number, confidence: number): number;
}

function selectWeights(seed: IState, trainingValues: readonly number[], period: number, trainingCount: number): Weights {
    const candidates = period > 1 ? SEASONAL : NONSEASONAL;
    let best = Infinity;
    let weights = candidates[0];

    for (const candidate of candidates) {
        const state = { ...seed, seasons: [...seed.seasons] };
        let loss = 0;
        for (let i = 0; i < trainingValues.length; i++) {
            const phase = i % state.seasons.length;
            const error = trainingValues[i] - (state.level + state.trend + state.seasons[phase]);
            loss += error * error;
            if (loss > best) break;
            if (i < trainingCount) {
                advance(state, phase, error, candidate);
            } else {
                state.level += state.trend;
            }
        }
        if (loss < best) {
            best = loss;
            weights = candidate;
        }
        if (loss === 0) break;
    }

    return weights;
}

export function trainEts(values: readonly number[], period: number): IEtsModel {
    let trainingValues = values;
    if (period <= 1 && values.length < 7) {
        // Pad two alternating phases for parameter selection. Only observations
        // from the input series contribute to the final fit.
        const trend = etsSlope(values, [0]);
        trainingValues = Array.from({ length: 7 }, (_, index) => values[index] ?? values[index % 2] + (index - index % 2) * trend);
    }
    const seed = initialize(trainingValues, period);
    const len = values.length;
    const trainingCount = len <= 10
        ? len
        : len - Math.min(Math.floor(len * 2 / 5), Math.max(10, 2 * period, len - Math.floor(len * 4 / 5)));
    const weights = selectWeights(seed, trainingValues, period, trainingValues.length === len ? trainingCount : trainingValues.length);

    const state = seed;
    const scoringStart = trainingCount === len ? 0 : trainingCount;
    let naive = 0;
    let symmetric = 0;
    let absolute = 0;
    let squared = 0;
    let innovationVariance = 0;
    for (let i = 0; i < len; i++) {
        const phase = i % state.seasons.length;
        const prediction = state.level + state.trend + state.seasons[phase];
        const error = values[i] - prediction;
        innovationVariance += error * error;
        if (i > 0 && i < trainingCount) naive += Math.abs(values[i] - values[i - 1]);
        if (i >= scoringStart) {
            const scale = Math.abs(values[i]) + Math.abs(prediction);
            if (scale !== 0) symmetric += 2 * Math.abs(error) / scale;
            absolute += Math.abs(error);
            squared += error * error;
        }
        advance(state, phase, error, weights);
    }

    const count = len - scoringStart;
    const mae = absolute / count;
    const metrics = [...weights, naive > 0 ? mae * (trainingCount - 1) / naive : 0, symmetric / count, mae, Math.sqrt(squared / count)];
    innovationVariance /= len;

    return {
        statistic: (metric) => metrics[metric - 1],
        project: (index) => state.level + (index - len + 1) * state.trend + state.seasons[index % state.seasons.length],
        confidenceWidth: (horizon, confidence) => {
            if (horizon <= 0 || innovationVariance === 0) return 0;
            const count = horizon - 1;
            const period = state.seasons.length;
            const cycles = Math.floor(count / period);
            const [alpha, beta, gamma] = weights;
            const variance = 1
                + count * alpha * alpha
                + alpha * beta * count * (count + 1)
                + beta * beta * count * (count + 1) * (2 * count + 1) / 6
                + cycles * gamma * (2 * alpha + gamma)
                + beta * gamma * period * cycles * (cycles + 1);
            const quantile = normalINV(1 - (1 - confidence) / 2, 0, 1);
            return quantile * Math.sqrt(innovationVariance * variance);
        },
    };
}
