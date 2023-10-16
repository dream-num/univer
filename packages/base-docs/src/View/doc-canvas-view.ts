import {
    Documents,
    EVENT_TYPE,
    IRender,
    IRenderManagerService,
    IWheelEvent,
    Layer,
    RenderManagerService,
    Scene,
    ScrollBar,
    Viewport,
} from '@univerjs/base-render';
import {
    DocumentModel,
    EventState,
    IConfigService,
    ICurrentUniverService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import {
    DOCS_COMPONENT_DEFAULT_Z_INDEX,
    DOCS_COMPONENT_HEADER_LAYER_INDEX,
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DOCS_VIEW_KEY,
    VIEWPORT_KEY,
} from '../Basics/docs-view-key';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, DocCanvasView)
export class DocCanvasView {
    private _scene!: Scene;

    private _currentDocumentModel!: DocumentModel;

    private _loadedMap = new Set();

    constructor(
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @IConfigService private readonly _configService: IConfigService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        // @IRenderingEngine private readonly _engine: Engine,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._currentUniverService.currentDoc$.subscribe((documentModel) => {
            if (documentModel == null) {
                return;
            }

            const unitId = documentModel.getUnitId();
            if (!this._loadedMap.has(unitId)) {
                this._currentDocumentModel = documentModel;
                this._addNewRender();
                this._loadedMap.add(unitId);
            }
        });
    }

    private _addNewRender() {
        const documentModel = this._currentDocumentModel;

        const unitId = documentModel.getUnitId();

        const container = documentModel.getContainer();

        const parentRenderUnitId = documentModel.getParentRenderUnitId();

        if (container != null && parentRenderUnitId != null) {
            throw new Error('container or parentRenderUnitId can only exist one');
        }

        if (container == null && parentRenderUnitId != null) {
            this._renderManagerService.createRenderWithParent(unitId, parentRenderUnitId);
        } else {
            this._renderManagerService.createRender(unitId);
        }

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        const { scene, engine } = currentRender;

        scene.openTransformer();

        this._scene = scene;

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

        const hasScroll = this._configService.getConfig(unitId, 'hasScroll') as Nullable<boolean>;

        if (hasScroll !== false) {
            new ScrollBar(viewMain);
        }

        scene.addLayer(
            Layer.create(scene, [], DOCS_COMPONENT_MAIN_LAYER_INDEX),
            Layer.create(scene, [], DOCS_COMPONENT_HEADER_LAYER_INDEX)
        );

        // this._viewLoader(scene);

        this._addComponent(currentRender);

        const should = this._currentDocumentModel.getShouldRenderLoopImmediately();
        if (should) {
            engine.runRenderLoop(() => {
                scene.render();
                // const app = document.getElementById('app');
                // if (app) {
                //     app.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
                // }
            });
        }

        this._renderManagerService.setCurrent(unitId);
    }

    private _addComponent(currentRender: IRender) {
        const scene = this._scene;
        const documentModel = this._currentDocumentModel;

        const unitId = documentModel.getUnitId();
        const documents = new Documents(DOCS_VIEW_KEY.MAIN, undefined, {
            pageMarginLeft: documentModel.documentStyle.marginLeft || 0,
            pageMarginTop: documentModel.documentStyle.marginTop || 0,
        });
        documents.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;

        currentRender.mainComponent = documents;
        currentRender.components.set(DOCS_VIEW_KEY.MAIN, documents);

        scene.addObjects([documents], DOCS_COMPONENT_MAIN_LAYER_INDEX);

        this._docSkeletonManagerService.setCurrent({ unitId });
    }
}
