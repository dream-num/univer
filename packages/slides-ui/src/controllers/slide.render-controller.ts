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

import type { EventState, IColorStyle, IPageElement, ISlidePage, Nullable, SlideDataModel, UnitModel } from '@univerjs/core';
import { debounce, getColorStyle, Inject, Injector, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type { BaseObject, IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import {
    IRenderManagerService,
    Rect,
    Scene,
    ScrollBar,
    Slide,
    Viewport,
} from '@univerjs/engine-render';

import { ObjectProvider } from '@univerjs/slides';

export enum SLIDE_KEY {
    COMPONENT = '__slideRender__',
    SCENE = '__mainScene__',
    VIEW = '__mainView__',
}

export type PageID = string;

// export const ICanvasView = createIdentifier<IUniverInstanceService>('univer.slide.canvas-view');
export class SlideRenderController extends RxDisposable implements IRenderModule {
    private _objectProvider: ObjectProvider | null = null;

    /**
     * As a dep of UNIVER_SLIDE, init by RenderManagerService@createRender --> injector.get(dep)
     * @param _renderContext
     * @param _injector
     * @param _univerInstanceService
     * @param _renderManagerService
     */
    constructor(
        private readonly _renderContext: IRenderContext<UnitModel>,
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService

    ) {
        super();
        this._objectProvider = this._injector.createInstance(ObjectProvider);
        this._addNewRender();
    }

    /**
     * _initialize --> _create --> _addNewRender
     */
    private _addNewRender() {
        const { unitId, engine, scene } = this._renderContext;
        const slideDataModel = this._univerInstanceService.getUnit<SlideDataModel>(unitId, UniverInstanceType.UNIVER_SLIDE);

        if (!slideDataModel) return;

        // moved to slideRenderService@this._instanceSrv.getAllUnitsForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).forEach((slideModel)
        // this._renderManagerService.createRender(unitId);

        //#region scene subscribe
        // const { engine, scene } = currentRender;
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
        scene.onMouseWheel$.subscribeEvent((evt: unknown, state: EventState) => {
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
        //#endregion

        ScrollBar.attachTo(viewMain);
        this._renderManagerService.setCurrent(unitId);

        // #region create slide
        const slide = this._createSlide(scene);
        this._renderContext.mainComponent = slide;
        this._createSlidePages(slideDataModel, slide);
        this.createThumbs();
        // #endregion

        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    get objectProvider() {
        return this._objectProvider;
    }

    activePage(_pageId?: string) {
        let pageId = _pageId;
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

        model.setActivePage(page);

        if (slide?.hasPage(id)) {
            slide.changePage(id);
            return;
        }

        this.createPageScene(id, page);
    }

    private _scrollToCenter() {
        const mainScene = this._currentRender()?.scene;
        const viewMain = mainScene?.getViewport(SLIDE_KEY.VIEW);
        const getCenterPositionViewPort = this._getCenterPositionViewPort(mainScene);
        if (!viewMain || !getCenterPositionViewPort) return;
        const { left: viewPortLeft, top: viewPortTop } = getCenterPositionViewPort;

        const { x, y } = viewMain.transViewportScroll2ScrollValue(viewPortLeft, viewPortTop);

        viewMain.scrollToBarPos({
            x,
            y,
        });
    }

    private _currentRender() {
        const slideDataModel = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
        return this._renderManagerService.getRenderById(slideDataModel.getUnitId());
    }

    private _refreshThumb = debounce(() => {
        this.createThumbs();
    }, 300);

    /**
     * init --> _addNewRender
     * @param mainScene
     */
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

        // slideComponent.enableNav();

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
            stroke: 'rgba(198,198,198,1)',
            fill: getColorStyle(fill) || 'rgba(255,255,255,1)',
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

    /**
     * _createScene by pages, createScene --> set sceneMap
     * invoked stack: initialize --> _create --> _addNewRender --> _createSlidePages
     * @param slideDataModel
     * @param slide
     */
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

            this.createPageScene(pageId, pages[pageId]);

            this._createThumb(pageId);
        }

        // setTimeout(() => {
        //     for (let i = 0, len = pageOrder.length; i < len; i++) {
        //         const pageId = pageOrder[i];

        //         this._thumbSceneRender(pageId, slide);
        //     }
        // }, 0);

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

    // private _sceneMap = new Map<string, Scene>();
    // setSceneMap$ = new Subject<Scene>();

    /**
     * _initialize --> _create --> _addNewRender --> _createSlidePages --> page forEach --> createPageScene
     * _sceneMap.set(pageId, pageScene);
     *
     * @param pageId
     * @param page
     * @returns pageScene: Scene
     */
    createPageScene(pageId: string, page: ISlidePage) {
        // const render = this._currentRender();
        const render = this._renderContext;
        if (!render || !this.objectProvider) {
            return;
        }

        const { scene: mainScene, mainComponent } = render;

        const slide = mainComponent as Slide;
        const { width, height } = slide;

        // new Scene  ----> add SubScene.
        const pageScene = new Scene(pageId, slide, {
            width,
            height,
        });

        const viewMain = new Viewport(`PageViewer_${pageId}`, pageScene, {
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
        const objects = this.objectProvider.convertToRenderObjects(pageElements, mainScene);
        if (!objects || !slide) return;

        this._addBackgroundRect(pageScene, pageBackgroundFill);
        pageScene.addObjects(objects);

        pageScene.initTransformer();
        objects.forEach((object) => {
            pageScene.attachTransformerTo(object);
        });

        const transformer = pageScene.getTransformer();

        transformer?.changeEnd$.subscribe(() => {
            this._thumbSceneRender(pageId, slide);
        });

        transformer?.clearControl$.subscribe(() => {
            this._thumbSceneRender(pageId, slide);
        });

        // add SubScene
        slide.addPageScene(pageScene);

        return pageScene;
    }

    /**
     * get pageScene from Slide
     * pageScene was added to the mainComponent(Slide) in createPageScene --> slide.addPageScene
     * @param pageId
     * @returns {Scene, Engine, UnitModel}
     */
    getPageRenderUnit(pageId: PageID) {
        const subsceneMap = (this._renderContext.mainComponent as Slide).getSubScenes();
        const pageScene = subsceneMap.get(pageId) as unknown as Scene;
        const { engine, unit } = this._renderContext;
        return {
            scene: pageScene,
            engine,
            unit,
        };
    }

    createObjectToPage(element: IPageElement, pageID: PageID): Nullable<BaseObject> {
        const render = this._renderContext; //this._currentRender();

        if (!render || !this.objectProvider) {
            return;
        }
        const { scene } = this.getPageRenderUnit(pageID);
        if (!scene) return;

        const object = this.objectProvider.convertToRenderObject(element, scene);
        if (object) {
            scene.addObject(object);
            scene.attachTransformerTo(object);
            scene.getLayer().makeDirty();
            return object;
        }
    }

    setObjectActiveByPage(obj: BaseObject, pageID: PageID) {
        const { scene } = this.getPageRenderUnit(pageID);
        if (!scene) return;
        const transformer = scene.getTransformer();
        transformer?.activeAnObject(obj);
    }

    removeObjectById(id: string, pageID: PageID) {
        const { scene } = this.getPageRenderUnit(pageID);
        if (!scene) return;
        scene.removeObject(id);
        const transformer = scene.getTransformer();
        transformer?.clearControls();
    }

    appendPage() {
        const model = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
        const page = model.getBlankPage();

        const render = this._currentRender();

        if (page == null || render == null || render.mainComponent == null) {
            return;
        }

        const { id } = page;

        const slide = render.mainComponent as Slide;

        const scene = this.createPageScene(id, page);

        scene && slide?.addPageScene(scene);

        model.appendPage(page);
        model.setActivePage(page);
    }
}
