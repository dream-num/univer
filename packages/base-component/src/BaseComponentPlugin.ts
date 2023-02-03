import { SheetPlugin } from '@univerjs/base-sheets';
import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES, Tools } from '@univerjs/core';
import { Context } from '@univerjs/core/src/Basics/Context';
import { UniverConfig } from './Basics';
import { DefaultUniverConfig } from './Basics/Const/ComponentConfig/DefaultUniverConfig';
import { DefaultUniverSheetConfig } from './Basics/Const/ComponentConfig/DefaultUniverSheetConfig';
import { UniverSheetConfig } from './Basics/Interfaces/ComponentConfig/UniverSheetConfig';
import { BaseComponentPluginObserve, installObserver } from './Basics/Observer';
import { Locale } from './Basics/Shared/Locale';
import { EventManager } from './Common';
import { ComponentManager } from './Common/ComponentManager';
import { RegisterManager } from './Common/RegisterManager';
import { UniverContainerController } from './Controller/UniverContainerController';
import { en, zh } from './Locale';

export class BaseComponentPlugin extends Plugin<BaseComponentPluginObserve> {
    private _registerManager: RegisterManager;

    private _componentManager: ComponentManager;

    private _eventManager: EventManager;

    private _config: UniverConfig;

    private _locale: Locale;

    private _univerContainerController: UniverContainerController;

    constructor(config: Partial<UniverConfig> = {}) {
        super(PLUGIN_NAMES.BASE_COMPONENT);
        this._config = Tools.deepMerge({}, DefaultUniverConfig, config);
    }

    static create() {
        return new BaseComponentPlugin();
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
        univerInstance.installPlugin(this);
    }

    initialize(ctx: Context): void {
        this._config.context = ctx;
        installObserver(this);
        // 初始国际化
        this._locale = new Locale(this._config.locale);
        this._locale.load({
            zh,
            en,
        });
        // 初始自定义组件管理器
        this._componentManager = new ComponentManager();
        this._univerContainerController = new UniverContainerController(this);
        this._registerManager = new RegisterManager(this);
        this.setEventManager();

        this.addSheet();
    }

    /**
     * get univer config
     */
    getConfig() {
        return this._config;
    }

    /**
     * 获取国际化信息
     */
    getLocale(): Locale {
        return this._locale;
    }

    getUniverContainerController() {
        return this._univerContainerController;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getRegisterManager(): RegisterManager {
        return this._registerManager;
    }

    /**
     * 自定义组件管理
     */
    getComponentManager() {
        return this._componentManager;
    }

    setEventManager() {
        this._eventManager = new EventManager(this);

        const universheets = this.getContext().getUniver().getAllUniverSheetsInstance();
        universheets.forEach((universheet: UniverSheet) => {
            universheet.getWorkBook().getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).listenEventManager();
        });
    }

    getEventManager() {
        return this._eventManager;
    }

    addSheet(config: UniverSheetConfig = {}) {
        config = Tools.deepMerge({}, DefaultUniverSheetConfig, config);
        this._univerContainerController.addSheet(config);
    }

    onMounted(ctx: Context): void {
        this.initialize(ctx);
    }

    onDestroy(): void {}
}
