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

import type { IWorkbookData } from '@univerjs/core';
import type { ILayoutService } from '@univerjs/ui';
import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleType,
    toDisposable,
    UniverInstanceService,
} from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetLoadingRenderService } from '../sheet-loading-render.service';

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const original = await importOriginal<typeof import('@univerjs/engine-render')>();

    class MockScene {
        disableObjectsEvent = vi.fn();
        makeDirty = vi.fn();
        dispose = vi.fn();
    }

    class MockEngine {
        private readonly _canvasElement = document.createElement('canvas');

        getCanvas() {
            return {
                setId: (id: string) => { this._canvasElement.id = id; },
                getCanvasEle: () => this._canvasElement,
            };
        }

        mount(element: HTMLElement) {
            element.append(this._canvasElement);
        }

        dispose() {
            this._canvasElement.remove();
        }
    }

    class MockRenderUnit {
        readonly components = new Map();
        readonly mainComponent = null;
        readonly engine: MockEngine;
        readonly scene: MockScene;
        private readonly _skeletonManager = {
            setCurrent: vi.fn(),
            makeDirty: vi.fn(),
            reCalculate: vi.fn(),
        };

        constructor(options: { engine: MockEngine; scene: MockScene }) {
            this.engine = options.engine;
            this.scene = options.scene;
        }

        addRenderDependencies() { }

        with() {
            return this._skeletonManager;
        }

        dispose() { }
    }

    return {
        ...original,
        Engine: MockEngine,
        RenderUnit: MockRenderUnit,
        Scene: MockScene,
    };
});

describe('SheetLoadingRenderService', () => {
    it('renders intercepted display values without owning the global workbook or pointer events', () => {
        const contentElement = document.createElement('div');
        contentElement.style.pointerEvents = 'auto';
        vi.spyOn(contentElement, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 640, 480));

        const layoutService: ILayoutService = {
            isFocused: false,
            rootContainerElement: null,
            focus() { },
            registerFocusHandler: () => toDisposable(() => {}),
            registerRootContainerElement: () => toDisposable(() => {}),
            registerContentElement: () => toDisposable(() => {}),
            registerContainerElement: () => toDisposable(() => {}),
            getContentElement: () => contentElement,
            checkElementInCurrentContainers: () => false,
            checkContentIsFocused: () => false,
        };
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([SheetInterceptorService]);
        const interceptorService = injector.get(SheetInterceptorService);
        const displayInterceptor = vi.fn((cell, context, next) => next({ ...cell, v: '1,234' }));
        interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
            handler: displayInterceptor,
        });

        const service = new SheetLoadingRenderService(injector, layoutService, interceptorService);
        const workbookData = {
            id: 'unit-1',
            name: 'Workbook',
            appVersion: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    cellData: {},
                },
            },
            resources: [],
        } satisfies IWorkbookData;

        service.show(workbookData, 'sheet-1', { 2: { 3: { v: 1234 } } });

        const previewWorkbook = service.workbook$.value;
        expect(contentElement.style.pointerEvents).toBe('auto');
        expect(contentElement.querySelector('canvas')?.style.pointerEvents).toBe('none');
        expect(previewWorkbook?.getSheetBySheetId('sheet-1')?.getCellRaw(2, 3)?.v).toBe('1,234');
        expect(displayInterceptor).toHaveBeenCalledWith(
            { v: 1234 },
            expect.objectContaining({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                workbook: previewWorkbook,
                row: 2,
                col: 3,
                rawData: { v: 1234 },
            }),
            expect.any(Function)
        );

        service.hide('unit-1');

        expect(service.loading$.value).toBe(false);
        expect(contentElement.querySelector('canvas')).toBeNull();
        service.dispose();
    });
});
