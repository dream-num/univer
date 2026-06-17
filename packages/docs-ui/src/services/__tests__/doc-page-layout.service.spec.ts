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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import type { IDocFitToWidthOptions } from '../../config/config';
import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DOCS_VIEW_KEY, VIEWPORT_KEY } from '../../basics/docs-view-key';
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

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
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

describe('DocPageLayoutService', () => {
    beforeEach(() => {
        TestDocViewScaleService.reset();
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

    it('keeps the page margin and scrolls to the page center when the viewport is narrower than the page', () => {
        const { documentComponent, scene, service } = createLayoutService({
            documentWidth: 600,
            documentHeight: 900,
            pageMarginLeft: 40,
            pageMarginTop: 20,
            engineWidth: 500,
            engineHeight: 800,
        });

        service.calculatePagePosition();

        expect(documentComponent.left).toBe(40);
        expect(documentComponent.top).toBe(20);
        expect(scene.width).toBe(680);
        expect(scene.height).toBe(940);
        expect(scene.viewport.scrollX).toBe(90);
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
