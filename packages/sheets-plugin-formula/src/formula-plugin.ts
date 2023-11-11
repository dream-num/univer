import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './common/plugin-name';
import { CalculateController } from './controllers/calculate.controller';
import { FormulaController } from './controllers/formula.controller';
import { PromptController } from './controllers/prompt.controller';
import { enUS } from './locale';
import { FormulaDataModel, IFormulaConfig } from './models/formula-data.model';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';

export class FormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _formulaController!: FormulaController;

    constructor(
        private _config: IFormulaConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(FORMULA_PLUGIN_NAME);
    }

    initialize(): void {
        this._localeService.load({
            enUS,
        });

        const dependencies: Dependency[] = [
            // models
            [FormulaDataModel, { useFactory: () => this._injector.createInstance(FormulaDataModel, this._config) }],
            // services
            [IFormulaPromptService, { useClass: FormulaPromptService }],
            // controllers
            [FormulaController],
            [PromptController],
            [CalculateController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onStarting(_injector: Injector): void {}

    override onRendered(): void {}

    override onReady(): void {
        this.initialize();
    }

    override onDestroy(): void {}
}
