import { Observable } from '@univerjs/core';

import { SheetUIPlugin } from '../SheetUIPlugin';
import { SheetContainer } from '../View';

export type SheetUIPluginObserve = {
    // onAfterChangeUILocaleObservable: Observable<void>;

    onRichTextKeyDownObservable: Observable<KeyboardEvent>;
    onRichTextKeyUpObservable: Observable<KeyboardEvent>;
    onUIDidMount: Observable<SheetContainer>;
};

export function uninstallObserver(plugin: SheetUIPlugin) {
    // plugin.deleteObserve('onAfterChangeUILocaleObservable');

    plugin.deleteObserve('onRichTextKeyDownObservable');
    plugin.deleteObserve('onRichTextKeyUpObservable');
    plugin.deleteObserve('onUIDidMount');
}

export function installObserver(plugin: SheetUIPlugin) {
    // plugin.pushToObserve('onAfterChangeUILocaleObservable');

    plugin.pushToObserve('onRichTextKeyDownObservable');
    plugin.pushToObserve('onRichTextKeyUpObservable');
    plugin.pushToObserve('onUIDidMount');
}
