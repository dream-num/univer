import { Observable } from '@univer/core';
import { FormulaPlugin } from '../FormulaPlugin';
import { SearchFormulaModal } from '../View/UI/SearchFormulaModal/SearchFormulaModal1';
import { SearchItem } from '../View/UI/SearchFormulaModal/SearchItem';

export type FormulaPluginObserve = {
    onSearchFormulaModalDidMountObservable: Observable<SearchFormulaModal>;
    onSearchItemDidMountObservable: Observable<SearchItem>;
};

export function uninstall(plugin: FormulaPlugin) {
    plugin.deleteObserve('onSearchFormulaModalDidMountObservable');
    plugin.deleteObserve('onSearchItemDidMountObservable');
}

export function install(plugin: FormulaPlugin) {
    plugin.pushToObserve('onSearchFormulaModalDidMountObservable');
    plugin.pushToObserve('onSearchItemDidMountObservable');
}
