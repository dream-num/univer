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

import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { DrawingGroupObject, Group } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { disposeDrawingRenderObject, getCurrentUnitInfo, getDrawingRenderObject, insertGroupObject, syncGroupRotateEnabled } from '../utils';

const { MockGroup } = vi.hoisted(() => {
    class HoistedMockGroup {
        oKey: string;
        transformerConfig?: { rotateEnabled?: boolean };
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

        getObjectIncludeInGroup(key: string) {
            return this._objects.find((obj) => obj.oKey === key) ?? null;
        }
    }

    return {
        MockGroup: HoistedMockGroup,
    };
});

vi.mock('@univerjs/drawing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/drawing')>();

    return {
        ...actual,
        getDrawingShapeKeyByDrawingSearch: vi.fn(({ drawingId }, index?: number) => `group-${drawingId}${index == null ? '' : `-${index}`}`),
    };
});

vi.mock('@univerjs/engine-render', () => ({
    DRAWING_OBJECT_LAYER_INDEX: 99,
    Group: MockGroup,
    DrawingGroupObject: MockGroup,
}));

describe('drawing controller utils', () => {
    it('keeps repeated document groups separate and preserves their page layer and stacking order', () => {
        const scene = {
            objects: new Map<string, InstanceType<typeof MockGroup>>(),
            getObjectIncludeInGroup(key: string) {
                return this.objects.get(key);
            },
            addObject: vi.fn((group: InstanceType<typeof MockGroup>, _layer: number) => {
                scene.objects.set(group.oKey, group);
                return { attachTransformerTo: vi.fn() };
            }),
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transforms: [
                    { left: 20, top: 30, width: 100, height: 40, flipX: true },
                    { left: 20, top: 830, width: 100, height: 40, flipY: true },
                ],
            })),
            getDrawingOrder: vi.fn(() => ['background', 'header']),
            getDrawingsByGroup: vi.fn(() => []),
        };
        for (const index of [0, 1]) {
            insertGroupObject(
                { unitId: 'doc', subUnitId: 'doc', drawingId: 'header' },
                { oKey: `child-${index}`, layer: { zIndex: 7 } } as never,
                scene as never,
                drawingManagerService as never,
                index
            );
        }
        const first = scene.objects.get('group-header-0')!;
        const second = scene.objects.get('group-header-1')!;
        expect(first).not.toBe(second);
        expect(first.getObjects()).toHaveLength(1);
        expect(second.getObjects()).toHaveLength(1);
        expect(first).toMatchObject({ zIndex: 1 });
        expect(scene.addObject).toHaveBeenCalledWith(second, 7);
        expect(first.transformByState).toHaveBeenCalledWith(expect.objectContaining({ top: 30, flipX: true }));
        expect(second.transformByState).toHaveBeenCalledWith(expect.objectContaining({ top: 830, flipY: true }));
    });

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
            getObjectIncludeInGroup(key: string) {
                return this.getObject(key);
            },
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'group-1',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: { left: 10, top: 20, width: 30, height: 40, angle: 15 },
                groupBaseBound: { left: 1, top: 2, width: 3, height: 4 },
            })),
            getDrawingOrder: vi.fn(() => ['background', 'group-1']),
            getDrawingsByGroup: vi.fn(() => []),
        };

        insertGroupObject({ drawingId: 'group-1' } as never, object as never, scene as never, drawingManagerService as never);

        const group = scene.getObject('group-group-1') as InstanceType<typeof MockGroup>;
        expect(getDrawingShapeKeyByDrawingSearch).toHaveBeenCalledWith({ drawingId: 'group-1' }, undefined);
        expect(group).toBeInstanceOf(DrawingGroupObject as unknown as typeof MockGroup);
        expect(group.getObjects()).toEqual([object]);
        expect(group.setBaseBound).toHaveBeenCalledWith({ left: 1, top: 2, width: 3, height: 4 });
        expect(group.transformByState).toHaveBeenCalledWith({ left: 10, top: 20, width: 30, height: 40, angle: 15, flipX: undefined, flipY: undefined });
        expect(attachTransformerTo).toHaveBeenCalledWith(group);

        insertGroupObject({ drawingId: 'group-1' } as never, object as never, scene as never, drawingManagerService as never);
        expect(group.getObjects()).toEqual([object]);

        const nextObject = { oKey: 'child-2' };
        insertGroupObject({ drawingId: 'group-1' } as never, nextObject as never, scene as never, drawingManagerService as never);
        expect(group.getObjects()).toEqual([object, nextObject]);
    });

    it.each([true, false])('inserts nested groups into their parent with Transformer attachment %s', (attachTransformer) => {
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
            getObjectIncludeInGroup(key: string) {
                return this.getObject(key);
            },
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn((param: { drawingId: string }) => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: param.drawingId,
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                groupId: param.drawingId === 'child-group' ? 'parent-group' : undefined,
                transform: { left: 0, top: 0, width: 10, height: 10 },
            })),
            getDrawingOrder: vi.fn(() => ['background', 'group-1']),
            getDrawingsByGroup: vi.fn(() => []),
        };

        insertGroupObject(
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'child-group' },
            object as never,
            scene as never,
            drawingManagerService as never,
            undefined,
            attachTransformer
        );

        const childGroup = scene.getObject('group-child-group') as InstanceType<typeof MockGroup> & { isInGroup?: boolean };
        const parentGroup = scene.getObject('group-parent-group') as InstanceType<typeof MockGroup>;
        expect(childGroup.isInGroup).toBe(true);
        expect(parentGroup.getObjects()).toEqual([childGroup]);
        expect(attachTransformerTo).toHaveBeenCalledTimes(attachTransformer ? 2 : 0);
    });

    it('disables restored group rotation when descendants include an old chart drawing', () => {
        const object = { oKey: 'chart-1' };
        const scene = {
            objects: new Map<string, InstanceType<typeof MockGroup> | { oKey: string }>(),
            getObject(key: string) {
                return this.objects.get(key) ?? null;
            },
            addObject(group: InstanceType<typeof MockGroup>) {
                this.objects.set(group.oKey, group);
                return {
                    attachTransformerTo: vi.fn(),
                };
            },
            getObjectIncludeInGroup(key: string) {
                return this.getObject(key);
            },
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'group-1',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: { left: 10, top: 20, width: 30, height: 40, angle: 30 },
            })),
            getDrawingOrder: vi.fn(() => ['background', 'group-1']),
            getDrawingsByGroup: vi.fn(() => [{
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'chart-1',
                drawingType: DrawingTypeEnum.DRAWING_CHART,
                transform: { left: 10, top: 20, width: 30, height: 40 },
                groupId: 'group-1',
            }]),
        };

        insertGroupObject({ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'group-1' }, object as never, scene as never, drawingManagerService as never);

        const group = scene.getObject('group-group-1') as InstanceType<typeof MockGroup>;
        expect(group.transformerConfig?.rotateEnabled).toBe(false);
        expect(group.transformByState).toHaveBeenCalledWith({ left: 10, top: 20, width: 30, height: 40, angle: 30, flipX: undefined, flipY: undefined });
    });

    it('uses explicit children when synchronizing group rotation state', () => {
        const group = new MockGroup('group-group-1');
        const scene = {
            getObjectIncludeInGroup: vi.fn(() => null),
        };
        const drawingManagerService = {
            getDrawingOrder: vi.fn(() => ['background', 'group-1']),
            getDrawingsByGroup: vi.fn(() => []),
        };

        syncGroupRotateEnabled(group as never, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        }, scene as never, drawingManagerService as never, [{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'chart-1',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
        }]);

        expect(group.transformerConfig?.rotateEnabled).toBe(false);
        expect(drawingManagerService.getDrawingsByGroup).not.toHaveBeenCalled();
    });

    it('skips invalid group targets and resolves current unit info for sheet, doc, and slide', () => {
        const scene = {
            getObject: vi.fn(() => ({ oKey: 'not-a-group' })),
            getObjectIncludeInGroup: vi.fn(() => ({ oKey: 'not-a-group' })),
            addObject: vi.fn(() => ({ attachTransformerTo: vi.fn() })),
        };
        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({ transform: { left: 0, top: 0, width: 10, height: 10 } })),
            getDrawingOrder: vi.fn(() => ['background', 'group-1']),
            getDrawingsByGroup: vi.fn(() => []),
        };

        insertGroupObject({ drawingId: 'group-2' } as never, { oKey: 'child-2' } as never, scene as never, drawingManagerService as never);
        expect(scene.getObjectIncludeInGroup).toHaveBeenCalled();
        expect(scene.addObject).not.toHaveBeenCalled();

        insertGroupObject({ drawingId: 'missing-group' } as never, { oKey: 'child-3' } as never, scene as never, {
            getDrawingByParam: vi.fn(() => null),
            getDrawingOrder: vi.fn(() => ['background', 'group-1']),
            getDrawingsByGroup: vi.fn(() => []),
        } as never);

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

    it('looks up and disposes grouped render objects through grouped scene lookup only', () => {
        const renderObject = { oKey: 'group-child', dispose: vi.fn() };
        const scene = {
            getObject: vi.fn(() => ({ oKey: 'top-level-child' })),
            getObjectIncludeInGroup: vi.fn(() => renderObject),
        };
        const drawingSearch = { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'child-1' };

        expect(getDrawingRenderObject(scene as never, drawingSearch)).toBe(renderObject);
        expect(disposeDrawingRenderObject(scene as never, drawingSearch)).toBe(true);
        expect(renderObject.dispose).toHaveBeenCalledTimes(1);
        expect(scene.getObject).not.toHaveBeenCalled();
    });

    it('disposes every repeated drawing instance including hidden ones', () => {
        const prefix = getDrawingShapeKeyByDrawingSearch({ unitId: 'unit-1', subUnitId: 'doc-1', drawingId: 'footer' });
        const hidden = { oKey: `${prefix}#-#0`, visible: false, dispose: vi.fn() };
        const visible = { oKey: `${prefix}#-#1`, visible: true, dispose: vi.fn() };
        const unrelated = { oKey: `${prefix}-other#-#0`, visible: true, dispose: vi.fn() };
        const scene = { getAllObjects: () => [hidden, visible, unrelated] };
        expect(disposeDrawingRenderObject(scene as never, {
            unitId: 'unit-1',
            subUnitId: 'doc-1',
            drawingId: 'footer',
            isMultiTransform: 1,
        })).toBe(true);
        expect(hidden.dispose).toHaveBeenCalledOnce();
        expect(visible.dispose).toHaveBeenCalledOnce();
        expect(unrelated.dispose).not.toHaveBeenCalled();
    });

    it('does not fall back to top-level scene lookup when grouped lookup misses', () => {
        const scene = {
            getObject: vi.fn(() => ({ oKey: 'top-level-child', dispose: vi.fn() })),
            getObjectIncludeInGroup: vi.fn(() => null),
        };

        expect(getDrawingRenderObject(scene as never, { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'child-1' })).toBeNull();
        expect(disposeDrawingRenderObject(scene as never, { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'child-1' })).toBe(false);
        expect(scene.getObject).not.toHaveBeenCalled();
    });
});
