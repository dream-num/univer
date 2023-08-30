import {
    BorderType,
    HorizontalAlign,
    UIObserver,
    VerticalAlign,
    WrapStrategy,
    ObserverManager,
    ICurrentUniverService,
    ICommandService,
    UndoCommand,
    RedoCommand,
} from '@univerjs/core';
import { Inject, SkipSelf } from '@wendellhu/redi';

import { SelectionController } from './Selection/SelectionController';

import { SelectionModel } from '../Model';
import { ISelectionManager } from '../Services/tokens';
import { CellEditorController } from './CellEditorController';
import { SelectionManager } from './Selection';
import { BasicWorksheetController, IStyleTypeValue } from './BasicWorksheet.controller';

export interface BorderInfo {
    type: BorderType;
    color: string;
    style: number;
}

interface backgroundStyleValue {
    rgb: string;
}

export class ToolbarController {
    constructor(
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @ICommandService private readonly _commandService: ICommandService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @Inject(CellEditorController) private readonly _cellEditorController: CellEditorController,
        @Inject(BasicWorksheetController) private readonly _basicWorksheetController: BasicWorksheetController
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

    private setRedo() {
        this._commandService.executeCommand(RedoCommand.id);
    }

    private setUndo() {
        this._commandService.executeCommand(UndoCommand.id);
    }

    private setFontColor(value: string) {
        this._selectionManager.getActiveRangeList()?.setFontColor(value);
    }

    private setBackground(value: string) {
        const range = this._selectionManager.getActiveRangeData();
        if (!range) return;
        const workbookId = this._currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const style: IStyleTypeValue<backgroundStyleValue> = {
            type: 'bg',
            value: {
                rgb: value,
            },
        };
        this._basicWorksheetController.setStyle(workbookId, worksheetId, style, [range]);
    }

    private setFontSize(value: number) {
        this._selectionManager.getActiveRangeList()?.setFontSize(value);
    }

    private setFontFamily(value: string) {
        this._selectionManager.getActiveRangeList()?.setFontFamily(value);
    }

    private setFontWeight(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setFontWeight(value);
    }

    private setFontStyle(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setFontStyle(value);
    }

    private setStrikeThrough(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setStrikeThrough(value);
    }

    private setUnderline(value: boolean) {
        this._selectionManager.getActiveRangeList()?.setUnderline(value);
    }

    private setMerge(value: string) {
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

    private setHorizontalAlignment(value: HorizontalAlign) {
        this._selectionManager.getActiveRangeList()?.setHorizontalAlignment(value);
    }

    private setVerticalAlignment(value: VerticalAlign) {
        this._selectionManager.getActiveRangeList()?.setVerticalAlignment(value);
    }

    private setWrapStrategy(value: WrapStrategy) {
        this._selectionManager.getActiveRangeList()?.setWrapStrategy(value);
    }

    private setTextRotation(value: number | string) {
        if (value === 'v') {
            this._selectionManager.getActiveRangeList()?.setVerticalText(1);
        } else {
            this._selectionManager.getActiveRangeList()?.setTextRotation(value as number);
        }
    }

    private setBorder(info: BorderInfo) {
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