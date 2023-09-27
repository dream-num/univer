import { Scene } from '@univerjs/base-render';
import { Registry } from '@univerjs/core';

export class BaseView {
    zIndex = 0;

    viewKey = '';

    private _scene!: Scene; // this is ensure to be initialized by concrete classes

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
    MAIN_SCENE = 'docMainScene',
    DOCS_VIEW = 'docsView',
}

export const CanvasViewRegistry = Registry.create();
