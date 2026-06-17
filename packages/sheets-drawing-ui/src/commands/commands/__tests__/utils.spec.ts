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

import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { cloneGroupParams, groupToUngroup, ungroupToGroup } from '../utils';

describe('sheets drawing command utils', () => {
    it('restores grouped sheet drawings with bounds calculated from child transforms', () => {
        const grouped = ungroupToGroup([
            {
                parent: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
                },
                children: [
                    {
                        unitId: 'book-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'child-1',
                        transform: { left: 2, top: 3, width: 10, height: 20 },
                    },
                    {
                        unitId: 'book-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'child-2',
                        transform: { left: 20, top: 5, width: 5, height: 5 },
                    },
                ],
            },
        ] as never);

        expect(grouped).toHaveLength(1);
        expect(grouped[0].parent).toMatchObject({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
            transform: {
                left: 2,
                top: 3,
                width: 23,
                height: 20,
            },
        });
        expect(grouped[0].children[0]).toMatchObject({
            drawingId: 'child-1',
            groupId: 'group-1',
            transform: { left: 2, top: 3, width: 10, height: 20 },
        });
        expect(grouped[0].children[1]).toMatchObject({
            drawingId: 'child-2',
            groupId: 'group-1',
        });
    });

    it('ungroups sheet drawings back into standalone transforms in the parent coordinate space', () => {
        const ungrouped = groupToUngroup([
            {
                parent: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    transform: { left: 30, top: 40, width: 80, height: 60 },
                    groupBaseBound: { left: 0, top: 0, width: 80, height: 60 },
                },
                children: [
                    {
                        unitId: 'book-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'child-1',
                        transform: { left: 5, top: 6, width: 7, height: 8 },
                    },
                ],
            },
        ] as never);

        expect(ungrouped).toHaveLength(1);
        expect(ungrouped[0].parent).toEqual({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: { left: 0, top: 0 },
        });
        expect(ungrouped[0].children[0]).toMatchObject({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'child-1',
            transform: {
                left: 35,
                top: 46,
                width: 7,
                height: 8,
            },
            groupId: undefined,
        });
    });

    it('clones nested group ids so pasted groups do not share original drawing ids', () => {
        const result = cloneGroupParams({
            nestedIdRecord: {
                'group-root': {
                    drawingId: 'group-root',
                    children: ['group-child', 'shape-1'],
                },
                'group-child': {
                    drawingId: 'group-child',
                    children: ['shape-2'],
                },
            },
            groups: [
                {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-root',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                },
                {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-child',
                    groupId: 'group-root',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                },
            ],
            flatChildren: [
                {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'shape-1',
                    groupId: 'group-root',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                },
                {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'shape-2',
                    groupId: 'group-child',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                },
            ],
        });

        const clonedRootId = result.idMap.get('group-root');
        const clonedChildGroupId = result.idMap.get('group-child');
        const clonedShapeId = result.idMap.get('shape-1');

        expect(clonedRootId).toBeDefined();
        expect(clonedRootId).not.toBe('group-root');
        expect(clonedChildGroupId).toBeDefined();
        expect(clonedShapeId).toBeDefined();
        const flatChildren = result.cloned.flatChildren!;
        expect(result.cloned.groups).toHaveLength(2);
        expect(flatChildren).toHaveLength(2);
        expect(result.cloned.groups[1].groupId).toBe(clonedRootId);
        expect(flatChildren[0].drawingId).toBe(clonedShapeId);
        expect(flatChildren[0].groupId).toBe(clonedRootId);
        expect(result.cloned.nestedIdRecord[clonedRootId!].children).toContain(clonedChildGroupId);
        expect(result.cloned.nestedIdRecord[clonedRootId!].children).toContain(clonedShapeId);
    });
});
