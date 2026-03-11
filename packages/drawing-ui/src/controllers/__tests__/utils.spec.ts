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

import { UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { DrawingGroupObject, Group } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { getCurrentUnitInfo, insertGroupObject } from '../utils';

const { MockGroup } = vi.hoisted(() => {
    class HoistedMockGroup {
        oKey: string;
        private _objects: Array<{ oKey: string }> = [];
        setBaseBound = vi.fn();
        transformByState = vi.fn();

        constructor(oKey: string) {
            this.oKey = oKey;
        }

        getObjects() {
            return this._objects;
        }

        addObject(object: { oKey: string }) {
            this._objects.push(object);
        }
    }

    return {
        MockGroup: HoistedMockGroup,
    };
});

vi.mock('@univerjs/drawing', () => ({
    getDrawingShapeKeyByDrawingSearch: vi.fn(({ drawingId }) => `group-${drawingId}`),
}));

vi.mock('@univerjs/engine-render', () => ({
    DRAWING_OBJECT_LAYER_INDEX: 99,
    Group: MockGroup,
    DrawingGroupObject: MockGroup,
}));

describe('drawing controller utils', () => {
    it('creates a new drawing group, attaches it to the scene, and avoids duplicate children', () => {
        const object = { oKey: 'child-1' };
        const attachTransformerTo = vi.fn();
        const scene = {
            objects: new Map<string, InstanceType<typeof MockGroup> | { oKey: string }>(),
            getObject(key: string) {
                return this.objects.get(key) ?? null;
            },
            addObject(group: InstanceType<typeof MockGroup>) {
                this.objects.set(group.oKey, group);
                return {
                    attachTransformerTo,
                };
            },
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({
                transform: { left: 10, top: 20, width: 30, height: 40, angle: 15 },
                groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
            })),
        };

        insertGroupObject({ drawingId: 'group-1' } as never, object as never, scene as never, drawingManagerService as never);

        const group = scene.getObject('group-group-1') as InstanceType<typeof MockGroup>;
        expect(getDrawingShapeKeyByDrawingSearch).toHaveBeenCalledWith({ drawingId: 'group-1' });
        expect(group).toBeInstanceOf(DrawingGroupObject as unknown as typeof MockGroup);
        expect(group.getObjects()).toEqual([object]);
        expect(group.setBaseBound).toHaveBeenCalledWith({ left: 1, top: 2, width: 3, height: 4 });
        expect(group.transformByState).toHaveBeenCalledWith({ left: 10, top: 20, width: 30, height: 40, angle: 15 });
        expect(attachTransformerTo).toHaveBeenCalledWith(group);

        insertGroupObject({ drawingId: 'group-1' } as never, object as never, scene as never, drawingManagerService as never);
        expect(group.getObjects()).toEqual([object]);
    });

    it('skips invalid group targets and resolves current unit info for sheet, doc, and slide', () => {
        const scene = {
            getObject: vi.fn(() => ({ oKey: 'not-a-group' })),
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({ transform: { left: 0, top: 0, width: 10, height: 10 } })),
        };

        insertGroupObject({ drawingId: 'group-2' } as never, { oKey: 'child-2' } as never, scene as never, drawingManagerService as never);
        expect(scene.getObject).toHaveBeenCalled();

        const sheet = {
            type: UniverInstanceType.UNIVER_SHEET,
            getUnitId: () => 'workbook-1',
            getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
        };
        const doc = {
            type: UniverInstanceType.UNIVER_DOC,
            getUnitId: () => 'doc-1',
        };
        const slide = {
            type: UniverInstanceType.UNIVER_SLIDE,
            getUnitId: () => 'slide-1',
        };
        const currentUniverService = {
            getFocusedUnit: vi.fn()
                .mockReturnValueOnce(sheet)
                .mockReturnValueOnce(doc)
                .mockReturnValueOnce(slide)
                .mockReturnValueOnce(null),
            getUnit: vi.fn(() => sheet),
        };

        expect(getCurrentUnitInfo(currentUniverService as never)).toEqual({
            unitId: 'workbook-1',
            subUnitId: 'sheet-1',
            current: sheet,
        });
        expect(getCurrentUnitInfo(currentUniverService as never)).toEqual({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            current: doc,
        });
        expect(getCurrentUnitInfo(currentUniverService as never)).toEqual({
            unitId: 'slide-1',
            subUnitId: 'slide-1',
            current: slide,
        });
        expect(getCurrentUnitInfo(currentUniverService as never)).toBeUndefined();
        expect(getCurrentUnitInfo(currentUniverService as never, 'workbook-1')).toEqual({
            unitId: 'workbook-1',
            subUnitId: 'sheet-1',
            current: sheet,
        });
        expect(Group).toBeDefined();
    });
});
