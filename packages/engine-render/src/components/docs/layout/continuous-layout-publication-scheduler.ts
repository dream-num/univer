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

const CONTINUOUS_PUBLICATION_BLOCK_THRESHOLD = 24;
const CONTINUOUS_PUBLICATION_MAX_WAIT_MS = 250;

/**
 * Batches stable Worker output before the skeleton is copied and serialized.
 * The block threshold avoids repeatedly copying earlier geometry. The time
 * threshold flushes a partial batch when a slow block spans multiple slices.
 * The deadline starts with the first stable block and stays fixed as the batch grows.
 */
export class ContinuousLayoutPublicationScheduler {
    private _firstPendingAt: number | null = null;

    /** Record readiness immediately, before a later block in the same slice can run. */
    markPending(now: number): void {
        this._firstPendingAt ??= now;
    }

    /** Check at layout and backlog boundaries, even when no new block finished. */
    isReady(pendingBlockCount: number, now: number): boolean {
        return pendingBlockCount >= CONTINUOUS_PUBLICATION_BLOCK_THRESHOLD ||
            (this._firstPendingAt != null && now - this._firstPendingAt >= CONTINUOUS_PUBLICATION_MAX_WAIT_MS);
    }

    reset(): void {
        this._firstPendingAt = null;
    }
}
