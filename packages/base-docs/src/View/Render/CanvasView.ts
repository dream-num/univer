import './Views';

import {
    EVENT_TYPE,
    IRenderManagerService,
    IWheelEvent,
    Layer,
    RenderManagerService,
    Scene,
    ScrollBar,
    Viewport,
} from '@univerjs/base-render';
import { EventState, sortRules } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry } from './BaseView';

export class CanvasView {
    private _views: BaseView[] = [];

    constructor(
        /** @deprecated This a temporary solution. CanvasView should not be a singleton. */
        private standalone = true,
        @IRenderManagerService private readonly _rms: RenderManagerService,
        // @IRenderingEngine private readonly _engine: Engine,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._initialize();
    }

    getView(key: string) {
        for (const view of this._views) {
            if (view.viewKey === key) {
                return view;
            }
        }
    }

    getDocsView() {
        return this.getView(CANVAS_VIEW_KEY.DOCS_VIEW);
    }

    private _initialize() {
        const engine = this._rms.defaultEngine;

        const scene = new Scene(CANVAS_VIEW_KEY.MAIN_SCENE, engine, {
            width: 1024,
            height: 2000,
        });

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

        this._viewLoader(scene);

        if (this.standalone) {
            engine.runRenderLoop(() => {
                scene.render();
                const app = document.getElementById('app');
                if (app) {
                    app.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
                }
            });
        }
    }

    private _viewLoader(scene: Scene) {
        CanvasViewRegistry.getData()
            .sort(sortRules)
            .forEach((viewFactory) => {
                this._views.push(viewFactory.create(scene, this._injector));
            });
    }
}
