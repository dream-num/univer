import { BaseComponentRender, BaseComponentSheet, ISelectButton, IToolBarItemProps } from '@univer/base-component';
import { Tools, BorderType, BorderStyleTypes, ICellData, IStyleData, HorizontalAlign, VerticalAlign, WrapStrategy, DEFAULT_STYLES } from '@univer/core';
import { SpreadsheetPlugin } from '../SpreadsheetPlugin';
import { defaultLayout, ILayout } from '../View/UI/SheetContainer';
import {
    BORDER_LINE_CHILDREN,
    FONT_FAMILY_CHILDREN,
    FONT_SIZE_CHILDREN,
    HORIZONTAL_ALIGN_CHILDREN,
    MERGE_CHILDREN,
    MORE_FORMATS_CHILDREN,
    TEXT_ROTATE_CHILDREN,
    TEXT_WRAP_CHILDREN,
    VERTICAL_ALIGN_CHILDREN,
} from '../View/UI/ToolBar/Const';
import { ToolBarModel } from '../Model/Domain/ToolBarModel';
import { ToolBar } from '../View/UI/ToolBar/ToolBar';
import { SelectionControl } from './Selection/SelectionController';
import { SelectionModel } from '../Model/Domain/SelectionModel';

/**
 *
 */
export class ToolBarController {
    private _toolBarModel: ToolBarModel;

    private _plugin: SpreadsheetPlugin;

    private _toolBarComponent: ToolBar;

    Render: BaseComponentRender;

    // all functions need trigger to update tool bar status
    triggerUpdateMap: Map<string, Function> = new Map();

    constructor(plugin: SpreadsheetPlugin) {
        this._plugin = plugin;

        const component = this._plugin.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        const config =
            this._plugin.layout === 'auto'
                ? Tools.deepClone(defaultLayout.toolBarConfig)
                : Tools.deepMerge(defaultLayout.toolBarConfig, (this._plugin.layout as ILayout).toolBarConfig);

        const toolList: IToolBarItemProps[] = [
            {
                locale: 'undo',
                type: 'single',
                icon: 'ForwardIcon',
                show: config.undoRedo,
                onClick: () => {
                    this.setUndo();
                },
            },
            {
                locale: 'redo',
                type: 'single',
                icon: 'BackIcon',
                show: config.undoRedo,
                onClick: () => {
                    this.setRedo();
                },
            },
            {
                locale: 'paintFormat',
                type: 'single',
                icon: 'FormatIcon',
                show: config.paintFormat,
            },
            {
                locale: 'currencyFormat',
                type: 'single',
                icon: 'MoneyIcon',
                show: config.currencyFormat,
            },
            {
                locale: 'percentageFormat',
                type: 'single',
                icon: 'PercentIcon',
                show: config.percentageFormat,
            },
            {
                locale: 'numberDecrease',
                type: 'single',
                icon: 'ReduceNumIcon',
                show: config.numberDecrease,
            },
            {
                locale: 'numberIncrease',
                type: 'single',
                icon: 'AddNumIcon',
                show: config.numberIncrease,
            },
            {
                locale: 'moreFormats',
                type: 'select',
                icon: 'NextIcon',
                needChange: true,
                show: config.moreFormats,
                // onClick: this.handleClickMoreFormats,
                border: true,
                children: [
                    ...MORE_FORMATS_CHILDREN,
                    {
                        locale: 'defaultFmt.CustomFormats.text',
                        border: true,
                        selected: false,
                        icon: 'RightIcon',
                        children: [
                            {
                                locale: 'format.moreCurrency',
                                onClick: (e: string) => {
                                    // this.showFormatModal(e, 'format.titleCurrency');
                                },
                            },
                            {
                                locale: 'format.moreDateTime',
                                onClick: (e: string) => {
                                    // this.showFormatModal(e, 'format.titleDateTime');
                                },
                            },
                            {
                                locale: 'format.moreNumber',
                                onClick: (e: string) => {
                                    // this.showFormatModal(e, 'format.titleNumber');
                                },
                            },
                        ],
                    },
                ],
            },

            {
                locale: 'font',
                type: 'select',
                icon: 'NextIcon',
                show: config.font,
                needChange: true,
                border: true,
                onClick: (fontFamily: string) => {
                    this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.notifyObservers(fontFamily);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('font', cb);
                },
                children: FONT_FAMILY_CHILDREN,
            },

            {
                type: 'select',
                locale: 'fontSize',
                label: String(DEFAULT_STYLES.fs),
                show: config.fontSize,
                selectType: ISelectButton.INPUT_NUMBER,
                needChange: true,
                border: false,
                onKeyUp: (fontSize: number) => {
                    this._plugin.getObserver('onAfterChangeFontSizeObservable')?.notifyObservers(fontSize);
                },
                onClick: (fontSize: number) => {
                    this._plugin.getObserver('onAfterChangeFontSizeObservable')?.notifyObservers(fontSize);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('fontSize', cb);
                },
                icon: 'NextIcon',
                children: FONT_SIZE_CHILDREN,
            },

            {
                locale: 'bold',
                type: 'single',
                icon: 'BoldIcon',
                show: config.bold,
                selected: false,
                onClick: (isBold: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontWeightObservable')?.notifyObservers(isBold);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('bold', cb);
                },
            },

            {
                locale: 'italic',
                type: 'single',
                icon: 'ItalicIcon',
                show: config.italic,
                selected: false,
                onClick: (isItalic: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontItalicObservable')?.notifyObservers(isItalic);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('italic', cb);
                },
            },
            {
                locale: 'strikethrough',
                type: 'single',
                icon: 'DeleteLineIcon',
                show: config.strikethrough,
                selected: false,
                onClick: (isStrikethrough: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.notifyObservers(isStrikethrough);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('strikethrough', cb);
                },
            },
            {
                locale: 'underline',
                type: 'single',
                icon: 'UnderLineIcon',
                show: config.underline,
                selected: false,
                onClick: (isItalic: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.notifyObservers(isItalic);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('underline', cb);
                },
            },
            {
                locale: 'textColor',
                type: 'select',
                label: 'TextColorIcon',
                icon: 'NextIcon',
                selectType: ISelectButton.COLOR,
                show: config.textColor,
                slot: {},
                onClick: (color: string) => {
                    this._plugin.getObserver('onAfterChangeFontColorObservable')?.notifyObservers(color);
                },
            },
            {
                locale: 'fillColor',
                type: 'select',
                label: 'FillColorIcon',
                icon: 'NextIcon',
                selectType: ISelectButton.COLOR,
                show: config.fillColor,
                slot: {},
                onClick: (color: string) => {
                    this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.notifyObservers(color);
                },
            },

            {
                locale: 'borderLine',
                type: 'select',
                label: 'FullBorderIcon',
                icon: 'NextIcon',
                show: config.border,
                needChange: true,
                selectType: ISelectButton.DOUBLE,
                onClick: (type, color, style) => {
                    this.setBorder(type, color, style);
                },
                children: BORDER_LINE_CHILDREN,
            },

            {
                locale: 'mergeCell',
                type: 'select',
                label: 'MergeIcon',
                icon: 'NextIcon',
                show: config.mergeCell,
                selectType: ISelectButton.DOUBLE,
                onClick: (value: string) => {
                    this.setMerge(value);
                },
                children: MERGE_CHILDREN,
            },

            {
                locale: 'horizontalAlignMode',
                type: 'select',
                label: 'LeftAlignIcon',
                icon: 'NextIcon',
                show: config.horizontalAlignMode,
                selectType: ISelectButton.DOUBLE,
                needChange: true,
                onClick: (value: HorizontalAlign) => {
                    this.setHorizontalAlignment(value);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('horizontalAlign', cb);
                },
                children: HORIZONTAL_ALIGN_CHILDREN,
            },
            {
                locale: 'verticalAlignMode',
                type: 'select',
                label: 'BottomVerticalIcon',
                icon: 'NextIcon',
                show: config.verticalAlignMode,
                selectType: ISelectButton.DOUBLE,
                needChange: true,
                onClick: (value: VerticalAlign) => {
                    this.setVerticalAlignment(value);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('verticalAlign', cb);
                },
                children: VERTICAL_ALIGN_CHILDREN,
            },
            {
                locale: 'textWrapMode',
                type: 'select',
                label: 'CutIcon',
                icon: 'NextIcon',
                show: config.textWrapMode,
                selectType: ISelectButton.DOUBLE,
                needChange: true,
                onClick: (value: WrapStrategy) => {
                    this.setWrapStrategy(value);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('textWrap', cb);
                },
                children: TEXT_WRAP_CHILDREN,
            },
            {
                locale: 'textRotateMode',
                type: 'select',
                label: 'TextRotateIcon',
                icon: 'NextIcon',
                show: config.textRotateMode,
                selectType: ISelectButton.DOUBLE,
                needChange: true,
                onClick: (value: number | string) => {
                    this.setTextRotation(value);
                },
                triggerUpdate: (cb: Function) => {
                    this.triggerUpdateMap.set('textRotate', cb);
                },
                children: TEXT_ROTATE_CHILDREN,
            },

            // {
            //     locale: 'print',
            //     type: 'select',
            //     label: 'PrintIcon',
            //     show: true,
            //     icon: 'NextIcon',
            //     children: [
            //         {
            //             locale: 'print.menuItemPrint',
            //             icon: 'PrintIcon',
            //         },
            //         {
            //             locale: 'print.menuItemAreas',
            //             icon: 'PrintAreaIcon',
            //             border: true,
            //         },
            //         {
            //             locale: 'print.menuItemRows',
            //             icon: 'PrintTitleIcon',
            //         },
            //         {
            //             locale: 'print.menuItemColumns',
            //             icon: 'PrintTitleIcon',
            //         },
            //     ],
            // },
        ];

        this._toolBarModel = new ToolBarModel();
        this._toolBarModel.config = config;
        this._toolBarModel.toolList = toolList;

        this.init();
    }

    init() {
        // this._plugin.sheetContainerConfig.toolList = [];
        // this._plugin.sheetContainerConfig.toolList = this._toolBarModel.toolList;

        // this._plugin.context
        //     .getObserverManager()
        //     .getObserver<SheetContainer>('onSheetContainerDidMountObservable', 'workbook')
        //     ?.add((component) => {
        //         this._sheetContainer = component;
        //         this._sheetContainer.setToolBar(this._toolBarModel.toolList);
        //     });
        this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.add((value: string) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setFontFamily(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('ff', value);
            }
        });
        this._plugin.getObserver('onAfterChangeFontSizeObservable')?.add((value: number) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setFontSize(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('fs', value);
            }
        });
        this._plugin.getObserver('onAfterChangeFontWeightObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setFontWeight(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('bl', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontItalicObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setFontStyle(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('it', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setStrikeThrough(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('cl', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setUnderline(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('un', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontColorObservable')?.add((value: string) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setFontColor(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('fc', value);
            }
        });
        this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.add((value: string) => {
            if (!this._plugin.getCellEditorControl().isEditMode) {
                this.setBackground(value);
            } else {
                this._plugin.getCellEditorControl().richText.cellTextStyle.updateFormat('bg', value);
            }
        });

        this._plugin.getObserver('onToolBarDidMountObservable')?.add((component) => {
            this._toolBarComponent = component;

            this._toolBarComponent.setToolBar(this._toolBarModel.toolList);

            // this._toolBarComponent.setState((prevState) => ({
            //     defaultToolList: prevState.toolList,
            //     index: prevState.toolList.length,
            // }));
        });

        this._plugin.context
            .getObserverManager()
            .getObserver('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                // this._sheetContainer.setToolBar(this._toolBarModel.toolList);
            });

        // Monitor selection changes, update toolbar button status and values TODO: 根据不同的焦点对象，接受
        this._plugin.getObserver('onChangeSelectionObserver')?.add((selectionControl: SelectionControl) => {
            // console.log('this._plugin.getSelectionManager().getActiveRangeList()?.getRangeList()', this._plugin.getSelectionManager().getActiveRangeList()?.getRangeList());

            const currentCell = selectionControl.model.currentCell;

            if (currentCell) {
                let currentRangeData;

                if (currentCell.isMerged) {
                    const mergeInfo = currentCell.mergeInfo;

                    currentRangeData = {
                        startRow: mergeInfo.startRow,
                        endRow: mergeInfo.endRow,
                        startColumn: mergeInfo.startColumn,
                        endColumn: mergeInfo.endColumn,
                    };
                } else {
                    const { row, column } = currentCell;
                    currentRangeData = {
                        startRow: row,
                        endRow: row,
                        startColumn: column,
                        endColumn: column,
                    };
                }

                const cellData = this._plugin.getWorkbook().getActiveSheet().getRange(currentRangeData).getObjectValue({ isIncludeStyle: true });
                this.triggerAllUpdate(cellData);
            }
        });
    }

    setRedo() {
        this._plugin.getContext().getCommandManager().redo();
        // // this._plugin.getMainComponent().makeDirty(true);
    }

    setUndo() {
        this._plugin.getContext().getCommandManager().undo();
        // // this._plugin.getMainComponent().makeDirty(true);
    }

    setFontColor(value: string) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontColor(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setBackground(value: string) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setBackground(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setFontSize(value: number) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontSize(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setFontFamily(value: string) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontFamily(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setFontWeight(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontWeight(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setFontStyle(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setFontStyle(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setStrikeThrough(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setStrikeThrough(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setUnderline(value: boolean) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setUnderline(value);
        // this._plugin.getMainComponent().makeDirty(true);
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

        // update data
        this._plugin.getCanvasView().updateToSheet(this._plugin.getContext().getWorkBook().getActiveSheet()!);
        // update render
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setHorizontalAlignment(value: HorizontalAlign) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setHorizontalAlignment(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setVerticalAlignment(value: VerticalAlign) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setVerticalAlignment(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setWrapStrategy(value: WrapStrategy) {
        this._plugin.getSelectionManager().getActiveRangeList()?.setWrapStrategy(value);
        // this._plugin.getMainComponent().makeDirty(true);
    }

    setTextRotation(value: number | string) {
        // vertical
        if (value === 'v') {
            this._plugin.getSelectionManager().getActiveRangeList()?.setVerticalText(1);
        } else {
            this._plugin
                .getSelectionManager()
                .getActiveRangeList()
                ?.setTextRotation(value as number);
        }

        // this._plugin.getMainComponent().makeDirty(true);
    }

    setBorder(type: BorderType, color: string, style: BorderStyleTypes) {
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

                this._plugin.getContext().getWorkBook().getActiveSheet().getRange(range).setBorderByType(type, color, style);
            });

            // update data
            this._plugin.getCanvasView().updateToSheet(this._plugin.getContext().getWorkBook().getActiveSheet()!);
            // update render
            // this._plugin.getMainComponent().makeDirty(true);
        }
    }

    triggerAllUpdate(cellData: ICellData) {
        if (!cellData) {
            cellData = {
                s: {},
            };
        }
        const style = (cellData.s as IStyleData) || {};

        for (const [key, triggerUpdate] of this.triggerUpdateMap) {
            let f;
            switch (key) {
                case 'font':
                    f = style.ff || DEFAULT_STYLES.ff;
                    triggerUpdate(f);
                    break;

                case 'fontSize':
                    f = style.fs || DEFAULT_STYLES.fs;
                    triggerUpdate(f);
                    break;

                case 'bold':
                    triggerUpdate(!!style.bl);
                    break;

                case 'italic':
                    triggerUpdate(!!style.it);
                    break;

                case 'strikethrough':
                    triggerUpdate(!!style.st?.s);
                    break;

                case 'underline':
                    triggerUpdate(!!style.ul?.s);
                    break;

                case 'horizontalAlign':
                    triggerUpdate(style?.ht || DEFAULT_STYLES.ht);
                    break;

                case 'verticalAlign':
                    triggerUpdate(style?.vt || DEFAULT_STYLES.vt);
                    break;

                case 'textWrap':
                    triggerUpdate(style?.tb || DEFAULT_STYLES.tb);
                    break;

                case 'textRotate':
                    if (!style.tr) {
                        style.tr = DEFAULT_STYLES.tr;
                    }
                    triggerUpdate(style.tr?.v ? 'v' : style.tr?.a);
                    break;

                default:
                    break;
            }
        }
    }
}
