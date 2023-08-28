import { Observable, ObserverManager } from '../Observer';

export class WorkBookObserverImpl {
    install(manager: ObserverManager) {
        // const manager = this.getObserverManager();

        manager.addObserver('onAfterSetSelectionObservable', 'core', new Observable());

        manager.addObserver('onBeforeChangeNameObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeNameObservable', 'core', new Observable());

        manager.addObserver('onBeforeChangeActiveSheetObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeActiveSheetObservable', 'core', new Observable());

        manager.addObserver('onBeforeChangeSheetNameObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeSheetNameObservable', 'core', new Observable());

        manager.addObserver('onBeforeInsertSheetObservable', 'core', new Observable());
        manager.addObserver('onAfterInsertSheetObservable', 'core', new Observable());

        manager.addObserver('onBeforeChangeSheetColorObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeSheetColorObservable', 'core', new Observable());

        manager.addObserver('onBeforeChangeSheetDataObservable', 'core', new Observable());
        manager.addObserver('onAfterChangeSheetDataObservable', 'core', new Observable());

        manager.addObserver('onSheetBarDidMountObservable', 'core', new Observable());
        manager.addObserver('onInfoBarDidMountObservable', 'core', new Observable());
        manager.addObserver('onRightMenuDidMountObservable', 'core', new Observable());

        manager.addObserver('onAfterChangeSheetScrollObservable', 'core', new Observable());
        manager.addObserver('onSheetRenderDidMountObservable', 'core', new Observable());
        manager.addObserver('onHideSheetObservable', 'core', new Observable());
        manager.addObserver('onShowSheetObservable', 'core', new Observable());
        manager.addObserver('onSheetTabColorChangeObservable', 'core', new Observable());
        manager.addObserver('onSheetOrderObservable', 'core', new Observable());
        manager.addObserver('onZoomRatioSheetObservable', 'core', new Observable());
    }
}
