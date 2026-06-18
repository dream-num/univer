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
    return commandParams && typeof commandParams === 'object' && typeof (commandParams as { unitId?: unknown }).unitId === 'string'
        ? (commandParams as { unitId: string }).unitId
        : undefined;
}

export function shouldRefreshDocsCustomBlockSizeForCommand(params: {
    childUnitIds: Set<string>;
    commandParams: unknown;
    hostUnitId: string;
}): boolean {
    const commandUnitId = getCommandUnitId(params.commandParams);
    return Boolean(commandUnitId && commandUnitId !== params.hostUnitId && params.childUnitIds.has(commandUnitId));
}
