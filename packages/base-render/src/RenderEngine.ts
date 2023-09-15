import { Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { Engine } from './Engine';

/**
 * The global rendering engine.
 */
export const IRenderingEngine = createIdentifier<Engine>('univer.render-engine');

export class RenderEngine extends Plugin {
    static override type = PluginType.Univer;

    constructor(_config: undefined, @Inject(Injector) override readonly _injector: Injector) {
        super(PLUGIN_NAMES.BASE_RENDER);
        this._injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
    }
}
