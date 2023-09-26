import { IRenderingEngine, Scene } from '@univerjs/base-render';
import { ObserverManager } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IOverGridImageProperty } from '../../Basics';
import { OverImageShape } from './OverImageShape';

export class OverImageRender {
    static LAYER_Z_INDEX: number = 1000;

    private _mainScene: Scene;

    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @Inject(ObserverManager) private _observerManager: ObserverManager
    ) {
        const engine = _injector.get(IRenderingEngine);
        this._mainScene = engine.getScene('mainScene') as Scene;
        if (this._mainScene == null) {
            throw new Error('main scene is null !!');
        }

        // TODO new command listener
        // CommandManager.getActionObservers().add((event) => {
        //     switch (event.data.actionName) {
        //         case AddOverGridImageAction.NAME: {
        //             const data = event.data as IAddOverGridImageActionData;
        //             this.addOverImage(data);
        //             break;
        //         }
        //         case RemoveOverGridImageAction.NAME: {
        //             const data = event.data as IRemoveOverGridImageActionData;
        //             this.removeOverImage(data.id);
        //             break;
        //         }
        //     }
        // });
    }

    addOverImage(property: IOverGridImageProperty): void {
        const shape = new OverImageShape(property);
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
