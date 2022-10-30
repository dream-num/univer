import { Context, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { FormulaEnginePlugin } from '@univer/base-formula-engine';
import { FormulaButton } from './UI/FormulaButton';
import { zh, en } from './Locale';

import { IConfig, IFormulaConfig } from './Basic/IFormula';
import { FORMULA_PLUGIN_NAME } from './Basic/PLUGIN_NAME';
import { FormulaController } from './Controller/FormulaController';
import { firstLoader } from './Controller/FirstLoader';

export class FormulaPlugin extends Plugin {
    private _formulaController: FormulaController;

    constructor(private _config?: IFormulaConfig) {
        super(FORMULA_PLUGIN_NAME);
        // this._config = config || {};
    }

    static create(config: IFormulaConfig) {
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

    initialize(): void {
        const context = this.getContext();
        /**
         * load more Locale object
         */
        this.getContext().getLocale().load({
            en,
            zh,
        });

        const config: IConfig = { context };

        const item: IToolBarItemProps = {
            locale: FORMULA_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <FormulaButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}

    getFormulaEngine() {
        return this._formulaController.getFormulaEngine();
    }
}
