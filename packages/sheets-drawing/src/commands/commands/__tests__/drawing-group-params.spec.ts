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
import { groupToUngroup, ungroupToGroup } from '../drawing-group-params';

describe('drawing group params', () => {
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
        expect(ungrouped[0].parent).toMatchObject({
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

    it('keeps nested group and child metadata in both directions', () => {
        const parent = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'inner',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            groupId: 'outer',
            transform: { left: 0, top: 0, width: 10, height: 10 },
            groupBaseBound: { left: 0, top: 0, width: 10, height: 10 },
        };
        const child = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'shape-1',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            transform: { left: 1, top: 2, width: 3, height: 4 },
        };

        const [grouped] = ungroupToGroup([{ parent, children: [child] }] as never);
        expect(grouped.parent).toMatchObject({ drawingId: 'inner', groupId: 'outer' });
        expect(grouped.children[0]).toMatchObject({ drawingType: DrawingTypeEnum.DRAWING_SHAPE, groupId: 'inner' });

        const [ungrouped] = groupToUngroup([{ parent, children: [{ ...child, groupId: 'inner' }] }] as never);
        expect(ungrouped.parent).toMatchObject({ drawingId: 'inner', groupId: 'outer' });
        expect(ungrouped.children[0]).toMatchObject({ drawingType: DrawingTypeEnum.DRAWING_SHAPE, groupId: undefined });
    });
});
