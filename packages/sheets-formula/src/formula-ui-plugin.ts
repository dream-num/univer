import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FORMULA_UI_PLUGIN_NAME } from './common/plugin-name';
import { FormulaAutoFillController } from './controllers/formula-auto-fill.controller';
import { FormulaInputController } from './controllers/formula-input.controller';
import { FormulaUIController } from './controllers/formula-ui.controller';
import { PromptController } from './controllers/prompt.controller';
import { enUS } from './locale';
import { DescriptionService, IDescriptionService } from './services/description.service';
import { FormulaInputService, IFormulaInputService } from './services/formula-input.service';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';

// TODO@Dushusir: user config IFunctionInfo, we will register all function info in formula engine
interface IFormulaUIConfig {
    description: IFunctionInfo[];
}
export class FormulaUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: Partial<IFormulaUIConfig>,
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
            [IFormulaInputService, { useClass: FormulaInputService }],
            [
                IDescriptionService,
                {
                    useFactory: () =>
                        this._injector.createInstance(DescriptionService, this._config?.description || []), // TODO@Dusuhir: initialize config with asynchronous method?
                },
            ],
            // controllers
            [FormulaUIController],
            [PromptController],
            [FormulaInputController],
            [FormulaAutoFillController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        this.initialize();
    }
}
