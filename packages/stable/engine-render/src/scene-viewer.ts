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

import type { IKeyValue, Nullable } from '@univerjs/core';

import type { IObjectFullState } from './basics/interfaces';
import type { IViewportInfo, Vector2 } from './basics/vector2';
import type { UniverRenderingContext } from './context';
import type { Scene } from './scene';
import { BaseObject } from './base-object';
import { RENDER_CLASS_TYPE } from './basics/const';

export class SceneViewer extends BaseObject {
    private _subScenes = new Map<string, Scene>();

    private _activeSubScene: Nullable<Scene>;

    private _allowSelectedClipElement = false;

    constructor(key?: string, props?: IObjectFullState) {
        // WTF: the name of `props`'s interface ends with State?
        super(key);
        this._initialProps(props);
    }

    override get classType() {
        return RENDER_CLASS_TYPE.SCENE_VIEWER;
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (bounds) {
            const { left, top, right, bottom } = bounds.cacheBound || bounds.viewBound;

            if (
                this.width + this.strokeWidth + this.left < left ||
                right < this.left ||
                this.height + this.strokeWidth + this.top < top ||
                bottom < this.top
            ) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

        this._activeSubScene?.makeDirtyNoParent(true).render(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    getSubScenes() {
        return this._subScenes;
    }

    getActiveSubScene() {
        return this._activeSubScene;
    }

    getSubScene(sceneKey: string) {
        for (const [key, scene] of this._subScenes) {
            if (key === sceneKey) {
                return scene;
            }
        }
    }

    addSubScene(scene: Scene) {
        this._activeSubScene = scene;
        this._subScenes.set(scene.sceneKey, scene);
        this.makeDirty();
    }

    removeSubScene(key: string) {
        const subScene = this._subScenes.get(key);
        this._subScenes.delete(key);
        if (this._activeSubScene === subScene) {
            this._activeSubScene = this._subScenes.values().next().value;
        }
        this.makeDirty();
    }

    activeSubScene(key: Nullable<string>) {
        if (key == null) {
            return;
        }
        const subScene = this._subScenes.get(key);
        if (this._activeSubScene !== subScene) {
            this._activeSubScene = subScene;
            this.makeDirty();
        }
    }

    enableSelectedClipElement() {
        this._allowSelectedClipElement = true;
    }

    disableSelectedClipElement() {
        this._allowSelectedClipElement = false;
    }

    allowSelectedClipElement() {
        return this._allowSelectedClipElement;
    }

    // 判断被选中的唯一对象
    pick(coord: Vector2) {
        if (this._activeSubScene === undefined) {
            return;
        }

        const tCoord = this.transform.invert().applyPoint(coord);

        return this._activeSubScene?.pick(tCoord);
    }

    override dispose() {
        super.dispose();

        this._subScenes.forEach((scene) => {
            scene.dispose();
        });
    }

    private _initialProps(props?: IObjectFullState) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }

        const transformState: IObjectFullState = {};
        let hasTransformState = false;
        themeKeys.forEach((key) => {
            if (props[key as keyof IObjectFullState] === undefined) {
                return true;
            }

            (transformState as IKeyValue)[key] = props[key as keyof IObjectFullState];
            hasTransformState = true;
        });

        if (hasTransformState) {
            this.transformByState(transformState);
        }

        this.makeDirty(true);
    }
}
