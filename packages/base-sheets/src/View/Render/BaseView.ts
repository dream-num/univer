import { Scene } from '@univerjs/base-render';
import { Registry, Worksheet } from '@univerjs/core';
import { SheetPlugin } from '../../SheetPlugin';

export class BaseView {
    viewKey = '';

    private _scene: Scene;

    private _plugin: SheetPlugin;

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

    updateToSheet(worksheet: Worksheet) { }

    initialize(scene: Scene, plugin: SheetPlugin) {
        this._scene = scene;
        this._plugin = plugin;
        this._initialize();
        return this;
    }

    protected _initialize() {
        // TODO
    }
}

export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    VIEW_MAIN = 'viewMain',
    VIEW_TOP = 'viewTop',
    VIEW_LEFT = 'viewLeft',
    VIEW_LEFT_TOP = 'viewLeftTop',
    SHEET_VIEW = 'sheetView',
    DRAG_LINE_VIEW = 'dragLineView',
}

export const CanvasViewRegistry = Registry.create();
