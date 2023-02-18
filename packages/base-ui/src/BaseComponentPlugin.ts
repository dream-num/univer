import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES, Tools } from '@univerjs/core';
import { Context } from '@univerjs/core/src/Basics/Context';
import { UniverConfig } from './Basics';
import { DefaultUniverConfig } from './Basics/Const/ComponentConfig/DefaultUniverConfig';
import { DefaultUniverSheetConfig } from './Basics/Const/ComponentConfig/DefaultUniverSheetConfig';
import { UniverSheetConfig } from './Basics/Interfaces/ComponentConfig/UniverSheetConfig';
import { BaseComponentPluginObserve, installObserver } from './Basics/Observer';
import { Locale } from './Basics/Shared/Locale';
import { ComponentManager } from './Common/ComponentManager';
import { UniverContainerController } from './Controller/UniverContainerController';
import { en, zh } from './Locale';

export class BaseComponentPlugin extends Plugin<BaseComponentPluginObserve> {
    private _componentManager: ComponentManager;

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
        // this._componentManager = new ComponentManager();
        // this._univerContainerController = new UniverContainerController(this);

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
     * 自定义组件管理
     */
    getComponentManager() {
        return this._componentManager;
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
