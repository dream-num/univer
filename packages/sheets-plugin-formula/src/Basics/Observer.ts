import { Observable } from '@univerjs/core';
import { FormulaPlugin } from '../FormulaPlugin';
import { HelpFunction, SearchFunction } from '../View/UI/FormulaPrompt';
import { SearchFormulaModal } from '../View/UI/SearchFormulaModal/SearchFormulaModal';
import { SearchItem } from '../View/UI/SearchFormulaModal/SearchItem';

export type FormulaPluginObserve = {
    onSearchFormulaModalDidMountObservable: Observable<SearchFormulaModal>;
    onSearchItemDidMountObservable: Observable<SearchItem>;
    onSearchFunctionDidMountObservable: Observable<SearchFunction>;
    onHelpFunctionDidMountObservable: Observable<HelpFunction>;
};

export function uninstall(plugin: FormulaPlugin) {
    plugin.deleteObserve('onSearchFormulaModalDidMountObservable');
    plugin.deleteObserve('onSearchItemDidMountObservable');
    plugin.deleteObserve('onSearchFunctionDidMountObservable');
    plugin.deleteObserve('onHelpFunctionDidMountObservable');
}

export function install(plugin: FormulaPlugin) {
    plugin.pushToObserve('onSearchFormulaModalDidMountObservable');
    plugin.pushToObserve('onSearchItemDidMountObservable');
    plugin.pushToObserve('onSearchFunctionDidMountObservable');
    plugin.pushToObserve('onHelpFunctionDidMountObservable');
}
