import { EVENT_TYPE, Scene, IRenderingEngine } from '@univerjs/base-render';
import { ObserverManager } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { OverImageShape } from './OverImageShape';
import { IOverGridImageProperty } from '../Interfaces';

export class OverImageRender {
    static LAYER_Z_INDEX: number = 1000;

    private _mainScene: Scene;

    private _activeShape: OverImageShape;

    constructor(@Inject(Injector) readonly _injector: Injector, @Inject(ObserverManager) private _observerManager: ObserverManager) {
        const engine = _injector.get(IRenderingEngine);
        this._mainScene = engine.getScene('mainScene') as Scene;
        if (this._mainScene == null) {
            throw new Error('main scene is null !!');
        }
        _observerManager.getObserver<IOverGridImageProperty>('onAddImage')!.add((eventData) => {
            eventData.autoWidth = true;
            eventData.autoHeight = true;
            this.addOverImage(eventData);
        });
    }

    addOverImage(property: IOverGridImageProperty): void {
        const shape = new OverImageShape(property);
        shape.on(EVENT_TYPE.PointerDown, () => {
            this._activeShape = shape;
            this._observerManager.getObserver<IOverGridImageProperty>('onActiveImage')!.notifyObservers(shape.getProperty());
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
