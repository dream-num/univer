import { HorizontalAlign, VerticalAlign, WrapStrategy, BorderType, UIObserver } from '@univerjs/core';
import { SheetPlugin } from '../SheetPlugin';

import { SelectionControl } from './Selection/SelectionController';

import { SelectionModel } from '../Model';

export interface BorderInfo {
    type: BorderType;
    color: string;
    style: number;
}

/**
 *
 */
export class ToolbarController {
    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    listenEventManager() {
        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
            .getObserverManager()
            .requiredObserver<UIObserver<number>>('onUIChangeObservable', 'core')
            .add((msg) => {
                switch (msg.name) {
                    case 'undo':
                        this.setUndo();
                        break;
                    case 'redo':
                        this.setRedo();
                        break;
                }
            });

        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
            .getObserverManager()
            .requiredObserver<UIObserver<number>>('onUIChangeObservable', 'core')
            .add((msg) => {
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

        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
            .getObserverManager()
            .requiredObserver<UIObserver<BorderInfo>>('onUIChangeObservable', 'core')
            .add((msg) => {
                switch (msg.name) {
                    case 'borderInfo':
                        this.setBorder(msg.value!);
                        break;
                }
            });

        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
            .getObserverManager()
            .requiredObserver<UIObserver<string>>('onUIChangeObservable', 'core')
            .add((msg) => {
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

        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
            .getObserverManager()
            .requiredObserver<UIObserver<boolean>>('onUIChangeObservable', 'core')
            .add((msg) => {
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
        this._plugin.getContext().getCommandManager().redo();
    }

    setUndo() {
        console.log('undo');
        this._plugin.getContext().getCommandManager().undo();
    }

    setFontColor(value: string) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontColor(value);
    }

    setBackground(value: string) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setBackground(value);
    }

    setFontSize(value: number) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontSize(value);
    }

    setFontFamily(value: string) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontFamily(value);
    }

    setFontWeight(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontWeight(value);
    }

    setFontStyle(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontStyle(value);
    }

    setStrikeThrough(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setStrikeThrough(value);
    }

    setUnderline(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setUnderline(value);
    }

    setMerge(value: string) {
        const currentRange = this._plugin.getSelectionManager().getActiveRange();

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
        this._plugin.getSelectionManager().getActiveRangeList()?.setHorizontalAlignment(value);
    }

    setVerticalAlignment(value: VerticalAlign) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setVerticalAlignment(value);
    }

    setWrapStrategy(value: WrapStrategy) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setWrapStrategy(value);
    }

    setTextRotation(value: number | string) {
        if (value === 'v') {
            this._plugin.getSelectionManager().getActiveRangeList()?.setVerticalText(1);
        } else {
            this._plugin
                .getSelectionManager()
                .getActiveRangeList()
                ?.setTextRotation(value as number);
        }
    }

    setBorder(info: BorderInfo) {
        const controls = this._plugin.getSelectionManager().getCurrentControls();

        if (controls && controls.length > 0) {
            controls?.forEach((control: SelectionControl) => {
                const model: SelectionModel = control.model;
                const range = {
                    startRow: model.startRow,
                    startColumn: model.startColumn,
                    endRow: model.endRow,
                    endColumn: model.endColumn,
                };

                this._plugin.getContext().getWorkBook().getActiveSheet().getRange(range).setBorderByType(info.type, info.color, info.style);
            });
        }
    }
}
