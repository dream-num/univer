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
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    DocumentFlavor,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocsRenderService, getDocsCanvasBackgroundColor } from '../docs-render.service';

class TestUniverInstanceService {
    private readonly _added$ = new Subject<{ unit: DocumentDataModel }>();
    private readonly _disposed$ = new Subject<DocumentDataModel>();
    private readonly _units = [
        new DocumentDataModel({
            id: 'doc-existing',
            documentStyle: { documentFlavor: DocumentFlavor.MODERN },
        }),
    ];

    getAllUnitsForType() {
        return this._units;
    }

    getTypeOfUnitAdded$() {
        return this._added$.asObservable();
    }

    getTypeOfUnitDisposed$() {
        return this._disposed$.asObservable();
    }

    getUnitCreateOptions() {
        return undefined;
    }

    addUnit(unit: DocumentDataModel) {
        this._units.push(unit);
        this._added$.next({ unit });
    }

    disposeUnit(unit: DocumentDataModel) {
        this._disposed$.next(unit);
    }
}

class TestCanvas {
    readonly style = { backgroundColor: '' };
    id = '';
    contextId = '';

    setId(id: string) {
        this.id = id;
    }

    getContext() {
        return {
            setId: (id: string) => {
                this.contextId = id;
            },
        };
    }

    getCanvasEle() {
        return { style: this.style };
    }
}

class TestRenderManagerService {
    readonly createRender$ = new Subject<string>();
    readonly created$ = new Subject<{ unitId: string; engine: { getCanvas: () => TestCanvas; canvasColorService: undefined } }>();
    readonly createdUnitIds: string[] = [];
    readonly removedUnitIds: string[] = [];
    readonly canvases = new Map<string, TestCanvas>();
    readonly renderers = new Map<string, { unitId: string; engine: { getCanvas: () => TestCanvas; canvasColorService: undefined } }>();

    createRender(unitId: string) {
        this.createdUnitIds.push(unitId);
        const canvas = new TestCanvas();
        this.canvases.set(unitId, canvas);
        const renderer = {
            unitId,
            engine: {
                getCanvas: () => canvas,
                canvasColorService: undefined,
            },
        };
        this.renderers.set(unitId, renderer);
        return renderer;
    }

    has(unitId: string) {
        return this.renderers.has(unitId);
    }

    getRenderById(unitId: string) {
        return this.renderers.get(unitId) ?? null;
    }

    removeRender(unitId: string) {
        this.removedUnitIds.push(unitId);
        this.renderers.delete(unitId);
    }
}

function createService(): DocsRenderService {
    const injector = new Injector();
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocsRenderService]);
    return injector.get(DocsRenderService);
}

function createLifecycleService() {
    const injector = new Injector();
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([DocsRenderService]);
    return {
        service: injector.get(DocsRenderService),
        instanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
        renderManagerService: injector.get(IRenderManagerService) as unknown as TestRenderManagerService,
    };
}

describe('DocsRenderService', () => {
    it('can start render lifecycle listening when there are no existing docs', () => {
        const service = createService();

        expect(() => service.dispose()).not.toThrow();
    });

    it('uses document flavor to choose the doc canvas background', () => {
        expect(getDocsCanvasBackgroundColor(DocumentFlavor.MODERN)).toBe('#fff');
        expect(getDocsCanvasBackgroundColor(DocumentFlavor.TRADITIONAL)).toBe('#fafafa');
        expect(getDocsCanvasBackgroundColor()).toBe('#fafafa');
    });

    it('creates renderers for document lifecycle changes and styles doc canvases', () => {
        const { service, instanceService, renderManagerService } = createLifecycleService();

        expect(renderManagerService.createdUnitIds).toEqual(['doc-existing']);
        expect(renderManagerService.canvases.get('doc-existing')?.id).toBe('univer-doc-main-canvas');
        expect(renderManagerService.canvases.get('doc-existing')?.contextId).toBe('univer-doc-main-canvas');
        expect(renderManagerService.canvases.get('doc-existing')?.style.backgroundColor).toBe('#fff');

        const editorDoc = new DocumentDataModel({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        instanceService.addUnit(editorDoc);
        expect(renderManagerService.createdUnitIds).toEqual(['doc-existing', DOCS_NORMAL_EDITOR_UNIT_ID_KEY]);
        expect(renderManagerService.canvases.get(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)?.style.backgroundColor).toBe('transparent');

        instanceService.disposeUnit(editorDoc);
        expect(renderManagerService.removedUnitIds).toEqual([DOCS_NORMAL_EDITOR_UNIT_ID_KEY]);

        service.dispose();
    });
});
