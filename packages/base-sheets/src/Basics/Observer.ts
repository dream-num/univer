import { IKeyboardEvent } from '@univer/base-render';
import { Observable, Plugin } from '@univer/core';
import { FormulaBar } from '../View/UI/FormulaBar/FormulaBar';
import { SelectionControl } from '../Controller/Selection/SelectionController';
import { SheetContainer } from '../View/UI/SheetContainer';
import { ToolBar } from '../View/UI/ToolBar/ToolBar';
import { LineColor } from '../View/UI/Common/Line/LineColor';
import { ModalGroup } from '../View/UI/ModalGroup/ModalGroup';
import { RichText } from '../View/UI/RichText/RichText';
import { CellRangeModal } from '../View/UI/Common/CellRange/CellRangeModal';

interface ISelectionControlFillConfig {}

interface ISelectionControlDragAndDropConfig {}

export type SheetPluginObserve = {
    onAfterChangeFontFamilyObservable: Observable<string>;
    onAfterChangeFontSizeObservable: Observable<number>;
    onAfterChangeFontWeightObservable: Observable<boolean>;
    onAfterChangeFontItalicObservable: Observable<boolean>;
    onAfterChangeFontStrikethroughObservable: Observable<boolean>;
    onAfterChangeFontUnderlineObservable: Observable<boolean>;
    onAfterChangeFontBackgroundObservable: Observable<string>;
    onAfterChangeFontColorObservable: Observable<string>;

    onDragAndDropStartObserver: Observable<ISelectionControlDragAndDropConfig>;

    onDragAndDroppingObserver: Observable<ISelectionControlDragAndDropConfig>;

    onDragAndDropEndEndObserver: Observable<ISelectionControlDragAndDropConfig>;

    onFillStartObserver: Observable<ISelectionControlFillConfig>;

    onFillingObserver: Observable<ISelectionControlFillConfig>;

    onFillEndObserver: Observable<ISelectionControlFillConfig>;

    onChangeSelectionObserver: Observable<SelectionControl>;

    onChangeCurrentSheetObserver: Observable<string>;

    onToolBarDidMountObservable: Observable<ToolBar>;

    onModalGroupDidMountObservable: Observable<ModalGroup>;

    onRichTextDidMountObservable: Observable<RichText>;

    onFormulaBarDidMountObservable: Observable<FormulaBar>;

    onLineColorDidMountObservable: Observable<LineColor>;

    onSheetContainerDidMountObservable: Observable<SheetContainer>;
    onCellRangeModalDidMountObservable: Observable<CellRangeModal>;

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

    plugin.deleteObserve('onDragAndDropStartObserver');
    plugin.deleteObserve('onDragAndDroppingObserver');
    plugin.deleteObserve('onDragAndDropEndEndObserver');
    plugin.deleteObserve('onFillStartObserver');
    plugin.deleteObserve('onFillingObserver');
    plugin.deleteObserve('onFillEndObserver');
    plugin.deleteObserve('onChangeSelectionObserver');

    plugin.deleteObserve('onToolBarDidMountObservable');
    plugin.deleteObserve('onModalGroupDidMountObservable');
    plugin.deleteObserve('onRichTextDidMountObservable');
    plugin.deleteObserve('onFormulaBarDidMountObservable');

    plugin.deleteObserve('onChangeCurrentSheetObserver');
    plugin.deleteObserve('onSheetContainerDidMountObservable');
    plugin.deleteObserve('onCellRangeModalDidMountObservable');
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
    plugin.pushToObserve('onChangeSelectionObserver');

    plugin.pushToObserve('onChangeCurrentSheetObserver');

    plugin.pushToObserve('onToolBarDidMountObservable');
    plugin.pushToObserve('onCellRangeModalDidMountObservable');
    plugin.pushToObserve('onModalGroupDidMountObservable');
    plugin.pushToObserve('onRichTextDidMountObservable');
    plugin.pushToObserve('onFormulaBarDidMountObservable');

    plugin.pushToObserve('onLineColorDidMountObservable');
    plugin.pushToObserve('onSheetBarDidMountObservable');
    plugin.pushToObserve('onCountBarDidMountObservable');
    plugin.pushToObserve('onInfoBarDidMountObservable');
    plugin.pushToObserve('onRightMenuDidMountObservable');
    plugin.pushToObserve('onSheetContainerDidMountObservable');
    plugin.pushToObserve('onSpreadsheetKeyDownObservable');
    plugin.pushToObserve('onSpreadsheetKeyUpObservable');
    plugin.pushToObserve('onSpreadsheetKeyCopyObservable');
    plugin.pushToObserve('onSpreadsheetKeyPasteObservable');
    plugin.pushToObserve('onSpreadsheetKeyCutObservable');
    plugin.pushToObserve('onSpreadsheetKeyCompositionStartObservable');
    plugin.pushToObserve('onSpreadsheetKeyCompositionUpdateObservable');
    plugin.pushToObserve('onSpreadsheetKeyCompositionEndObservable');
}
