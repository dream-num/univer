import { Plugin } from '@univerjs/core';
import { IPasteData, IDragAndDropData } from '../Basics/Interfaces';
import { PasteExtensionManager, DragAndDropExtensionManager, CopyExtensionManager } from '../Basics/Register';

export class RegisterManager {
    private _pasteExtensionManager: PasteExtensionManager;

    private _copyExtensionManager: CopyExtensionManager;

    private _dragAndDropExtensionManager: DragAndDropExtensionManager;

    constructor(private _plugin: Plugin) {
        this.initialize();
    }

    initialize(): void {
        this.setClipboardExtensionManager();
        this.setDragAndDropExtensionManager();
    }

    setClipboardExtensionManager() {
        this._pasteExtensionManager = new PasteExtensionManager(this._plugin);
        this._copyExtensionManager = new CopyExtensionManager(this._plugin);
        const onKeyPasteObservable = this._plugin.getGlobalContext().getObserverManager().getObserver<ClipboardEvent>('onKeyPasteObservable', 'core');
        const onKeyCopyObservable = this._plugin.getGlobalContext().getObserverManager().getObserver<ClipboardEvent>('onKeyCopyObservable', 'core');

        if (onKeyPasteObservable && !onKeyPasteObservable.hasObservers()) {
            onKeyPasteObservable.add((evt: ClipboardEvent) => {
                this._pasteExtensionManager.pasteResolver(evt).then((data: IPasteData) => {
                    this._pasteExtensionManager.handle(data);
                });
            });
        }
        if (onKeyCopyObservable && !onKeyCopyObservable.hasObservers()) {
            onKeyCopyObservable.add((evt: ClipboardEvent) => {
                this._copyExtensionManager.handle();
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
     * usage this._pasteExtensionManager.handle(data);
     * @returns
     */
    getPasteExtensionManager(): PasteExtensionManager {
        return this._pasteExtensionManager;
    }

    /**
     * usage this._pasteExtensionManager.handle(data);
     * @returns
     */
    getCopyExtensionManager(): CopyExtensionManager {
        return this._copyExtensionManager;
    }

    getDragAndDropExtensionManager(): DragAndDropExtensionManager {
        return this._dragAndDropExtensionManager;
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
