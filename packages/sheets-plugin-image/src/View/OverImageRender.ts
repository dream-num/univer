import { RenderEngine, EVENT_TYPE, Scene } from '@univerjs/base-render';
import { PLUGIN_NAMES } from '@univerjs/core';
import { SHEET_UI_PLUGIN_NAME, SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { OverGridImagePlugin, OverGridImageProperty } from '../OverGridImagePlugin';
import { OverImageShape } from './OverImageShape';

export class OverImageRender {
    static LAYER_Z_INDEX: number = 1000;

    private _mainScene: Scene;

    private _plugin: OverGridImagePlugin;

    private _activeShape: OverImageShape;

    constructor(plugin: OverGridImagePlugin) {
        const sheetPlugin = plugin.getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        const engine = sheetPlugin.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;
        this._plugin = plugin;
        this._mainScene = engine.getScene('mainScene')!;
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
        if (layer != null) {
            let readyRemove = [];
            let layerObject = layer.getObjects();
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
