import { Observable } from '@univerjs/core';

import { NumfmtPlugin } from '../NumfmtPlugin';
import { NumfmtModal } from '../View/UI/NumfmtModal';

export type NumfmtPluginObserve = {
    onNumfmtModalDidMountObservable: Observable<NumfmtModal>;
};

export function uninstall(plugin: NumfmtPlugin) {
    plugin.deleteObserve('onNumfmtModalDidMountObservable');
}

export function install(plugin: NumfmtPlugin) {
    plugin.pushToObserve('onNumfmtModalDidMountObservable');
}
