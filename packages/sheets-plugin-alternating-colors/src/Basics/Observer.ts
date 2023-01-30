import { Plugin, Observable } from '@univerjs/core';

export type AlternatingColorsPluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<string>;
};

export function uninstall(plugin: Plugin) {
    plugin.deleteObserve('onDidMountAlternatingColorsObservable');
}

export function install(plugin: Plugin) {
    plugin.pushToObserve('onDidMountAlternatingColorsObservable');
}
