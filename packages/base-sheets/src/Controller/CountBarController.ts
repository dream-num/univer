import { ICurrentUniverService, ObserverManager, UIObserver } from '@univerjs/core';
import { Inject, SkipSelf } from '@wendellhu/redi';

export class CountBarController {
    constructor(
        @SkipSelf() @Inject(ObserverManager) private _globalObserverManager: ObserverManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        this._getCoreObserver<number>('onUIChangeObservable').add(({ name, value }) => {
            switch (name) {
                case 'changeZoom': {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
                    if (workbook) {
                        // workbook.getActiveSheet().setZoomRatio(value!);
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
