import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES } from '@univer/core';

import { RegisterManager } from './Common/RegisterManager';

export class BaseComponentPlugin extends Plugin {
    private _registerManager: RegisterManager;

    constructor() {
        super(PLUGIN_NAMES.BASE_COMPONENT);
    }

    static create() {
        return new BaseComponentPlugin();
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
        univerInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        this.setRegisterManager();
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

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
