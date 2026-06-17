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

import { describe, expect, it, vi } from 'vitest';
import { DocPageLayoutService } from '../doc-page-layout.service';

const mockDocObject = vi.hoisted(() => ({ current: null as unknown }));

vi.mock('../../basics/component-tools', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../basics/component-tools')>();

    return {
        ...actual,
        neoGetDocObject: () => mockDocObject.current,
    };
});

function createFixture(options: {
    engineWidth: number;
    engineHeight: number;
    docsWidth?: number;
    docsHeight?: number;
    viewScale: number;
    sceneScale?: number;
    align?: 'center' | 'start';
    paddingX?: number | `${number}%`;
}) {
    const docsComponent = {
        width: options.docsWidth ?? 960,
        height: options.docsHeight ?? 1000,
        pageMarginLeft: 20,
        pageMarginTop: 20,
        translate: vi.fn(),
    };
    const docBackground = {
        translate: vi.fn(),
    };
    const viewport = {
        scrollToViewportPos: vi.fn(),
    };
    const scene = {
        scaleX: options.sceneScale ?? options.viewScale,
        scaleY: options.sceneScale ?? options.viewScale,
        getParent: vi.fn(() => ({ width: options.engineWidth, height: options.engineHeight })),
        scale: vi.fn(),
        resize: vi.fn(),
        getViewport: vi.fn(() => viewport),
    };
    mockDocObject.current = {
        document: docsComponent,
        docBackground,
        scene,
    };

    const viewScaleService = {
        getViewScale: vi.fn(() => options.viewScale),
        getAvailableWidth: vi.fn(() => options.engineWidth),
        getOptions: vi.fn(() => ({
            mode: 'fit-width',
            target: 'viewport',
            paddingX: options.paddingX ?? 20,
            minScale: 0,
            align: options.align ?? 'center',
        })),
    };
    const service = new (DocPageLayoutService as unknown as new (...args: unknown[]) => DocPageLayoutService)(
        {
            unit: {
                getSettings: () => ({ zoomRatio: 1 }),
                getSnapshot: () => ({ documentStyle: {} }),
            },
        },
        viewScaleService
    );

    return {
        docBackground,
        docsComponent,
        scene,
        service,
        viewScaleService,
        viewport,
    };
}

describe('DocPageLayoutService', () => {
    it('uses view scale for centered scene geometry', () => {
        const { docsComponent, scene, service, viewport } = createFixture({
            engineWidth: 1600,
            engineHeight: 1200,
            viewScale: 1.5,
        });

        service.calculatePagePosition();

        expect(scene.resize).toHaveBeenCalledWith(1040, 773.3333333333334);
        expect(docsComponent.translate).toHaveBeenCalledWith(53.333333333333336, 20);
        expect(viewport.scrollToViewportPos).toHaveBeenCalledWith({ viewportScrollX: 0 });
    });

    it('starts at the container edge when configured with start alignment and no padding', () => {
        const { docsComponent, service } = createFixture({
            engineWidth: 480,
            engineHeight: 800,
            viewScale: 0.5,
            align: 'start',
            paddingX: 0,
        });

        service.calculatePagePosition();

        expect(docsComponent.translate).toHaveBeenCalledWith(0, 20);
    });

    it('uses percentage padding for start-aligned fitting', () => {
        const { docsComponent, service } = createFixture({
            engineWidth: 1200,
            engineHeight: 800,
            viewScale: 1,
            align: 'start',
            paddingX: '10%',
        });

        service.calculatePagePosition();

        expect(docsComponent.translate).toHaveBeenCalledWith(120, 20);
    });

    it('reapplies view scale when an early container measurement left the scene stale', () => {
        const { scene, service } = createFixture({
            engineWidth: 900,
            engineHeight: 800,
            viewScale: 1.5,
            sceneScale: 1 / 600,
            align: 'start',
            paddingX: 0,
        });

        service.calculatePagePosition();

        expect(scene.scale).toHaveBeenCalledWith(1.5, 1.5);
    });
});
