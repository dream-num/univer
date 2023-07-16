import { Plugin } from '@univerjs/core';

interface ISelectionControlFillConfig {}

interface ISelectionControlDragAndDropConfig {}

export function uninstall(plugin: Plugin) {
    plugin.deleteObserve('onBeforeFormulaCalculateObservable');
    plugin.deleteObserve('onAfterFormulaLexerObservable');
}

export function install(plugin: Plugin) {
    plugin.pushToObserve('onBeforeFormulaCalculateObservable');
    plugin.deleteObserve('onAfterFormulaLexerObservable');
}
