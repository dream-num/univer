/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IPageElement, Nullable } from '@univerjs/core';
import { Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type {
    BaseObject,
    IRenderModule,
    Scene,
    ScrollBar,
    Slide,
    Viewport,
} from '@univerjs/engine-render';
import {
    IRenderManagerService,
} from '@univerjs/engine-render';

import { SlideRenderController } from './slide.render-controller';

export enum SLIDE_KEY {
    COMPONENT = '__slideRender__',
    SCENE = '__mainScene__',
    VIEW = '__mainView__',
}

export type PageID = string;

// export const ICanvasView = createIdentifier<IUniverInstanceService>('univer.slide.canvas-view');
@OnLifecycle(LifecycleStages.Ready, CanvasView)
export class CanvasView extends RxDisposable implements IRenderModule {
    constructor(
        // this controller needs by commands. The injector in Commands is root injector. T
        // That means this controller is not init by renderUnit, no renderContext.
        // private readonly _renderContext: IRenderContext<UnitModel>,
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initialize();
    }

    private _scene: Scene | null = null;
    private _viewport: Viewport | null = null;
    private _slide: Slide | null = null;
    private _scrollBar: ScrollBar | null = null;

    get Scene() {
        return this._scene;
    }

    get Viewport() {
        return this._viewport;
    }

    get Slide() {
        return this._slide;
    }

    get ScrollBar() {
        return this._scrollBar;
    }

    private _initialize() {
        //...
    }

    private _getSlideRenderControllerFromRenderUnit() {
        const renderUnit = this._renderManagerService
            .getRenderById(this._instanceSrv.getCurrentUnitForType(UniverInstanceType.UNIVER_SLIDE)!.getUnitId())!;
        const slideRC = renderUnit.with(SlideRenderController);
        return slideRC;
    }

    private _getRenderUnitByPageId(pageId: PageID) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        return slideRC.getPageRenderUnit(pageId);
    }

    createThumbs() {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        slideRC.createThumbs();
    }

    activePage(_pageId?: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        slideRC.activePage(_pageId);
    }

    getRenderUnitByPageId(pageId: PageID) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        return slideRC.getPageRenderUnit(pageId);
    }

    createObjectToPage(element: IPageElement, pageID: PageID): Nullable<BaseObject> {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        return slideRC.createObjectToPage(element, pageID);
    }

    setObjectActiveByPage(obj: BaseObject, pageID: PageID) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        return slideRC.setObjectActiveByPage(obj, pageID);
    }

    removeObjectById(id: string, pageID: PageID) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        slideRC.removeObjectById(id, pageID);
    }

    /**
     * append blank page
     */
    appendPage() {
        const slideRC = this._getSlideRenderControllerFromRenderUnit();
        slideRC.appendPage();
    }
}
