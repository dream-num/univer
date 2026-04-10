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
    getGroupState: vi.fn(() => ({ left: 10, top: 20, width: 100, height: 50 })),
    transformObjectOutOfGroup: vi.fn((transform, groupTransform) => ({
        left: (transform.left ?? 0) + (groupTransform.left ?? 0),
        top: (transform.top ?? 0) + (groupTransform.top ?? 0),
        width: transform.width,
        height: transform.height,
    })),
}));

describe('docs drawing command utils', () => {
    it('rebuilds group metadata from ungrouped drawings', () => {
        expect(ungroupToGroup([
            {
                parent: { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'group-1' },
                children: [
                    { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'child-1', transform: { left: 2, top: 3 } },
                    { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'child-2', transform: { left: 4, top: 5 } },
                ],
            },
        ] as never)).toEqual([
            {
                parent: {
                    unitId: 'doc-1',
                    subUnitId: 'doc-1',
                    drawingId: 'group-1',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                    transform: { left: 10, top: 20, width: 100, height: 50 },
                    groupBaseBound: { left: 10, top: 20, width: 100, height: 50 },
                },
                children: [
                    { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'child-1', transform: { left: 2, top: 3 }, groupId: 'group-1' },
                    { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'child-2', transform: { left: 4, top: 5 }, groupId: 'group-1' },
                ],
            },
        ]);
    });

    it('projects grouped children back out of the group transform', () => {
        expect(groupToUngroup([
            {
                parent: {
                    unitId: 'doc-1',
                    subUnitId: 'doc-1',
                    drawingId: 'group-1',
                    transform: { left: 10, top: 20, width: 100, height: 50 },
                    groupBaseBound: { left: 10, top: 20, width: 100, height: 50 },
                },
                children: [
                    { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'child-1', transform: { left: 2, top: 3, width: 4, height: 5 } },
                ],
            },
        ] as never)).toEqual([
            {
                parent: {
                    unitId: 'doc-1',
                    subUnitId: 'doc-1',
                    drawingId: 'group-1',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                    transform: { left: 0, top: 0 },
                },
                children: [
                    {
                        unitId: 'doc-1',
                        subUnitId: 'doc-1',
                        drawingId: 'child-1',
                        transform: { left: 12, top: 23, width: 4, height: 5 },
                        groupId: undefined,
                    },
                ],
            },
        ]);
    });
});
