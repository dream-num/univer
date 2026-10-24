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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IRenderContext, ISceneTransformState, RenderUnit } from '@univerjs/engine-render';
import { ICommandService, Injector, Univer, UniverInstanceType } from '@univerjs/core';
import {
    CanvasColorService,
    DocBackground,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    ScrollBar,
    Viewport,
} from '@univerjs/engine-render';
import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import type { IDocFitToWidthOptions } from '../../config/config';
import { DOCS_VIEW_KEY, VIEWPORT_KEY } from '../../basics/docs-view-key';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { DocPageLayoutService } from '../doc-page-layout.service';
import { DocViewScaleService } from '../doc-view-scale';

class TestDocViewScaleService {
    static viewScale = 1;
    static availableWidth = 1000;
    static options: IDocFitToWidthOptions = { mode: 'none' };

    static reset() {
        this.viewScale = 1;
        this.availableWidth = 1000;
        this.options = { mode: 'none' };
    }

    getViewScale() {
        return TestDocViewScaleService.viewScale;
    }

    getOptions() {
        return TestDocViewScaleService.options;
    }

    getAvailableWidth() {
        return TestDocViewScaleService.availableWidth;
    }
}

class TestViewport {
    scrollX: number | undefined;

    scrollToViewportPos(params: { viewportScrollX: number }) {
        this.scrollX = params.viewportScrollX;
    }
}

class TestScene {
    scaleX = 1;
    scaleY = 1;
    width = 0;
    height = 0;

    constructor(
        private readonly _parent: { width: number; height: number } | null,
        private readonly _viewport = new TestViewport()
    ) {}

    scale(scaleX: number, scaleY: number) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    transformByState(state: ISceneTransformState) {
        if (state.width !== undefined) {
            this.width = state.width;
        }
        if (state.height !== undefined) {
            this.height = state.height;
        }
    }

    getParent() {
        return this._parent;
    }

    getViewport(key: string) {
        return key === VIEWPORT_KEY.VIEW_MAIN ? this._viewport : null;
    }

    get viewport() {
        return this._viewport;
    }
}

class TestDocumentComponent {
    left: number | undefined;
    top: number | undefined;

    constructor(
        readonly width: number,
        readonly height: number,
        readonly pageMarginLeft: number,
        readonly pageMarginTop: number
    ) {}

    translate(left: number, top: number) {
        this.left = left;
        this.top = top;
    }
}

class TestDocBackground {
    left: number | undefined;
    top: number | undefined;

    translate(left: number, top: number) {
        this.left = left;
        this.top = top;
    }
}

function createLayoutService(params: {
    documentWidth: number;
    documentHeight: number;
    pageMarginLeft: number;
    pageMarginTop: number;
    engineWidth: number;
    engineHeight: number;
}) {
    const injector = new Injector();
    injector.add([DocViewScaleService, { useClass: TestDocViewScaleService as never }]);

    const documentComponent = new TestDocumentComponent(
        params.documentWidth,
        params.documentHeight,
        params.pageMarginLeft,
        params.pageMarginTop
    );
    const docBackground = new TestDocBackground();
    const scene = new TestScene({ width: params.engineWidth, height: params.engineHeight });
    const context = {
        mainComponent: documentComponent,
        scene,
        engine: { width: params.engineWidth, height: params.engineHeight },
        components: new Map([[DOCS_VIEW_KEY.BACKGROUND, docBackground]]),
    } as unknown as IRenderContext<DocumentDataModel>;

    return {
        docBackground,
        documentComponent,
        scene,
        service: injector.createInstance(DocPageLayoutService, context),
    };
}

function createScrollableLayout(documentHeight: number) {
    const univer = new Univer();
    onTestFinished(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SetDocZoomRatioOperation);
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'zoom-scroll-layout',
        body: { dataStream: '\r\n' },
        documentStyle: { pageSize: { width: 600, height: documentHeight } },
        settings: { zoomRatio: 1 },
    });
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.engine.resizeBySize(1000, 800);
    const documents = new Documents(DOCS_VIEW_KEY.MAIN, undefined, { pageMarginLeft: 40, pageMarginTop: 20 });
    documents.resize(600, documentHeight);
    const background = new DocBackground(DOCS_VIEW_KEY.BACKGROUND);
    render.mainComponent = documents;
    render.components.set(DOCS_VIEW_KEY.BACKGROUND, background);
    render.scene.addObjects([documents, background]);
    const viewport = new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene, { left: 0, top: 0, right: 0, bottom: 0 });
    const scrollBar = new ScrollBar(viewport);
    render.addRenderDependencies([[DocViewScaleService], [DocPageLayoutService]]);
    const service = render.with(DocPageLayoutService);
    return {
        scrollBar,
        viewport,
        zoom(ratio: number) {
            commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: model.getUnitId(), zoomRatio: ratio });
            service.calculatePagePosition();
        },
    };
}

describe('DocPageLayoutService', () => {
    beforeEach(() => {
        TestDocViewScaleService.reset();
    });

    it.each([600, 780])('creates a scrollable range when zooming a fitting %ipx document past the viewport', (documentHeight) => {
        const { scrollBar, viewport, zoom } = createScrollableLayout(documentHeight);
        zoom(0.75);
        expect(scrollBar.hasVerticalThumb()).toBe(false);

        zoom(1.5);

        expect(scrollBar.hasVerticalThumb()).toBe(true);
        viewport.scrollToViewportPos({ viewportScrollY: documentHeight + 40 });
        expect(viewport.viewportScrollY).toBeGreaterThan(0);
        expect(viewport.calcViewportInfo().viewBound.bottom).toBeGreaterThanOrEqual(documentHeight + 20);

        zoom(0.75);

        expect(scrollBar.hasVerticalThumb()).toBe(false);
        expect(viewport.viewportScrollY).toBe(0);
    });

    it('includes page margins when zooming into the overflow boundary', () => {
        const { scrollBar, zoom } = createScrollableLayout(600);
        zoom(1);
        expect(scrollBar.hasVerticalThumb()).toBe(false);

        zoom(1.26);

        expect(scrollBar.hasVerticalThumb()).toBe(true);
    });

    it('updates an existing scrollable range on zoom', () => {
        const { scrollBar, zoom } = createScrollableLayout(1200);
        zoom(1);
        expect(scrollBar.hasVerticalThumb()).toBe(true);
        const initialThumbHeight = scrollBar.verticalThumbSize;

        zoom(2);

        expect(scrollBar.hasVerticalThumb()).toBe(true);
        expect(scrollBar.verticalThumbSize).toBeLessThan(initialThumbHeight);
    });

    it('centers the document page when the viewport is wider than the page', () => {
        const { docBackground, documentComponent, scene, service } = createLayoutService({
            documentWidth: 600,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 1000,
            engineHeight: 1200,
        });

        service.calculatePagePosition();

        expect(documentComponent.left).toBe(200);
        expect(documentComponent.top).toBe(20);
        expect(docBackground.left).toBe(200);
        expect(docBackground.top).toBe(20);
        expect(scene.width).toBe(920);
        expect(scene.height).toBe(1160);
        expect(scene.viewport.scrollX).toBe(0);
    });

    it('keeps the page margin and resets horizontal scroll when the viewport is narrower than the page', () => {
        const { documentComponent, scene, service } = createLayoutService({
            documentWidth: 600,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 500,
            engineHeight: 800,
        });
        scene.viewport.scrollX = 90;

        service.calculatePagePosition();

        expect(documentComponent.left).toBe(40);
        expect(documentComponent.top).toBe(20);
        expect(scene.width).toBe(680);
        expect(scene.height).toBe(940);
        expect(scene.viewport.scrollX).toBe(0);
    });

    it('adds and removes temporary bottom scroll reserve without changing document placement', () => {
        const { documentComponent, scene, service } = createLayoutService({
            documentWidth: 600,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 500,
            engineHeight: 800,
        });

        service.calculatePagePosition();
        service.setBottomReserve(300);

        expect(documentComponent.left).toBe(40);
        expect(documentComponent.top).toBe(20);
        expect(service.resolveSceneHeight(940)).toBe(1240);
        expect(scene.height).toBe(1240);

        service.setBottomReserve(0);

        expect(scene.height).toBe(940);
    });

    it('uses fit-width start alignment padding instead of centering the page', () => {
        TestDocViewScaleService.viewScale = 2;
        TestDocViewScaleService.availableWidth = 1000;
        TestDocViewScaleService.options = { mode: 'fit-width', align: 'start', paddingX: '10%' };

        const { documentComponent, scene, service } = createLayoutService({
            documentWidth: 500,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 1400,
            engineHeight: 1200,
        });

        service.calculatePagePosition();

        expect(scene.scaleX).toBe(2);
        expect(scene.scaleY).toBe(2);
        expect(documentComponent.left).toBe(50);
        expect(scene.width).toBe(650);
        expect(scene.viewport.scrollX).toBe(0);
    });

    it('moves the page out of view while the engine has no usable width', () => {
        const { docBackground, documentComponent, scene, service } = createLayoutService({
            documentWidth: 600,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 1,
            engineHeight: 1200,
        });

        service.calculatePagePosition();

        expect(documentComponent.left).toBe(-10000);
        expect(documentComponent.top).toBe(-10000);
        expect(docBackground.left).toBe(-10000);
        expect(docBackground.top).toBe(-10000);
        expect(scene.width).toBe(680);
        expect(scene.height).toBe(1160);
    });

    it('leaves the current layout untouched when the document size is not ready', () => {
        const { documentComponent, scene, service } = createLayoutService({
            documentWidth: Number.POSITIVE_INFINITY,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 1000,
            engineHeight: 1200,
        });

        service.calculatePagePosition();

        expect(documentComponent.left).toBeUndefined();
        expect(documentComponent.top).toBeUndefined();
        expect(scene.width).toBe(0);
        expect(scene.height).toBe(0);
        expect(scene.viewport.scrollX).toBeUndefined();
    });
});
