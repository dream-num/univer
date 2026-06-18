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

import type { Rect } from '@univerjs/engine-render';
import type { IPageElement, ISlideData } from '../../../../types/interfaces/i-slide-data';
import { ConfigService, ContextService, IConfigService, IContextService, Injector, LocaleService } from '@univerjs/core';
import { Scene, SceneViewer } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { BasicShapes } from '../../../../types/enum/prst-geom-type';
import { PageElementType, PageType } from '../../../../types/interfaces/i-slide-data';
import { SlideAdaptor } from '../slide-adaptor';

function createRenderTestBed() {
    const injector = new Injector();

    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);

    return {
        injector,
        slideAdaptor: injector.createInstance(SlideAdaptor),
    };
}

function createMainScene() {
    return new Scene(
        'main-scene',
        new SceneViewer('main-viewer', {
            width: 960,
            height: 540,
        })
    );
}

function createDeckElement(): IPageElement {
    return {
        id: 'embedded-deck',
        zIndex: 9,
        left: 16,
        top: 24,
        width: 720,
        height: 405,
        title: 'Embedded sales deck',
        description: 'Deck inside a page element',
        type: PageElementType.SLIDE,
        slide: createEmbeddedSlideData(),
    };
}

function createEmbeddedSlideData(): ISlideData {
    return {
        id: 'sales-deck',
        title: 'Sales update',
        pageSize: { width: 720, height: 405 },
        body: {
            pageOrder: ['summary', 'pipeline'],
            pages: {
                summary: {
                    id: 'summary',
                    pageType: PageType.SLIDE,
                    zIndex: 1,
                    title: 'Summary',
                    description: 'Executive summary',
                    pageBackgroundFill: { rgb: '#112233' },
                    pageElements: {
                        'sales-box': {
                            id: 'sales-box',
                            zIndex: 3,
                            left: 40,
                            top: 32,
                            width: 180,
                            height: 72,
                            title: 'Revenue card',
                            description: 'Revenue highlight',
                            type: PageElementType.SHAPE,
                            shape: {
                                shapeType: BasicShapes.RoundRect,
                                text: '',
                                shapeProperties: {
                                    shapeBackgroundFill: { rgb: '#44aa88' },
                                    radius: 12,
                                    outline: {
                                        outlineFill: { rgb: '#0b3128' },
                                        weight: 2,
                                    },
                                },
                            },
                        },
                    },
                },
                pipeline: {
                    id: 'pipeline',
                    pageType: PageType.SLIDE,
                    zIndex: 2,
                    title: 'Pipeline',
                    description: 'Next page',
                    pageBackgroundFill: { rgb: '#ffeecc' },
                    pageElements: {},
                },
            },
        },
    };
}

describe('SlideAdaptor', () => {
    it('converts slide pages in source order with page backgrounds and child shape styling', () => {
        const { slideAdaptor } = createRenderTestBed();
        const deck = slideAdaptor.convert(createDeckElement(), createMainScene())!;

        expect(deck.left).toBe(16);
        expect(deck.top).toBe(24);
        expect(deck.width).toBe(720);
        expect(deck.height).toBe(405);
        expect(deck.zIndex).toBe(9);
        expect([...deck.getSubScenes().keys()]).toEqual(['summary', 'pipeline']);
        expect(deck.getActiveSubScene()?.sceneKey).toBe('summary');

        const summaryScene = deck.getSubScene('summary')!;
        const summaryBackground = summaryScene.getObject('canvas') as Rect;
        expect(summaryBackground.fill).toBe('#112233');
        expect(summaryBackground.width).toBe(720);
        expect(summaryBackground.height).toBe(405);
        expect(summaryBackground.evented).toBe(false);

        const salesBox = summaryScene.getObject('sales-box') as Rect;
        expect(salesBox.left).toBe(40);
        expect(salesBox.top).toBe(32);
        expect(salesBox.width).toBe(180);
        expect(salesBox.height).toBe(72);
        expect(salesBox.zIndex).toBe(3);
        expect(salesBox.fill).toBe('#44aa88');
        expect(salesBox.stroke).toBe('#0b3128');
        expect(salesBox.strokeWidth).toBe(2);
        expect(salesBox.getPropByKey('radius')).toBe(12);

        const pipelineScene = deck.getSubScene('pipeline')!;
        expect((pipelineScene.getObject('canvas') as Rect).fill).toBe('#ffeecc');

        deck.changePage('pipeline');
        expect(deck.getActiveSubScene()?.sceneKey).toBe('pipeline');
    });
});
