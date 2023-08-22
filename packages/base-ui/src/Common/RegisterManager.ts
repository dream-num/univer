import { CommandManager, ICurrentUniverService, ObserverManager } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { IPasteData, IDragAndDropData } from '../Basics/Interfaces';
import { PasteExtensionManager, DragAndDropExtensionManager, CopyExtensionManager } from '../Basics/Register';

export class RegisterManager {
    private _pasteExtensionManager: PasteExtensionManager;

    private _copyExtensionManager: CopyExtensionManager;

    private _dragAndDropExtensionManager: DragAndDropExtensionManager;

    constructor(
        @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(CommandManager) private readonly _comandManager: CommandManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        this.initialize();
    }

    initialize(): void {
        this.setClipboardExtensionManager();
        this.setDragAndDropExtensionManager();
    }

    setClipboardExtensionManager() {
        this._pasteExtensionManager = new PasteExtensionManager(this._comandManager, this._currentUniverService);
        this._copyExtensionManager = new CopyExtensionManager();
        const onKeyPasteObservable = this._globalObserverManager.getObserver<ClipboardEvent>('onKeyPasteObservable', 'core');
        const onKeyCopyObservable = this._globalObserverManager.getObserver<ClipboardEvent>('onKeyCopyObservable', 'core');

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

        const onDropObservable = this._globalObserverManager.getObserver<DragEvent>('onDropObservable', 'core');

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
