import { Observable } from '@univerjs/core';
import { SheetUIPlugin } from '../SheetUIPlugin';

export type SheetUIPluginObserve = {
    // onAfterChangeUILocaleObservable: Observable<void>;
};

export function uninstallObserver(plugin: SheetUIPlugin) {
    // plugin.deleteObserve('onAfterChangeUILocaleObservable');
}

export function installObserver(plugin: SheetUIPlugin) {
    // plugin.pushToObserve('onAfterChangeUILocaleObservable');
}
