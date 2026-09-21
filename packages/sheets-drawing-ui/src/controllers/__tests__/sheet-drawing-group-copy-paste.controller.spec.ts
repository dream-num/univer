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

import type { IDrawingGroupNestedParam, IDrawingParam } from '@univerjs/core';
import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import { DrawingTypeEnum, Injector, ObjectMatrix } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { COPY_TYPE, ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetsDrawingGroupCopyPasteController } from '../sheet-drawing-group-copy-paste.controller';

interface ITestClipboardHook extends ISheetClipboardHook {
    onBeforeCopyFocusedObject: NonNullable<ISheetClipboardHook['onBeforeCopyFocusedObject']>;
    onPasteCells: NonNullable<ISheetClipboardHook['onPasteCells']>;
}

describe('SheetsDrawingGroupCopyPasteController', () => {
    it('runs dependency hooks before the drawing batch and preserves post-drawing hook order', () => {
        let clipboardHook: ISheetClipboardHook | undefined;
        const nested = createNestedGroup();
        const getBatchAddOp = vi.fn((objects: IDrawingParam[]) => ({ redo: 'add', undo: 'remove', objects }));
        const injector = new Injector([
            [ISheetClipboardService, { useValue: {
                addClipboardHook: vi.fn((hook: ISheetClipboardHook) => {
                    clipboardHook = hook;
                    return { dispose: vi.fn() };
                }),
            } }],
            [IRenderManagerService, { useValue: {} }],
            [SheetSkeletonService, { useValue: { getSkeleton: vi.fn(() => createSkeleton()) } }],
            [ISheetDrawingService, { useValue: {
                getFocusDrawings: vi.fn(() => [nested.groups[0]]),
                getBatchAddOp,
            } }],
            [IDrawingManagerService, { useValue: { getDrawingsByGroupNested: vi.fn(() => nested) } }],
            [SheetsDrawingGroupCopyPasteController],
        ]);
        const controller = injector.get(SheetsDrawingGroupCopyPasteController);
        const beforeRegistration = controller.registerFeaturePasteHook(({ cloned }) => {
            const child = cloned.flatChildren![0] as IDrawingParam & { slicerViewId: string };
            child.slicerViewId = 'new-view';
            return { redos: [{ id: 'before-redo', params: {} }], undos: [{ id: 'before-undo', params: {} }] };
        }, { beforeDrawing: true });
        controller.registerFeaturePasteHook(() => ({
            redos: [{ id: 'after-redo', params: {} }],
            undos: [{ id: 'after-undo', params: {} }],
        }));
        const hook = clipboardHook as ITestClipboardHook;
        expect(hook.onBeforeCopyFocusedObject('unit', 'sheet', COPY_TYPE.COPY)).toBe(true);

        const mutations = hook.onPasteCells(
            { unitId: 'unit', subUnitId: 'sheet', range: { rows: [0], cols: [0] } },
            { unitId: 'unit', subUnitId: 'sheet-2', range: { rows: [1], cols: [1] } },
            new ObjectMatrix(),
            { copyId: 'copy', copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations.redos.map(({ id }) => id)).toEqual([
            'before-redo',
            SetDrawingApplyMutation.id,
            'after-redo',
        ]);
        expect(mutations.undos.map(({ id }) => id)).toEqual([
            SetDrawingApplyMutation.id,
            'before-undo',
            'after-undo',
        ]);
        expect(getBatchAddOp.mock.calls[0]?.[0]).toEqual(expect.arrayContaining([
            expect.objectContaining({ drawingType: DrawingTypeEnum.DRAWING_SLICER, slicerViewId: 'new-view' }),
        ]));

        beforeRegistration.dispose();
        controller.dispose();
        injector.dispose();
    });
});

function createSkeleton() {
    return {
        getNoMergeCellWithCoordByIndex: vi.fn((row: number, column: number) => ({
            startX: column * 10,
            endX: column * 10 + 10,
            startY: row * 20,
            endY: row * 20 + 20,
        })),
        getCellIndexAndOffsetByPosition: vi.fn((left: number, top: number) => ({
            column: Math.floor(left / 10),
            row: Math.floor(top / 20),
            columnOffset: left % 10,
            rowOffset: top % 20,
        })),
    };
}

function createNestedGroup(): IDrawingGroupNestedParam {
    const sheetTransform = {
        from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
        to: { row: 5, column: 5, rowOffset: 0, columnOffset: 0 },
    };
    const child = {
        unitId: 'unit',
        subUnitId: 'sheet',
        drawingId: 'slicer',
        drawingType: DrawingTypeEnum.DRAWING_SLICER,
        slicerViewId: 'view',
        groupId: 'group',
        transform: { left: 0, top: 0, width: 100, height: 100 },
        sheetTransform,
        axisAlignSheetTransform: sheetTransform,
    };
    const group = {
        unitId: 'unit',
        subUnitId: 'sheet',
        drawingId: 'group',
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        transform: { left: 10, top: 20, width: 100, height: 100 },
        sheetTransform,
        axisAlignSheetTransform: sheetTransform,
    };
    return {
        nestedIdRecord: { group: { drawingId: 'group', children: ['slicer'] } },
        flatChildren: [child],
        groups: [group],
    };
}
