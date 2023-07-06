import { BaseSelectChildrenProps, BaseSelectProps, ColorPicker, ComponentChildren, CustomComponent } from '@univerjs/base-ui';
import { DEFAULT_STYLES, HorizontalAlign, Tools, UIObserver, VerticalAlign, WrapStrategy, Range, FontWeight, FontItalic, ITextRotation } from '@univerjs/core';
import { DefaultToolbarConfig, DocToolbarConfig, DOC_UI_PLUGIN_NAME } from '../Basics';
import { DocUIPlugin } from '../DocUIPlugin';
import { Toolbar } from '../View';
import { ColorSelect } from '../View/Common';
import { FONT_FAMILY_CHILDREN, FONT_SIZE_CHILDREN, HORIZONTAL_ALIGN_CHILDREN, VERTICAL_ALIGN_CHILDREN, TEXT_WRAP_CHILDREN, TEXT_ROTATE_CHILDREN } from '../View/Toolbar/Const';

import styles from '../View/Toolbar/index.module.less';

export interface BaseToolbarSelectProps extends BaseSelectProps {
    children?: BaseSelectChildrenProps[];
}

enum ToolbarType {
    SELECT,
    BUTTON,
}

export interface IToolbarItemProps extends BaseToolbarSelectProps {
    active?: boolean;
    unActive?: boolean; //button不需保持状态
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    tooltip?: string; //tooltip文字
    border?: boolean;
    suffix?: ComponentChildren;
}

export class ToolbarUIController {
    private _plugin: DocUIPlugin;

    private _toolbar: Toolbar;

    private _toolList: IToolbarItemProps[];

    private _config: DocToolbarConfig;

    private _colorSelect1: ColorSelect;

    private _textColor: string = '#000';

    private _colorSelect2: ColorSelect;

    private _background: string = '#fff';

    constructor(plugin: DocUIPlugin, config?: DocToolbarConfig) {
        this._plugin = plugin;

        this._config = Tools.deepMerge({}, DefaultToolbarConfig, config);

        this._toolList = [
            {
                toolbarType: 1,
                tooltip: 'toolbar.undo',
                name: 'undo',
                label: {
                    name: 'ForwardIcon',
                },
                show: this._config.undo,
                onClick: () => {
                    this.setUndo();
                    this.hideTooltip();
                },
            },
            {
                toolbarType: 1,
                tooltip: 'toolbar.redo',
                label: {
                    name: 'BackIcon',
                },
                name: 'redo',
                show: this._config.redo,
                onClick: () => {
                    this.setRedo();
                    this.hideTooltip();
                },
            },
            {
                type: 0,
                tooltip: 'toolbar.font',
                className: styles.selectLabelString,
                name: 'font',
                show: this._config.font,
                border: true,
                onMainClick: () => {
                    this.hideTooltip();
                },
                onClick: (fontFamily: string) => {
                    this.setFontFamily(fontFamily);
                },
                children: FONT_FAMILY_CHILDREN,
            },
            {
                type: 1,
                tooltip: 'toolbar.fontSize',
                label: String(DEFAULT_STYLES.fs),
                name: 'fontSize',
                show: this._config.fontSize,
                onClick: (fontSize: number) => {
                    this.setFontSize(fontSize);
                },
                onMainClick: () => {
                    this.hideTooltip();
                },
                onPressEnter: (fontSize: number) => {
                    this.setFontSize(fontSize);
                    this.hideTooltip();
                },
                children: FONT_SIZE_CHILDREN,
            },
            {
                toolbarType: 1,
                tooltip: 'toolbar.bold',
                label: {
                    name: 'BoldIcon',
                },
                unActive: false,
                name: 'bold',
                show: this._config.bold,
                onClick: (e, isBold: boolean) => {
                    this.setFontWeight(isBold);
                    this.hideTooltip();
                },
            },
            {
                toolbarType: 1,
                tooltip: 'toolbar.italic',
                label: {
                    name: 'ItalicIcon',
                },
                unActive: false,
                name: 'italic',
                show: this._config.italic,
                onClick: (e, isItalic: boolean) => {
                    this.setFontStyle(isItalic);
                    this.hideTooltip();
                },
            },
            {
                toolbarType: 1,
                tooltip: 'toolbar.strikethrough',
                label: {
                    name: 'DeleteLineIcon',
                },
                unActive: false,
                name: 'strikethrough',
                show: this._config.strikethrough,
                onClick: (e, isStrikethrough: boolean) => {
                    this.hideTooltip();
                    const strikethroughItem = this._toolList.find((item) => item.name === 'strikethrough');
                    if (!strikethroughItem) return;
                    strikethroughItem.active = isStrikethrough;
                    this.setStrikeThrough(isStrikethrough);
                },
            },
            {
                toolbarType: 1,
                tooltip: 'toolbar.underline',
                label: {
                    name: 'UnderLineIcon',
                },
                unActive: false,
                name: 'underline',
                show: this._config.underline,
                onClick: (e, isUnderLine: boolean) => {
                    this.hideTooltip();
                    const underlineItem = this._toolList.find((item) => item.name === 'underline');
                    if (!underlineItem) return;
                    underlineItem.active = isUnderLine;
                    this.setUnderline(isUnderLine);
                },
            },
            {
                type: 5,
                tooltip: 'toolbar.textColor.main',
                label: {
                    name: DOC_UI_PLUGIN_NAME + ColorSelect.name,
                    props: {
                        getComponent: (ref: ColorSelect) => {
                            this._colorSelect1 = ref;
                        },
                        color: '#000',
                        label: {
                            name: 'TextColorIcon',
                        },
                    },
                },
                onClick: () => {
                    this.hideTooltip();
                    const textColor = this._toolList.find((item) => item.name === 'textColor');
                    if (!textColor) return;
                    if (!textColor.label) return;
                    if (!(textColor.label as CustomComponent).props?.color) return;
                    (textColor.label as CustomComponent).props!.color = this._textColor;
                    this.changeColor(this._textColor);
                },
                hideSelectedIcon: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        label: 'toolbar.resetColor',
                    },
                    {
                        label: {
                            name: DOC_UI_PLUGIN_NAME + ColorPicker.name,
                            props: {
                                onClick: (color: string, e: MouseEvent) => {
                                    this._colorSelect1.setColor(color);
                                    this._textColor = color;
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
                name: 'textColor',
                show: this._config.textColor,
            },
            {
                type: 5,
                tooltip: 'toolbar.fillColor.main',
                label: {
                    name: DOC_UI_PLUGIN_NAME + ColorSelect.name,
                    props: {
                        getComponent: (ref: ColorSelect) => {
                            this._colorSelect2 = ref;
                        },
                        color: '#fff',
                        label: {
                            name: 'FillColorIcon',
                        },
                    },
                },
                onClick: () => {
                    this.hideTooltip();
                    const fillColor = this._toolList.find((item) => item.name === 'fillColor');
                    if (!fillColor) return;
                    if (!fillColor.label) return;
                    if (!(fillColor.label as CustomComponent).props?.color) return;
                    (fillColor.label as CustomComponent).props!.color = this._background;
                    this.setBackground(this._background);
                },
                hideSelectedIcon: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        label: 'toolbar.resetColor',
                    },
                    {
                        label: {
                            name: DOC_UI_PLUGIN_NAME + ColorPicker.name,
                            props: {
                                onClick: (color: string, e: MouseEvent) => {
                                    this._colorSelect2.setColor(color);
                                    this._background = color;
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
                name: 'fillColor',
                show: this._config.fillColor,
            },
            {
                type: 3,
                tooltip: 'toolbar.horizontalAlignMode.main',
                className: styles.selectDoubleString,
                display: 1,
                name: 'horizontalAlignMode',
                show: this._config.horizontalAlignMode,
                onClick: (value: HorizontalAlign) => {
                    this.setHorizontalAlignment(value);
                    this.hideTooltip();
                },
                children: HORIZONTAL_ALIGN_CHILDREN,
            },
            {
                type: 3,
                tooltip: 'toolbar.verticalAlignMode.main',
                className: styles.selectDoubleString,
                display: 1,
                name: 'verticalAlignMode',
                show: this._config.verticalAlignMode,
                onClick: (value: VerticalAlign) => {
                    this.setVerticalAlignment(value);
                    this.hideTooltip();
                },
                children: VERTICAL_ALIGN_CHILDREN,
            },
            {
                type: 3,
                className: styles.selectDoubleString,
                tooltip: 'toolbar.textWrapMode.main',
                display: 1,
                name: 'textWrapMode',
                show: this._config.textWrapMode,
                onClick: (value: WrapStrategy) => {
                    this.setWrapStrategy(value);
                    this.hideTooltip();
                },
                children: TEXT_WRAP_CHILDREN,
            },
            {
                type: 3,
                className: styles.selectDoubleString,
                name: 'textRotateMode',
                tooltip: 'toolbar.textRotateMode.main',
                display: 1,
                show: this._config.textRotateMode,
                onClick: (value: number | string) => {
                    this.setTextRotation(value);
                    this.hideTooltip();
                },
                children: TEXT_ROTATE_CHILDREN,
            },
        ];

        this._initialize();
    }

    // 获取Toolbar组件
    getComponent = (ref: Toolbar) => {
        this._toolbar = ref;
        this.setToolbar();
    };

    // 增加toolbar配置
    addToolbarConfig(config: IToolbarItemProps) {
        const index = this._toolList.findIndex((item) => item.name === config.name);
        if (index > -1) return;
        this._toolList.push(config);
    }

    // 删除toolbar配置
    deleteToolbarConfig(name: string) {
        const index = this._toolList.findIndex((item) => item.name === name);
        if (index > -1) {
            this._toolList.splice(index, 1);
        }
    }

    // 刷新toolbar
    setToolbar() {
        this._toolbar?.setToolbar(this._toolList);
    }

    setUIObserve<T>(msg: UIObserver<T>) {
        this._plugin.getContext().getObserverManager().requiredObserver<UIObserver<T>>('onUIChangeObservable', 'core').notifyObservers(msg);
    }

    changeColor(color: string) {
        const strikethroughItem = this._toolList.find((item) => item.name === 'strikethrough');
        const underlineItem = this._toolList.find((item) => item.name === 'underline');
        this.setFontColor(color);
        if (underlineItem) {
            this.setUnderline(underlineItem.active ?? false);
        }
        if (strikethroughItem) {
            this.setStrikeThrough(strikethroughItem.active ?? false);
        }
    }

    setUndo() {
        const msg = {
            name: 'undo',
        };
        this.setUIObserve(msg);
    }

    setRedo() {
        const msg = {
            name: 'redo',
        };
        this.setUIObserve(msg);
    }

    setFontFamily(fontFamily: string) {
        const msg = {
            name: 'fontFamily',
            value: fontFamily,
        };
        this.setUIObserve(msg);
    }

    setFontSize(fontSize: number) {
        const msg = {
            name: 'fontSize',
            value: fontSize,
        };
        this.setUIObserve<number>(msg);
    }

    setFontWeight(isBold: boolean) {
        const msg = {
            name: 'fontWeight',
            value: isBold,
        };
        this.setUIObserve<boolean>(msg);
    }

    setFontStyle(isItalic: boolean) {
        const msg = {
            name: 'fontStyle',
            value: isItalic,
        };
        this.setUIObserve<boolean>(msg);
    }

    setStrikeThrough(isStrikethrough: boolean) {
        const msg = {
            name: 'strikeThrough',
            value: isStrikethrough,
        };
        this.setUIObserve<boolean>(msg);
    }

    setUnderline(isUnderLine: boolean) {
        const msg = {
            name: 'underLine',
            value: isUnderLine,
        };
        this.setUIObserve<boolean>(msg);
    }

    setFontColor(color: string) {
        const msg = {
            name: 'fontColor',
            value: color,
        };
        this.setUIObserve(msg);
    }

    setBackground(color: string) {
        const msg = {
            name: 'background',
            value: color,
        };
        this.setUIObserve(msg);
    }

    setTextRotation(value: string | number) {
        const msg = {
            name: 'textRotation',
            value,
        };
        this.setUIObserve(msg);
    }

    setWrapStrategy(value: WrapStrategy) {
        const msg = {
            name: 'wrapStrategy',
            value,
        };
        this.setUIObserve<number>(msg);
    }

    setVerticalAlignment(value: VerticalAlign) {
        const msg = {
            name: 'verticalAlignment',
            value,
        };
        this.setUIObserve<number>(msg);
    }

    setHorizontalAlignment(value: HorizontalAlign) {
        const msg = {
            name: 'horizontalAlignment',
            value,
        };
        this.setUIObserve<number>(msg);
    }

    hideTooltip() {
        const dom = this._toolbar.base as HTMLDivElement;
        const tooltip = dom.querySelectorAll(`.${styles.tooltipTitle}.${styles.bottom}`);
        tooltip.forEach((item) => {
            (item as HTMLSpanElement).style.display = 'none';
        });
    }

    private _changeToolbarState(range: Range): void {
        const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        if (worksheet) {
            const isBold = range.getFontWeight();
            const IsItalic = range.getFontStyle();
            const strikeThrough = range.getStrikeThrough();
            const fontSize = range.getFontSize();
            const fontWeight = range.getFontWeight();
            const fontName = range.getFontFamily();
            const fontItalic = range.getFontStyle();
            // const fontColor = range.getFontColor();
            // const background = range.getBackground();
            const underline = range.getUnderline();
            const horizontalAlign = range.getHorizontalAlignment() ?? HorizontalAlign.LEFT;
            const verticalAlign = range.getVerticalAlignment() ?? VerticalAlign.BOTTOM;
            const rotation = range.getTextRotation();
            const warp = range.getWrapStrategy() ?? WrapStrategy.CLIP;

            const bold = this._toolList.find((item) => item.name === 'bold');
            const italic = this._toolList.find((item) => item.name === 'italic');
            const textRotateModeItem = this._toolList.find((item) => item.name === 'textRotateMode');
            const fontSizeItem = this._toolList.find((item) => item.name === 'fontSize');
            const fontNameItem = this._toolList.find((item) => item.name === 'font');
            const fontBoldItem = this._toolList.find((item) => item.name === 'bold');
            const fontItalicItem = this._toolList.find((item) => item.name === 'italic');
            // const textColor = this._toolList.find((item) => item.name === 'textColor')
            // const fillColor = this._toolList.find((item) => item.name === 'fillColor')
            const strikethroughItem = this._toolList.find((item) => item.name === 'strikethrough');
            const underlineItem = this._toolList.find((item) => item.name === 'underline');
            const horizontalAlignModeItem = this._toolList.find((item) => item.name === 'horizontalAlignMode');
            const verticalAlignModeItem = this._toolList.find((item) => item.name === 'verticalAlignMode');
            const textWrapMode = this._toolList.find((item) => item.name === 'textWrapMode');

            if (bold) {
                bold.active = isBold === FontWeight.BOLD;
            }

            if (italic) {
                italic.active = IsItalic === FontItalic.ITALIC;
            }

            if (strikethroughItem) {
                strikethroughItem.active = !!(strikeThrough && strikeThrough.s);
            }
            if (fontNameItem) {
                fontNameItem.children?.forEach((item) => {
                    item.selected = fontName === item.value;
                });
            }
            if (fontSizeItem) {
                fontSizeItem.label = fontSize.toString();
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
                    if ((rotation as ITextRotation).v) {
                        item.selected = item.value === 'v';
                    } else {
                        item.selected = (rotation as ITextRotation).a === item.value;
                    }
                });
            }
            if (verticalAlignModeItem) {
                verticalAlignModeItem.children?.forEach((item) => {
                    item.selected = verticalAlign === item.value;
                });
            }
            if (textWrapMode) {
                textWrapMode.children?.forEach((item) => {
                    item.selected = warp === item.value;
                });
            }

            this.setToolbar();
        }
    }

    private _initialize() {
        this._plugin.getComponentManager().register(DOC_UI_PLUGIN_NAME + ColorSelect.name, ColorSelect);
        this._plugin.getComponentManager().register(DOC_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);

        // CommandManager.getCommandObservers().add(({ actions }) => {
        //     if (!actions || actions.length === 0) return;
        //     const action = actions[0] as SheetActionBase<ISheetActionData, ISheetActionData, void>;

        //     const currentUnitId = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook().getUnitId();
        //     const actionUnitId = action.getWorkBook().getUnitId();

        //     if (currentUnitId !== actionUnitId) return null;
        // });
    }
}
