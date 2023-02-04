import { LocaleType } from '@univerjs/core';
import { ISheetsPluginConfig } from '../Basics';
import { SheetUIPlugin } from '../SheetUIPlugin';
import { SheetContainer, UI } from '../View';

export class SheetUIController {
    protected _plugin: SheetUIPlugin;

    private _sheetContainer: SheetContainer;

    // private _toolbarController: ToolBarController;

    // private _cellEditorController: CellEditorController;

    // private _infoBarController: InfoBarController;

    // private _rightMenuController: RightMenuController;

    // private _countBarController: CountBarController;

    // private _sheetBarController: SheetBarControl;

    private _config: ISheetsPluginConfig;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initialize();

        // this._toolbarController = new ToolBarController(this._plugin);
        // this._cellEditorController = new CellEditorController(this._plugin);
        // this._infoBarController = new InfoBarController(this._plugin);
        // this._rightMenuController = new RightMenuController(this._plugin);
        // this._countBarController = new CountBarController(this._plugin);
        // this._sheetBarController = new SheetBarControl(this._plugin);

        // 初始化UI
        const config = {
            config: this._config,
            changeSkin: this.changeSkin,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            methods: {
                toolbar: {
                    // getComponent: this._toolbarController.getComponent,
                },
                cellEditor: {
                    // getComponent: this._cellEditorController.getComponent,
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
     * Change skin
     * @param {String} lang new skin
     */
    changeSkin = () => {
        // publish
        this._plugin.getObserver('onAfterChangeUISkinObservable')!.notifyObservers();
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
        this._plugin.getObserver('onAfterChangeUILocaleObservable')!.notifyObservers();
    };

    getContentRef() {
        return this._sheetContainer.getContentRef();
    }
}
