import { SheetPlugin } from '@univerjs/base-sheets';
import { DragManager, EventManager, getRefElement } from '@univerjs/base-ui';
import { LocaleType, PLUGIN_NAMES, UniverSheet } from '@univerjs/core';
import { ISheetUIPluginConfig } from '../Basics';
import { SheetUIPlugin } from '../SheetUIPlugin';
import { SheetContainer } from '../View';
import { CellEditorUIController } from './CellEditorUIController';
import { CountBarUIController } from './CountBarUIController';
import { FormulaBarUIController } from './FormulaBarUIController';
import { InfoBarUIController } from './InfoBarUIController';
import { RightMenuUIController } from './RightMenuUIController';
import { SheetBarUIController } from './SheetBarUIContruller';
import { SlotController } from './SlotController';
import { ToolbarUIController } from './ToolbarUIController';

export class SheetContainerUIController {
    protected _plugin: SheetUIPlugin;

    private _sheetContainer: SheetContainer;

    private _toolbarController: ToolbarUIController;

    private _slotController: SlotController;

    private _cellEditorUIController: CellEditorUIController;

    private _formulaBarUIController: FormulaBarUIController;

    private _infoBarController: InfoBarUIController;

    private _rightMenuController: RightMenuUIController;

    private _countBarController: CountBarUIController;

    private _sheetBarController: SheetBarUIController;

    private _config: ISheetUIPluginConfig;

    private _dragManager: DragManager;

    private _eventManager: EventManager;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initialize();

        this._slotController = new SlotController();
        this._toolbarController = new ToolbarUIController(this._plugin, this._config.layout?.toolbarConfig);
        this._cellEditorUIController = new CellEditorUIController(this._plugin);
        this._formulaBarUIController = new FormulaBarUIController(this._plugin);
        this._infoBarController = new InfoBarUIController(this._plugin);
        this._rightMenuController = new RightMenuUIController(this._plugin, this._config.layout?.rightMenuConfig);
        this._countBarController = new CountBarUIController(this._plugin);
        this._sheetBarController = new SheetBarUIController(this._plugin);
    }

    getUIConfig() {
        const config = {
            context: this._plugin.getContext(),
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
                    getComponent: this._formulaBarUIController.getComponent,
                },
                infoBar: {
                    getComponent: this._infoBarController.getComponent,
                    // renameSheet: this._infoBarController.renameSheet,
                },
                rightMenu: {
                    getComponent: this._rightMenuController.getComponent,
                },
                countBar: {
                    getComponent: this._countBarController.getComponent,
                    onChange: this._countBarController.onChange,
                },
                sheetBar: {
                    getComponent: this._sheetBarController.getComponent,
                    addSheet: this._sheetBarController.addSheet,
                    selectSheet: this._sheetBarController.selectSheet,
                    dragEnd: this._sheetBarController.dragEnd,
                    changeSheetName: this._sheetBarController.changeSheetName,
                },
                slot: {
                    getComponent: this._slotController.getComponent,
                },
            },
        };
        return config;
    }

    // 获取SheetContainer组件
    getComponent = (ref: SheetContainer) => {
        this._sheetContainer = ref;
        this._plugin.getObserver('onUIDidMount')?.notifyObservers(this._sheetContainer);

        this._initSheetContainer();
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
        this._plugin.getGlobalContext().getObserverManager().requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getContentRef() {
        return this._sheetContainer.getContentRef();
    }

    setEventManager() {
        const universheets = this._plugin.getUniver().getAllUniverSheetsInstance();
        universheets.forEach((universheet: UniverSheet) => {
            universheet.getWorkBook().getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).listenEventManager();
        });
    }

    getEventManager() {
        return this._eventManager;
    }

    getCellEditorUIController() {
        return this._cellEditorUIController;
    }

    getFormulaBarUIController() {
        return this._formulaBarUIController;
    }

    getMainSlotController() {
        return this._slotController;
    }

    getToolbarController() {
        return this._toolbarController;
    }

    UIDidMount(cb: Function) {
        if (this._sheetContainer) return cb(this._sheetContainer);

        this._plugin.getObserver('onUIDidMount')?.add(() => cb(this._sheetContainer));
    }

    private _initialize() {
        this._dragManager = new DragManager(this._plugin);
        this._eventManager = new EventManager(this._plugin);

        this.setEventManager();
    }

    private _initSheetContainer() {
        // handle drag event
        this._dragManager.handleDragAction(getRefElement(this._sheetContainer));
    }
}
