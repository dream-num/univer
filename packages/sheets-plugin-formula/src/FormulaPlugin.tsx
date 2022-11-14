import { SheetContext, IOCContainer, UniverSheet, Plugin, IKeyValue, ActionExtensionManager } from '@univer/core';
import { CellEditExtensionManager, CellInputExtensionManager } from '@univer/base-sheets';
import { FormulaEnginePlugin } from '@univer/base-formula-engine';
import { zh, en } from './Locale';

import { IConfig, IFormulaConfig } from './Basic/Interfaces/IFormula';
import { FORMULA_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { FormulaController } from './Controller/FormulaController';
import { firstLoader } from './Controller/FirstLoader';
import { FormulaCellEditExtensionFactory } from './Basic/Register/FormulaCellEditExtension';
import { FormulaCellInputExtensionFactory } from './Basic/Register/FormulaCellInputExtension';
import { FormulaActionExtensionFactory } from './Basic/Register';

export class FormulaPlugin extends Plugin<IKeyValue, SheetContext> {
    private _formulaController: FormulaController;

    constructor(private _config?: IFormulaConfig) {
        super(FORMULA_PLUGIN_NAME);
        // this._config = config || {};
    }

    static create(config?: IFormulaConfig) {
        return new FormulaPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);

        const context = this.getContext();
        let formulaEngine = context.getPluginManager().getPluginByName<FormulaEnginePlugin>('pluginFormulaEngine');
        if (!formulaEngine) {
            formulaEngine = new FormulaEnginePlugin();
            universheetInstance.installPlugin(formulaEngine);
        }

        this._formulaController = new FormulaController(this, this._config);

        this._formulaController.setFormulaEngine(formulaEngine);

        firstLoader(this._formulaController);
    }

    initialize(context: SheetContext): void {
        this.context = context;
        /**
         * load more Locale object
         */
        this.getContext().getLocale().load({
            en,
            zh,
        });

        const config: IConfig = { context };

        // const item = {
        //     locale: FORMULA_PLUGIN_NAME,
        //     type: 0,
        //     show: true,
        //     label: <FormulaButton config={config} />,
        // };
        // context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addToolButton(item);

        this.registerExtension();
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(context: SheetContext): void {
        this.initialize(context);
    }

    onDestroy(): void {}

    registerExtension() {
        const cellEditRegister = CellEditExtensionManager.create();
        cellEditRegister.add(new FormulaCellEditExtensionFactory(this));

        const cellInputRegister = CellInputExtensionManager.create();
        cellInputRegister.add(new FormulaCellInputExtensionFactory(this));

        const actionRegister = ActionExtensionManager.create();
        actionRegister.add(new FormulaActionExtensionFactory(this));
    }

    getFormulaEngine() {
        return this._formulaController.getFormulaEngine();
    }

    getFormulaController() {
        return this._formulaController;
    }
}
