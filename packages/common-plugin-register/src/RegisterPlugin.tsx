import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES } from '@univer/core';
import { zh, en } from './Locale';
import { REGISTER_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { ClipboardExtensionManager } from './Basic/Register';

export class RegisterPlugin extends Plugin {
    private _clipboardExtensionManager: ClipboardExtensionManager;

    constructor() {
        super(REGISTER_PLUGIN_NAME);
    }

    static create() {
        return new RegisterPlugin();
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
        univerInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });

        this.setExtensionManager();
    }

    setExtensionManager() {
        this._clipboardExtensionManager = new ClipboardExtensionManager();
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getClipboardExtensionManager(): ClipboardExtensionManager {
        return this._clipboardExtensionManager;
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
