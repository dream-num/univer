import { Range, HorizontalAlign, VerticalAlign, WrapStrategy, DEFAULT_STYLES, BorderType } from '@univer/core';
import { ColorPicker } from '@univer/style-universheet';
import { SheetPlugin } from '../SheetPlugin';

import { SelectionControl } from './Selection/SelectionController';

import { LineColor } from '../View/UI/Common/Line/LineColor';
import { SelectionModel } from '../Model';
import { IShowToolBarConfig, IToolBarItemProps, ToolBarModel } from '../Model/ToolBarModel';
import { ToolBar } from '../View/UI/ToolBar';
import styles from '../View/UI/ToolBar/index.module.less';
import {
    BORDER_LINE_CHILDREN,
    BORDER_SIZE_CHILDREN,
    FONT_FAMILY_CHILDREN,
    FONT_SIZE_CHILDREN,
    HORIZONTAL_ALIGN_CHILDREN,
    MERGE_CHILDREN,
    TEXT_ROTATE_CHILDREN,
    TEXT_WRAP_CHILDREN,
    VERTICAL_ALIGN_CHILDREN,
} from '../View/UI/ToolBar/Const';
import { DefaultToolbarConfig } from '../Basics';
import { LineBold } from '../View/UI/Common/Line/LineBold';
import { ColorSelect } from '../View/UI/Common/ColorSelect/ColorSelect';

interface BorderInfo {
    color: string;
    type: number;
}

/**
 *
 */
export class ToolBarController {
    private _toolBarModel: ToolBarModel;

    private _plugin: SheetPlugin;

    private _toolBarComponent: ToolBar;

    private _toolList: IToolBarItemProps[];

    private _moreText: Record<string, string>;

    private _lineColor: LineColor;

    private _lineBold: LineBold;

    private _colorSelect: ColorSelect[] = [];

    private _borderInfo: BorderInfo; //存储边框信息

    private _changeToolBarState(range: Range): void {
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

            // console.log('cellMatrix:', cellMatrix);
            // console.log('fontSize:', fontSize);
            // console.log('horizontalAlign:', horizontalAlign);
            // console.log('fontName:', fontName);
            // console.log('verticalAlign:', verticalAlign);
            // console.log('fontItalic:', fontItalic);
            // console.log('fontWeight:', fontWeight);
            // console.log('strikeThrough:', strikeThrough);

            const textRotateModeItem = this._toolList.find((item) => item.name === 'textRotateMode');
            const fontSizeItem = this._toolList.find((item) => item.name === 'fontSize');
            const fontNameItem = this._toolList.find((item) => item.name === 'font');
            const fontBoldItem = this._toolList.find((item) => item.name === 'bold');
            const fontItalicItem = this._toolList.find((item) => item.name === 'italic');
            const strikethroughItem = this._toolList.find((item) => item.name === 'strikethrough');
            const underlineItem = this._toolList.find((item) => item.name === 'underline');
            const horizontalAlignModeItem = this._toolList.find((item) => item.name === 'horizontalAlignMode');
            const verticalAlignModeItem = this._toolList.find((item) => item.name === 'verticalAlignMode');

            if (strikethroughItem) {
                strikethroughItem.active = !!(strikeThrough && strikeThrough.s);
            }
            if (fontNameItem) {
                fontNameItem.children?.forEach((item) => {
                    item.selected = fontName === item.value;
                });
            }
            if (fontSizeItem) {
                fontSizeItem.children?.forEach((item) => {
                    item.selected = fontSize === item.value;
                });
            }
            if (fontBoldItem) {
                fontBoldItem.active = !!fontWeight;
            }
            if (fontItalicItem) {
                fontItalicItem.active = !!fontItalic;
            }
            if (underlineItem) {
                underlineItem.active = !!(underline && underline.s);
            }
            if (horizontalAlignModeItem) {
                horizontalAlignModeItem.children?.forEach((item) => {
                    item.selected = horizontalAlign === item.value;
                });
            }
            if (textRotateModeItem) {
                textRotateModeItem.children?.forEach((item) => {
                    item.selected = rotation === item.value;
                });
            }
            if (verticalAlignModeItem) {
                verticalAlignModeItem.children?.forEach((item) => {
                    item.selected = verticalAlign === item.value;
                });
            }

            this.resetToolBarList();
        }
    }

    constructor(plugin: SheetPlugin, config?: IShowToolBarConfig) {
        this._plugin = plugin;

        const pluginName = this._plugin.getPluginName();

        this._initRegisterComponent();

        const toolbarConfig = config || DefaultToolbarConfig;

        this._borderInfo = {
            color: 'rgb(217, 217, 217)',
            type: 1,
        };

        this._toolList = [
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.undo',
                name: 'undo',
                customLabel: {
                    name: 'ForwardIcon',
                },
                show: toolbarConfig.undoRedo,
                onClick: () => {
                    this.setUndo();
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.redo',
                customLabel: {
                    name: 'BackIcon',
                },
                name: 'redo',
                show: toolbarConfig.undoRedo,
                onClick: () => {
                    this.setRedo();
                },
            },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'paintFormat',
            //     label: 'FormatIcon',
            //     show: toolbarConfig.paintFormat,
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'currencyFormat',
            //     label: 'MoneyIcon',
            //     show: toolbarConfig.currencyFormat,
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'percentageFormat',
            //     label: 'PercentIcon',
            //     show: toolbarConfig.percentageFormat,
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'numberDecrease',
            //     label: 'ReduceNumIcon',
            //     show: toolbarConfig.numberDecrease,
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'numberIncrease',
            //     label: 'AddNumIcon',
            //     show: toolbarConfig.numberIncrease,
            // },
            {
                type: 0,
                tooltipLocale: 'toolbar.font',
                className: styles.selectLabelString,
                name: 'font',
                show: toolbarConfig.font,
                border: true,
                onClick: (fontFamily: string) => {
                    this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.notifyObservers(fontFamily);
                },
                children: FONT_FAMILY_CHILDREN,
            },
            {
                type: 1,
                tooltipLocale: 'toolbar.fontSize',
                label: String(DEFAULT_STYLES.fs),
                name: 'fontSize',
                show: toolbarConfig.fontSize,
                onClick: (fontSize: number) => {
                    this._plugin.getObserver('onAfterChangeFontSizeObservable')?.notifyObservers(fontSize);
                },
                onKeyUp: (fontSize: number) => {
                    this._plugin.getObserver('onAfterChangeFontSizeObservable')?.notifyObservers(fontSize);
                },
                children: FONT_SIZE_CHILDREN,
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.bold',
                customLabel: {
                    name: 'BoldIcon',
                },
                active: false,
                name: 'bold',
                show: toolbarConfig.bold,
                onClick: (isBold: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontWeightObservable')?.notifyObservers(isBold);
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.italic',
                customLabel: {
                    name: 'ItalicIcon',
                },
                name: 'italic',
                show: toolbarConfig.italic,
                onClick: (isItalic: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontItalicObservable')?.notifyObservers(isItalic);
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.strikethrough',
                customLabel: {
                    name: 'DeleteLineIcon',
                },
                name: 'strikethrough',
                show: toolbarConfig.strikethrough,
                onClick: (isStrikethrough: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.notifyObservers(isStrikethrough);
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.underline',
                customLabel: {
                    name: 'UnderLineIcon',
                },
                name: 'underline',
                show: toolbarConfig.underline,
                onClick: (isItalic: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.notifyObservers(isItalic);
                },
            },
            {
                type: 5,
                tooltipLocale: 'toolbar.textColor.main',
                customLabel: {
                    name: pluginName + ColorSelect.name,
                    props: {
                        customLabel: {
                            name: 'TextColorIcon',
                        },
                        id: 'textColor',
                    },
                },
                hideSelectedIcon: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        customLabel: {
                            name: pluginName + ColorPicker.name,
                            props: {
                                onClick: (color: string, e: MouseEvent) => {
                                    const colorSelect = this._colorSelect.find((item) => item.getId() === 'textColor');
                                    colorSelect?.setColor(color);
                                    this._plugin.getObserver('onAfterChangeFontColorObservable')?.notifyObservers(color);
                                },
                                lang: {
                                    collapseLocale: 'colorPicker.collapse',
                                    customColorLocale: 'colorPicker.customColor',
                                    confirmColorLocale: 'colorPicker.confirmColor',
                                    cancelColorLocale: 'colorPicker.cancelColor',
                                    changeLocale: 'colorPicker.change',
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
                name: 'textColor',
                show: toolbarConfig.textColor,
            },
            {
                type: 5,
                tooltipLocale: 'toolbar.fillColor.main',
                customLabel: {
                    name: pluginName + ColorSelect.name,
                    props: {
                        customLabel: {
                            name: 'FillColorIcon',
                        },
                        id: 'fillColor',
                    },
                },
                hideSelectedIcon: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        customLabel: {
                            name: pluginName + ColorPicker.name,
                            props: {
                                onClick: (color: string, e: MouseEvent) => {
                                    const colorSelect = this._colorSelect.find((item) => item.getId() === 'fillColor');
                                    colorSelect?.setColor(color);
                                    this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.notifyObservers(color);
                                },
                                lang: {
                                    collapseLocale: 'colorPicker.collapse',
                                    customColorLocale: 'colorPicker.customColor',
                                    confirmColorLocale: 'colorPicker.confirmColor',
                                    cancelColorLocale: 'colorPicker.cancelColor',
                                    changeLocale: 'colorPicker.change',
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
                name: 'fillColor',
                show: toolbarConfig.fillColor,
            },
            {
                type: 3,
                display: 1,
                show: toolbarConfig.border,
                tooltipLocale: 'toolbar.border.main',
                className: styles.selectDoubleString,
                onClick: (value) => {
                    if (value) {
                        this.setBorder(value);
                    }
                },
                name: 'border',
                children: [
                    ...BORDER_LINE_CHILDREN,
                    {
                        customLabel: {
                            name: pluginName + LineColor.name,
                            props: {
                                locale: 'borderLine.borderColor',
                            },
                        },
                        unSelectable: true,
                        className: styles.selectColorPickerParent,
                        children: [
                            {
                                customLabel: {
                                    name: pluginName + ColorPicker.name,
                                    props: {
                                        onClick: (color: string, e: MouseEvent) => this.handleLineColor(color, e),
                                        lang: {
                                            collapseLocale: 'colorPicker.collapse',
                                            customColorLocale: 'colorPicker.customColor',
                                            confirmColorLocale: 'colorPicker.confirmColor',
                                            cancelColorLocale: 'colorPicker.cancelColor',
                                            changeLocale: 'colorPicker.change',
                                        },
                                    },
                                },
                                className: styles.selectColorPicker,
                                onClick: this.handleLineColor,
                            },
                        ],
                    },
                    {
                        customLabel: {
                            name: pluginName + LineBold.name,
                            props: {
                                locale: 'borderLine.borderSize',
                            },
                        },
                        onClick: (...arg) => this.handleLineBold(arg[1], arg[2], arg[0]),
                        className: styles.selectLineBoldParent,
                        unSelectable: true,
                        children: BORDER_SIZE_CHILDREN,
                    },
                ],
            },
            {
                type: 5,
                tooltipLocale: 'toolbar.mergeCell.main',
                customLabel: {
                    name: 'MergeIcon',
                },
                show: toolbarConfig.mergeCell,
                onClick: (value: string) => {
                    this.setMerge(value);
                },
                name: 'mergeCell',
                children: MERGE_CHILDREN,
            },
            {
                type: 3,
                tooltipLocale: 'toolbar.horizontalAlignMode.main',
                className: styles.selectDoubleString,
                display: 1,
                name: 'horizontalAlignMode',
                show: toolbarConfig.horizontalAlignMode,
                onClick: (value: HorizontalAlign) => {
                    this.setHorizontalAlignment(value);
                },
                children: HORIZONTAL_ALIGN_CHILDREN,
            },
            {
                type: 3,
                tooltipLocale: 'toolbar.verticalAlignMode.main',
                className: styles.selectDoubleString,
                display: 1,
                name: 'verticalAlignMode',
                show: toolbarConfig.verticalAlignMode,
                onClick: (value: VerticalAlign) => {
                    this.setVerticalAlignment(value);
                },
                children: VERTICAL_ALIGN_CHILDREN,
            },
            {
                type: 3,
                className: styles.selectDoubleString,
                tooltipLocale: 'toolbar.textWrapMode.main',
                display: 1,
                name: 'textWrapMode',
                show: toolbarConfig.textWrapMode,
                onClick: (value: WrapStrategy) => {
                    this.setWrapStrategy(value);
                },
                children: TEXT_WRAP_CHILDREN,
            },
            {
                type: 3,
                className: styles.selectDoubleString,
                name: 'textRotateMode',
                tooltipLocale: 'toolbar.textRotateMode.main',
                display: 1,
                show: toolbarConfig.textRotateMode,
                onClick: (value: number | string) => {
                    this.setTextRotation(value);
                },
                children: TEXT_ROTATE_CHILDREN,
            },
        ];

        this._moreText = { more: 'toolbar.toolMore', tip: 'toolbar.toolMoreTip' };

        this._toolBarModel = new ToolBarModel();
        this._toolBarModel.config = toolbarConfig;
        this._toolBarModel.toolList = this._toolList;

        this.init();
    }

    init() {
        this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.add((value: string) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setFontFamily(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('ff', value);
            }
        });
        this._plugin.getObserver('onAfterChangeFontSizeObservable')?.add((value: number) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setFontSize(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('fs', value);
            }
        });
        this._plugin.getObserver('onAfterChangeFontWeightObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setFontWeight(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('bl', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontItalicObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setFontStyle(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('it', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setStrikeThrough(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('cl', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.add((value: boolean) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setUnderline(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('un', value ? '1' : '0');
            }
        });
        this._plugin.getObserver('onAfterChangeFontColorObservable')?.add((value: string) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setFontColor(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('fc', value);
            }
        });
        this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.add((value: string) => {
            if (!this._plugin.getCellEditorController().isEditMode) {
                this.setBackground(value);
            } else {
                this._plugin.getCellEditorController().richText.cellTextStyle.updateFormat('bg', value);
            }
        });

        this._plugin.getObserver('onToolBarDidMountObservable')?.add((component) => {
            //初始化视图
            this._toolBarComponent = component;
            this.resetToolBarList();
        });
        this._plugin.getObserver('onLineColorDidMountObservable')?.add((component) => {
            //初始化视图
            this._lineColor = component;
        });
        this._plugin.getObserver('onLineBoldDidMountObservable')?.add((component) => {
            //初始化视图
            this._lineBold = component;
        });
        this._plugin.getObserver('onColorSelectDidMountObservable')?.add((component) => {
            //初始化视图
            this._colorSelect.push(component);
        });

        this._plugin.context
            .getObserverManager()
            .getObserver('onAfterChangeUILocaleObservable', 'core')
            ?.add(() => {
                this.resetToolBarList();
            });

        // Monitor selection changes, update toolbar button status and values TODO: 根据不同的焦点对象，接受
        this._plugin.getObserver('onChangeSelectionObserver')?.add((selectionControl: SelectionControl) => {
            // const currentCell = selectionControl.model.currentCell;
            //
            // if (currentCell) {
            //     let currentRangeData;
            //
            //     if (currentCell.isMerged) {
            //         const mergeInfo = currentCell.mergeInfo;
            //
            //         currentRangeData = {
            //             startRow: mergeInfo.startRow,
            //             endRow: mergeInfo.endRow,
            //             startColumn: mergeInfo.startColumn,
            //             endColumn: mergeInfo.endColumn,
            //         };
            //     } else {
            //         const { row, column } = currentCell;
            //         currentRangeData = {
            //             startRow: row,
            //             endRow: row,
            //             startColumn: column,
            //             endColumn: column,
            //         };
            //     }
            //
            //     const cellData = this._plugin.getWorkbook().getActiveSheet().getRange(currentRangeData).getObjectValue({ isIncludeStyle: true });
            // }
            const manager = this._plugin.getSelectionManager();
            const range = manager?.getCurrentCell();
            if (range) {
                this._changeToolBarState(range);
            }
        });
    }

    private _initRegisterComponent() {
        const pluginName = this._plugin.getPluginName();

        // 注册自定义组件
        this._plugin.registerComponent(pluginName + LineColor.name, LineColor);
        this._plugin.registerComponent(pluginName + LineBold.name, LineBold);
        this._plugin.registerComponent(pluginName + ColorSelect.name, ColorSelect);
        this._plugin.registerComponent(pluginName + ColorPicker.name, ColorPicker);
    }

    resetLabel(label: string[] | string) {
        const locale = this._plugin.context.getLocale();

        let str = '';

        if (label instanceof Array) {
            label.forEach((item) => {
                if (item.includes('.')) {
                    str += locale.get(item);
                } else {
                    str += item;
                }
            });
        } else {
            if (label.includes('.')) {
                str = locale.get(label);
            } else {
                str += label;
            }
        }

        return str;
    }

    findLocale(obj: any) {
        for (let k in obj) {
            if (k === 'locale') {
                obj.label = this.resetLabel(obj[k]);
            } else if (k.endsWith('Locale')) {
                const index = k.indexOf('Locale');
                obj[k.slice(0, index)] = this.resetLabel(obj[k]);
            } else if (!obj[k].$$typeof) {
                if (Object.prototype.toString.call(obj[k]) === '[object Object]') {
                    this.findLocale(obj[k]);
                } else if (Object.prototype.toString.call(obj[k]) === '[object Array]') {
                    this.resetToolListLabel(obj[k]);
                }
            }
        }

        return obj;
    }

    resetToolListLabel(toolList: IToolBarItemProps[]) {
        for (let i = 0; i < toolList.length; i++) {
            let item = toolList[i];

            item = this.findLocale(item);

            if (item.children) {
                item.children = this.resetToolListLabel(item.children);
            }
        }

        return toolList;
    }

    resetToolBarList() {
        const locale = this._plugin.context.getLocale();

        const toolList = this.resetToolListLabel(this._toolList);
        this._toolBarComponent.setToolBar(toolList, {
            more: locale.get(this._moreText.more),
            tip: locale.get(this._moreText.tip),
        });
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

    setBorder(type: BorderType) {
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

                this._plugin.getContext().getWorkBook().getActiveSheet().getRange(range).setBorderByType(type, this._borderInfo.color, this._borderInfo.type);
            });
        }
    }

    // 改变边框线颜色
    handleLineColor(color: string, e: MouseEvent) {
        e.stopPropagation();
        this._lineColor.setColor(color);
        this._borderInfo.color = color;
    }

    // 改变边框线粗细
    handleLineBold(value: string, index: number, e: MouseEvent) {
        e.stopPropagation();
        if (!value) return;
        this._lineBold.setLineType(value);
        this._borderInfo.type = index;
    }

    addToolButton(config: IToolBarItemProps) {
        const index = this._toolList.findIndex((item) => item.name === config.name);
        if (index > -1) return;
        this._toolList.push(config);
        if (this._toolBarComponent) {
            this.resetToolBarList();
        }
    }
}
