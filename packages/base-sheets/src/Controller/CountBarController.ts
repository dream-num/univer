import { Inject, SkipSelf } from '@wendellhu/redi';
import { UIObserver, ObserverManager, ICurrentUniverService, IDCurrentUniverService } from '@univerjs/core';

export class CountBarController {
    constructor(
        @SkipSelf() @Inject(ObserverManager) private _globalObserverManager: ObserverManager,
        @IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {}

    listenEventManager(): void {
        this._getCoreObserver<number>('onUIChangeObservable').add(({ name, value }) => {
            switch (name) {
                case 'changeZoom': {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
                    if (workbook) {
                        workbook.getActiveSheet().setZoomRatio(value!);
                    }
                    break;
                }
            }
        });
    }

    protected _getCoreObserver<T>(type: string) {
        return this._globalObserverManager.requiredObserver<UIObserver<T>>(type, 'core');
    }
}
