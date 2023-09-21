import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { CellEditExtensionManager, CellInputExtensionManager } from '@univerjs/base-ui';
import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { IFormulaConfig } from './Basics/Interfaces/IFormula';
import { FormulaPluginObserve, install } from './Basics/Observer';
import { FormulaCellEditExtensionFactory } from './Basics/Register/FormulaCellEditExtension';
import { FormulaCellInputExtensionFactory } from './Basics/Register/FormulaCellInputExtension';
import { FormulaController } from './Controller/FormulaController';
import { FormulaPromptController } from './Controller/FormulaPromptController';
import { SearchFormulaController } from './Controller/SearchFormulaModalController';
import { en } from './Locale';

export class FormulaPlugin extends Plugin<FormulaPluginObserve> {
    static override type = PluginType.Sheet;

    // protected _formulaActionExtensionFactory: FormulaActionExtensionFactory;

    private _formulaController: FormulaController;

    private _searchFormulaController: SearchFormulaController;

    private _formulaPromptController: FormulaPromptController;

    constructor(
        private _config: IFormulaConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(FORMULA_PLUGIN_NAME);

        this.initializeDependencies(this._injector);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this._localeService.getLocale().load({
            en,
        });

        // this._arrayFormLineControl.addArrayFormLineToSheet(
        //     {
        //         startRow: 1,
        //         endRow: 3,
        //         startColumn: 1,
        //         endColumn: 3,
        //     },
        //     'sheet-0004'
        // );
        // this._arrayFormLineControl.addArrayFormLineToSheet(
        //     {
        //         startRow: 4,
        //         endRow: 5,
        //         startColumn: 4,
        //         endColumn: 5,
        //     },
        //     'sheet-0004'
        // );
        // this._arrayFormLineControl.addArrayFormLineToSheet(
        //     {
        //         startRow: 5,
        //         endRow: 6,
        //         startColumn: 5,
        //         endColumn: 6,
        //     },
        //     'sheet-0003'
        // );
    }

    override onRendered(): void {
        install(this);

        // setTimeout(() => {
        //     this.registerExtension();
        //     const sheetContainerUIController = this._injector.get(SheetContainerUIController);
        //     const formulaBar = sheetContainerUIController.getFormulaBarUIController().getFormulaBar();

        //     const formulaEngineService = this._injector.get(FormulaEngineService);
        //     this._formulaController.setFormulaEngine(formulaEngineService);

        //     firstLoader(this._formulaController);

        //     formulaBar.setFx({
        //         onClick: () => {
        //             this._searchFormulaController.showFormulaModal('SearchFormula', true);
        //         },
        //         icon: 'FxIcon',
        //     });
        //     this.initialize();
        // }, 200);
    }

    override onDestroy(): void {
        // const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        // actionRegister.delete(this._formulaActionExtensionFactory);
    }

    registerExtension() {
        const cellEditRegister = CellEditExtensionManager.create();
        const formulaCellEditExtensionFactory = this._injector.createInstance(FormulaCellEditExtensionFactory);
        this._injector.add([FormulaCellEditExtensionFactory, { useValue: formulaCellEditExtensionFactory }]);
        cellEditRegister.add(formulaCellEditExtensionFactory);

        const cellInputRegister = CellInputExtensionManager.create();
        const formulaCellInputExtensionFactory = this._injector.createInstance(FormulaCellInputExtensionFactory);
        this._injector.add([FormulaCellInputExtensionFactory, { useValue: formulaCellInputExtensionFactory }]);
        cellInputRegister.add(formulaCellInputExtensionFactory);

        // const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        // this._formulaActionExtensionFactory = new FormulaActionExtensionFactory(this._injector);
        // actionRegister.add(this._formulaActionExtensionFactory);
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
