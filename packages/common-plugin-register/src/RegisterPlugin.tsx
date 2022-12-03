import { Plugin, UniverSheet, UniverDoc, UniverSlide, PLUGIN_NAMES } from '@univer/core';
import { zh, en } from './Locale';
import { REGISTER_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { ClipboardExtensionManager } from './Basic/Register';
import { IClipboardData } from './Basic';

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
        const onKeyPasteObservable = this.getContext().getObserverManager().getObserver<ClipboardEvent>('onKeyPasteObservable', 'core');

        if (onKeyPasteObservable && !onKeyPasteObservable.hasObservers()) {
            onKeyPasteObservable.add((evt: ClipboardEvent) => {
                console.log('cell edit onKeyPasteObservable====', evt);

                this._clipboardExtensionManager.pasteResolver(evt).then((data: IClipboardData) => {
                    this._clipboardExtensionManager.handle(data);
                });
            });
        }
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
