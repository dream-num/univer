import { UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { Engine } from './Engine';

export class RenderEngine extends Plugin {
    private _engine: Engine;

    constructor() {
        super(PLUGIN_NAMES.BASE_RENDER);
        this._engine = new Engine();
    }

    static create() {
        return new RenderEngine();
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    getEngine(): Engine {
        return this._engine;
    }
}
