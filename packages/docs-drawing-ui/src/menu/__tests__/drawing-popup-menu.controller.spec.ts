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
import { IDocDrawingAdapterService } from '@univerjs/docs-drawing';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { IMenuManagerService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { DocDrawingFloatingToolbarAdapterService } from '../../services/doc-drawing-floating-toolbar-adapter.service';
import { DocDrawingPopupMenuController } from '../drawing-popup-menu.controller';

function createControllerHarness() {
    const unitId = 'doc-1';
    const drawingId = 'drawing-1';
    const injector = new Injector();
    const createControl$ = new Subject<void>();
    const clearControl$ = new Subject<boolean>();
    const changing$ = new Subject<void>();
    const focus$ = new Subject<never[]>();
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
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
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
    injector.add([IContextService, { useValue: new ContextService() }]);
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
    injector.add([DocCanvasPopManagerService, {
        useValue: {
            attachPopupToObject: () => popupDisposable,
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
        injector,
        popupDisposable,
        selectedObjects,
    };
}

describe('DocDrawingPopupMenuController', () => {
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
});
