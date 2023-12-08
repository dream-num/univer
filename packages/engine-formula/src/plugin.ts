import { Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { CalculateController } from './controller/calculate.controller';
import { FormulaController } from './controller/formula.controller';
import { FormulaDataModel } from './models/formula-data.model';
import { ActiveDirtyManagerService, IActiveDirtyManagerService } from './services/active-dirty-manager.service';
import { FormulaService, IFormulaService } from './services/formula.service';
import { FormulaEngineService } from './services/formula-engine.service';
import { IPassiveDirtyManagerService, PassiveDirtyManagerService } from './services/passive-dirty-manager.service';

const PLUGIN_NAME = 'base-formula-engine';

interface IBaseFormulaEnginePlugin {
    notExecuteFormula?: boolean;
}

export class BaseFormulaEnginePlugin extends Plugin {
    private _formulaDataModel: FormulaDataModel | null = null;

    constructor(
        private _config: IBaseFormulaEnginePlugin,
        @Inject(Injector) protected override _injector: Injector
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(): void {
        this._initialize();
    }

    private _initialize() {
        // this._formulaDataModel = this._injector.createInstance(FormulaDataModel);

        const dependencies: Dependency[] = [
            // Services
            [FormulaEngineService],
            [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
            [IPassiveDirtyManagerService, { useClass: PassiveDirtyManagerService }],
            // [IFormulaService, { useClass: FormulaService }],

            // Models
            [FormulaDataModel],

            //Controllers
            [FormulaController],
        ];

        if (!this._config?.notExecuteFormula) {
            // only worker
            dependencies.push([IFormulaService, { useClass: FormulaService }]);
            dependencies.push([CalculateController]);
        }

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        this._injector.get(FormulaDataModel).initFormulaData();

        if (!this._config?.notExecuteFormula) {
            this._injector.get(IFormulaService).registerFunctions();
        }
    }
}
