import { LocaleType, UIObserver } from '@univerjs/core';
import { ISheetUIPluginConfig } from '../Basics';
import { SheetUIPlugin } from '../SheetUIPlugin';
import { SheetContainer, UI } from '../View';
import { CellEditorUIController } from './CellEditorUIController';
import { RightMenuUIController } from './RightMenuUIController';
import { SheetBarUIController } from './SheetBarUIContruller';
import { ToolBarUIController } from './ToolbarUIController';

export class SheetContainerUIController {
    protected _plugin: SheetUIPlugin;

    private _sheetContainer: SheetContainer;

    private _toolbarController: ToolBarUIController;

    private _cellEditorUIController: CellEditorUIController;

    // private _formulaBarUIController: FormulaBarUIController;

    // private _infoBarController: InfoBarController;

    private _rightMenuController: RightMenuUIController;

    // private _countBarController: CountBarController;

    private _sheetBarController: SheetBarUIController;

    private _config: ISheetUIPluginConfig;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initialize();

        this._toolbarController = new ToolBarUIController(this._plugin, this._config.layout?.toolBarConfig);
        this._cellEditorUIController = new CellEditorUIController(this._plugin);
        // this._formulaBarUIController = new FormulaBarUIController(this._plugin);
        // this._infoBarController = new InfoBarController(this._plugin);
        this._rightMenuController = new RightMenuUIController(this._plugin, this._config.layout?.rightMenuConfig);
        // this._countBarController = new CountBarController(this._plugin);
        this._sheetBarController = new SheetBarUIController(this._plugin);

        // 初始化UI
        const config = {
            config: this._config,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            // 其余组件的props
            methods: {
                toolbar: {
                    getComponent: this._toolbarController.getComponent,
                },
                cellEditor: {
                    getComponent: this._cellEditorUIController.getComponent,
                },
                formulaBar: {
                    // getComponent: this._formulaBarUIController.getComponent,
                },
                infoBar: {
                    // getComponent: this._infoBarController.getComponent,
                    // renameSheet: this._infoBarController.renameSheet,
                },
                rightMenu: {
                    // getComponent: this._rightMenuController.getComponent,
                },
                countBar: {
                    // getComponent: this._countBarController.getComponent,
                },
                sheetBar: {
                    // getComponent: this._sheetBarController.getComponent,
                    // addSheet: this._sheetBarController.addSheet,
                    // selectSheet: this._sheetBarController.selectSheet,
                    // changeSheetName: this._sheetBarController.changeSheetName,
                },
            },
        };
        UI.create(config);
    }

    private _initialize() {}

    // 获取SheetContainer组件
    getComponent = (ref: SheetContainer) => {
        this._sheetContainer = ref;
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._plugin
            .getContext()
            .getLocale()
            .change(locale as LocaleType);

        // publish
        this._plugin.getContext().getObserverManager().requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getContentRef() {
        return this._sheetContainer.getContentRef();
    }
}
