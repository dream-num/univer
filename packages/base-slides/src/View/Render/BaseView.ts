import { Scene } from '@univer/base-render';
import { Registry, Worksheet } from '@univer/core';
import { SlidePlugin } from '../../SlidePlugin';

export class BaseView {
    zIndex = 0;
    viewKey = '';

    private _scene: Scene;

    private _plugin: SlidePlugin;

    // constructor(private _scene: Scene, private _plugin: Plugin) {
    //     this._initialize();
    // }

    getScene() {
        return this._scene;
    }

    getPlugin() {
        return this._plugin;
    }

    getContext() {
        return this._plugin.getContext();
    }

    updateToSheet() {}

    protected _initialize() {}

    initialize(scene: Scene, plugin: SlidePlugin) {
        this._scene = scene;
        this._plugin = plugin;
        this._initialize();
        return this;
    }
}

export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    SLIDE_VIEW = 'slideView',
}

export const CanvasViewRegistry = Registry.create();
