import { DragManager, getRefElement, Prompt, SlotManager, ZIndexManager } from '@univerjs/base-ui';
import { LocaleType } from '@univerjs/core';
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

    private _slotManager: SlotManager;

    private _zIndexManager: ZIndexManager;

    private _cellEditorUIController: CellEditorUIController;

    private _formulaBarUIController: FormulaBarUIController;

    private _infoBarController: InfoBarUIController;

    private _rightMenuController: RightMenuUIController;

    private _countBarController: CountBarUIController;

    private _sheetBarController: SheetBarUIController;

    private _config: ISheetUIPluginConfig;

    private _dragManager: DragManager;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initialize();

        this._slotController = new SlotController();
        this._slotManager = new SlotManager();
        this._toolbarController = new ToolbarUIController(this._plugin, this._config.layout?.toolbarConfig);
        this._cellEditorUIController = new CellEditorUIController(this._plugin);
        this._formulaBarUIController = new FormulaBarUIController(this._plugin);
        this._infoBarController = new InfoBarUIController(this._plugin);
        this._rightMenuController = new RightMenuUIController(this._plugin, this._config.layout?.rightMenuConfig);
        this._countBarController = new CountBarUIController(this._plugin);
        this._sheetBarController = new SheetBarUIController(this._plugin);
        // 插入prompt组件
        // this._slotController.addSlot(SHEET_UI_PLUGIN_NAME + Prompt.name, {
        //     component: Prompt,
        // });
        this._plugin.getComponentManager().register(Prompt.name, Prompt);
        this._slotManager.setSlotComponent('main', {
            name: Prompt.name,
            component: {
                name: Prompt.name,
            },
        });
    }

    getUIConfig() {
        const config = {
            context: this._plugin.getGlobalContext(),
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
                    // getComponent: this._slotController.getComponent,
                    getComponent: this._slotManager.getComponent,
                },
            },
        };
        return config;
    }

    // 获取SheetContainer组件
    getComponent = (ref: SheetContainer) => {
        this._sheetContainer = ref;
        this._plugin.getObserver('onUIDidMount')?.notifyObservers(this._sheetContainer);

        this._plugin.getGlobalContext().getObserverManager().requiredObserver<boolean>('onUIDidMountObservable', 'core').notifyObservers(true);

        this.setSheetContainer();
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

    getCellEditorUIController() {
        return this._cellEditorUIController;
    }

    getFormulaBarUIController() {
        return this._formulaBarUIController;
    }

    getMainSlotController() {
        return this._slotController;
    }

    getSlotManager() {
        return this._slotManager;
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
    }

    private setSheetContainer() {
        // handle drag event
        this._dragManager.handleDragAction(getRefElement(this._sheetContainer));
    }
}
