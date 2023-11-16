import { LocaleService as _LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { DebuggerController } from './controllers/debugger.controller';
import { enUS } from './locale';

export interface IDebuggerPluginConfig {}

export class DebuggerPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _debuggerController!: DebuggerController;

    constructor(
        config: IDebuggerPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(_LocaleService) private readonly _localeService: _LocaleService
    ) {
        super('debugger');
    }

    initialize(): void {
        this._localeService.load({
            enUS,
        });

        this._debuggerController = this._injector.createInstance(DebuggerController);
        this._injector.add([DebuggerController, { useValue: this._debuggerController }]);

        this.registerExtension();
    }

    registerExtension() {}

    override onRendered(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    getdebuggerController() {
        return this._debuggerController;
    }
}
