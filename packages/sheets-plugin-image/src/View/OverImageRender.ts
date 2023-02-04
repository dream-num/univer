import { RenderEngine, EVENT_TYPE, Scene } from '@univerjs/base-render';
import { PLUGIN_NAMES } from '@univerjs/core';
import { OverGridImagePlugin, OverGridImageProperty } from '../OverGridImagePlugin';
import { OverImageShape } from './OverImageShape';

export class OverImageRender {
    static LAYER_Z_INDEX = 1000;

    private _plugin: OverGridImagePlugin;

    private _mainScene: Scene;

    private _activeShape: OverImageShape;

    constructor(plugin: OverGridImagePlugin) {
        const engine = plugin.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;
        this._plugin = plugin;
        this._mainScene = engine.getScenes('mainScene')!;
        plugin.getObserver('onAddImage')!.add((eventData: OverGridImageProperty) => {
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
        if (!layer) {
            return;
        }
        for (let i = 0; i < layer.objects.length; i++) {
            const shape = layer.objects[i] as OverImageShape;
            if (shape.getProperty().id === id) {
                layer.objects.splice(i, 1);
            }
        }
    }
}
