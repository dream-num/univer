import { Context, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { FormulaEnginePlugin } from '../../base-formula-engine';
import { FormulaButton } from './UI/FormulaButton';
import { zh, en } from './Locale';

import { IConfig } from './Basic/IFormula';
import { FORMULA_PLUGIN_NAME } from './Basic/PLUGIN_NAME';

type IPluginConfig = {};

export class FormulaPlugin extends Plugin {
    protected _config: IPluginConfig;

    private _formulaEngine: FormulaEnginePlugin;

    constructor(config?: IPluginConfig) {
        super(FORMULA_PLUGIN_NAME);
        this._config = config || {};
    }

    static create(config?: IPluginConfig) {
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
        this._formulaEngine = formulaEngine;
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
        return this._formulaEngine;
    }
}
