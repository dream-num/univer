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
import { IMessageService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingPopupMenuController } from '../drawing-popup-menu.controller';

describe('DrawingPopupMenuController', () => {
    it.each([
        { drawingType: DrawingTypeEnum.DRAWING_IMAGE, label: 'image' },
        { drawingType: DrawingTypeEnum.DRAWING_DOM, label: 'Float DOM' },
    ])('constrains the $label popup to the canvas and places it on the left in RTL', ({ drawingType }) => {
        const injector = new Injector();
        const createControl$ = new Subject<void>();
        const clearControl$ = new Subject<void>();
        const changing$ = new Subject<void>();
        const contextChanged$ = new Subject<Record<string, boolean>>();
        const imageIoChange$ = new Subject<number>();
        const currentWorkbook$ = new Subject<never>();
        const disposedWorkbook$ = new Subject<never>();
        const imageObject = { oKey: 'image-1' };
        const attachPopupToObject = vi.fn(() => ({
            dispose: vi.fn(),
            canDispose: () => true,
        }));

        injector.add([LocaleService]);
        injector.add([IDrawingManagerService, {
            useValue: {
                getDrawingOKey: () => ({
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    drawingId: 'image-1',
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
                            getSelectedObjectMap: () => new Map([['image-1', imageObject]]),
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
        injector.add([IContextService, {
            useValue: {
                contextChanged$,
                setContextValue: vi.fn(),
            } as never,
        }]);
        injector.add([IImageIoService, { useValue: { change$: imageIoChange$ } as never }]);
        injector.add([ICommandService, { useValue: { syncExecuteCommand: vi.fn() } as never }]);
        injector.add([DrawingPopupMenuController]);

        injector.get(LocaleService).setDirection('rtl');
        const controller = injector.get(DrawingPopupMenuController);
        createControl$.next();

        expect(attachPopupToObject).toHaveBeenCalledWith(
            imageObject,
            expect.objectContaining({
                constrainToCanvas: true,
                direction: 'left',
            })
        );

        controller.dispose();
        injector.dispose();
    });
});
