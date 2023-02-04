import { Observable } from '@univerjs/core';
import { BaseComponentPlugin } from '../BaseComponentPlugin';

export type BaseComponentPluginObserve = {
    onAfterChangeUISkinObservable: Observable<void>;
    onAfterChangeUILocaleObservable: Observable<void>;
};

export function uninstallObserver(plugin: BaseComponentPlugin) {
    plugin.deleteObserve('onAfterChangeUISkinObservable');
    plugin.deleteObserve('onAfterChangeUILocaleObservable');
}

export function installObserver(plugin: BaseComponentPlugin) {
    plugin.pushToObserve('onAfterChangeUISkinObservable');
    plugin.pushToObserve('onAfterChangeUILocaleObservable');
}
