import {
    BorderType,
    HorizontalAlign,
    UIObserver,
    VerticalAlign,
    WrapStrategy,
    ObserverManager,
    ICurrentUniverService,
    IDCurrentUniverService,
    CommandManager,
} from '@univerjs/core';
import { Inject, SkipSelf } from '@wendellhu/redi';

import { SelectionController } from './Selection/SelectionController';

import { SelectionModel } from '../Model';
import { ISelectionManager } from '../Services/tokens';
import { CellEditorController } from './CellEditorController';
import { SelectionManager } from './Selection';

export interface BorderInfo {
    type: BorderType;
    color: string;
    style: number;
}

export class ToolbarController {
    constructor(
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(CommandManager) private readonly _commandManager: CommandManager,
        @IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @Inject(CellEditorController) private readonly _cellEditorController: CellEditorController
    ) {
        this._initialize();
    }

    listenEventManager() {
        const cellEditorController = this._cellEditorController;
        this._globalObserverManager.requiredObserver<UIObserver<number>>('onUIChangeObservable', 'core').add((msg) => {
            switch (msg.name) {
                case 'undo':
                    this.setUndo();
                    break;
                case 'redo':
                    this.setRedo();
                    break;
            }
        });

        this._globalObserverManager.requiredObserver<UIObserver<number>>('onUIChangeObservable', 'core').add((msg) => {
            if (cellEditorController.getEditMode()) return;
            switch (msg.name) {
                case 'fontSize':
                    this.setFontSize(msg.value!);
                    break;
                case 'textRotation':
                    this.setTextRotation(msg.value!);
                    break;
                case 'wrapStrategy':
                    this.setWrapStrategy(msg.value!);
                    break;
                case 'verticalAlignment':
                    this.setVerticalAlignment(msg.value!);
                    break;
                case 'horizontalAlignment':
                    this.setHorizontalAlignment(msg.value!);
                    break;
            }
        });

        this._globalObserverManager.requiredObserver<UIObserver<BorderInfo>>('onUIChangeObservable', 'core').add((msg) => {
            if (cellEditorController.getEditMode()) return;
            switch (msg.name) {
                case 'borderInfo':
                    this.setBorder(msg.value!);
                    break;
            }
        });

        this._globalObserverManager.requiredObserver<UIObserver<string>>('onUIChangeObservable', 'core').add((msg) => {
            if (cellEditorController.getEditMode()) return;
            switch (msg.name) {
                case 'fontFamily':
                    this.setFontFamily(msg.value!);
                    break;
                case 'fontColor':
                    this.setFontColor(msg.value!);
                    break;
                case 'background':
                    this.setBackground(msg.value!);
                    break;
                case 'merge':
                    this.setMerge(msg.value!);
                    break;
            }
        });

        this._globalObserverManager.requiredObserver<UIObserver<boolean>>('onUIChangeObservable', 'core').add((msg) => {
            if (cellEditorController.getEditMode()) return;
            switch (msg.name) {
                case 'fontWeight':
                    this.setFontWeight(msg.value!);
                    break;
                case 'fontStyle':
                    this.setFontStyle(msg.value!);
                    break;
                case 'strikeThrough':
                    this.setStrikeThrough(msg.value!);
                    break;
                case 'underLine':
                    this.setUnderline(msg.value!);
                    break;
            }
        });
    }

    _initialize() {
        // this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.add((value: string) => {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('ff', value);
        // });
        // this._plugin.getObserver('onAfterChangeFontItalicObservable')?.add((value: boolean) => {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('it', value ? '1' : '0');
        // });
        // this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.add((value: boolean) => {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('cl', value ? '1' : '0');
        // });
        // this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.add((value: boolean) => {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('un', value ? '1' : '0');
        // });
        // this._plugin.getObserver('onAfterChangeFontColorObservable')?.add((value: string) => {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('fc', value);
        // });
        // this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.add((value: string) => {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('bg', value);
        // });
    }

    setRedo() {
        this._commandManager.redo();
    }

    setUndo() {
        this._commandManager.undo();
    }

    setFontColor(value: string) {
        this._selectionManager.getActiveRangeList()?.setFontColor(value);
    }

    setBackground(value: string) {
        this._selectionManager.getActiveRangeList()?.setBackground(value);
    }

    setFontSize(value: number) {
        this._selectionManager.getActiveRangeList()?.setFontSize(value);
    }

    setFontFamily(value: string) {
        this._selectionManager.getActiveRangeList()?.setFontFamily(value);
    }

    setFontWeight(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setFontWeight(value);
    }

    setFontStyle(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setFontStyle(value);
    }

    setStrikeThrough(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setStrikeThrough(value);
    }

    setUnderline(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setUnderline(value);
    }

    setMerge(value: string) {
        const currentRange = this._selectionManager.getActiveRange();

        switch (value) {
            case 'all':
                currentRange?.merge();
                break;

            case 'vertical':
                currentRange?.mergeVertically();
                break;

            case 'horizontal':
                currentRange?.mergeAcross();
                break;

            case 'cancel':
                currentRange?.breakApart();
                break;

            default:
                break;
        }
    }

    setHorizontalAlignment(value: HorizontalAlign) {
        this._selectionManager.getActiveRangeList()?.setHorizontalAlignment(value);
    }

    setVerticalAlignment(value: VerticalAlign) {
        this._selectionManager.getActiveRangeList()?.setVerticalAlignment(value);
    }

    setWrapStrategy(value: WrapStrategy) {
        this._selectionManager.getActiveRangeList()?.setWrapStrategy(value);
    }

    setTextRotation(value: number | string) {
        if (value === 'v') {
            this._selectionManager.getActiveRangeList()?.setVerticalText(1);
        } else {
            this._selectionManager.getActiveRangeList()?.setTextRotation(value as number);
        }
    }

    setBorder(info: BorderInfo) {
        const controls = this._selectionManager.getCurrentControls();

        if (controls && controls.length > 0) {
            controls?.forEach((control: SelectionController) => {
                const model: SelectionModel = control.model;
                const range = {
                    startRow: model.startRow,
                    startColumn: model.startColumn,
                    endRow: model.endRow,
                    endColumn: model.endColumn,
                };

                this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet().getRange(range).setBorderByType(info.type, info.color, info.style);
            });
        }
    }
}
