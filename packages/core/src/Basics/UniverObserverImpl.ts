import { Observable, ObserverManager } from '../Observer';

export class UniverObserverImpl {
    install(manager: ObserverManager) {
        // Event = > UIChange
        manager.addObserver('onUIChangeObservable', 'core', new Observable());
        manager.addObserver('onUIDidMountObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeUISkinObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeUILocaleObservable', 'core', new Observable());
        manager.addObserver('onViewComponentFocusChange', 'core', new Observable());

        // SheetBar
        manager.addObserver('onAddSheet', 'core', new Observable());
        manager.addObserver('onDeleteSheet', 'core', new Observable());
        manager.addObserver('onHideSheet', 'core', new Observable());
        manager.addObserver('onUnHideSheet', 'core', new Observable());
        manager.addObserver('onToLeftSheet', 'core', new Observable());
        manager.addObserver('onToRightSheet', 'core', new Observable());
        manager.addObserver('onCopySheet', 'core', new Observable());
        manager.addObserver('onRemoveSheet', 'core', new Observable());
        manager.addObserver('onSheetColor', 'core', new Observable());
    }
}
