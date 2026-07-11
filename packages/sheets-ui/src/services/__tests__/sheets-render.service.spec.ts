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
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService, Spreadsheet } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsRenderService } from '../sheets-render.service';

function createService(): SheetsRenderService {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ThemeService]);
    injector.add([SheetsRenderService]);
    return injector.get(SheetsRenderService);
}

function createWorkbook(unitId: string) {
    return {
        getUnitId: () => unitId,
    };
}

function createLifecycleService() {
    const added$ = new Subject<{ unit: ReturnType<typeof createWorkbook>; options?: Record<string, unknown> }>();
    const disposed$ = new Subject<ReturnType<typeof createWorkbook>>();
    const rawFormula$ = new BehaviorSubject(false);
    const initialWorkbook = createWorkbook('book-1');
    const created$ = new Subject<unknown>();
    const createdRenderers: Array<{
        unitId: string;
        options?: unknown;
        canvasElement: { dataset: Record<string, string> };
        canvas: { setId: ReturnType<typeof vi.fn>; getCanvasEle: ReturnType<typeof vi.fn> };
        context: { setId: ReturnType<typeof vi.fn> };
    }> = [];
    const removedRenderers: string[] = [];
    const spreadsheet = Object.create(Spreadsheet.prototype) as Spreadsheet & { makeForceDirty: (state?: boolean) => void };
    spreadsheet.makeForceDirty = vi.fn<(state?: boolean) => void>();

    class TestContextService {
        subscribeContextValue$() {
            return rawFormula$.asObservable();
        }
    }

    class TestUniverInstanceService {
        getTypeOfUnitAdded$(type: UniverInstanceType) {
            return type === UniverInstanceType.UNIVER_SHEET ? added$.asObservable() : new Subject().asObservable();
        }

        getAllUnitsForType(type: UniverInstanceType) {
            return type === UniverInstanceType.UNIVER_SHEET ? [initialWorkbook] : [];
        }

        getUnitCreateOptions() {
            return undefined;
        }

        getTypeOfUnitDisposed$(type: UniverInstanceType) {
            return type === UniverInstanceType.UNIVER_SHEET ? disposed$.asObservable() : new Subject().asObservable();
        }
    }

    class TestRenderManagerService {
        readonly created$ = created$.asObservable();

        createRender(unitId: string, options?: unknown) {
            const canvasElement = { dataset: {} as Record<string, string> };
            const canvas = { setId: vi.fn(), getCanvasEle: vi.fn(() => canvasElement) };
            const context = { setId: vi.fn() };
            createdRenderers.push({ unitId, options, canvasElement, canvas, context });
            return {
                unitId,
                engine: {
                    getCanvas: () => ({
                        setId: canvas.setId,
                        getCanvasEle: canvas.getCanvasEle,
                        getContext: () => context,
                    }),
                },
            };
        }

        removeRender(unitId: string) {
            removedRenderers.push(unitId);
        }

        getRenderAll() {
            return [{ mainComponent: spreadsheet }];
        }
    }

    const injector = new Injector();
    injector.add([IContextService, { useClass: TestContextService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ThemeService]);
    injector.add([SheetsRenderService]);

    return {
        service: injector.get(SheetsRenderService),
        added$,
        disposed$,
        rawFormula$,
        created$,
        createdRenderers,
        removedRenderers,
        spreadsheet,
    };
}

describe('SheetsRenderService', () => {
    it('tracks mutations that require rebuilding the sheet skeleton and unregisters them by disposable', () => {
        const service = createService();
        const disposable = service.registerSkeletonChangingMutations('sheet.mutation.resize-row');

        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.resize-row')).toBe(true);
        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.set-value')).toBe(false);

        const duplicateDisposable = service.registerSkeletonChangingMutations('sheet.mutation.resize-row');
        duplicateDisposable.dispose();
        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.resize-row')).toBe(true);

        disposable.dispose();
        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.resize-row')).toBe(false);
    });

    it('creates and disposes sheet renderers as workbooks enter and leave the instance service', async () => {
        const { added$, disposed$, createdRenderers, removedRenderers } = createLifecycleService();

        await Promise.resolve();
        expect(createdRenderers.map(({ unitId }) => unitId)).toEqual(['book-1']);

        added$.next({ unit: createWorkbook('book-2'), options: { mountContainer: 'container' } });
        expect(createdRenderers.at(-1)).toMatchObject({
            unitId: 'book-2',
            options: { mountContainer: 'container' },
        });

        const { canvasElement, canvas, context } = createdRenderers.at(-1)!;
        expect(canvas.setId).toHaveBeenCalledWith('univer-sheet-main-canvas_book-2');
        expect(canvasElement.dataset.uUnitId).toBe('book-2');
        expect(context.setId).toHaveBeenCalledWith('univer-sheet-main-canvas_book-2');

        disposed$.next(createWorkbook('book-1'));
        expect(removedRenderers).toEqual(['book-1']);
    });

    it('marks spreadsheet renderers dirty when raw formula display changes', async () => {
        const { rawFormula$, spreadsheet } = createLifecycleService();

        await Promise.resolve();
        rawFormula$.next(true);

        expect(spreadsheet.makeForceDirty).toHaveBeenCalledWith(true);
    });
});
