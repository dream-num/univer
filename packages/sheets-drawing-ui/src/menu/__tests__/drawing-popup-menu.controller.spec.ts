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
    DrawingTypeEnum,
    ICommandService,
    IContextService,
    IImageIoService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    toDisposable,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService, IMenuManagerService, IMessageService, MenuItemType } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingPopupMenuController } from '../drawing-popup-menu.controller';

function createControllerHarness(initialDrawingType: DrawingTypeEnum) {
    const injector = new Injector();
    const createControl$ = new Subject<void>();
    const clearControl$ = new Subject<void>();
    const changing$ = new Subject<void>();
    const imageIoChange$ = new Subject<number>();
    const currentWorkbook$ = new Subject<never>();
    const disposedWorkbook$ = new Subject<never>();
    const dialogs$ = new Subject<never>();
    const drawingObject = { oKey: 'drawing-1' };
    const popupDisposable = {
        dispose: vi.fn(),
        canDispose: () => true,
    };
    let drawingType = initialDrawingType;
    let attachedPopup: { extraProps?: Record<string, unknown> } | undefined;
    const attachPopupToObject = vi.fn((_targetObject: unknown, popup: { extraProps?: Record<string, unknown> }) => {
        attachedPopup = popup;
        return popupDisposable;
    });

    injector.add([LocaleService]);
    injector.add([IDialogService, {
        useValue: {
            open: () => toDisposable(() => undefined),
            close: () => undefined,
            closeAll: () => undefined,
            getDialogs$: () => dialogs$,
        },
    }]);
    injector.add([IDrawingManagerService, {
        useValue: {
            getDrawingOKey: () => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'drawing-1',
                drawingType,
            }),
        } as never,
    }]);
    injector.add([SheetCanvasPopManagerService, {
        useValue: {
            attachPopupToObject,
            getFeatureMenu: () => undefined,
        } as never,
    }]);
    injector.add([IRenderManagerService, {
        useValue: {
            has: () => true,
            getRenderUnitById: () => ({
                scene: {
                    getAllObjectsByOrder: () => [],
                    getTransformerByCreate: () => ({
                        createControl$,
                        clearControl$,
                        changing$,
                        getSelectedObjectMap: () => new Map([['drawing-1', drawingObject]]),
                    }),
                },
            }),
        } as never,
    }]);
    injector.add([IUniverInstanceService, {
        useValue: {
            getCurrentTypeOfUnit$: () => currentWorkbook$,
            getTypeOfUnitDisposed$: () => disposedWorkbook$,
            getAllUnitsForType: () => [{ getUnitId: () => 'unit-1' }],
        } as never,
    }]);
    injector.add([IMessageService, { useValue: { show: () => toDisposable(() => {}) } as never }]);
    injector.add([IMenuManagerService, {
        useValue: {
            getFlatMenuByPositionKey: () => [{
                key: 'add-comment',
                order: 0,
                item: {
                    id: 'sheet.operation.add-drawing-comment',
                    type: MenuItemType.BUTTON,
                    title: 'sheets-thread-comment-ui.menu.addComment',
                },
            }],
        } as never,
    }]);
    injector.add([IContextService, { useValue: new ContextService() }]);
    injector.add([IImageIoService, { useValue: { change$: imageIoChange$ } as never }]);
    injector.add([ICommandService, { useValue: { syncExecuteCommand: vi.fn() } as never }]);
    injector.add([DrawingPopupMenuController]);

    return {
        attachPopupToObject,
        createControl$,
        drawingObject,
        getAttachedPopup: () => attachedPopup,
        injector,
        popupDisposable,
        setDrawingType: (nextDrawingType: DrawingTypeEnum) => {
            drawingType = nextDrawingType;
        },
    };
}

describe('DrawingPopupMenuController', () => {
    it.each([
        { drawingType: DrawingTypeEnum.DRAWING_IMAGE, label: 'image' },
        { drawingType: DrawingTypeEnum.DRAWING_DOM, label: 'Float DOM' },
    ])('constrains the $label popup to the canvas and places it on the left in RTL', ({ drawingType }) => {
        const { attachPopupToObject, createControl$, drawingObject, getAttachedPopup, injector } = createControllerHarness(drawingType);
        injector.get(LocaleService).setDirection('rtl');
        const controller = injector.get(DrawingPopupMenuController);
        createControl$.next();

        expect(attachPopupToObject).toHaveBeenCalledWith(
            drawingObject,
            expect.objectContaining({
                constrainToCanvas: true,
                direction: 'left',
            })
        );
        expect(getAttachedPopup()?.extraProps?.menuItems).toEqual(expect.arrayContaining([
            expect.objectContaining({
                commandId: 'sheet.operation.add-drawing-comment',
                label: 'sheets-thread-comment-ui.menu.addComment',
            }),
        ]));

        controller.dispose();
        injector.dispose();
    });

    it('removes a chart popup when focus moves to a shape', () => {
        const {
            attachPopupToObject,
            createControl$,
            injector,
            popupDisposable,
            setDrawingType,
        } = createControllerHarness(DrawingTypeEnum.DRAWING_CHART);
        const controller = injector.get(DrawingPopupMenuController);
        createControl$.next();

        setDrawingType(DrawingTypeEnum.DRAWING_SHAPE);
        createControl$.next();

        expect(popupDisposable.dispose).toHaveBeenCalledOnce();
        expect(attachPopupToObject).toHaveBeenCalledOnce();

        controller.dispose();
        injector.dispose();
    });
});
