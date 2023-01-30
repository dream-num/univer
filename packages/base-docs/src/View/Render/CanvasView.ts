import { Engine, EVENT_TYPE, IWheelEvent, Layer, Scene, ScrollBar, Viewport } from '@univerjs/base-render';
import { EventState, sortRules } from '@univerjs/core';
import { BaseView, CanvasViewRegistry, CANVAS_VIEW_KEY } from './BaseView';
import './Views';
import { DocPlugin } from '../../DocPlugin';

export class CanvasView {
    private _scene: Scene;

    private _views: BaseView[] = [];

    constructor(private _engine: Engine, private _plugin: DocPlugin) {
        this._initialize();
    }

    private _initialize() {
        const engine = this._engine;
        const context = this._plugin.getContext();

        const scene = new Scene(CANVAS_VIEW_KEY.MAIN_SCENE, engine, {
            width: 1200,
            height: 2000,
        });
        this._scene = scene;
        const viewMain = new Viewport(CANVAS_VIEW_KEY.DOCS_VIEW, scene, {
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

        const scrollbar = new ScrollBar(viewMain);

        scene.addLayer(Layer.create(scene, [], 0), Layer.create(scene, [], 2));

        this._viewLoader(scene, this._plugin);

        engine.runRenderLoop(() => {
            scene.render();
            const app = document.getElementById('app');
            if (app) {
                app.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
            }
        });
    }

    getView(key: string) {
        for (let view of this._views) {
            if (view.viewKey === key) {
                return view;
            }
        }
    }

    getDocsView() {
        return this.getView(CANVAS_VIEW_KEY.DOCS_VIEW);
    }

    private _viewLoader(scene: Scene, plugin: DocPlugin) {
        CanvasViewRegistry.getData()
            .sort(sortRules)
            .forEach((view) => {
                this._views.push(view.initialize(scene, plugin));
            });
    }
}
