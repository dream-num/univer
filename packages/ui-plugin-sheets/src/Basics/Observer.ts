import { Observable } from '@univerjs/core';
import { SheetUIPlugin } from '../SheetUIPlugin';

export type SheetUIPluginObserve = {
    // onAfterChangeUILocaleObservable: Observable<void>;

        // onRichTextDidMountObservable: Observable<RichText>;
        onRichTextKeyDownObservable: Observable<KeyboardEvent>;
        onRichTextKeyUpObservable: Observable<KeyboardEvent>;
};

export function uninstallObserver(plugin: SheetUIPlugin) {
    // plugin.deleteObserve('onAfterChangeUILocaleObservable');

    // plugin.deleteObserve('onRichTextDidMountObservable');
    plugin.deleteObserve('onRichTextKeyDownObservable');
    plugin.deleteObserve('onRichTextKeyUpObservable');

}

export function installObserver(plugin: SheetUIPlugin) {
    // plugin.pushToObserve('onAfterChangeUILocaleObservable');

        // plugin.pushToObserve('onRichTextDidMountObservable');
        plugin.pushToObserve('onRichTextKeyDownObservable');
        plugin.pushToObserve('onRichTextKeyUpObservable');
}
