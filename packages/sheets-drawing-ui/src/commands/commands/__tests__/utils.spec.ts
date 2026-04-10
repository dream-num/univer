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
import { describe, expect, it, vi } from 'vitest';
import { groupToUngroup, ungroupToGroup } from '../utils';

vi.mock('@univerjs/engine-render', () => ({
    getGroupState: vi.fn(() => ({ left: 30, top: 40, width: 80, height: 60 })),
    transformObjectOutOfGroup: vi.fn((transform, groupTransform) => ({
        left: (transform.left ?? 0) + (groupTransform.left ?? 0),
        top: (transform.top ?? 0) + (groupTransform.top ?? 0),
        width: transform.width,
        height: transform.height,
    })),
}));

describe('sheets drawing command utils', () => {
    it('restores grouped sheet drawings with the original base bound', () => {
        expect(ungroupToGroup([
            {
                parent: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
                },
                children: [
                    { unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'child-1', transform: { left: 2, top: 3 } },
                ],
            },
        ] as never)).toEqual([
            {
                parent: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                    groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
                    transform: { left: 30, top: 40, width: 80, height: 60 },
                },
                children: [
                    {
                        unitId: 'book-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'child-1',
                        transform: { left: 2, top: 3 },
                        groupId: 'group-1',
                    },
                ],
            },
        ]);
    });

    it('ungroups sheet drawings back into standalone transforms', () => {
        expect(groupToUngroup([
            {
                parent: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    transform: { left: 30, top: 40, width: 80, height: 60 },
                    groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
                },
                children: [
                    { unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'child-1', transform: { left: 5, top: 6, width: 7, height: 8 } },
                ],
            },
        ] as never)).toEqual([
            {
                parent: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                    transform: { left: 0, top: 0 },
                },
                children: [
                    {
                        unitId: 'book-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'child-1',
                        transform: { left: 35, top: 46, width: 7, height: 8 },
                        groupId: undefined,
                    },
                ],
            },
        ]);
    });
});
