import { Range, HorizontalAlign, VerticalAlign, WrapStrategy, BorderType, UIObserver } from '@univerjs/core';
import { SheetPlugin } from '../SheetPlugin';

import { SelectionControl } from './Selection/SelectionController';

import { SelectionModel, ToolbarModel } from '../Model';

interface BorderInfo {
    type: BorderType;
    color: string;
    style: number;
}

/**
 *
 */
export class ToolbarController {
    private _toolbarModel: ToolbarModel;

    private _plugin: SheetPlugin;

    private _changeToolbarState(range: Range): void {
        const workbook = this._plugin.getContext().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        if (worksheet) {
            const cellMatrix = worksheet.getCellMatrix();
            const strikeThrough = range.getStrikeThrough();
            const fontSize = range.getFontSize();
            const fontWeight = range.getFontWeight();
            const fontName = range.getFontFamily();
            const fontItalic = range.getFontStyle();
            const underline = range.getUnderline();
            const horizontalAlign = range.getHorizontalAlignment();
            const verticalAlign = range.getVerticalAlignment();
            const rotation = range.getTextRotation();

            // const textRotateModeItem = this._toolList.find((item) => item.name === 'textRotateMode');
            // const fontSizeItem = this._toolList.find((item) => item.name === 'fontSize');
            // const fontNameItem = this._toolList.find((item) => item.name === 'font');
            // const fontBoldItem = this._toolList.find((item) => item.name === 'bold');
            // const fontItalicItem = this._toolList.find((item) => item.name === 'italic');
            // const strikethroughItem = this._toolList.find((item) => item.name === 'strikethrough');
            // const underlineItem = this._toolList.find((item) => item.name === 'underline');
            // const horizontalAlignModeItem = this._toolList.find((item) => item.name === 'horizontalAlignMode');
            // const verticalAlignModeItem = this._toolList.find((item) => item.name === 'verticalAlignMode');

            // if (strikethroughItem) {
            //     strikethroughItem.active = !!(strikeThrough && strikeThrough.s);
            // }
            // if (fontNameItem) {
            //     fontNameItem.children?.forEach((item) => {
            //         item.selected = fontName === item.value;
            //     });
            // }
            // if (fontSizeItem) {
            //     fontSizeItem.children?.forEach((item) => {
            //         item.selected = fontSize === item.value;
            //     });
            // }
            // if (fontBoldItem) {
            //     fontBoldItem.active = !!fontWeight;
            // }
            // if (fontItalicItem) {
            //     fontItalicItem.active = !!fontItalic;
            // }
            // if (underlineItem) {
            //     underlineItem.active = !!(underline && underline.s);
            // }
            // if (horizontalAlignModeItem) {
            //     horizontalAlignModeItem.children?.forEach((item) => {
            //         item.selected = horizontalAlign === item.value;
            //     });
            // }
            // if (textRotateModeItem) {
            //     textRotateModeItem.children?.forEach((item) => {
            //         item.selected = rotation === item.value;
            //     });
            // }
            // if (verticalAlignModeItem) {
            //     verticalAlignModeItem.children?.forEach((item) => {
            //         item.selected = verticalAlign === item.value;
            //     });
            // }
        }
    }

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
                    case 'fontSize':
                        this.setFontSize(msg.value!);
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
                console.dir(msg);
                switch (msg.name) {
                    case 'fontWeight':
                        this.setFontWeight(msg.value!);
                        break;
                }
            });
    }

    _initialize() {
        // this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.add((value: string) => {
        //     if (!this._plugin.getCellEditorController().isEditMode) {
        //         this.setFontFamily(value);
        //     } else {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('ff', value);
        //     }
        // });
        // this._plugin.getObserver('onAfterChangeFontItalicObservable')?.add((value: boolean) => {
        //     if (!this._plugin.getCellEditorController().isEditMode) {
        //         this.setFontStyle(value);
        //     } else {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('it', value ? '1' : '0');
        //     }
        // });
        // this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.add((value: boolean) => {
        //     if (!this._plugin.getCellEditorController().isEditMode) {
        //         this.setStrikeThrough(value);
        //     } else {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('cl', value ? '1' : '0');
        //     }
        // });
        // this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.add((value: boolean) => {
        //     if (!this._plugin.getCellEditorController().isEditMode) {
        //         this.setUnderline(value);
        //     } else {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('un', value ? '1' : '0');
        //     }
        // });
        // this._plugin.getObserver('onAfterChangeFontColorObservable')?.add((value: string) => {
        //     if (!this._plugin.getCellEditorController().isEditMode) {
        //         this.setFontColor(value);
        //     } else {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('fc', value);
        //     }
        // });
        // this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.add((value: string) => {
        //     if (!this._plugin.getCellEditorController().isEditMode) {
        //         this.setBackground(value);
        //     } else {
        //         this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('bg', value);
        //     }
        // });
        // // Monitor selection changes, update toolbar button status and values TODO: 根据不同的焦点对象，接受
        // this._plugin.getObserver('onChangeSelectionObserver')?.add((selectionControl: SelectionControl) => {
        //     // const currentCell = selectionControl.model.currentCell;
        //     //
        //     // if (currentCell) {
        //     //     let currentRangeData;
        //     //
        //     //     if (currentCell.isMerged) {
        //     //         const mergeInfo = currentCell.mergeInfo;
        //     //
        //     //         currentRangeData = {
        //     //             startRow: mergeInfo.startRow,
        //     //             endRow: mergeInfo.endRow,
        //     //             startColumn: mergeInfo.startColumn,
        //     //             endColumn: mergeInfo.endColumn,
        //     //         };
        //     //     } else {
        //     //         const { row, column } = currentCell;
        //     //         currentRangeData = {
        //     //             startRow: row,
        //     //             endRow: row,
        //     //             startColumn: column,
        //     //             endColumn: column,
        //     //         };
        //     //     }
        //     //
        //     //     const cellData = this._plugin.getWorkbook().getActiveSheet().getRange(currentRangeData).getObjectValue({ isIncludeStyle: true });
        //     // }
        //     const manager = this._plugin.getSelectionManager();
        //     const range = manager?.getCurrentCell();
        //     if (range) {
        //         this._changeToolbarState(range);
        //     }
        // });
    }

    setRedo() {
        this._plugin.getContext().getCommandManager().redo();
    }

    setUndo() {
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
