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

import type { IDocLayoutPerformanceMetrics } from '../services/doc-layout-executor.service';

const PERFORMANCE_SAMPLE_LIMIT = 2048;

type WorkerTransferMetrics = Omit<IDocLayoutPerformanceMetrics, 'hydrationMs'>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value != null;
}

function getRequest(message: unknown): { method: string; request: Record<string, unknown> } | null {
    if (!isRecord(message) || typeof message.method !== 'string' || !Array.isArray(message.args)) {
        return null;
    }
    const request = message.args[0];
    return isRecord(request) ? { method: message.method, request } : null;
}

function getPublicationResult(message: unknown): Record<string, unknown> | null {
    if (!isRecord(message) || !isRecord(message.data)) {
        return null;
    }
    const result = message.data;
    if (isRecord(result.step)) {
        return result.step;
    }
    return result;
}

function createTransferMetrics(): WorkerTransferMetrics {
    return {
        mutationTransferMs: [],
        patchTransferMs: [],
        snapshotTransferMs: [],
    };
}

export class DocsLayoutWorkerPerformanceTracker {
    private readonly _metrics = new Map<string, WorkerTransferMetrics>();

    recordRequest(message: unknown, durationMs: number): void {
        const requestInfo = getRequest(message);
        const unitId = requestInfo?.request.unitId;
        if (requestInfo == null || typeof unitId !== 'string') {
            return;
        }

        if (requestInfo.method === 'createSession') {
            this._append(unitId, 'snapshotTransferMs', durationMs);
            return;
        }
        if (
            requestInfo.method === 'startLayout' &&
            Array.isArray(requestInfo.request.mutations) &&
            requestInfo.request.mutations.length > 0
        ) {
            this._append(unitId, 'mutationTransferMs', durationMs);
        }
    }

    recordResponse(message: unknown, durationMs: number): void {
        const result = getPublicationResult(message);
        if (
            result == null ||
            typeof result.unitId !== 'string' ||
            result.publication == null
        ) {
            return;
        }
        this._append(result.unitId, 'patchTransferMs', durationMs);
    }

    getMetrics(unitId: string): WorkerTransferMetrics {
        const metrics = this._metrics.get(unitId) ?? createTransferMetrics();
        return {
            mutationTransferMs: [...metrics.mutationTransferMs],
            patchTransferMs: [...metrics.patchTransferMs],
            snapshotTransferMs: [...metrics.snapshotTransferMs],
        };
    }

    reset(unitId: string): void {
        this._metrics.delete(unitId);
    }

    resetAll(): void {
        this._metrics.clear();
    }

    private _append(unitId: string, metric: keyof WorkerTransferMetrics, durationMs: number): void {
        const metrics = this._metrics.get(unitId) ?? createTransferMetrics();
        const samples = metrics[metric];
        samples.push(durationMs);
        if (samples.length > PERFORMANCE_SAMPLE_LIMIT) {
            samples.splice(0, samples.length - PERFORMANCE_SAMPLE_LIMIT);
        }
        this._metrics.set(unitId, metrics);
    }
}
