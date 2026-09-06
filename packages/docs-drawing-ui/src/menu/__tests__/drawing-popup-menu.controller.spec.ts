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

import type { IDrawingSearch } from '@univerjs/core';
import {
    ContextService,
    DocumentDataModel,
    DrawingTypeEnum,
    ICommandService,
    IContextService,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    PermissionService,
    toDisposable,
} from '@univerjs/core';
import { setDocumentPermissionValue } from '@univerjs/docs';
import { DocDrawingService, IDocDrawingAdapterService, IDocDrawingService, RemoveDocDrawingCommand } from '@univerjs/docs-drawing';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { COMPONENT_IMAGE_POPUP_MENU, OpenImageCropOperation } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { IMenuManagerService, MOBILE_UI_MODE } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { EditDocDrawingOperation } from '../../commands/operations/edit-doc-drawing.operation';
import { DocDrawingFloatingToolbarAdapterService } from '../../services/doc-drawing-floating-toolbar-adapter.service';
import { DocDrawingPopupMenuController } from '../drawing-popup-menu.controller';

function createControllerHarness(drawingType = DrawingTypeEnum.DRAWING_IMAGE) {
    const unitId = 'doc-1';
    const drawingId = 'drawing-1';
    const injector = new Injector();
    const createControl$ = new Subject<void>();
    const clearControl$ = new Subject<boolean>();
    const changing$ = new Subject<void>();
    const focus$ = new Subject<never[]>();
    const remove$ = new Subject<IDrawingSearch[]>();
    const currentDocument$ = new Subject<never>();
    const disposedDocument$ = new Subject<never>();
    const renderCreated$ = new Subject<never>();
    const renderDisposed$ = new Subject<never>();
    const drawingObject = { oKey: drawingId };
    const selectedObjects = new Map([[drawingId, drawingObject]]);
    const popupDisposable = {
        dispose: vi.fn(),
        canDispose: () => false,
    };
    const drawing = {
        unitId,
        subUnitId: unitId,
        drawingId,
        drawingType,
    };
    const documentDataModel = new DocumentDataModel({
        id: unitId,
        body: {
            dataStream: '\b\r\n',
            customBlocks: [{ startIndex: 0, blockId: drawingId }],
        },
    });
    const transformer = {
        createControl$,
        clearControl$,
        changing$,
        getSelectedObjectMap: () => selectedObjects,
        clearSelectedObjects: vi.fn(),
    };
    const scene = {
        getAllObjects: () => [],
        getTransformerByCreate: () => transformer,
    };

    injector.add([ICommandService, {
        useValue: {
            onCommandExecuted: () => toDisposable(() => undefined),
        } as never,
    }]);
    const contextService = new ContextService();
    injector.add([IContextService, { useValue: contextService }]);
    injector.add([IPermissionService, { useClass: PermissionService }]);
    injector.add([IUniverInstanceService, {
        useValue: {
            getAllUnitsForType: () => [documentDataModel],
            getCurrentTypeOfUnit$: () => currentDocument$,
            getTypeOfUnitDisposed$: () => disposedDocument$,
            getUnit: () => documentDataModel,
            getUnitType: () => undefined,
        } as never,
    }]);
    injector.add([IRenderManagerService, {
        useValue: {
            created$: renderCreated$,
            disposed$: renderDisposed$,
            getRenderUnitById: () => ({ scene }),
            has: () => true,
        } as never,
    }]);
    injector.add([IDrawingManagerService, {
        useValue: {
            focus$,
            remove$,
            focusDrawing: vi.fn(),
            getDrawingByParam: () => drawing,
            getDrawingOKey: () => drawing,
            getFocusDrawings: () => [],
        } as never,
    }]);
    injector.add([IDocDrawingAdapterService, {
        useValue: {
            getEditDrawingCommandInfo: () => null,
        } as never,
    }]);
    injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
    const attachPopupToObject = vi.fn(() => popupDisposable);
    injector.add([DocCanvasPopManagerService, {
        useValue: {
            attachPopupToObject,
        } as never,
    }]);
    injector.add([IMenuManagerService, {
        useValue: {
            getFlatMenuByPositionKey: () => [],
        } as never,
    }]);
    injector.add([DocDrawingFloatingToolbarAdapterService]);
    injector.add([DocDrawingPopupMenuController]);

    return {
        clearControl$,
        createControl$,
        contextService,
        injector,
        attachPopupToObject,
        popupDisposable,
        selectedObjects,
        remove$,
        transformer,
    };
}

describe('DocDrawingPopupMenuController', () => {
    it('removes the floating menu and selection handles when its drawing is deleted', () => {
        const { createControl$, injector, popupDisposable, remove$, transformer } = createControllerHarness();
        const controller = injector.get(DocDrawingPopupMenuController);
        try {
            createControl$.next();
            remove$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'another-drawing' }]);
            expect(popupDisposable.dispose).not.toHaveBeenCalled();
            remove$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'drawing-1' }]);
            expect(popupDisposable.dispose).toHaveBeenCalledOnce();
            expect(transformer.clearSelectedObjects).toHaveBeenCalledOnce();
        } finally {
            controller.dispose();
            injector.dispose();
        }
    });
    it('keeps an active popup during refresh and removes it after the selected drawing is deleted', () => {
        const { clearControl$, createControl$, injector, popupDisposable, selectedObjects } = createControllerHarness();
        const controller = injector.get(DocDrawingPopupMenuController);

        try {
            createControl$.next();
            clearControl$.next(false);
            expect(popupDisposable.dispose).not.toHaveBeenCalled();

            selectedObjects.clear();
            clearControl$.next(true);

            expect(popupDisposable.dispose).toHaveBeenCalledOnce();
        } finally {
            controller.dispose();
            injector.dispose();
        }
    });

    it('removes an active popup when document editing is revoked even if drawing focus is empty', () => {
        const { createControl$, injector, popupDisposable } = createControllerHarness();
        const controller = injector.get(DocDrawingPopupMenuController);

        try {
            createControl$.next();
            expect(popupDisposable.dispose).not.toHaveBeenCalled();

            setDocumentPermissionValue(injector.get(IPermissionService), 'doc-1', 'doc-1', UnitAction.Edit, false);

            expect(popupDisposable.dispose).toHaveBeenCalledOnce();
        } finally {
            controller.dispose();
            injector.dispose();
        }
    });

    it('uses the mobile drawing menu for images and charts', () => {
        const imageHarness = createControllerHarness();
        imageHarness.contextService.setContextValue(MOBILE_UI_MODE, true);
        const imageController = imageHarness.injector.get(DocDrawingPopupMenuController);

        try {
            imageHarness.createControl$.next();
            expect(imageHarness.attachPopupToObject).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    componentKey: COMPONENT_IMAGE_POPUP_MENU,
                    extraProps: expect.objectContaining({
                        variant: 'doc-floating-toolbar',
                        menuItems: [
                            expect.objectContaining({ commandId: EditDocDrawingOperation.id }),
                            expect.objectContaining({ commandId: OpenImageCropOperation.id }),
                            expect.objectContaining({ commandId: RemoveDocDrawingCommand.id }),
                        ],
                    }),
                }),
                'doc-1'
            );
        } finally {
            imageController.dispose();
            imageHarness.injector.dispose();
        }

        const chartHarness = createControllerHarness(DrawingTypeEnum.DRAWING_CHART);
        chartHarness.contextService.setContextValue(MOBILE_UI_MODE, true);
        const chartController = chartHarness.injector.get(DocDrawingPopupMenuController);

        try {
            chartHarness.createControl$.next();
            expect(chartHarness.attachPopupToObject).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    componentKey: COMPONENT_IMAGE_POPUP_MENU,
                    extraProps: expect.objectContaining({
                        variant: 'doc-chart-floating-toolbar',
                        menuItems: [
                            expect.objectContaining({ commandId: EditDocDrawingOperation.id, label: 'docs-drawing-ui.image-popup.edit' }),
                            expect.objectContaining({ commandId: RemoveDocDrawingCommand.id }),
                        ],
                    }),
                }),
                'doc-1'
            );
        } finally {
            chartController.dispose();
            chartHarness.injector.dispose();
        }
    });
});
