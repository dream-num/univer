import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { UniscriptController } from './controllers/uniscript.controller';
import { enUS } from './locale';
import { UniscriptService } from './services/script.service';
import { ScriptPanelService } from './services/script-panel.service';

const PLUGIN_NAME = 'uniscript';

export class UniscriptPlugin extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        _config: unknown,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            // controllers
            [UniscriptController],

            // services
            [ScriptPanelService],
            [UniscriptService],
        ];

        dependencies.forEach((d) => injector.add(d));

        this._localeService.load({
            enUS,
        });
    }
}
