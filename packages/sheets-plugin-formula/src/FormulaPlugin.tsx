import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { Plugin, CommandManager, PluginType } from '@univerjs/core';
import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { CellEditExtensionManager, CellInputExtensionManager, ComponentManager, Icon } from '@univerjs/base-ui';
import { SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { zh, en } from './Locale';

import { IFormulaConfig } from './Basics/Interfaces/IFormula';
import { FORMULA_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { FormulaController } from './Controller/FormulaController';
import { firstLoader } from './Controller/FirstLoader';
import { FormulaCellEditExtensionFactory } from './Basics/Register/FormulaCellEditExtension';
import { FormulaCellInputExtensionFactory } from './Basics/Register/FormulaCellInputExtension';
import { FormulaActionExtensionFactory } from './Basics/Register';
import { FormulaPluginObserve, install } from './Basics/Observer';
import { SearchFormulaController } from './Controller/SearchFormulaModalController';
import { FormulaPromptController } from './Controller/FormulaPromptController';

export class FormulaPlugin extends Plugin<FormulaPluginObserve> {
    static override type = PluginType.Sheet;
    
    protected _formulaActionExtensionFactory: FormulaActionExtensionFactory;

    private _formulaController: FormulaController;

    private _searchFormulaController: SearchFormulaController;

    private _formulaPromptController: FormulaPromptController;

    constructor(private _config: IFormulaConfig, @Inject(Injector) private readonly _sheetInjector: Injector, @Inject(CommandManager) private readonly _commandManager: CommandManager) {
        super(FORMULA_PLUGIN_NAME);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
        });

        
        
        const sheetContainerUIController = this._sheetInjector.get(SheetContainerUIController);
        const formulaBar = sheetContainerUIController.getFormulaBarUIController().getFormulaBar();
        

        sheetContainerUIController.UIDidMount(() => {
            this.initializeDependencies(this._sheetInjector);
            this.registerExtension();

            let formulaEngineService = this._sheetInjector.get(FormulaEngineService);
            this._formulaController.setFormulaEngine(formulaEngineService);

            firstLoader(this._formulaController);

            const componentManager = this._sheetInjector.get(ComponentManager);
            componentManager.register('FxIcon', Icon.Math.FxIcon);

            formulaBar.setFx({
                onClick: () => {
                    this._searchFormulaController.showFormulaModal('SearchFormula', true);
                },
                icon: 'FxIcon',
            });
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

    override onMounted(): void {
        install(this);

        this.initialize();
    }

    override onDestroy(): void {
        const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        actionRegister.delete(this._formulaActionExtensionFactory);
    }

    registerExtension() {
        const cellEditRegister = CellEditExtensionManager.create();
        const formulaCellEditExtensionFactory = this._sheetInjector.createInstance(FormulaCellEditExtensionFactory, this);
        this._sheetInjector.add([FormulaCellEditExtensionFactory, { useValue: formulaCellEditExtensionFactory }]);
        cellEditRegister.add(formulaCellEditExtensionFactory);

        const cellInputRegister = CellInputExtensionManager.create();
        const formulaCellInputExtensionFactory = this._sheetInjector.createInstance(FormulaCellInputExtensionFactory, this);
        this._sheetInjector.add([FormulaCellInputExtensionFactory, { useValue: formulaCellInputExtensionFactory }]);
        cellInputRegister.add(formulaCellInputExtensionFactory);

        const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        this._formulaActionExtensionFactory = new FormulaActionExtensionFactory(this,this._sheetInjector);
        actionRegister.add(this._formulaActionExtensionFactory);
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

    private initializeDependencies(sheetInjector: Injector){
        const dependencies: Dependency[] = [
            [SearchFormulaController],
            [FormulaPromptController],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });

        this._searchFormulaController = this._sheetInjector.get(SearchFormulaController);
        this._formulaPromptController = this._sheetInjector.get(FormulaPromptController);
        this._formulaController = sheetInjector.createInstance(FormulaController, this._config);
        sheetInjector.add([FormulaController, { useValue: this._formulaController }]);
        sheetInjector.add([FormulaEngineService]);
    }
}
