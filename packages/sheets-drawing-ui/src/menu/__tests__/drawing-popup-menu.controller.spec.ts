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

import { DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, IImageIoService, Injector, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { COMPONENT_IMAGE_POPUP_MENU } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DrawingPopupMenuController } from '../drawing-popup-menu.controller';

describe('DrawingPopupMenuController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows a popup for a single selected drawing, hides it on clear, and reports upload loading state', () => {
        const createControl$ = new Subject<void>();
        const clearControl$ = new Subject<void>();
        const changing$ = new Subject<void>();
        const contextChanged$ = new Subject<Record<string, boolean>>();
        const ioChange$ = new BehaviorSubject(0);
        const popupDispose = { dispose: vi.fn() };
        const selectedObject = { oKey: 'book-1#-#sheet-1#-#drawing-1' };
        const transformer = {
            createControl$,
            clearControl$,
            changing$,
            getSelectedObjectMap: () => new Map([['drawing-1', selectedObject]]),
        };
        const showMessageDispose = { dispose: vi.fn() };
        const injector = new Injector();
        injector.add([LocaleService, { useValue: { t: (key: string) => key } as never }]);
        injector.add([IDrawingManagerService, {
            useValue: {
                getDrawingOKey: vi.fn(() => ({
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'drawing-1',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                })),
            } as never,
        }]);
        injector.add([SheetCanvasPopManagerService, {
            useValue: {
                getFeatureMenu: vi.fn(() => null),
                attachPopupToObject: vi.fn(() => popupDispose),
            } as never,
        }]);
        injector.add([IRenderManagerService, {
            useValue: {
                has: vi.fn(() => true),
                getRenderById: vi.fn(() => ({
                    scene: {
                        getTransformerByCreate: () => transformer,
                        getAllObjectsByOrder: () => [],
                    },
                })),
                removeRender: vi.fn(),
            } as never,
        }]);
        injector.add([IUniverInstanceService, {
            useValue: {
                getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject({ getUnitId: () => 'book-1' }).asObservable()),
                getTypeOfUnitDisposed$: vi.fn(() => EMPTY),
                getAllUnitsForType: vi.fn(() => [{ getUnitId: () => 'book-1' }]),
            } as never,
        }]);
        injector.add([IMessageService, {
            useValue: {
                show: vi.fn(() => showMessageDispose),
            } as never,
        }]);
        injector.add([IContextService, {
            useValue: {
                setContextValue: vi.fn(),
                contextChanged$,
            } as never,
        }]);
        injector.add([IImageIoService, { useValue: { change$: ioChange$.asObservable() } as never }]);
        injector.add([ICommandService, {
            useValue: {
                syncExecuteCommand: vi.fn(),
            } as never,
        }]);

        const controller = injector.createInstance(DrawingPopupMenuController);

        ioChange$.next(2);
        expect(injector.get(IMessageService).show).toHaveBeenCalledWith(expect.objectContaining({
            content: 'uploadLoading.loading: 2',
        }));
        ioChange$.next(0);
        expect(showMessageDispose.dispose).toHaveBeenCalled();

        createControl$.next();
        expect(injector.get(IContextService).setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, true);
        expect(injector.get(SheetCanvasPopManagerService).attachPopupToObject).toHaveBeenCalledWith(
            selectedObject,
            expect.objectContaining({
                componentKey: COMPONENT_IMAGE_POPUP_MENU,
                extraProps: expect.objectContaining({
                    menuItems: expect.arrayContaining([
                        expect.objectContaining({ label: 'image-popup.delete' }),
                    ]),
                }),
            })
        );

        changing$.next();
        clearControl$.next();
        contextChanged$.next({ [FOCUSING_COMMON_DRAWINGS]: false });
        expect(popupDispose.dispose).toHaveBeenCalled();
        expect(injector.get(IContextService).setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, false);
        expect(injector.get(ICommandService).syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, []);

        controller.dispose();
    });

    it('skips popup creation for multi-selection or drawings that disable popup menus', () => {
        const createControl$ = new Subject<void>();
        const injector = new Injector();
        injector.add([LocaleService, { useValue: { t: (key: string) => key } as never }]);
        injector.add([IDrawingManagerService, {
            useValue: {
                getDrawingOKey: vi.fn(() => ({
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'drawing-1',
                    drawingType: DrawingTypeEnum.DRAWING_DOM,
                    data: { disablePopup: true },
                })),
            } as never,
        }]);
        injector.add([SheetCanvasPopManagerService, {
            useValue: {
                getFeatureMenu: vi.fn(() => null),
                attachPopupToObject: vi.fn(),
            } as never,
        }]);
        injector.add([IRenderManagerService, {
            useValue: {
                has: vi.fn(() => true),
                getRenderById: vi.fn(() => ({
                    scene: {
                        getTransformerByCreate: () => ({
                            createControl$,
                            clearControl$: EMPTY,
                            changing$: EMPTY,
                            getSelectedObjectMap: () => new Map([
                                ['drawing-1', { oKey: 'book-1#-#sheet-1#-#drawing-1' }],
                                ['drawing-2', { oKey: 'book-1#-#sheet-1#-#drawing-2' }],
                            ]),
                        }),
                        getAllObjectsByOrder: () => [],
                    },
                })),
                removeRender: vi.fn(),
            } as never,
        }]);
        injector.add([IUniverInstanceService, {
            useValue: {
                getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject({ getUnitId: () => 'book-1' }).asObservable()),
                getTypeOfUnitDisposed$: vi.fn(() => EMPTY),
                getAllUnitsForType: vi.fn(() => [{ getUnitId: () => 'book-1' }]),
            } as never,
        }]);
        injector.add([IMessageService, { useValue: { show: vi.fn() } as never }]);
        injector.add([IContextService, { useValue: { setContextValue: vi.fn(), contextChanged$: EMPTY } as never }]);
        injector.add([IImageIoService, { useValue: { change$: EMPTY } as never }]);
        injector.add([ICommandService, { useValue: { syncExecuteCommand: vi.fn() } as never }]);

        const controller = injector.createInstance(DrawingPopupMenuController);

        createControl$.next();
        expect(injector.get(SheetCanvasPopManagerService).attachPopupToObject).not.toHaveBeenCalled();

        controller.dispose();
    });
});
