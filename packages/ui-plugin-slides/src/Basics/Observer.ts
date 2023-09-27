import { Observable } from '@univerjs/core';

import { SlideUIPlugin } from '../SlideUIPlugin';
import { SlideContainer } from '../View/SlideContainer';

export type SlideUIPluginObserve = {
    onUIDidMount: Observable<SlideContainer>;
};

export function uninstallObserver(plugin: SlideUIPlugin) {
    plugin.deleteObserve('onUIDidMount');
}

export function installObserver(plugin: SlideUIPlugin) {
    plugin.pushToObserve('onUIDidMount');
}
