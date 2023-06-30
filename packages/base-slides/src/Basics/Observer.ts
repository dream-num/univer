import { IKeyboardEvent } from '@univerjs/base-render';
import { Observable, Plugin } from '@univerjs/core';
// import { SlideBar } from '@univerjs/ui-plugin-slides/src/View/SlideBar/SlideBar';
// import { SlideContainer } from '../View/UI/SlideContainer';
// import { Toolbar } from '../View/UI/ToolBar/Toolbar';

export type SlidePluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<string>;
    onAfterChangeFontSizeObservable: Observable<number>;
    onAfterChangeFontWeightObservable: Observable<boolean>;
    onAfterChangeFontItalicObservable: Observable<boolean>;
    onAfterChangeFontStrikethroughObservable: Observable<boolean>;
    onAfterChangeFontUnderlineObservable: Observable<boolean>;
    onAfterChangeFontBackgroundObservable: Observable<string>;
    onAfterChangeFontColorObservable: Observable<string>;

    onChangeCurrentSheetObserver: Observable<string>;

    // onToolbarDidMountObservable: Observable<Toolbar>;
    // onSlideBarDidMountObservable: Observable<SlideBar>;

    // onSlideContainerDidMountObservable: Observable<SlideContainer>;

    onSpreadsheetKeyDownObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyUpObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyCopyObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyPasteObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyCutObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyCompositionStartObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyCompositionUpdateObservable: Observable<IKeyboardEvent>;
    onSpreadsheetKeyCompositionEndObservable: Observable<IKeyboardEvent>;
};

export function uninstall(plugin: Plugin) {
    plugin.deleteObserve('onAfterChangeFontFamilyObservable');
    plugin.deleteObserve('onAfterChangeFontSizeObservable');
    plugin.deleteObserve('onAfterChangeFontWeightObservable');
    plugin.deleteObserve('onAfterChangeFontItalicObservable');
    plugin.deleteObserve('onAfterChangeFontStrikethroughObservable');
    plugin.deleteObserve('onAfterChangeFontUnderlineObservable');
    plugin.deleteObserve('onAfterChangeFontBackgroundObservable');
    plugin.deleteObserve('onAfterChangeFontColorObservable');

    plugin.deleteObserve('onToolbarDidMountObservable');
    plugin.deleteObserve('onSlideBarDidMountObservable');

    plugin.deleteObserve('onChangeCurrentSheetObserver');
    plugin.deleteObserve('onSlideContainerDidMountObservable');
    plugin.deleteObserve('onSpreadsheetKeyDownObservable');
    plugin.deleteObserve('onSpreadsheetKeyUpObservable');
    plugin.deleteObserve('onSpreadsheetKeyCopyObservable');
    plugin.deleteObserve('onSpreadsheetKeyPasteObservable');
    plugin.deleteObserve('onSpreadsheetKeyCutObservable');
    plugin.deleteObserve('onSpreadsheetKeyCompositionStartObservable');
    plugin.deleteObserve('onSpreadsheetKeyCompositionUpdateObservable');
    plugin.deleteObserve('onSpreadsheetKeyCompositionEndObservable');
}

export function install(plugin: Plugin) {
    plugin.pushToObserve('onAfterChangeFontFamilyObservable');
    plugin.pushToObserve('onAfterChangeFontSizeObservable');
    plugin.pushToObserve('onAfterChangeFontWeightObservable');
    plugin.pushToObserve('onAfterChangeFontItalicObservable');
    plugin.pushToObserve('onAfterChangeFontStrikethroughObservable');
    plugin.pushToObserve('onAfterChangeFontUnderlineObservable');
    plugin.pushToObserve('onAfterChangeFontBackgroundObservable');
    plugin.pushToObserve('onAfterChangeFontColorObservable');

    plugin.pushToObserve('onDragAndDropStartObserver');
    plugin.pushToObserve('onDragAndDroppingObserver');
    plugin.pushToObserve('onDragAndDropEndEndObserver');
    plugin.pushToObserve('onFillStartObserver');
    plugin.pushToObserve('onFillingObserver');
    plugin.pushToObserve('onFillEndObserver');

    plugin.pushToObserve('onChangeCurrentSheetObserver');

    plugin.pushToObserve('onToolbarDidMountObservable');

    plugin.pushToObserve('onSheetBarDidMountObservable');
    plugin.pushToObserve('onCountBarDidMountObservable');
    plugin.pushToObserve('onInfoBarDidMountObservable');
    plugin.pushToObserve('onSlideBarDidMountObservable');
    plugin.pushToObserve('onRightMenuDidMountObservable');
    plugin.pushToObserve('onSlideContainerDidMountObservable');
    plugin.pushToObserve('onSpreadsheetKeyDownObservable');
    plugin.pushToObserve('onSpreadsheetKeyUpObservable');
    plugin.pushToObserve('onSpreadsheetKeyCopyObservable');
    plugin.pushToObserve('onSpreadsheetKeyPasteObservable');
    plugin.pushToObserve('onSpreadsheetKeyCutObservable');
    plugin.pushToObserve('onSpreadsheetKeyCompositionStartObservable');
    plugin.pushToObserve('onSpreadsheetKeyCompositionUpdateObservable');
    plugin.pushToObserve('onSpreadsheetKeyCompositionEndObservable');
}
