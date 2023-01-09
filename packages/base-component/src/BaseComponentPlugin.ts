import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES } from '@univer/core';
import { UniverConfig } from './Basics/Interfaces/UniverConfig';
import { RegisterManager } from './Common/RegisterManager';
import { UniverContainerController } from './Controller/UniverContainerController';

export class BaseComponentPlugin extends Plugin {
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
        this._univerContainerController = new UniverContainerController(this);
        this.setRegisterManager();
    }

    /**
     * get univer config
     */
    getConfig() {
        return this._config;
    }

    /**
     * get sheetPlugin
     */
    getSheetPlugin() {}

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

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
