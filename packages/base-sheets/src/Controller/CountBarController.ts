import { UIObserver } from '@univerjs/core';
import { SheetPlugin } from '../SheetPlugin';

export class CountBarController {
    private _plugin: SheetPlugin;

    protected _getCoreObserver<T>(type: string) {
        return this._plugin.getGlobalContext().getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;
    }

    getPlugin(): SheetPlugin {
        return this._plugin;
    }

    listenEventManager(): void {
        this._getCoreObserver<number>('onUIChangeObservable').add(({ name, value }) => {
            switch (name) {
                case 'changeZoom': {
                    const workbook = this._plugin.getContext().getWorkBook();
                    if (workbook) {
                        console.log(value);
                        workbook.getActiveSheet().setZoomRatio(value!);
                    }
                    break;
                }
            }
        });
    }
}
