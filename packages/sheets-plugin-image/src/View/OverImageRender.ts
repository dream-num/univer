import { RenderEngine, EVENT_TYPE, Scene, IRenderingEngine } from '@univerjs/base-render';
import { Inject } from '@wendellhu/redi';
import { ObserverManager } from '@univerjs/core';
import { OverImageShape } from './OverImageShape';

export class OverImageRender {
    static LAYER_Z_INDEX: number = 1000;

    private _mainScene: Scene;

    private _activeShape: OverImageShape;

    constructor(@Inject(IRenderingEngine) renderEngine: RenderEngine, @Inject(ObserverManager) observerManager: ObserverManager) {
        this._mainScene = renderEngine.getEngine().getScene('mainScene') as Scene;
        if (this._mainScene == null) {
            throw new Error('this._mainScene');
        }
        observerManager.getObserver('onAddImage').add((eventData: OverGridImageProperty) => {
            eventData.autoWidth = true;
            eventData.autoHeight = true;
            this.addOverImage(eventData);
        });
    }

    addOverImage(property: OverGridImageProperty): void {
        const shape = new OverImageShape(property);
        shape.on(EVENT_TYPE.PointerDown, () => {
            this._activeShape = shape;
            this._plugin.showOverImagePanel();
            this._plugin.getObserver('onActiveImage')!.notifyObservers(shape.getProperty());
        });
        this._mainScene.addObject(shape, OverImageRender.LAYER_Z_INDEX);
    }

    removeOverImage(id: string): void {
        const layer = this._mainScene.getLayer(OverImageRender.LAYER_Z_INDEX);
        if (layer != null) {
            const readyRemove = [];
            const layerObject = layer.getObjects();
            for (let i = 0; i < layerObject.length; i++) {
                const shape = layerObject[i] as OverImageShape;
                if (shape.getProperty().id === id) {
                    readyRemove.push(shape);
                }
            }
            for (let i = 0; i < readyRemove.length; i++) {
                const shape = layerObject[i] as OverImageShape;
                layer.removeObject(shape);
            }
        }
    }
}
