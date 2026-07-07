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

import type { IDrawingParam, IDrawingSearch, IUniverInstanceService, Nullable, Workbook } from '@univerjs/core';
import type { IDrawingManagerService } from '@univerjs/drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import { UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, DrawingGroupObject, Group } from '@univerjs/engine-render';
import { resolveDrawingUIRotateEnabled } from '../utils/rotate-enabled';

export function getDrawingRenderObject(scene: Scene, drawingSearch: IDrawingSearch): BaseObject | null {
    const key = getDrawingShapeKeyByDrawingSearch(drawingSearch);
    return scene.getObjectIncludeInGroup(key) ?? null;
}

export function disposeDrawingRenderObject(scene: Scene, drawingSearch: IDrawingSearch): boolean {
    const object = getDrawingRenderObject(scene, drawingSearch);

    if (object == null) {
        return false;
    }

    object.dispose();
    return true;
}

function getRenderObjectForDrawing(scene: Scene, drawing: IDrawingParam): BaseObject | null {
    return getDrawingRenderObject(scene, drawing);
}

export function syncGroupRotateEnabled(
    group: Group,
    groupParam: IDrawingParam,
    scene: Scene,
    drawingManagerService: IDrawingManagerService,
    children?: readonly IDrawingParam[]
): void {
    const rotateEnabled = resolveDrawingUIRotateEnabled(groupParam, {
        getChildren: (drawing) => {
            if (children && drawing.drawingId === groupParam.drawingId && drawing.unitId === groupParam.unitId && drawing.subUnitId === groupParam.subUnitId) {
                return children;
            }

            return drawingManagerService.getDrawingsByGroup(drawing);
        },
        getRenderObject: (drawing) => getRenderObjectForDrawing(scene, drawing),
    });
    group.transformerConfig = {
        ...group.transformerConfig,
        rotateEnabled,
    };
}

export function insertGroupObject(objectParam: IDrawingSearch, object: BaseObject, scene: Scene, drawingManagerService: IDrawingManagerService) {
    const groupParam = drawingManagerService.getDrawingByParam(objectParam);
    if (groupParam == null) {
        return;
    }

    const groupKey = getDrawingShapeKeyByDrawingSearch(objectParam);
    const groupObject = scene.getObjectIncludeInGroup(groupKey);

    if (groupObject && !(groupObject instanceof Group)) {
        return;
    }

    if (groupObject != null) {
        const objects = groupObject.getObjects();
        for (const obj of objects) {
            if (obj.oKey === object.oKey) {
                return;
            }
        }
        groupObject.addObject(object);
        syncGroupRotateEnabled(groupObject, groupParam, scene, drawingManagerService);
        return;
    }

    const group = new DrawingGroupObject(groupKey);

    scene.addObject(group, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(group);

    group.addObject(object);
    syncGroupRotateEnabled(group, groupParam, scene, drawingManagerService);

    const { transform, groupBaseBound } = groupParam;

    if (groupBaseBound) {
        group.setBaseBound(groupBaseBound);
    }

    if (groupParam.groupId) {
        group.isInGroup = true;
        insertGroupObject(
            { drawingId: groupParam.groupId, unitId: objectParam.unitId, subUnitId: objectParam.subUnitId },
            group,
            scene,
            drawingManagerService
        );
    }

    transform && group.transformByState(
        {
            left: transform.left,
            top: transform.top,
            angle: transform.angle,
            width: transform.width,
            height: transform.height,
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
