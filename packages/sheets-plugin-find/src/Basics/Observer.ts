import { Observable } from '@univerjs/core';
import { FindPlugin } from '../FindPlugin';
import { FindModal } from '../View/UI/FindModal';
import { SearchContent } from '../View/UI/SearchContent';

export type FindPluginObserve = {
    onFindModalDidMountObservable: Observable<FindModal>;
    onSearchContentDidMountObservable: Observable<SearchContent>;
};

export function uninstall(plugin: FindPlugin) {
    plugin.deleteObserve('onFindModalDidMountObservable');
    plugin.deleteObserve('onSearchContentDidMountObservable');
}

export function install(plugin: FindPlugin) {
    plugin.pushToObserve('onFindModalDidMountObservable');
    plugin.pushToObserve('onSearchContentDidMountObservable');
}
