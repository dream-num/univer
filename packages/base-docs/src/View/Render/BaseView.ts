import { Scene } from '@univer/base-render';
import { Registry, Worksheet } from '@univer/core';
import { DocPlugin } from '../../DocPlugin';

export class BaseView {
    zIndex = 0;
    viewKey = '';

    private _scene: Scene;

    private _plugin: DocPlugin;

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

    initialize(scene: Scene, plugin: DocPlugin) {
        this._scene = scene;
        this._plugin = plugin;
        this._initialize();
        return this;
    }
}

export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    DOCS_VIEW = 'docsView',
}

export const CanvasViewRegistry = Registry.create();
