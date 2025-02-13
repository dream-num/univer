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

import type { IDrawingSearch, IUniverInstanceService, Nullable, Workbook } from '@univerjs/core';
import type { IDrawingManagerService } from '@univerjs/drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import { UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, Group } from '@univerjs/engine-render';

export function insertGroupObject(objectParam: IDrawingSearch, object: BaseObject, scene: Scene, drawingManagerService: IDrawingManagerService) {
    const groupParam = drawingManagerService.getDrawingByParam(objectParam);
    if (groupParam == null) {
        return;
    }

    const groupKey = getDrawingShapeKeyByDrawingSearch(objectParam);
    const groupObject = scene.getObject(groupKey);

    if (groupObject && !(groupObject instanceof Group)) {
        return;
    }

    if (groupObject != null) {
        groupObject.addObject(object);
        return;
    }

    const group = new Group(groupKey);

    scene.addObject(group, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(group);

    group.addObject(object);

    const { transform } = groupParam;

    transform && group.transformByState(
        {
            left: transform.left,
            top: transform.top,
            angle: transform.angle,
        }
    );
}

export function getCurrentUnitInfo(currentUniverService: IUniverInstanceService, propUnitId?: string) {
    const current = propUnitId ? currentUniverService.getUnit(propUnitId) : currentUniverService.getFocusedUnit();
    if (current == null) {
        return;
    }

    const unitId = current.getUnitId();
    let subUnitId: Nullable<string>;

    if (current.type === UniverInstanceType.UNIVER_SHEET) {
        subUnitId = (current as Workbook).getActiveSheet()?.getSheetId();
    } else if (current.type === UniverInstanceType.UNIVER_DOC) {
        subUnitId = unitId;
    } else if (current.type === UniverInstanceType.UNIVER_SLIDE) {
        subUnitId = unitId;
    }

    return { unitId, subUnitId, current };
}
