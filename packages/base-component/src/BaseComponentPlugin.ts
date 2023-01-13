import { SheetPlugin } from '@univer/base-sheets';
import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES } from '@univer/core';
import { UniverConfig } from './Basics/Interfaces/UniverConfig';
import { UniverSheetConfig } from './Basics/Interfaces/UniverSheetConfig';
import { BaseComponentPluginObserve, installObserver } from './Basics/Observer';
import { RegisterManager } from './Common/RegisterManager';
import { UniverContainerController } from './Controller/UniverContainerController';

export class BaseComponentPlugin extends Plugin<BaseComponentPluginObserve> {
    private _registerManager: RegisterManager;

    private _config: UniverConfig;

    private _univerContainerController: UniverContainerController;

    constructor(config: Partial<UniverConfig> = {}) {
        super(PLUGIN_NAMES.BASE_COMPONENT);
        this._config = config;
    }

    static create() {
        return new BaseComponentPlugin();
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
        univerInstance.installPlugin(this);
    }

    initialize(): void {
        installObserver(this);
        this._univerContainerController = new UniverContainerController(this);
        this.setRegisterManager();
    }

    /**
     * get univer config
     */
    getConfig() {
        return this._config;
    }

    getUniverContainerController() {
        return this._univerContainerController;
    }

    /**
     * get sheetPlugin
     */
    getSheetPlugin() {
        return this.getPluginByName<SheetPlugin>('spreadsheet')!;
    }

    setRegisterManager() {
        this._registerManager = new RegisterManager(this);
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getRegisterManager(): RegisterManager {
        return this._registerManager;
    }

    addSheet(config: UniverSheetConfig) {
        this._univerContainerController.addSheet(config);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
