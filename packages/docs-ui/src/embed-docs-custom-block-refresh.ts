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
import { isSheetLikeDocsCustomBlockChildType } from '@univerjs/docs';

export function collectDocsTableLikeEmbedChildUnitIds(
    drawings: Record<string, unknown> | undefined,
    resolveChildUnitId?: (data: Record<string, unknown>) => string | undefined
): Set<string> {
    const childUnitIds = new Set<string>();

    Object.values(drawings ?? {}).forEach((drawing) => {
        const data = getDrawingData(drawing);
        const childUnitId = data
            ? resolveChildUnitId?.(data) ?? (typeof data.childUnitId === 'string' ? data.childUnitId : undefined)
            : undefined;
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
    commandId?: string;
    childUnitIds: Set<string>;
    commandParams: unknown;
    hostUnitId: string;
}): boolean {
    if (params.commandId && isDocsCustomBlockLayoutNeutralCommand(params.commandId)) {
        return false;
    }

    const commandUnitId = getCommandUnitId(params.commandParams);
    return Boolean(commandUnitId && commandUnitId !== params.hostUnitId && params.childUnitIds.has(commandUnitId));
}

const DOCS_CUSTOM_BLOCK_LAYOUT_NEUTRAL_COMMAND_IDS = new Set([
    'sheet.command.expand-selection',
    'sheet.command.move-selection',
    'sheet.operation.scroll-to-cell',
    'sheet.operation.scroll-to-range',
    'sheet.operation.set-activate-cell-edit',
    'sheet.operation.set-cell-edit-visible',
    'sheet.operation.set-cell-edit-visible-arrow',
    'sheet.operation.set-cell-edit-visible-f2',
    'sheet.operation.set-format-painter',
    'sheet.operation.set-scroll',
    'sheet.operation.set-selections',
    'sheet.operation.set-zoom-ratio',
]);

function isDocsCustomBlockLayoutNeutralCommand(commandId: string): boolean {
    return DOCS_CUSTOM_BLOCK_LAYOUT_NEUTRAL_COMMAND_IDS.has(commandId);
}

export interface IDocsCustomBlockSizeRefreshScheduler {
    dispose: () => void;
    schedule: () => void;
}

export function createDocsCustomBlockSizeRefreshScheduler(
    refresh: () => void
): IDocsCustomBlockSizeRefreshScheduler {
    let pendingFrame: number | undefined;

    return {
        dispose: () => {
            if (pendingFrame == null) {
                return;
            }

            window.cancelAnimationFrame(pendingFrame);
            pendingFrame = undefined;
        },
        schedule: () => {
            if (pendingFrame != null) {
                return;
            }

            pendingFrame = window.requestAnimationFrame(() => {
                pendingFrame = undefined;
                refresh();
            });
        },
    };
}
