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

import type { IDrawingParam } from '@univerjs/core';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import { DrawingTypeEnum, ICommandService, LocaleType, Univer } from '@univerjs/core';
import { DrawingManagerService, getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    CancelDrawingGroupOperation,
    SetDrawingGroupOperation,
} from '../../commands/operations/drawing-group.operation';
import { DrawingGroup } from '../panel/DrawingGroup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'drawing-group-unit';
const subUnitId = 'drawing-group-subunit';

function createDrawing(drawingId: string, left: number, groupId?: string): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        groupId,
        transform: {
            left,
            top: 10,
            width: 20,
            height: 30,
            angle: 0,
        },
    };
}

function createGroup(drawingId: string): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        transform: {
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            angle: 0,
        },
        groupBaseBound: {
            left: 0,
            top: 0,
            width: 100,
            height: 100,
        },
    };
}

class TestRenderManagerService {
    readonly clearControl$ = new Subject<boolean>();
    readonly changeStart$ = new Subject<{ objects: Map<string, unknown> }>();

    getRenderById() {
        return {
            scene: {
                getTransformerByCreate: () => ({
                    clearControl$: this.clearControl$,
                    changeStart$: this.changeStart$,
                }),
            },
        };
    }
}

function clickElement(element: Element): void {
    act(() => {
        element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
}

function getGroupButton(container: HTMLElement, index: number): HTMLButtonElement {
    const button = container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]')[index];
    if (!button) {
        throw new Error(`Group button at index ${index} was not found.`);
    }

    return button;
}

function buttonIsAvailable(container: HTMLElement, index: number): boolean {
    const button = container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]')[index];
    if (!button) {
        return false;
    }

    let current: HTMLElement | null = button;
    while (current && current !== container) {
        if (current.classList.contains('univer-hidden')) {
            return false;
        }

        current = current.parentElement;
    }

    return true;
}

function renderWithRediContext(injector: ReturnType<Univer['__getInjector']>, element: ReactElement) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return { container, root };
}

describe('DrawingGroup behavior', () => {
    let univer: Univer;
    let drawingManagerService: IDrawingManagerService;
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    beforeEach(() => {
        univer = new Univer({ locales: { [LocaleType.ZH_CN]: {} } });
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IconManager]);

        const commandService = injector.get(ICommandService);
        commandService.registerCommand(SetDrawingGroupOperation);
        commandService.registerCommand(CancelDrawingGroupOperation);
        drawingManagerService = injector.get(IDrawingManagerService);
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
        univer.dispose();
    });

    it('emits a group update that links every selected drawing to the new group', () => {
        const drawings = [createDrawing('image-1', 0), createDrawing('image-2', 30)];
        const groupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginGroupUpdate$.subscribe((update) => groupUpdates.push(update));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <DrawingGroup hasGroup drawings={drawings} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(getGroupButton(container, 0));

        expect(groupUpdates).toHaveLength(1);
        const update = groupUpdates[0][0];
        expect(update.parent).toMatchObject({
            unitId,
            subUnitId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: {
                left: 0,
                top: 10,
                width: 50,
                height: 30,
            },
        });
        expect(update.children.map((drawing) => ({
            drawingId: drawing.drawingId,
            groupId: drawing.groupId,
        }))).toEqual([
            { drawingId: 'image-1', groupId: update.parent.drawingId },
            { drawingId: 'image-2', groupId: update.parent.drawingId },
        ]);
    });

    it('emits an ungroup update that detaches every child from the selected group', () => {
        const group = createGroup('group-1');
        const childA = createDrawing('image-1', 0, group.drawingId);
        const childB = createDrawing('image-2', 30, group.drawingId);
        const ungroupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    [group.drawingId]: group,
                    [childA.drawingId]: childA,
                    [childB.drawingId]: childB,
                },
                order: [group.drawingId, childA.drawingId, childB.drawingId],
            },
        });
        drawingManagerService.featurePluginUngroupUpdate$.subscribe((update) => ungroupUpdates.push(update));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <DrawingGroup hasGroup drawings={[group]} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(getGroupButton(container, 1));

        expect(ungroupUpdates).toHaveLength(1);
        const update = ungroupUpdates[0][0];
        expect(update.parent).toBe(group);
        expect(update.children.map((drawing) => ({
            drawingId: drawing.drawingId,
            groupId: drawing.groupId,
        }))).toEqual([
            { drawingId: 'image-1', groupId: undefined },
            { drawingId: 'image-2', groupId: undefined },
        ]);
    });

    it('shows only the group action when the transformer selects multiple ungrouped drawings', () => {
        const drawings = [createDrawing('image-1', 0), createDrawing('image-2', 30)];
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    'image-1': drawings[0],
                    'image-2': drawings[1],
                },
                order: ['image-1', 'image-2'],
            },
        });

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <DrawingGroup hasGroup drawings={drawings} />
        );
        root = rendered.root;
        container = rendered.container;

        const firstKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: 'image-1' });
        const secondKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: 'image-2' });

        act(() => {
            (univer.__getInjector().get(IRenderManagerService) as unknown as TestRenderManagerService)
                .changeStart$
                .next({
                    objects: new Map([
                        [firstKey, { oKey: firstKey, left: 0, top: 10, width: 20, height: 30, angle: 0 }],
                        [secondKey, { oKey: secondKey, left: 30, top: 10, width: 20, height: 30, angle: 0 }],
                    ]),
                });
        });

        expect(buttonIsAvailable(container, 0)).toBe(true);
        expect(buttonIsAvailable(container, 1)).toBe(false);
    });
});
