import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { UniscriptController } from './controllers/uniscript.controller';
import { zhCN } from './locale';
import type { IScriptEditorServiceConfig } from './services/script-editor.service';
import { ScriptEditorService } from './services/script-editor.service';
import { UniscriptExecutionService } from './services/script-execution.service';
import { ScriptPanelService } from './services/script-panel.service';

const PLUGIN_NAME = 'uniscript';

export interface IUniscriptPluginConfig extends IScriptEditorServiceConfig {}

export class UniscriptPlugin extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        private readonly _config: IUniscriptPluginConfig,
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
            [ScriptEditorService, { useFactory: () => injector.createInstance(ScriptEditorService, this._config) }],
            [ScriptPanelService],
            [UniscriptExecutionService],
        ];

        dependencies.forEach((d) => injector.add(d));

        this._localeService.load({
            zhCN,
        });
    }
}
