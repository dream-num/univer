import { Plugin, PluginType } from '@univerjs/core';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { Engine } from './engine';
import { IRenderManagerService, RenderManagerService } from './render-manager.service';

/**
 * The global rendering engine.
 */
export const IRenderingEngine = createIdentifier<Engine>('univer.render-engine');

const PLUGIN_NAME = 'render-engine';

export class RenderEngine extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        _config: undefined,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAME);

        this._injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);

        this._injector.add([
            IRenderManagerService,
            {
                useClass: RenderManagerService,
            },
        ]);
    }
}
