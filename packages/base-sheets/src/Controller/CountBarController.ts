import { Context, SheetContext, UIObserver } from '@univerjs/core';
import { IGlobalContext, ISheetContext } from '../Services/tokens';

export class CountBarController {
    constructor(@ISheetContext private readonly _sheetContext: SheetContext, @IGlobalContext private readonly _globalContext: Context) {}

    listenEventManager(): void {
        this._getCoreObserver<number>('onUIChangeObservable').add(({ name, value }) => {
            switch (name) {
                case 'changeZoom': {
                    const workbook = this._sheetContext.getWorkBook();
                    if (workbook) {
                        workbook.getActiveSheet().setZoomRatio(value!);
                    }
                    break;
                }
            }
        });
    }

    protected _getCoreObserver<T>(type: string) {
        return this._globalContext.getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }
}
