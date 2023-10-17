import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { DEBUGGER_PLUGIN_NAME } from './Basics';
import { DebuggerController } from './controllers/debugger.controller';
import { en } from './Locale';
import { I18nService } from './services/i18n.service';

export interface IDebuggerPluginConfig {}

export class DebuggerPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _debuggerController!: DebuggerController;

    constructor(
        config: IDebuggerPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(DEBUGGER_PLUGIN_NAME);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this._localeService.getLocale().load({
            en,
        });

        this._debuggerController = this._injector.createInstance(DebuggerController);
        this._injector.add([DebuggerController, { useValue: this._debuggerController }]);
        this._injector.add([I18nService]);

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
