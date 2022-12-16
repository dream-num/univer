import { Engine, EVENT_TYPE, IWheelEvent, Layer, Rect, Scene, SceneViewer, ScrollBar, Viewport } from '@univer/base-render';
import { EventState, ISlidePage, Nullable, Registry, sortRules } from '@univer/core';
import { BaseView, CanvasViewRegistry, CANVAS_VIEW_KEY } from './BaseView';
import { SlideView } from './Views/SlideView';
import './Views';
import { SlidePlugin } from '../../SlidePlugin';
import { SlideBar } from '../UI/SlideBar/SlideBar';
import { ObjectProvider } from './ObjectProvider';

export class CanvasView {
    private _scene: Scene;

    private _views: BaseView[] = [];

    private _slideThumbEngine = new Map<string, Engine>();

    private _ObjectProvider = new ObjectProvider();

    private _pageScene = new Map<string, SceneViewer>();

    private _activePageId: string;

    constructor(private _engine: Engine, private _plugin: SlidePlugin) {
        this._initialize();
    }

    getView(key: string) {
        for (let view of this._views) {
            if (view.viewKey === key) {
                return view;
            }
        }
    }

    getDocsView(): SlideView {
        return this.getView(CANVAS_VIEW_KEY.SLIDE_VIEW) as SlideView;
    }

    createSideThumb(slideBar: SlideBar, pages: ISlidePage[]) {
        const slideBarRef = slideBar.slideBarRef;
        const thumbList = slideBarRef.current?.childNodes[0].childNodes;
        if (thumbList == null || thumbList.length !== pages.length) {
            return;
        }

        const context = this._plugin.context;

        for (var i = 0, len = thumbList.length; i < len; i++) {
            const thumbDom = (thumbList[i] as HTMLElement).querySelector('div');
            const { id, pageElements } = pages[i];
            if (this._slideThumbEngine.has(id) || !thumbDom) {
                continue;
            }
            const thumbScene = this._createThumb(thumbDom as HTMLElement, id);

            const objects = this._ObjectProvider.convertToRenderObjects(pageElements, context);

            thumbScene.addObjects(objects);

            this._thumbSceneRender(thumbScene);
        }
    }

    private _initialize() {
        const engine = this._engine;
        const context = this._plugin.getContext();

        const scene = new Scene(CANVAS_VIEW_KEY.MAIN_SCENE, engine, {
            width: 2400,
            height: 1800,
        });
        this._scene = scene;
        const viewMain = new Viewport(CANVAS_VIEW_KEY.SLIDE_VIEW, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        scene.addViewport(viewMain).attachControl();

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

        const scrollBar = ScrollBar.attachTo(viewMain);

        const { left: viewPortLeft, top: viewPortTop } = this._getCenterPositionViewPort();

        const { horizontalThumbWidth, verticalThumbHeight } = scrollBar;

        const { x, y } = viewMain.getBarScroll(viewPortLeft, viewPortTop);

        viewMain.scrollTo({
            x,
            y,
        });

        // scene.addLayer(Layer.create(scene, [], 0), Layer.create(scene, [], 2));

        // this._viewLoader(scene, this._plugin);

        this.activePage();

        engine.runRenderLoop(() => {
            scene.render();
            const app = document.getElementById('app');
            if (app) {
                app.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
            }
        });
    }

    activePage(pageId?: string) {
        const model = this._plugin.context.getSlide();
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

        if (page == null) {
            return;
        }

        const mainScene = this._scene;

        const { width: sceneWidth, height: sceneHeight } = mainScene;

        const { id, pageElements } = page;

        const pageSize = model.getPageSize();

        const { width = 100, height = 100 } = pageSize;

        const sceneViewer = new SceneViewer(id, {
            left: (sceneWidth - width) / 2,
            top: (sceneHeight - height) / 2,
            width,
            height,
            zIndex: 10,
        });

        const scene = this._createScene(id, sceneViewer);

        const objects = this._ObjectProvider.convertToRenderObjects(pageElements, this._plugin.context);

        scene.openTransformer();

        this._addBackgroundRect(scene);

        scene.addObjects(objects);

        const prePageSceneViewer = mainScene.getObject(this._activePageId);

        prePageSceneViewer?.dispose();

        mainScene.addObject(sceneViewer);

        this._activePageId = pageId;
    }

    private _addBackgroundRect(scene: Scene) {
        const model = this._plugin.context.getSlide();

        const pageSize = model.getPageSize();

        const { width: pageWidth = 0, height: pageHeight = 0 } = pageSize;

        const page = new Rect('canvas', {
            left: 0,
            top: 0,
            width: pageWidth,
            height: pageHeight,
            strokeWidth: 1,
            stroke: 'rgba(198,198,198, 1)',
            fill: 'rgba(255,255,255, 1)',
            zIndex: 0,
            evented: false,
        });
        scene.addObject(page, 0);
    }

    private _getCenterPositionViewPort() {
        const { width, height } = this._scene;

        const engine = this._scene.getEngine();

        const canvasWidth = engine?.width || 0;
        const canvasHeight = engine?.height || 0;

        return {
            left: (width - canvasWidth) / 2,
            top: (height - canvasHeight) / 2,
        };
    }

    // private _getCenterPositionViewPort() {
    //     const model = this._plugin.context.getSlide();

    //     const pageSize = model.getPageSize();

    //     const { width, height } = this._scene;

    //     const { width: pageWidth = width, height: pageHeight = height } = pageSize;

    //     return {
    //         left: (width - pageWidth) / 2,
    //         top: (height - pageHeight) / 2,
    //     };
    // }

    private _thumbSceneRender(scene: Scene) {
        const model = this._plugin.context.getSlide();

        const pageSize = model.getPageSize();

        const { width, height } = scene;

        const { width: pageWidth = width, height: pageHeight = height } = pageSize;

        scene.scale(width / pageWidth, height / pageHeight);

        scene.render();
    }

    private _createThumb(thumbDom: HTMLElement, pageId: string) {
        const engine = new Engine();
        engine.setContainer(thumbDom);
        this._slideThumbEngine.set(pageId, engine);

        return this._createScene(pageId, engine);
    }

    private _createScene(pageId: string, parent: Engine | SceneViewer, pageWidth?: number, pageHeight?: number) {
        let { width, height } = parent;

        if (pageWidth != null) {
            width = pageWidth;
        }

        if (pageHeight != null) {
            height = pageHeight;
        }

        const scene = new Scene('Page_' + pageId, parent, {
            width,
            height,
        });

        const viewMain = new Viewport('PageViewer_' + pageId, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
        });

        viewMain.closeClip();

        scene.addViewport(viewMain);

        return scene;
    }

    private _viewLoader(scene: Scene, plugin: SlidePlugin) {
        CanvasViewRegistry.getData()
            .sort(sortRules)
            .forEach((view) => {
                this._views.push(view.initialize(scene, plugin));
            });
    }
}
