import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FORMULA_UI_PLUGIN_NAME } from './common/plugin-name';
import { FormulaUIController } from './controllers/formula-ui.controller';
import { PromptController } from './controllers/prompt.controller';
import { enUS } from './locale';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';

// TODO@Dushusir: user config IFunctionInfo, we will register all function info in formula engine
export class FormulaUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(FORMULA_UI_PLUGIN_NAME);
    }

    initialize(): void {
        this._localeService.load({
            enUS,
        });

        const dependencies: Dependency[] = [
            // services
            [IFormulaPromptService, { useClass: FormulaPromptService }],
            // controllers
            [FormulaUIController],
            [PromptController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        this.initialize();
    }
}
