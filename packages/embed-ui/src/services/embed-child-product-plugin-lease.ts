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

import type { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

export interface IEmbedChildProductCurrentUnitLeaseOptions {
    instanceService: IUniverInstanceService;
    childUnitId: string;
    childType: UniverInstanceType;
    restoreUnitId?: string;
    shouldRestore?: () => boolean;
    /**
     * Product plugin registration may schedule already-started plugin lifecycle work on a short timer.
     * Keep the child current/focused until that lifecycle queue has had a chance to observe it.
     */
    settleDelayMs?: number;
    deferredRestoreDelaysMs?: readonly number[];
}

const DEFAULT_PRODUCT_PLUGIN_SETTLE_DELAY_MS = 16;
const DEFAULT_DEFERRED_RESTORE_DELAYS_MS = [0, 16, 100, 300, 1000] as const;

export async function runWithEmbedChildProductCurrentUnit<T>(
    options: IEmbedChildProductCurrentUnitLeaseOptions,
    runner: () => T | Promise<T>
): Promise<T> {
    const {
        instanceService,
        childUnitId,
        childType,
        restoreUnitId,
        shouldRestore,
        settleDelayMs = DEFAULT_PRODUCT_PLUGIN_SETTLE_DELAY_MS,
        deferredRestoreDelaysMs = restoreUnitId ? DEFAULT_DEFERRED_RESTORE_DELAYS_MS : [],
    } = options;
    const previousCurrentUnit = instanceService.getCurrentUnitOfType(childType);
    const previousFocusedUnitId = instanceService.getFocusedUnit()?.getUnitId() ?? null;
    const restoreFocusUnitId = previousFocusedUnitId ?? restoreUnitId ?? null;

    instanceService.setCurrentUnitForType(childUnitId);
    instanceService.focusUnit(childUnitId);

    const restoreCurrentAndFocus = () => {
        if (shouldRestore && !shouldRestore()) {
            return;
        }

        if (previousCurrentUnit && previousCurrentUnit.getUnitId() !== childUnitId) {
            instanceService.setCurrentUnitForType(previousCurrentUnit.getUnitId());
        }
        if (restoreUnitId) {
            instanceService.setCurrentUnitForType(restoreUnitId);
        }
        instanceService.focusUnit(restoreFocusUnitId);
    };

    try {
        const result = await runner();
        if (settleDelayMs > 0) {
            await wait(settleDelayMs);
        }

        return result;
    } finally {
        restoreCurrentAndFocus();
        scheduleDeferredRestore(restoreCurrentAndFocus, deferredRestoreDelaysMs);
    }
}

function wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function scheduleDeferredRestore(restore: () => void, delays: readonly number[]): void {
    delays.forEach((delay) => {
        globalThis.setTimeout(restore, delay);
    });
}
