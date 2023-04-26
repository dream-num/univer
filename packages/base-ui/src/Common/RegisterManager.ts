import { Plugin } from '@univerjs/core';
import { IPasteData, IDragAndDropData } from '../Basics/Interfaces';
import { PasteExtensionManager, DragAndDropExtensionManager } from '../Basics/Register';

export class RegisterManager {
    private _clipboardExtensionManager: PasteExtensionManager;

    private _dragAndDropExtensionManager: DragAndDropExtensionManager;

    constructor(private _plugin: Plugin) {
        this.initialize();
    }

    initialize(): void {
        this.setClipboardExtensionManager();
        this.setDragAndDropExtensionManager();
    }

    setClipboardExtensionManager() {
        this._clipboardExtensionManager = new PasteExtensionManager(this._plugin);
        const onKeyPasteObservable = this._plugin.getGlobalContext().getObserverManager().getObserver<ClipboardEvent>('onKeyPasteObservable', 'core');

        if (onKeyPasteObservable && !onKeyPasteObservable.hasObservers()) {
            onKeyPasteObservable.add((evt: ClipboardEvent) => {
                this._clipboardExtensionManager.pasteResolver(evt).then((data: IPasteData) => {
                    this._clipboardExtensionManager.handle(data);
                });
            });
        }
    }

    setDragAndDropExtensionManager() {
        this._dragAndDropExtensionManager = new DragAndDropExtensionManager();

        const onDropObservable = this._plugin.getGlobalContext().getObserverManager().getObserver<DragEvent>('onDropObservable', 'core');

        if (onDropObservable && !onDropObservable.hasObservers()) {
            onDropObservable.add((evt: DragEvent) => {
                this._dragAndDropExtensionManager.dragResolver(evt).then((dataList: IDragAndDropData[]) => {
                    if (dataList.length === 0) return;
                    this._dragAndDropExtensionManager.handle(dataList);
                });
            });
        }
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getClipboardExtensionManager(): PasteExtensionManager {
        return this._clipboardExtensionManager;
    }

    getDragAndDropExtensionManager(): DragAndDropExtensionManager {
        return this._dragAndDropExtensionManager;
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
