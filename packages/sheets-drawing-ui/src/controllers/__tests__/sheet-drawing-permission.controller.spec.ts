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

import { ObjectType } from '@univerjs/engine-render';
import { InsertSheetDrawingCommand, SetDrawingArrangeCommand } from '@univerjs/sheets-drawing';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetDrawingPermissionController } from '../sheet-drawing-permission.controller';

function createController() {
    let beforeCommandHandler: ((command: { id: string; params?: unknown }) => void) | undefined;
    const viewPermission$ = new Subject<Array<{ value: boolean }>>();
    const editPermission$ = new Subject<Array<{ value: boolean }>>();
    const activeSheet$ = new BehaviorSubject({ getSheetId: () => 'sheet-1' });
    const workbook = {
        activeSheet$,
        getUnitId: () => 'unit-1',
        getActiveSheet: () => activeSheet$.value,
    };
    const workbook$ = new BehaviorSubject(workbook);
    const drawingObject = { objectType: ObjectType.IMAGE, oKey: 'image-drawing-1' };
    const unrelatedObject = { objectType: ObjectType.IMAGE, oKey: 'image-other' };
    const transformer = { clearSelectedObjects: vi.fn() };
    const scene = {
        getAllObjectsByOrder: vi.fn(() => [drawingObject, unrelatedObject]),
        getTransformerByCreate: vi.fn(() => transformer),
        removeObject: vi.fn(),
        attachTransformerTo: vi.fn(),
        detachTransformerFrom: vi.fn(),
    };
    const sheetDrawingService = {
        setDrawingVisible: vi.fn(),
        setDrawingEditable: vi.fn(),
        getDrawingData: vi.fn(() => ({
            'drawing-1': { drawingId: 'drawing-1' },
        })),
        addNotification: vi.fn(),
    };
    let composePermissionCall = 0;
    const permissionService = {
        composePermission: vi.fn(() => [{ value: true }]),
        composePermission$: vi.fn(() => {
            composePermissionCall += 1;
            return composePermissionCall === 1 ? viewPermission$ : editPermission$;
        }),
    };
    const sheetPermissionCheckController = {
        permissionCheckWithoutRange: vi.fn(() => false),
        blockExecuteWithoutPermission: vi.fn(),
    };

    const controller = new SheetDrawingPermissionController(
        {
            beforeCommandExecuted: vi.fn((handler) => {
                beforeCommandHandler = handler;
                return { dispose: vi.fn() };
            }),
        } as never,
        { t: (key: string) => key } as never,
        { getRenderById: vi.fn(() => ({ scene })) } as never,
        permissionService as never,
        {
            getCurrentTypeOfUnit$: vi.fn(() => workbook$),
            getCurrentUnitOfType: vi.fn(() => workbook),
        } as never,
        { currentUser$: new BehaviorSubject({ userID: 'user-1' }) } as never,
        sheetPermissionCheckController as never,
        sheetDrawingService as never
    );

    return {
        controller,
        viewPermission$,
        editPermission$,
        scene,
        transformer,
        drawingObject,
        unrelatedObject,
        sheetDrawingService,
        beforeCommandHandler: () => beforeCommandHandler,
        sheetPermissionCheckController,
    };
}

describe('SheetDrawingPermissionController', () => {
    it('hides sheet drawings and removes rendered drawing objects when view permission is revoked', () => {
        const { controller, viewPermission$, scene, transformer, drawingObject, unrelatedObject, sheetDrawingService } = createController();

        viewPermission$.next([{ value: false }]);

        expect(sheetDrawingService.setDrawingVisible).toHaveBeenLastCalledWith(false);
        expect(scene.removeObject).toHaveBeenCalledWith(drawingObject);
        expect(scene.removeObject).not.toHaveBeenCalledWith(unrelatedObject);
        expect(transformer.clearSelectedObjects).toHaveBeenCalled();

        viewPermission$.next([{ value: true }]);

        expect(sheetDrawingService.setDrawingVisible).toHaveBeenLastCalledWith(true);
        expect(sheetDrawingService.addNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);

        controller.dispose();
    });

    it('detaches and reattaches transformers when edit permission changes, and blocks protected commands', () => {
        const {
            controller,
            editPermission$,
            scene,
            transformer,
            drawingObject,
            sheetDrawingService,
            beforeCommandHandler,
            sheetPermissionCheckController,
        } = createController();

        editPermission$.next([{ value: false }]);

        expect(sheetDrawingService.setDrawingEditable).toHaveBeenLastCalledWith(false);
        expect(scene.detachTransformerFrom).toHaveBeenCalledWith(drawingObject);
        expect(transformer.clearSelectedObjects).toHaveBeenCalled();

        editPermission$.next([{ value: true }]);

        expect(sheetDrawingService.setDrawingEditable).toHaveBeenLastCalledWith(true);
        expect(scene.attachTransformerTo).toHaveBeenCalledWith(drawingObject);
        expect(sheetDrawingService.addNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);

        beforeCommandHandler()?.({
            id: InsertSheetDrawingCommand.id,
            params: {
                drawings: [{ unitId: 'unit-1', subUnitId: 'sheet-1' }],
            },
        });
        beforeCommandHandler()?.({
            id: SetDrawingArrangeCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
            },
        });

        expect(sheetPermissionCheckController.permissionCheckWithoutRange).toHaveBeenCalledTimes(2);
        expect(sheetPermissionCheckController.blockExecuteWithoutPermission).toHaveBeenCalledWith('sheets-drawing-ui.permission.dialog.editErr');

        controller.dispose();
    });
});
