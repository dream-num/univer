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

import type { Nullable } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent } from '../../basics/i-events';

import type { UniverRenderingContext } from '../../context';
import type { Scene } from '../../scene';
import { COLORS, EventSubject } from '@univerjs/core';
import { CURSOR_TYPE } from '../../basics/const';
import { attachObjectHover } from '../../basics/quick-event';
import { getColor } from '../../basics/tools';
import { SceneViewer } from '../../scene-viewer';
import { Path } from '../../shape/path';

export enum SLIDE_NAVIGATION_KEY {
    LEFT = '__slideNavigationLeft__',
    RIGHT = '__slideNavigationRight__',
}

const arrowPath =
    'M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z m200.746667-478.506667l1.749333-1.664 30.165333-30.165333-330.496-330.581333a42.837333 42.837333 0 0 0-60.288 0 42.538667 42.538667 0 0 0 0 60.330666l270.08 270.165334-270.08 269.952a42.496 42.496 0 0 0 0 60.288c16.64 16.64 43.861333 16.469333 60.288 0.042666l298.581334-298.368z';

export class Slide extends SceneViewer {
    slideChangePageByNavigation$ = new EventSubject<Nullable<string>>();

    subSceneChanged$ = new EventSubject<Scene>();

    private _navigationEnabled = false;

    activeFirstPage() {
        const scenes = this.getSubScenes();
        const firstKey = scenes.keys().next().value;
        if (firstKey == null) {
            return;
        }
        this.changePage(firstKey);
    }

    /**
     * add pageScene to this._subScenes
     * @param pageScene
     */
    addPageScene(pageScene: Scene) {
        const key = pageScene.sceneKey;
        if (!this.getSubScene(key)) {
            this.addSubScene(pageScene);
        }
        this.addNavigation();
        this.subSceneChanged$.emitEvent(pageScene);
    }

    changePage(id?: string) {
        if (id === null) {
            return;
        }
        this.removeNavigation();
        this.activeSubScene(id as string);
        this.addNavigation();
    }

    hasPage(key: string) {
        return this.getSubScene(key);
    }

    addNavigation() {
        const scene = this.getActiveSubScene();
        if (scene == null || this._navigationEnabled === false) {
            return;
        }

        const leftArrow = new Path(SLIDE_NAVIGATION_KEY.LEFT, {
            data: arrowPath,
            width: 60,
            height: 60,
            left: 90,
            top: (this.height - 30) / 2,
            fill: this._getArrowColor(),
            flipX: true,
        });

        const rightArrow = new Path(SLIDE_NAVIGATION_KEY.RIGHT, {
            data: arrowPath,
            width: 60,
            height: 60,
            left: this.width - 90,
            top: (this.height - 30) / 2,
            fill: this._getArrowColor(),
        });

        const hoverIn = (o: Path, evt: IPointerEvent | IMouseEvent) => {
            o.setCursor(CURSOR_TYPE.POINTER);
            o.setProps({
                fill: this._getArrowColor(true),
            });
        };

        const hoverOut = (o: Path, evt: IPointerEvent | IMouseEvent) => {
            o.setCursor(CURSOR_TYPE.DEFAULT);
            o.setProps({
                fill: this._getArrowColor(),
            });
        };

        attachObjectHover(leftArrow, hoverIn, hoverOut);
        attachObjectHover(rightArrow, hoverIn, hoverOut);

        this._addNavTrigger(leftArrow, rightArrow);

        scene.addObjects([leftArrow, rightArrow], 7);
    }

    removeNavigation() {
        const scene = this.getActiveSubScene();
        if (scene == null || this._navigationEnabled === false) {
            return;
        }

        scene.getObject(SLIDE_NAVIGATION_KEY.LEFT)?.dispose();
        scene.getObject(SLIDE_NAVIGATION_KEY.RIGHT)?.dispose();
    }

    enableNav() {
        this._navigationEnabled = true;
    }

    disableNav() {
        this._navigationEnabled = false;
    }

    hiddenNav() {
        const scene = this.getActiveSubScene();
        if (scene == null || this._navigationEnabled === false) {
            return;
        }

        scene.getObject(SLIDE_NAVIGATION_KEY.LEFT)?.hide();
        scene.getObject(SLIDE_NAVIGATION_KEY.RIGHT)?.hide();
    }

    showNav() {
        const scene = this.getActiveSubScene();
        if (scene == null || this._navigationEnabled === false) {
            return;
        }

        scene.getObject(SLIDE_NAVIGATION_KEY.LEFT)?.show();
        scene.getObject(SLIDE_NAVIGATION_KEY.RIGHT)?.show();
    }

    renderToThumb(mainCtx: UniverRenderingContext, pageId: string, scaleX: number = 1, scaleY: number = 1) {
        const scene = this.getSubScene(pageId);
        if (scene == null) {
            return;
        }
        mainCtx.save();
        mainCtx.scale(scaleX, scaleY);
        scene.makeDirtyNoParent(true).render(mainCtx);
        mainCtx.restore();
    }

    private _getSubScenesIndex(key?: string) {
        if (key == null) {
            return;
        }

        const subScenes = Array.from(this.getSubScenes());
        const subScenesLen = subScenes.length;
        let currentIndex = 0;
        for (let i = 0; i < subScenesLen; i++) {
            const [sceneKey] = subScenes[i];
            if (key === sceneKey) {
                currentIndex = i;
                break;
            }
        }

        let next = currentIndex + 1;
        let prev = currentIndex - 1;

        next = next >= subScenesLen ? 0 : next;

        prev = prev < 0 ? subScenesLen - 1 : prev;

        return {
            nextScene: subScenes[next][1],
            previousScene: subScenes[prev][1],
        };
    }

    private _addNavTrigger(leftArrow: Path, rightArrow: Path) {
        leftArrow.onPointerDown$.subscribeEvent(() => {
            const result = this._getSubScenesIndex(this.getActiveSubScene()?.sceneKey);
            const prevKey = result?.previousScene.sceneKey;
            this.changePage(prevKey);
            this.slideChangePageByNavigation$.emitEvent(prevKey);
        });

        rightArrow.onPointerDown$.subscribeEvent(() => {
            const result = this._getSubScenesIndex(this.getActiveSubScene()?.sceneKey);
            const nextKey = result?.nextScene.sceneKey;
            this.changePage(nextKey);
            this.slideChangePageByNavigation$.emitEvent(nextKey);
        });
    }

    private _getArrowColor(isHover = false) {
        if (isHover) {
            return getColor(COLORS.white, 0.8);
        }
        return getColor(COLORS.white, 0.5);
    }
}
