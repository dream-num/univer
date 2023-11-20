import { IUniverInstanceService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './common/plugin-name';
import { CalculateController } from './controllers/calculate.controller';
import { FormulaController } from './controllers/formula.controller';
import { FormulaDataModel, IFormulaConfig } from './models/formula-data.model';

export class FormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: IFormulaConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(FORMULA_PLUGIN_NAME);
    }

    initialize(): void {
        const dependencies: Dependency[] = [
            // models
            [FormulaDataModel, { useFactory: () => this._injector.createInstance(FormulaDataModel, this._config) }],
            // controllers
            [FormulaController],
        ];

        if (!this._config.notExecuteFormula) {
            dependencies.push([CalculateController]);
        }

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onStarting(): void {
        this.initialize();
    }
}
