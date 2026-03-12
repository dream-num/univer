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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Rect } from '../../../shape/rect';
import { Viewport } from '../../../viewport';
import { Slide, SLIDE_NAVIGATION_KEY } from '../slide';

function createPageScene(engine: Engine, key: string, color: string) {
    const scene = new Scene(key, engine);
    scene.transformByState({
        width: 640,
        height: 360,
        scaleX: 1,
        scaleY: 1,
    });
    new Viewport(MAIN_VIEW_PORT_KEY, scene, {
        left: 0,
        top: 0,
        width: 420,
        height: 240,
        active: true,
        allowCache: true,
        bufferEdgeX: 8,
        bufferEdgeY: 6,
    });
    scene.addObject(new Rect(`${key}-rect`, {
        left: 24,
        top: 24,
        width: 120,
        height: 70,
        fill: color,
        stroke: '#222222',
    }), 1);
    return scene;
}

describe('slide', () => {
    let restoreEnv: () => void;
    let container: HTMLDivElement;
    let engine: Engine;

    beforeEach(() => {
        restoreEnv = setupRenderTestEnv().restore;
        container = document.createElement('div');
        container.style.width = '760px';
        container.style.height = '460px';
        document.body.appendChild(container);
        engine = new Engine('slide-engine', { elementWidth: 700, elementHeight: 420, dpr: 1 });
        engine.mount(container, false);
    });

    afterEach(() => {
        engine.dispose();
        restoreEnv();
        container.remove();
        document.body.innerHTML = '';
    });

    it('changes pages through navigation objects and supports thumbnail rendering', () => {
        const slide = new Slide('slide-main', {
            width: 640,
            height: 360,
        } as any);
        slide.enableNav();

        const pageA = createPageScene(engine, 'page-a', '#cc8844');
        const pageB = createPageScene(engine, 'page-b', '#4488cc');
        slide.addPageScene(pageA);
        slide.addPageScene(pageB);

        expect(slide.hasPage('page-a')).toBeTruthy();
        expect(slide.hasPage('page-b')).toBeTruthy();

        slide.activeFirstPage();
        expect(slide.getActiveSubScene()?.sceneKey).toBe('page-a');

        slide.showNav();
        slide.hiddenNav();
        slide.showNav();

        const changed: string[] = [];
        slide.slideChangePageByNavigation$.subscribeEvent((key) => {
            if (key) {
                changed.push(key);
            }
        });

        const rightArrow = slide.getActiveSubScene()?.getObject(SLIDE_NAVIGATION_KEY.RIGHT) as any;
        expect(rightArrow).toBeTruthy();
        rightArrow.onPointerDown$.emitEvent({} as any);
        expect(slide.getActiveSubScene()?.sceneKey).toBe('page-b');

        const leftArrow = slide.getActiveSubScene()?.getObject(SLIDE_NAVIGATION_KEY.LEFT) as any;
        expect(leftArrow).toBeTruthy();
        leftArrow.onPointerDown$.emitEvent({} as any);
        expect(slide.getActiveSubScene()?.sceneKey).toBe('page-a');
        expect(changed).toContain('page-b');
        expect(changed).toContain('page-a');

        const thumbCanvas = new Canvas({ width: 320, height: 180, pixelRatio: 1 });
        slide.renderToThumb(thumbCanvas.getContext(), 'page-a', 0.5, 0.5);
        thumbCanvas.dispose();

        slide.disableNav();
        slide.removeNavigation();
        slide.dispose();
    });
});
