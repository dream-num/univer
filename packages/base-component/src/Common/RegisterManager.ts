import { Plugin } from '@univer/core';
import { IClipboardData } from '../Basics/Interfaces';
import { ClipboardExtensionManager } from '../Basics/Register';

export class RegisterManager {
    private _clipboardExtensionManager: ClipboardExtensionManager;

    constructor(private _plugin: Plugin) {
        this.initialize();
    }

    initialize(): void {
        this.setExtensionManager();
    }

    setExtensionManager() {
        const onKeyPasteObservable = this._plugin.getContext().getObserverManager().getObserver<ClipboardEvent>('onKeyPasteObservable', 'core');

        if (onKeyPasteObservable && !onKeyPasteObservable.hasObservers()) {
            onKeyPasteObservable.add((evt: ClipboardEvent) => {
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
