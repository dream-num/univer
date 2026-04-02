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

import { DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS } from '@univerjs/core';
import { COMPONENT_IMAGE_POPUP_MENU } from '@univerjs/drawing-ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocDrawingPopupMenuController } from '../../menu/drawing-popup-menu.controller';

describe('DocDrawingPopupMenuController', () => {
    it('shows a popup for a single focused drawing and clears focus when the transformer clears', () => {
        const popupDispose = { dispose: vi.fn() };
        const selectedObject = { oKey: 'doc-1#-#doc-1#-#shape-1' };
        const selectedObjects = new Map([['shape-1', selectedObject]]);

        const transformer = {
            createControl$: new Subject<void>(),
            clearControl$: new Subject<void>(),
            changing$: new Subject<void>(),
            changeStart$: new Subject<void>(),
            getSelectedObjectMap: () => selectedObjects,
        };
        const scene = {
            getTransformerByCreate: () => transformer,
            getAllObjects: () => [],
        };

        const docModel = {
            getUnitId: () => 'doc-1',
        };

        const controller = new DocDrawingPopupMenuController(
            {
                getDrawingOKey: vi.fn(() => ({
                    unitId: 'doc-1',
                    subUnitId: 'doc-1',
                    drawingId: 'shape-1',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                })),
                getFocusDrawings: vi.fn(() => []),
                focusDrawing: vi.fn(),
            } as never,
            {
                attachPopupToObject: vi.fn(() => popupDispose),
            } as never,
            {
                has: vi.fn(() => true),
                getRenderById: vi.fn(() => ({ scene })),
                removeRender: vi.fn(),
            } as never,
            {
                getCurrentTypeOfUnit$: () => new BehaviorSubject(docModel as never).asObservable(),
                getTypeOfUnitDisposed$: () => new Subject().asObservable(),
                getAllUnitsForType: () => [docModel],
            } as never,
            {
                setContextValue: vi.fn(),
            } as never
        );
        const controllerRef = controller as any;

        transformer.createControl$.next();

        expect(controllerRef._canvasPopManagerService.attachPopupToObject).toHaveBeenCalledWith(
            selectedObject,
            expect.objectContaining({
                componentKey: COMPONENT_IMAGE_POPUP_MENU,
                extraProps: expect.objectContaining({
                    menuItems: expect.arrayContaining([
                        expect.objectContaining({ label: 'image-popup.delete' }),
                    ]),
                }),
            }),
            'doc-1'
        );
        expect(controllerRef._drawingManagerService.focusDrawing).toHaveBeenCalledWith([{
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingId: 'shape-1',
        }]);

        transformer.changing$.next();
        transformer.changeStart$.next();
        transformer.clearControl$.next();

        expect(popupDispose.dispose).toHaveBeenCalled();
        expect(controllerRef._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, false);
        expect(controllerRef._drawingManagerService.focusDrawing).toHaveBeenLastCalledWith(null);

        controller.dispose();
    });

    it('does not create a popup when multiple drawings are selected', () => {
        const attachPopupToObject = vi.fn();
        const selectedObjects = new Map([
            ['shape-1', { oKey: 'doc-1#-#doc-1#-#shape-1' }],
            ['shape-2', { oKey: 'doc-1#-#doc-1#-#shape-2' }],
        ]);

        const transformer = {
            createControl$: new Subject<void>(),
            clearControl$: new Subject<void>(),
            changing$: new Subject<void>(),
            changeStart$: new Subject<void>(),
            getSelectedObjectMap: () => selectedObjects,
        };

        const controller = new DocDrawingPopupMenuController(
            {
                getDrawingOKey: vi.fn(),
                getFocusDrawings: vi.fn(() => []),
                focusDrawing: vi.fn(),
            } as never,
            {
                attachPopupToObject,
            } as never,
            {
                has: vi.fn(() => true),
                getRenderById: vi.fn(() => ({ scene: { getTransformerByCreate: () => transformer, getAllObjects: () => [] } })),
                removeRender: vi.fn(),
            } as never,
            {
                getCurrentTypeOfUnit$: () => new BehaviorSubject({ getUnitId: () => 'doc-1' } as never).asObservable(),
                getTypeOfUnitDisposed$: () => new Subject().asObservable(),
                getAllUnitsForType: () => [{ getUnitId: () => 'doc-1' }],
            } as never,
            {
                setContextValue: vi.fn(),
            } as never
        );

        transformer.createControl$.next();

        expect(attachPopupToObject).not.toHaveBeenCalled();

        controller.dispose();
    });
});
