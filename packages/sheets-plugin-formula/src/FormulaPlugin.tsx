import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { IFormulaConfig } from './Basics/Interfaces/IFormula';
import { FormulaController } from './Controller/FormulaController';
import { FormulaPromptController } from './Controller/FormulaPromptController';
import { SearchFormulaController } from './Controller/SearchFormulaModalController';
import { enUS } from './locale';

export class FormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;

    // protected _formulaActionExtensionFactory: FormulaActionExtensionFactory;

    private _formulaController!: FormulaController;

    private _searchFormulaController!: SearchFormulaController;

    private _formulaPromptController!: FormulaPromptController;

    constructor(
        private _config: IFormulaConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(FORMULA_PLUGIN_NAME);

        this.initializeDependencies(this._injector);
    }

    initialize(): void {
        this._localeService.getLocale().load({
            enUS,
        });
    }

    getFormulaEngine() {
        return this._formulaController.getFormulaEngine();
    }

    getFormulaController() {
        return this._formulaController;
    }

    getSearchFormulaController() {
        return this._searchFormulaController;
    }

    getFormulaPromptController() {
        return this._formulaPromptController;
    }

    private initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [[SearchFormulaController], [FormulaPromptController]];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });

        this._searchFormulaController = this._injector.get(SearchFormulaController);
        this._formulaPromptController = this._injector.get(FormulaPromptController);
        this._formulaController = sheetInjector.createInstance(FormulaController, this._config);
        sheetInjector.add([FormulaController, { useValue: this._formulaController }]);
        sheetInjector.add([FormulaEngineService]);
    }
}
