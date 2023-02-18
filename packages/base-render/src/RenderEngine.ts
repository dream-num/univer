import { Plugin, PLUGIN_NAMES, Univer } from '@univerjs/core';
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

    installTo(univerInstance: Univer) {
        univerInstance.install(this);
    }

    getEngine(): Engine {
        return this._engine;
    }
}
