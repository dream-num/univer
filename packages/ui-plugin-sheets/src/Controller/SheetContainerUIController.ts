import { Inject, Injector, Self, SkipSelf } from '@wendellhu/redi';

import { ComponentManager, DragManager, getRefElement, Prompt, SlotManager } from '@univerjs/base-ui';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';

import { ISheetUIPluginConfig } from '../Basics/Interfaces/ComponentConfig/ISheetUIPluginConfig';
import { SheetContainer } from '../View';
import { CellEditorUIController } from './CellEditorUIController';
import { CountBarUIController } from './CountBarUIController';
import { FormulaBarUIController } from './FormulaBarUIController';
import { InfoBarUIController } from './InfoBarUIController';
import { RightMenuUIController } from './RightMenuUIController';
import { SheetBarUIController } from './SheetBarUIContruller';
import { SlotController } from './SlotController';
import { ToolbarUIController } from './ToolbarUIController';

// NOTE: is this class necessary? Could be merged to AppUIConrainer
export class SheetContainerUIController {
    private _sheetContainer: SheetContainer;

    private _toolbarController: ToolbarUIController;

    private _slotController: SlotController;

    private _slotManager: SlotManager;

    private _cellEditorUIController: CellEditorUIController;

    private _formulaBarUIController: FormulaBarUIController;

    private _infoBarController: InfoBarUIController;

    private _rightMenuController: RightMenuUIController;

    private _countBarController: CountBarUIController;

    private _sheetBarController: SheetBarUIController;

    private _config: ISheetUIPluginConfig;

    private _dragManager: DragManager;

    constructor(
        config: ISheetUIPluginConfig,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Self() @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._config = config;

        this._slotController = new SlotController();
        this._slotManager = new SlotManager();
        this._toolbarController = this._injector.createInstance(ToolbarUIController, this._config.layout?.toolbarConfig);
        this._cellEditorUIController = this._injector.createInstance(CellEditorUIController, () => this.getContentRef());
        this._formulaBarUIController = this._injector.createInstance(FormulaBarUIController);
        this._infoBarController = this._injector.createInstance(InfoBarUIController);
        this._rightMenuController = this._injector.createInstance(RightMenuUIController, this._config.layout?.rightMenuConfig);
        this._countBarController = this._injector.createInstance(CountBarUIController);
        this._sheetBarController = this._injector.createInstance(SheetBarUIController);
        this._dragManager = this._injector.createInstance(DragManager);

        // 插入prompt组件
        this._componentManager.register(Prompt.name, Prompt);
        this._slotManager.setSlotComponent('main', {
            name: Prompt.name,
            component: {
                name: Prompt.name,
            },
        });
    }

    getUIConfig() {
        const config = {
            injector: this._injector,
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

        this._observerManager.getObserver<SheetContainer>('onUIDidMount')?.notifyObservers(this._sheetContainer);
        this._globalObserverManager.requiredObserver<boolean>('onUIDidMountObservable', 'core').notifyObservers(true);

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
        this._localeService.getLocale().change(locale as LocaleType);

        // publish
        this._globalObserverManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
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

        this._observerManager.getObserver('onUIDidMount')?.add(() => cb(this._sheetContainer));
    }

    private setSheetContainer() {
        // handle drag event
        this._dragManager.handleDragAction(getRefElement(this._sheetContainer));
    }
}
