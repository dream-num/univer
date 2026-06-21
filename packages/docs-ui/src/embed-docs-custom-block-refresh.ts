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

import type { UniverInstanceType } from '@univerjs/core';
import { isSheetLikeDocsCustomBlockChildType } from './embed-host-anchor';

export function collectDocsTableLikeEmbedChildUnitIds(drawings: Record<string, unknown> | undefined): Set<string> {
    const childUnitIds = new Set<string>();

    Object.values(drawings ?? {}).forEach((drawing) => {
        const data = getDrawingData(drawing);
        const childUnitId = typeof data?.childUnitId === 'string' ? data.childUnitId : undefined;
        const childType = typeof data?.childType === 'number' ? data.childType as UniverInstanceType : undefined;
        if (!childUnitId || !isSheetLikeDocsCustomBlockChildType(childType)) {
            return;
        }

        childUnitIds.add(childUnitId);
    });

    return childUnitIds;
}

function getDrawingData(drawing: unknown): Record<string, unknown> | undefined {
    if (!drawing || typeof drawing !== 'object') {
        return undefined;
    }

    const data = (drawing as { data?: unknown }).data;
    return data && typeof data === 'object' ? data as Record<string, unknown> : undefined;
}

export function getCommandUnitId(commandParams: unknown): string | undefined {
    if (!commandParams || typeof commandParams !== 'object') {
        return undefined;
    }

    const params = commandParams as { unitID?: unknown; unitId?: unknown };
    if (typeof params.unitId === 'string') {
        return params.unitId;
    }

    return typeof params.unitID === 'string' ? params.unitID : undefined;
}

export function shouldRefreshDocsCustomBlockSizeForCommand(params: {
    childUnitIds: Set<string>;
    commandParams: unknown;
    hostUnitId: string;
}): boolean {
    const commandUnitId = getCommandUnitId(params.commandParams);
    return Boolean(commandUnitId && commandUnitId !== params.hostUnitId && params.childUnitIds.has(commandUnitId));
}

export interface IDocsCustomBlockSizeRefreshScheduler {
    dispose: () => void;
    schedule: () => void;
}

export function createDocsCustomBlockSizeRefreshScheduler(
    refresh: () => void,
    frameApi: {
        cancelFrame: (handle: number) => void;
        requestFrame: (callback: () => void) => number;
    } = getDefaultFrameApi()
): IDocsCustomBlockSizeRefreshScheduler {
    let pendingFrame: number | undefined;

    return {
        dispose: () => {
            if (pendingFrame == null) {
                return;
            }

            frameApi.cancelFrame(pendingFrame);
            pendingFrame = undefined;
        },
        schedule: () => {
            if (pendingFrame != null) {
                return;
            }

            pendingFrame = frameApi.requestFrame(() => {
                pendingFrame = undefined;
                refresh();
            });
        },
    };
}

function getDefaultFrameApi(): { cancelFrame: (handle: number) => void; requestFrame: (callback: () => void) => number } {
    if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
        return {
            cancelFrame: (handle) => cancelAnimationFrame(handle),
            requestFrame: (callback) => requestAnimationFrame(callback),
        };
    }

    return {
        cancelFrame: (handle) => clearTimeout(handle),
        requestFrame: (callback) => setTimeout(callback, 16) as unknown as number,
    };
}
