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

import { RANGE_TYPE } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetCrosshairHighlightRenderController } from './crosshair-highlight.render-controller';

const mockShapes: Array<{ dispose: ReturnType<typeof vi.fn>; props: Record<string, unknown> }> = [];

vi.mock('@univerjs/sheets-ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/sheets-ui')>('@univerjs/sheets-ui');
    return {
        ...actual,
        getCoordByCell: vi.fn((row: number, col: number) => ({
            startX: row * 10 + col,
            startY: row * 5 + col,
            endX: row * 10 + col + 8,
            endY: row * 5 + col + 6,
        })),
    };
});

vi.mock('./crosshair-highlight-shape', () => ({
    SheetCrossHairHighlightShape: class {
        readonly dispose = vi.fn();
        readonly props: Record<string, unknown>;

        constructor(_key: string, props: Record<string, unknown>) {
            this.props = props;
            mockShapes.push(this);
        }
    },
}));

describe('SheetCrosshairHighlightRenderController', () => {
    it('should react to selections, render shapes and clear on disable', async () => {
        mockShapes.length = 0;

        const activeSheet$ = new BehaviorSubject(0);
        const workbook = {
            activeSheet$,
            getActiveSheet: vi.fn(() => ({
                getRowCount: () => 20,
                getColumnCount: () => 10,
            })),
        };
        const scene = {
            addObject: vi.fn(),
            makeDirty: vi.fn(),
        };
        const normalSelection = {
            range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
        };
        const refSelection = {
            range: { startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 },
        };

        const refSelectionEnabled$ = new BehaviorSubject(false);
        const enabled$ = new BehaviorSubject(false);
        const color$ = new BehaviorSubject('rgba(10,20,30,0.6)');
        const skeleton = { a: 1 };
        const currentSkeleton$ = new BehaviorSubject(skeleton);

        const selectionMoveStart$ = new Subject<unknown>();
        const selectionMoving$ = new Subject<unknown>();
        const selectionMoveEnd$ = new Subject<unknown>();
        const selectionSet$ = new Subject<unknown>();
        const refSelectionMoveStart$ = new Subject<unknown>();
        const refSelectionMoving$ = new Subject<unknown>();
        const refSelectionMoveEnd$ = new Subject<unknown>();

        const controller = new SheetCrosshairHighlightRenderController(
            {
                unit: workbook,
                scene,
            } as never,
            {
                currentSkeleton$,
                getCurrentSkeleton: vi.fn(() => skeleton),
            } as never,
            {
                selectionMoveStart$,
                selectionMoving$,
                selectionMoveEnd$,
                selectionSet$,
                getCurrentSelections: vi.fn(() => [normalSelection]),
            } as never,
            {
                enabled$,
                color$,
            } as never,
            {
                subscribeContextValue$: vi.fn(() => refSelectionEnabled$.asObservable()),
            } as never,
            {
                selectionMoveStart$: refSelectionMoveStart$,
                selectionMoving$: refSelectionMoving$,
                selectionMoveEnd$: refSelectionMoveEnd$,
                getCurrentSelections: vi.fn(() => [refSelection]),
            } as never
        );

        const addSelectionSpy = vi.spyOn(controller, 'addSelection');
        const clearSpy = vi.spyOn(controller as never, '_clear');

        enabled$.next(true);
        activeSheet$.next(1);
        expect(addSelectionSpy).toHaveBeenCalled();
        expect(scene.addObject).toHaveBeenCalled();
        expect(scene.makeDirty).toHaveBeenCalledWith(true);

        refSelectionEnabled$.next(true);
        activeSheet$.next(2);
        expect(addSelectionSpy).toHaveBeenCalledWith(refSelection.range, expect.anything());

        enabled$.next(false);
        activeSheet$.next(3);
        expect(clearSpy).toHaveBeenCalled();

        controller.addSelection(
            {
                rangeType: RANGE_TYPE.COLUMN,
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 0,
            } as never,
            workbook.getActiveSheet() as never
        );

        controller.addSelection(
            {
                startRow: 2,
                endRow: 2,
                startColumn: 2,
                endColumn: 2,
            } as never,
            workbook.getActiveSheet() as never
        );

        (controller as unknown as { _transformSelection: (value: unknown, sheet: unknown) => void })._transformSelection(
            null,
            workbook.getActiveSheet()
        );
        (controller as unknown as { _transformSelection: (value: unknown, sheet: unknown) => void })._transformSelection(
            [{
                range: {
                    startRow: 0,
                    endRow: 19,
                    startColumn: 0,
                    endColumn: 0,
                },
            }],
            workbook.getActiveSheet()
        );

        const preShape = { dispose: vi.fn() };
        (controller as unknown as { _shapes: Array<{ dispose: () => void }> })._shapes = [preShape];
        (controller as unknown as { _clear: () => void })._clear();
        expect(preShape.dispose).toHaveBeenCalledTimes(1);

        controller.addSelection(
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            } as never,
            workbook.getActiveSheet() as never
        );

        (controller as unknown as { _sheetSkeletonManagerService: { getCurrentSkeleton: () => unknown } })._sheetSkeletonManagerService.getCurrentSkeleton = () => null;
        controller.render([{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } as never]);
        expect(scene.makeDirty).toHaveBeenCalledWith(true);

        await controller.dispose();
    });
});
