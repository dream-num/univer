import { Scene } from '@univerjs/base-render';
import { Registry } from '@univerjs/core';

export class BaseView {
    zIndex = 0;

    viewKey = '';

    private _scene: Scene;

    // constructor(private _scene: Scene, private _plugin: Plugin) {
    //     this._initialize();
    // }

    getScene() {
        return this._scene;
    }

    updateToSheet() {}

    initialize(scene: Scene) {
        this._scene = scene;
        this._initialize();
        return this;
    }

    protected _initialize() {}
}

export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    DOCS_VIEW = 'docsView',
}

export const CanvasViewRegistry = Registry.create();