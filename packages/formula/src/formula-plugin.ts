import { Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './common/plugin-name';
import { ArrayFormulaDisplayController } from './controllers/array-formula-display.controller';
import { CalculateController } from './controllers/calculate.controller';
import { FormulaController } from './controllers/formula.controller';
import { TriggerCalculationController } from './controllers/trigger-calculation.controller';
import { UpdateFormulaController } from './controllers/update-formula.controller';
import type { IFormulaConfig } from './models/formula-data.model';
import { FormulaDataModel } from './models/formula-data.model';
import { FormulaService, IFormulaService } from './services/formula.service';

export class FormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _formulaDataModel: FormulaDataModel | null = null;

    constructor(
        private _config: IFormulaConfig | undefined,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(FORMULA_PLUGIN_NAME);
    }

    initialize(): void {
        this._formulaDataModel = this._injector.createInstance(FormulaDataModel);

        // main thread and worker
        const dependencies: Dependency[] = [
            // [IFormulaService, { useFactory: () => this._injector.createInstance(FormulaService) }],
            // models
            [FormulaDataModel, { useValue: this._formulaDataModel }],
            // controllers
            [FormulaController],
        ];

        if (!this._config?.notExecuteFormula) {
            // only worker
            dependencies.push([IFormulaService, { useClass: FormulaService }]);
            dependencies.push([CalculateController]);
        } else {
            // only main thread
            dependencies.push([UpdateFormulaController]);
            dependencies.push([ArrayFormulaDisplayController]);
            dependencies.push([TriggerCalculationController]);
        }

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onStarting(): void {
        this.initialize();
    }

    override onReady(): void {
        this._formulaDataModel?.initFormulaData();
    }
}
