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

import type { IDrawingGroupNestedIds, IDrawingGroupNestedParam, IDrawingParam } from '@univerjs/core';
import { generateRandomId } from '@univerjs/core';

export interface ICloneGroupResult {
    cloned: IDrawingGroupNestedParam;
    /** Map from original drawingId → new drawingId, for updating connector/line relations */
    idMap: Map<string, string>;
}

// only paste can use this function
export function cloneGroupParams(groupParams: IDrawingGroupNestedParam): ICloneGroupResult {
    const idMap = new Map<string, string>();

    groupParams.flatChildren?.forEach((p) => idMap.set(p.drawingId, generateRandomId(10)));
    groupParams.groups.forEach((p) => idMap.set(p.drawingId, generateRandomId(10)));

    const clonedNestedIdRecord: Record<string, IDrawingGroupNestedIds> = {};
    for (const [oldGroupId, entry] of Object.entries(groupParams.nestedIdRecord)) {
        const newGroupId = idMap.get(oldGroupId) ?? oldGroupId;
        clonedNestedIdRecord[newGroupId] = {
            drawingId: newGroupId,
            children: entry.children?.map((id) => idMap.get(id) ?? id),
        };
    }

    const flatChildren: IDrawingParam[] = [];
    const groups: IDrawingParam[] = [];

    for (const group of groupParams.groups) {
        const groupDrawingId = idMap.get(group.drawingId) ?? group.drawingId;
        const parentGroupId = group.groupId ? idMap.get(group.groupId) ?? group.groupId : undefined;
        groups.push(cloneDrawingParam(group, groupDrawingId, parentGroupId));
    }

    for (const child of groupParams.flatChildren || []) {
        const childDrawingId = idMap.get(child.drawingId) ?? child.drawingId;
        const parentGroupId = child.groupId ? idMap.get(child.groupId) ?? child.groupId : undefined;
        flatChildren.push(cloneDrawingParam(child, childDrawingId, parentGroupId));
    }

    return {
        cloned: {
            nestedIdRecord: clonedNestedIdRecord,
            flatChildren,
            groups,
        },
        idMap,
    };
}

function cloneDrawingParam(param: IDrawingParam, newDrawingId: string, parentGroupId: string | undefined): IDrawingParam {
    const newParam = { ...param };
    if (newDrawingId) {
        newParam.drawingId = newDrawingId;
    }
    if (parentGroupId) {
        newParam.groupId = parentGroupId;
    } else {
        delete newParam.groupId;
    }

    return JSON.parse(JSON.stringify(newParam)) as IDrawingParam;
}
