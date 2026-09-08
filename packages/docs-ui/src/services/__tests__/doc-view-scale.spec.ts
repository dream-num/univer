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

/**
 * @vitest-environment jsdom
 */

import type { IUniverDocsUIConfig } from '../../config/config';
import {
    createInternalEditorID,
    DocumentFlavor,
    IConfigService,
    MODERN_DOCUMENT_WIDTH,
    ModernDocumentWidthMode,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { CanvasColorService, Engine, ICanvasColorService, RenderUnit, Scene } from '@univerjs/engine-render';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS, DOCS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import {
    calcDocFitToWidthScale,
    DocViewScaleService,
    resolveDocFitBaseWidth,
    resolveDocViewScale,
} from '../doc-view-scale';

import { MobileDocViewScaleService } from '../mobile/doc-view-scale';

const cleanup: Array<() => void> = [];

function createRender(
    mobile: boolean,
    documentFlavor: DocumentFlavor,
    availableWidth: number,
    pageWidth: number,
    zoomRatio = 1,
    config: IUniverDocsUIConfig = { fitToWidth: { mode: 'fit-width', paddingX: 0, minScale: 0 } },
    id = 'view-scale-test'
) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, config);
    const unit = univer.createUnit(UniverInstanceType.UNIVER_DOC, {
        id,
        body: { dataStream: 'Text\r\n' },
        settings: { zoomRatio },
        documentStyle: { documentFlavor, pageSize: { width: pageWidth, height: Infinity } },
    });
    const engine = injector.createInstance(Engine, unit.getUnitId(), { elementWidth: availableWidth, elementHeight: 800 });
    const scene = new Scene('view-scale', engine);
    const render = injector.createInstance(RenderUnit, { unit, engine, scene, isMainScene: true });
    render.addRenderDependencies([[DocViewScaleService, { useClass: mobile ? MobileDocViewScaleService : DocViewScaleService }]]);
    cleanup.push(() => {
        render.dispose();
        scene.dispose();
        engine.dispose();
        univer.dispose();
    });
    return { service: render.with(DocViewScaleService), engine };
}

describe('doc view scale helpers', () => {
    afterEach(() => {
        for (const dispose of cleanup.splice(0).reverse()) {
            dispose();
        }
        document.body.innerHTML = '';
    });

    it('does not fit when mode is none', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 1600,
            baseWidth: 800,
            options: DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS,
        })).toBe(1);
    });

    it('fits width with padding and min scale', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 1200,
            baseWidth: 800,
            options: { mode: 'fit-width', paddingX: 20, minScale: 1 },
        })).toBe(1.45);
        expect(calcDocFitToWidthScale({
            availableWidth: 600,
            baseWidth: 800,
            options: { mode: 'fit-width', paddingX: 20, minScale: 1 },
        })).toBe(1);
    });

    it('fits width with percentage padding relative to available width', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 1200,
            baseWidth: 960,
            options: { mode: 'fit-width', paddingX: '10%', minScale: 0 },
        })).toBe(1);
    });

    it('allows embedded containers to shrink and clamp max scale', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 480,
            baseWidth: 960,
            options: { mode: 'fit-width', paddingX: 0, minScale: 0 },
        })).toBe(0.5);
        expect(calcDocFitToWidthScale({
            availableWidth: 2400,
            baseWidth: 960,
            options: { mode: 'fit-width', paddingX: 0, minScale: 0, maxScale: 2 },
        })).toBe(2);
    });

    it('resolves traditional and modern base widths without table overflow', () => {
        expect(resolveDocFitBaseWidth({
            documentFlavor: DocumentFlavor.TRADITIONAL,
            documentStylePageWidth: 794,
            skeletonPageWidth: 1254,
        })).toBe(794);
        expect(resolveDocFitBaseWidth({
            documentFlavor: DocumentFlavor.MODERN,
            documentStylePageWidth: undefined,
            skeletonPageWidth: 1254,
        })).toBe(MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM]);
        expect(resolveDocFitBaseWidth({
            documentFlavor: DocumentFlavor.MODERN,
            documentStylePageWidth: MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.WIDE],
            skeletonPageWidth: 1500,
        })).toBe(MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.WIDE]);
    });

    it('keeps user zoom separate from fit scale', () => {
        expect(resolveDocViewScale(1.25, 0.5)).toBe(0.625);
        expect(resolveDocViewScale(1, 1.5)).toBe(1.5);
    });

    it('computes view scale from engine width, document zoom, and configured page width', () => {
        const { service } = createRender(false, DocumentFlavor.MODERN, 1440, 960, 1.25);
        expect(service.getFitToWidthScale()).toBe(1.5);
        expect(service.getViewScale()).toBe(1.875);
    });

    it('uses configured element and string containers for container-targeted fitting', () => {
        const container = document.createElement('div');
        container.id = 'univerdoc';
        Object.defineProperty(container, 'clientWidth', { configurable: true, value: 480 });
        document.body.appendChild(container);
        for (const target of [container, 'univerdoc']) {
            const { service } = createRender(false, DocumentFlavor.MODERN, 960, 960, 1, {
                container: target,
                fitToWidth: { mode: 'fit-width', target: 'container', paddingX: 0, minScale: 0 },
            });
            expect(service.getAvailableWidth()).toBe(480);
            expect(service.getFitToWidthScale()).toBe(0.5);
        }
    });

    it('keeps mobile internal editor text at its own zoom across compact and expanded widths', () => {
        const { service, engine } = createRender(true, DocumentFlavor.MODERN, 270, Infinity, 1, {
            fitToWidth: { mode: 'fit-width', paddingX: 12, minScale: 0, maxScale: 1 },
        }, createInternalEditorID('shape-text'));
        expect(service.getViewScale()).toBe(1);
        engine.resizeBySize(390, 700);
        expect(service.getViewScale()).toBe(1);
        expect(service.getViewScale(1.25)).toBe(1.25);
    });

    it('keeps Modern documents at 1:1 scale on mobile while Traditional documents still fit', () => {
        expect(createRender(true, DocumentFlavor.MODERN, 400, 800).service.getFitToWidthScale()).toBe(1);
        expect(createRender(true, DocumentFlavor.TRADITIONAL, 400, 800).service.getFitToWidthScale()).toBe(0.5);
        expect(createRender(false, DocumentFlavor.MODERN, 400, 800).service.getFitToWidthScale()).toBe(0.5);
    });
});
