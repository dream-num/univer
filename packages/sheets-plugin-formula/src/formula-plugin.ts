import { Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './common/plugin-name';
import { CalculateController } from './controllers/calculate.controller';
import { FormulaController } from './controllers/formula.controller';
import { UpdateFormulaController } from './controllers/update-formula.controller';
import { FormulaDataModel, IFormulaConfig } from './models/formula-data.model';

export class FormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _formulaDataModel: FormulaDataModel;

    constructor(
        private _config: IFormulaConfig | undefined,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(FORMULA_PLUGIN_NAME);
    }

    initialize(): void {
        this._formulaDataModel = this._injector.createInstance(FormulaDataModel);
        const dependencies: Dependency[] = [
            // models
            [FormulaDataModel, { useValue: this._formulaDataModel }],
            // controllers
            [FormulaController],
            [UpdateFormulaController],
        ];
        if (!this._config?.notExecuteFormula) {
            dependencies.push([CalculateController]);
        }

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onStarting(): void {
        this.initialize();
    }

    override onReady(): void {
        this._formulaDataModel.initFormulaData();
    }
}
