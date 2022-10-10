import { Scene } from '@univer/base-render';
import { Plugin, Registry, Worksheet1 } from '@univer/core';

export class BaseView {
    viewKey = '';

    private _scene: Scene;

    private _plugin: Plugin;

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

    updateToSheet(worksheet: Worksheet1) {}

    protected _initialize() {}

    initialize(scene: Scene, plugin: Plugin) {
        this._scene = scene;
        this._plugin = plugin;
        this._initialize();
        return this;
    }
}

export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    VIEW_MAIN = 'viewMain',
    VIEW_TOP = 'viewTop',
    VIEW_LEFT = 'viewLeft',
    VIEW_LEFT_TOP = 'viewLeftTop',
    SHEET_VIEW = 'sheetView',
}

export const CanvasViewRegistry = Registry.create();
