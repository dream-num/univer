import {
    Documents,
    EVENT_TYPE,
    IRenderManagerService,
    IWheelEvent,
    Layer,
    RenderManagerService,
    ScrollBar,
    Viewport,
} from '@univerjs/base-render';
import { EventState, IConfigService, ICurrentUniverService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import {
    DOCS_COMPONENT_DEFAULT_Z_INDEX,
    DOCS_COMPONENT_HEADER_LAYER_INDEX,
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DOCS_CONFIG_STANDALONE_KEY,
    DOCS_VIEW_KEY,
    VIEWPORT_KEY,
} from '../Basics/docs-view-key';

export class CanvasView {
    constructor(
        /** @deprecated This a temporary solution. CanvasView should not be a singleton. */
        private standalone = true,
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @IConfigService private readonly _configService: IConfigService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        // @IRenderingEngine private readonly _engine: Engine,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._initialize();
    }

    getDocsView() {}

    private _initialize() {
        const { engine, scene } = this._getDocsObject()!;

        const viewMain = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, {
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

        new ScrollBar(viewMain);

        scene.addLayer(
            Layer.create(scene, [], DOCS_COMPONENT_MAIN_LAYER_INDEX),
            Layer.create(scene, [], DOCS_COMPONENT_HEADER_LAYER_INDEX)
        );

        // this._viewLoader(scene);
        const documents = new Documents(DOCS_VIEW_KEY.MAIN);
        documents.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;

        scene.addObjects([documents], DOCS_COMPONENT_MAIN_LAYER_INDEX);

        if (this._getStandalone()) {
            engine.runRenderLoop(() => {
                scene.render();
                const app = document.getElementById('app');
                if (app) {
                    app.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
                }
            });
        }
    }

    private _getStandalone() {
        const unitId = this._currentUniverService.getCurrentUniverDocInstance().getUnitId();
        return this._configService.getConfig(unitId, DOCS_CONFIG_STANDALONE_KEY) as boolean;
    }

    private _getDocsObject() {
        const unitId = this._currentUniverService.getCurrentUniverDocInstance().getUnitId();
        const standalone = this._configService.getConfig(unitId, DOCS_CONFIG_STANDALONE_KEY) as boolean;
        if (standalone === true) {
            this._renderManagerService.createRenderWithNewEngine(unitId);
        } else {
            this._renderManagerService.createRenderWithDefaultEngine(unitId);
        }

        return this._renderManagerService.getRenderById(unitId);
    }
}
