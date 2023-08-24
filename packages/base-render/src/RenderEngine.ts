import { Injector, Optional, createIdentifier } from '@wendellhu/redi';
import { Plugin, PluginType, PLUGIN_NAMES } from '@univerjs/core';

import { Engine } from './Engine';

export const IRenderingEngine = createIdentifier<Engine>('univer.render-engine');

export class RenderEngine extends Plugin {
    static override type = PluginType.Univer;

    private _engine: Engine;

    constructor(@Optional(Injector) override readonly _injector: Injector) {
        super(PLUGIN_NAMES.BASE_RENDER);

        this._engine = new Engine();

        this._injector?.add([IRenderingEngine, { useFactory: () => this._engine }]);
    }

    getEngine(): Engine {
        return this._engine;
    }
}
