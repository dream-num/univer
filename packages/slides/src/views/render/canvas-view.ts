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

import type { EventState, IColorStyle, ISlidePage, Nullable, SlideDataModel } from '@univerjs/core';
import { debounce, getColorStyle, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type { IWheelEvent } from '@univerjs/engine-render';
import {
    EVENT_TYPE,
    IRenderManagerService,
    Rect,
    Scene,
    ScrollBar,
    Slide,
    Viewport,
} from '@univerjs/engine-render';
import { Inject, Injector } from '@wendellhu/redi';

import { takeUntil } from 'rxjs';
import { ObjectProvider } from './object-provider';

export enum SLIDE_KEY {
    COMPONENT = '__slideRender__',
    SCENE = '__mainScene__',
    VIEW = '__mainView__',
}
@OnLifecycle(LifecycleStages.Ready, CanvasView)
export class CanvasView extends RxDisposable {
    private _objectProvider: ObjectProvider | null = null;

    private _activePageId: string = '';

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initializeDependencies(this._injector);
        this._initialize();
    }

    private _initialize() {
        this._renderManagerService.createRender$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
            this._create(unitId);
        });

        this._univerInstanceService.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).pipe(takeUntil(this.dispose$)).subscribe((slideModel) => {
            this._create(slideModel?.getUnitId());
        });

        this._univerInstanceService.getAllUnitsForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).forEach((slideModel) => {
            this._create(slideModel.getUnitId());
        });
    }

    activePage(pageId?: string) {
        const model = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
        let page: Nullable<ISlidePage>;
        if (pageId) {
            page = model.getPage(pageId);
        } else {
            const pageElements = model.getPages();
            const pageOrder = model.getPageOrder();
            if (pageOrder == null || pageElements == null) {
                return;
            }
            page = pageElements[pageOrder[0]];

            pageId = page.id;
        }

        const render = this._currentRender();

        if (page == null || render == null || render.mainComponent == null) {
            return;
        }

        const { id } = page;

        const slide = render.mainComponent as Slide;

        this._activePageId = pageId;

        if (slide?.hasPage(id)) {
            slide.changePage(id);
            return;
        }

        this._createScene(id, page);
    }

    private _scrollToCenter() {
        const mainScene = this._currentRender()?.scene;
        const viewMain = mainScene?.getViewport(SLIDE_KEY.VIEW);
        const getCenterPositionViewPort = this._getCenterPositionViewPort(mainScene);
        if (!viewMain || !getCenterPositionViewPort) return;
        const { left: viewPortLeft, top: viewPortTop } = getCenterPositionViewPort;

        const { x, y } = viewMain.transViewportScroll2ScrollValue(viewPortLeft, viewPortTop);

        viewMain.scrollTo({
            x,
            y,
        });
    }

    private _create(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const model = this._univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_SLIDE);
        if (model == null) {
            return;
        }

        if (!this._renderManagerService.has(unitId)) {
            this._addNewRender(unitId);
        }
    }

    private _currentRender() {
        const slideDataModel = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
        return this._renderManagerService.getRenderById(slideDataModel.getUnitId());
    }

    // eslint-disable-next-line max-lines-per-function
    private _addNewRender(unitId: string) {
        const slideDataModel = this._univerInstanceService.getUnit<SlideDataModel>(unitId, UniverInstanceType.UNIVER_SLIDE);

        if (slideDataModel == null) {
            return;
        }

        this._renderManagerService.createRender(unitId);

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        const { scene, engine } = currentRender;

        const observer = engine.onTransformChange$.subscribeEvent(() => {
            this._scrollToCenter();
            // add once
            observer?.unsubscribe();
        });

        engine.onTransformChange$.subscribeEvent(() => {
            setTimeout(() => {
                this.createThumbs();
            }, 300);
        });

        // const scene = new Scene(SLIDE_KEY.SCENE, engine, {
        //     width: 2400,
        //     height: 1800,
        // });
        scene.resize(2400, 1800);

        const viewMain = new Viewport(SLIDE_KEY.VIEW, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isRelativeX: true,
            isRelativeY: true,
            isWheelPreventDefaultX: true,
        });

        scene.attachControl();

        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    const value = e.deltaY > 0 ? 0.1 : -0.1;
                    // scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        scene.onFileLoaded$.subscribeEvent(() => {
            this._refreshThumb();
        });

        ScrollBar.attachTo(viewMain);

        this._renderManagerService.setCurrent(unitId);

        // const getCenterPositionViewPort = this._getCenterPositionViewPort();
        // const { left: viewPortLeft = 0, top: viewPortTop = 0 } = getCenterPositionViewPort;

        // const { x, y } = viewMain.getBarScroll(viewPortLeft, viewPortTop);

        // viewMain.scrollTo({
        //     x,
        //     y,
        // });

        // scene.addObject(new Rect('canvasTest', { left: 333, top: 333, width: 400, height: 300, fill: 'rgba(22,22,22, 1)' }));

        const slideComponent = this._createSlide(scene);

        currentRender.mainComponent = slideComponent;

        currentRender.components.set(SLIDE_KEY.COMPONENT, slideComponent);

        this._createSlidePages(slideDataModel, slideComponent);

        engine.runRenderLoop(() => {
            scene.render();
            const app = document.getElementById('app');
            if (app) {
                app.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
            }
        });
    }

    private _refreshThumb = debounce(() => {
        this.createThumbs();
    }, 300);

    private _createSlide(mainScene: Scene) {
        const model = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;

        const { width: sceneWidth, height: sceneHeight } = mainScene;

        const pageSize = model.getPageSize();

        const { width = 100, height = 100 } = pageSize;

        const slideComponent = new Slide(SLIDE_KEY.COMPONENT, {
            left: (sceneWidth - width) / 2,
            top: (sceneHeight - height) / 2,
            width,
            height,
            zIndex: 10,
        });

        slideComponent.enableNav();

        slideComponent.enableSelectedClipElement();

        mainScene.addObject(slideComponent);

        return slideComponent;
    }

    private _addBackgroundRect(scene: Scene, fill: IColorStyle) {
        const model = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;

        const pageSize = model.getPageSize();

        const { width: pageWidth = 0, height: pageHeight = 0 } = pageSize;

        const page = new Rect('canvas', {
            left: 0,
            top: 0,
            width: pageWidth,
            height: pageHeight,
            strokeWidth: 1,
            stroke: 'rgba(198,198,198, 1)',
            fill: getColorStyle(fill) || 'rgba(255,255,255, 1)',
            zIndex: 0,
            evented: false,
        });
        scene.addObject(page, 0);
    }

    private _getCenterPositionViewPort(mainScene?: Scene) {
        if (!mainScene) return { left: 0, top: 0 };
        const { width, height } = mainScene;

        const engine = mainScene.getEngine();

        const canvasWidth = engine?.width || 0;
        const canvasHeight = engine?.height || 0;

        return {
            left: (width - canvasWidth) / 2,
            top: (height - canvasHeight) / 2,
        };
    }

    private _thumbSceneRender(pageId: string, slide: Slide) {
        const render = this._renderManagerService.getRenderById(pageId);

        if (render == null) {
            return;
        }

        const { engine: thumbEngine } = render;

        if (thumbEngine == null) {
            return;
        }

        const { width, height } = slide;

        const { width: pageWidth = width, height: pageHeight = height } = thumbEngine;

        const thumbContext = thumbEngine.getCanvas().getContext();

        slide.renderToThumb(thumbContext, pageId, pageWidth / width, pageHeight / height);
    }

    private _createSlidePages(slideDataModel: SlideDataModel, slide: Slide) {
        const pages = slideDataModel.getPages();

        const pageOrder = slideDataModel.getPageOrder();

        if (!pages || !pageOrder) {
            return;
        }

        if (pageOrder.length === 0) {
            return;
        }

        for (let i = 0, len = pageOrder.length; i < len; i++) {
            const pageId = pageOrder[i];

            this._createScene(pageId, pages[pageId]);

            this._createThumb(pageId);
        }

        // setTimeout(() => {
        //     for (let i = 0, len = pageOrder.length; i < len; i++) {
        //         const pageId = pageOrder[i];

        //         this._thumbSceneRender(pageId, slide);
        //     }
        // }, 0);

        this._activePageId = pageOrder[0];

        slide.activeFirstPage();
    }

    createThumbs() {
        const slideDataModel = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;

        const pageOrder = slideDataModel.getPageOrder();

        const render = this._currentRender();

        if (!pageOrder || !render) {
            return;
        }

        if (pageOrder.length === 0) {
            return;
        }

        for (let i = 0, len = pageOrder.length; i < len; i++) {
            const pageId = pageOrder[i];

            this._thumbSceneRender(pageId, render.mainComponent as Slide);
        }
    }

    private _createThumb(pageId: string) {
        this._renderManagerService.createRender(pageId);
    }

    private _createScene(pageId: string, page: ISlidePage) {
        const render = this._currentRender();

        if (!render || !this._objectProvider) {
            return;
        }

        const { scene: mainScene, mainComponent } = render;

        const slide = mainComponent as Slide;

        const { width, height } = slide;

        const scene = new Scene(pageId, slide, {
            width,
            height,
        });

        const viewMain = new Viewport(`PageViewer_${pageId}`, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isRelativeX: true,
            isRelativeY: true,
        });

        viewMain.closeClip();

        const { pageElements, pageBackgroundFill } = page;

        // SceneViewers
        const objects = this._objectProvider.convertToRenderObjects(pageElements, mainScene);
        if (!objects || !slide) return;

        this._addBackgroundRect(scene, pageBackgroundFill);
        // So finally SceneViewers are added to the scene as objects. How can we do optimizations on this?
        scene.addObjects(objects);

        objects.forEach((object) => {
            scene.attachTransformerTo(object);
        });

        const transformer = scene.getTransformer();

        transformer?.onChangeEndObservable.add(() => {
            this._thumbSceneRender(this._activePageId, slide);
        });

        transformer?.onClearControlObservable.add(() => {
            this._thumbSceneRender(this._activePageId, slide);
        });

        slide.addPage(scene);

        return scene;
    }

    private _initializeDependencies(slideInjector: Injector) {
        this._objectProvider = slideInjector.createInstance(ObjectProvider);
    }
}
