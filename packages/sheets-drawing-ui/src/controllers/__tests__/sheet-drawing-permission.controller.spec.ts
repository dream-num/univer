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

import { Injector, IPermissionService, IUniverInstanceService, UserManagerService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetDrawingPermissionController } from '../sheet-drawing-permission.controller';

describe('SheetDrawingPermissionController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('removes or reattaches drawing scene objects when sheet view/edit permissions change', async () => {
        const sheet$ = new BehaviorSubject<any>({
            getSheetId: () => 'sheet1',
        });
        const workbook = {
            getUnitId: () => 'test',
            activeSheet$: sheet$.asObservable(),
            getActiveSheet: () => sheet$.value,
        };
        const workbook$ = new BehaviorSubject<any>(workbook);
        const currentUser$ = new BehaviorSubject({ userID: 'user-1' });
        const viewPermission$ = new BehaviorSubject([{ value: false }, { value: false }]);
        const editPermission$ = new BehaviorSubject([{ value: false }, { value: false }]);

        const matchingObject = {
            classType: RENDER_CLASS_TYPE.IMAGE,
            oKey: 'test#-#sheet1#-#drawing-1',
        };
        const nonDrawingObject = {
            classType: 'shape',
            oKey: 'shape-1',
        };
        const transformer = {
            clearSelectedObjects: vi.fn(),
        };
        const scene = {
            getAllObjectsByOrder: vi.fn(() => [matchingObject, nonDrawingObject]),
            removeObject: vi.fn(),
            detachTransformerFrom: vi.fn(),
            attachTransformerTo: vi.fn(),
            getTransformerByCreate: () => transformer,
        };
        const drawingManagerService = {
            setDrawingVisible: vi.fn(),
            setDrawingEditable: vi.fn(),
            getDrawingData: vi.fn(() => ({
                'drawing-1': {
                    drawingId: 'drawing-1',
                },
            })),
            addNotification: vi.fn(),
        };
        const permissionService = {
            composePermission: vi.fn((ids: string[]) => ids.some((id) => /view/i.test(id)) ? viewPermission$.value : editPermission$.value),
            composePermission$: vi.fn((ids: string[]) => (ids.some((id) => /view/i.test(id)) ? viewPermission$ : editPermission$).asObservable()),
        };
        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => workbook$.asObservable()),
            getCurrentUnitForType: vi.fn(() => workbook$.value),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => ({ scene })),
        };

        const injector = new Injector();
        injector.add([IDrawingManagerService, { useValue: drawingManagerService as never }]);
        injector.add([IRenderManagerService, { useValue: renderManagerService as never }]);
        injector.add([IPermissionService, { useValue: permissionService as never }]);
        injector.add([IUniverInstanceService, { useValue: univerInstanceService as never }]);
        injector.add([UserManagerService, { useValue: { currentUser$: currentUser$.asObservable() } as never }]);

        const controller = injector.createInstance(SheetDrawingPermissionController);
        await Promise.resolve();

        expect(drawingManagerService.setDrawingVisible).toHaveBeenCalledWith(false);
        expect(drawingManagerService.setDrawingEditable).toHaveBeenCalledWith(false);
        expect(scene.removeObject).toHaveBeenCalledWith(matchingObject);
        expect(scene.detachTransformerFrom).toHaveBeenCalledWith(matchingObject);
        expect(transformer.clearSelectedObjects).toHaveBeenCalled();

        viewPermission$.next([{ value: true }, { value: true }]);
        editPermission$.next([{ value: true }, { value: true }]);
        await Promise.resolve();

        expect(drawingManagerService.setDrawingVisible).toHaveBeenCalledWith(true);
        expect(drawingManagerService.setDrawingEditable).toHaveBeenCalledWith(true);
        expect(drawingManagerService.addNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);
        expect(scene.attachTransformerTo).toHaveBeenCalledWith(matchingObject);

        controller.dispose();
    });

    it('turns drawing visibility and editability off when workbook or active sheet disappears', async () => {
        const sheet$ = new BehaviorSubject<any>({
            getSheetId: () => 'sheet1',
        });
        const workbook$ = new BehaviorSubject<any>({
            getUnitId: () => 'test',
            activeSheet$: sheet$.asObservable(),
            getActiveSheet: () => sheet$.value,
        });

        const drawingManagerService = {
            setDrawingVisible: vi.fn(),
            setDrawingEditable: vi.fn(),
            getDrawingData: vi.fn(() => ({})),
            addNotification: vi.fn(),
        };

        const injector = new Injector();
        injector.add([IDrawingManagerService, { useValue: drawingManagerService as never }]);
        injector.add([IRenderManagerService, { useValue: { getRenderById: () => ({ scene: { getAllObjectsByOrder: () => [], getTransformerByCreate: () => ({ clearSelectedObjects: vi.fn() }) } }) } as never }]);
        injector.add([IPermissionService, { useValue: { composePermission: () => [{ value: true }, { value: true }], composePermission$: () => new BehaviorSubject([{ value: true }, { value: true }]).asObservable() } as never }]);
        injector.add([IUniverInstanceService, { useValue: { getCurrentTypeOfUnit$: () => workbook$.asObservable(), getCurrentUnitForType: () => workbook$.value } as never }]);
        injector.add([UserManagerService, { useValue: { currentUser$: new BehaviorSubject({ userID: 'user-1' }).asObservable() } as never }]);

        const controller = injector.createInstance(SheetDrawingPermissionController);
        workbook$.next(null);
        sheet$.next(null);
        await Promise.resolve();

        expect(drawingManagerService.setDrawingVisible).toHaveBeenCalledWith(false);
        expect(drawingManagerService.setDrawingEditable).toHaveBeenCalledWith(false);

        controller.dispose();
    });
});
