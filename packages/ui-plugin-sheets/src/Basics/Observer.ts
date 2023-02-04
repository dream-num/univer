import { Observable } from '@univerjs/core';
import { SheetUIPlugin } from '../SheetUIPlugin';

export type SheetUIPluginObserve = {
    onAfterChangeUISkinObservable: Observable<void>;
    onAfterChangeUILocaleObservable: Observable<void>;
};

export function uninstallObserver(plugin: SheetUIPlugin) {
    plugin.deleteObserve('onAfterChangeUISkinObservable');
    plugin.deleteObserve('onAfterChangeUILocaleObservable');
}

export function installObserver(plugin: SheetUIPlugin) {
    plugin.pushToObserve('onAfterChangeUISkinObservable');
    plugin.pushToObserve('onAfterChangeUILocaleObservable');
}
