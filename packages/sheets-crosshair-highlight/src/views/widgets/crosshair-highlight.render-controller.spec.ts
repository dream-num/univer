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

import type { IRange } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetCrossHairHighlightShape } from './crosshair-highlight-shape';
import { SheetCrosshairHighlightRenderController } from './crosshair-highlight.render-controller';

class TestSheet {
    getRowCount(): number {
        return 20;
    }

    getColumnCount(): number {
        return 10;
    }
}

class TestWorkbook {
    readonly activeSheet$ = new BehaviorSubject(0);
    readonly sheet = new TestSheet();

    getActiveSheet(): TestSheet {
        return this.sheet;
    }
}

class TestScene {
    readonly objects: SheetCrossHairHighlightShape[] = [];
    readonly dirtyRequests: boolean[] = [];

    addObject(object: SheetCrossHairHighlightShape): void {
        this.objects.push(object);
    }

    makeDirty(value: boolean): void {
        this.dirtyRequests.push(value);
    }
}

class TestSkeleton {
    getCellWithCoordByIndex(row: number, column: number) {
        return {
            startX: column * 100,
            startY: row * 20,
            endX: column * 100 + 100,
            endY: row * 20 + 20,
        };
    }
}

class TestSkeletonManagerService {
    readonly skeleton = new TestSkeleton();
    readonly currentSkeleton$ = new BehaviorSubject(this.skeleton);

    getCurrentSkeleton(): TestSkeleton {
        return this.skeleton;
    }
}

class TestSelectionsService {
    readonly selectionMoveStart$ = new Subject<ISelectionWithStyle[]>();
    readonly selectionMoving$ = new Subject<ISelectionWithStyle[]>();
    readonly selectionMoveEnd$ = new Subject<ISelectionWithStyle[]>();
    readonly selectionSet$ = new Subject<ISelectionWithStyle[]>();
    private _selections: ISelectionWithStyle[] = [];

    setSelections(selections: ISelectionWithStyle[]): void {
        this._selections = selections;
        this.selectionSet$.next(selections);
    }

    getCurrentSelections(): ISelectionWithStyle[] {
        return this._selections;
    }
}

class TestCrosshairHighlightService {
    readonly enabled$ = new BehaviorSubject(false);
    readonly highlightColor$ = new BehaviorSubject('rgba(10,20,30,0.6)');
}

class TestContextService {
    readonly refSelectionEnabled$ = new BehaviorSubject(false);

    subscribeContextValue$() {
        return this.refSelectionEnabled$.asObservable();
    }
}

function createSelection(range: IRange): ISelectionWithStyle {
    return { range } as ISelectionWithStyle;
}

function getShapeRects(scene: TestScene) {
    return scene.objects.map((shape) => ({
        left: shape.left,
        top: shape.top,
        width: shape.width,
        height: shape.height,
    }));
}

function getRenderedShapeCount(controller: SheetCrosshairHighlightRenderController): number {
    return (controller as unknown as { _shapes: SheetCrossHairHighlightShape[] })._shapes.length;
}

describe('SheetCrosshairHighlightRenderController', () => {
    it('renders crosshair rectangles from the active normal selection and clears them when disabled', async () => {
        const workbook = new TestWorkbook();
        const scene = new TestScene();
        const skeletonManagerService = new TestSkeletonManagerService();
        const selectionsService = new TestSelectionsService();
        const refSelectionsService = new TestSelectionsService();
        const crosshairHighlightService = new TestCrosshairHighlightService();
        const contextService = new TestContextService();
        selectionsService.setSelections([
            createSelection({
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
            }),
        ]);

        const controller = new SheetCrosshairHighlightRenderController(
            {
                unit: workbook,
                scene,
            } as never,
            skeletonManagerService as never,
            selectionsService as never,
            crosshairHighlightService as never,
            contextService as never,
            refSelectionsService as never
        );

        crosshairHighlightService.enabled$.next(true);

        expect(getRenderedShapeCount(controller)).toBe(4);
        expect(scene.objects.every((object) => object instanceof SheetCrossHairHighlightShape)).toBe(true);
        expect(getShapeRects(scene)).toEqual([
            { left: 0, top: 20, width: 100, height: 20 },
            { left: 200, top: 20, width: 900, height: 20 },
            { left: 100, top: 0, width: 100, height: 20 },
            { left: 100, top: 40, width: 100, height: 380 },
        ]);
        expect(scene.dirtyRequests).toEqual([true]);

        crosshairHighlightService.enabled$.next(false);

        expect(getRenderedShapeCount(controller)).toBe(0);

        await controller.dispose();
    });

    it('switches to reference selections and ignores full-row or full-column selections', async () => {
        const workbook = new TestWorkbook();
        const scene = new TestScene();
        const skeletonManagerService = new TestSkeletonManagerService();
        const selectionsService = new TestSelectionsService();
        const refSelectionsService = new TestSelectionsService();
        const crosshairHighlightService = new TestCrosshairHighlightService();
        const contextService = new TestContextService();

        selectionsService.setSelections([
            createSelection({
                startRow: 2,
                endRow: 2,
                startColumn: 2,
                endColumn: 2,
            }),
        ]);
        refSelectionsService.setSelections([
            createSelection({
                startRow: 0,
                endRow: 19,
                startColumn: 3,
                endColumn: 3,
            }),
            createSelection({
                startRow: 3,
                endRow: 3,
                startColumn: 4,
                endColumn: 4,
            }),
        ]);

        const controller = new SheetCrosshairHighlightRenderController(
            {
                unit: workbook,
                scene,
            } as never,
            skeletonManagerService as never,
            selectionsService as never,
            crosshairHighlightService as never,
            contextService as never,
            refSelectionsService as never
        );

        crosshairHighlightService.enabled$.next(true);
        expect(getShapeRects(scene).slice(-4)).toEqual([
            { left: 0, top: 40, width: 200, height: 20 },
            { left: 300, top: 40, width: 800, height: 20 },
            { left: 200, top: 0, width: 100, height: 40 },
            { left: 200, top: 60, width: 100, height: 360 },
        ]);

        contextService.refSelectionEnabled$.next(true);

        expect(getShapeRects(scene).slice(-4)).toEqual([
            { left: 0, top: 60, width: 400, height: 20 },
            { left: 500, top: 60, width: 600, height: 20 },
            { left: 400, top: 0, width: 100, height: 60 },
            { left: 400, top: 80, width: 100, height: 340 },
        ]);
        expect(getRenderedShapeCount(controller)).toBe(4);

        await controller.dispose();
    });
});
