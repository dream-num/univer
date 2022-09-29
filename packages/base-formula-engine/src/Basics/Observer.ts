import { BooleanNumber, IKeyValue, Observable, Plugin } from '@univer/core';
import { LexerNode } from '../Analysis/LexerNode';

interface ISelectionControlFillConfig {}

interface ISelectionControlDragAndDropConfig {}

export type FormulaEnginePluginObserver = {
    onBeforeFormulaCalculateObservable: Observable<string>;
    onAfterFormulaLexerObservable: Observable<LexerNode>;
};

export function uninstall(plugin: Plugin) {
    plugin.deleteObserve('onBeforeFormulaCalculateObservable');
    plugin.deleteObserve('onAfterFormulaLexerObservable');
}

export function install(plugin: Plugin) {
    plugin.pushToObserve('onBeforeFormulaCalculateObservable');
    plugin.deleteObserve('onAfterFormulaLexerObservable');
}
