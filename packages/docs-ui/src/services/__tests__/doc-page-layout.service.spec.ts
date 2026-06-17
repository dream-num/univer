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

import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DOCS_VIEW_KEY } from '../../basics/docs-view-key';
import { DocPageLayoutService } from '../doc-page-layout.service';

describe('DocPageLayoutService', () => {
    it('centers a document page in a wide render parent and scrolls the viewport back to the page origin', () => {
        const injector = new Injector();
        const translated: Array<{ left: number; top: number }> = [];
        const scrolls: unknown[] = [];
        const scene = {
            getParent: () => ({ width: 1000, height: 800 }),
            resize: (width: number, height: number) => translated.push({ left: width, top: height }),
            getViewport: () => ({ scrollToViewportPos: (payload: unknown) => scrolls.push(payload) }),
        };
        const docComponent = {
            width: 600,
            height: 700,
            pageMarginLeft: 50,
            pageMarginTop: 20,
            translate: (left: number, top: number) => translated.push({ left, top }),
        };
        const background = {
            translate: (left: number, top: number) => translated.push({ left, top }),
        };
        const context = {
            unit: { getSettings: () => ({}), getSnapshot: () => ({}) },
            mainComponent: docComponent,
            scene,
            engine: {},
            components: new Map([[DOCS_VIEW_KEY.BACKGROUND, background]]),
        };

        const service = injector.createInstance(DocPageLayoutService, context as never);
        service.calculatePagePosition();

        expect(translated).toEqual([
            { left: 900, top: 760 },
            { left: 200, top: 20 },
            { left: 200, top: 20 },
        ]);
        expect(scrolls).toEqual([{ viewportScrollX: 0 }]);
    });
});
