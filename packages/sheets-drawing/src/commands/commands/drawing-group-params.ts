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

import type { IAccessor, IDrawingParam, Nullable, Workbook } from '@univerjs/core';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import { DrawingTypeEnum, IUniverInstanceService, SheetTypes, UniverInstanceType } from '@univerjs/core';
import { getGroupState, transformObjectOutOfGroup } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { transformToAxisAlignPosition } from '../../basics/transform-position';
import { applySheetDrawingPlacement, getSheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';

/**
 * Derives the cell markers of a drawing that is top-level after the command.
 * Absolute drawings, and every drawing on a Chart Sheet, keep None placement.
 * Returns null when a grid worksheet cannot be laid out.
 */
export function anchorTopLevelDrawing(accessor: IAccessor, drawing: IDrawingParam): Nullable<IDrawingParam> {
    const { unitId, subUnitId } = drawing;
    const worksheet = accessor.get(IUniverInstanceService)
        .getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
        ?.getSheetBySheetId(subUnitId);
    if (!worksheet) return null;

    // Group update params may carry a partial transform or omit the anchor
    // type; both fall back to the stored drawing.
    const stored = accessor.get(ISheetDrawingService).getDrawingByParam(drawing);
    const transform = { ...stored?.transform, ...drawing.transform };
    const anchorType = (drawing as Partial<ISheetDrawing>).anchorType ?? stored?.anchorType;

    if (worksheet.getConfig().type === SheetTypes.CHART || anchorType === SheetDrawingAnchorType.None) {
        const absolute = { ...drawing, transform, anchorType: SheetDrawingAnchorType.None } as ISheetDrawing;
        return applySheetDrawingPlacement(absolute, getSheetDrawingPlacement(absolute));
    }

    const skeleton = accessor.get(SheetSkeletonService).ensureSkeleton(unitId, subUnitId);
    if (!skeleton) return null;

    return { ...drawing, transform, axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton) } as IDrawingParam;
}

export function ungroupToGroup(ungroupParams: IDrawingGroupUpdateParam[]) {
    const newGroupParams: IDrawingGroupUpdateParam[] = [];

    ungroupParams.forEach((ungroupParam) => {
        const { parent, children } = ungroupParam;
        const { drawingId: groupId } = parent;
        const groupTransform = getGroupState(0, 0, children.map((o) => o.transform || {}));

        const newChildren = children.map((drawing) => {
            const transform = drawing.transform || { left: 0, top: 0 };
            return {
                ...drawing,
                transform: {
                    ...transform,
                    left: transform.left!,
                    top: transform.top!,
                },
                groupId,
            };
        }) as IDrawingParam[];

        const groupParam = {
            ...parent,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            groupBaseBound: { ...parent.groupBaseBound },
            transform: groupTransform,
        } as IDrawingParam;

        newGroupParams.push({
            parent: groupParam,
            children: newChildren,
        });
    });

    return newGroupParams;
}

export function groupToUngroup(groupParams: IDrawingGroupUpdateParam[]) {
    const newGroupParams: IDrawingGroupUpdateParam[] = [];

    groupParams.forEach((groupParam) => {
        const { parent, children } = groupParam;
        const { transform: groupTransform = { width: 0, height: 0 } } = parent;
        if (groupTransform == null) {
            return;
        }
        const newChildren = children.map((object) => {
            const { transform } = object;
            const newTransform = transformObjectOutOfGroup(transform || {}, groupTransform, groupTransform.width || 0, groupTransform.height || 0, parent.groupBaseBound);
            return {
                ...object,
                transform: newTransform,
                groupId: undefined,
            };
        }) as IDrawingParam[];

        const ungroupParam = {
            ...parent,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: {
                left: 0,
                top: 0,
            },
        } as IDrawingParam;

        newGroupParams.push({
            parent: ungroupParam,
            children: newChildren,
        });
    });

    return newGroupParams;
}
