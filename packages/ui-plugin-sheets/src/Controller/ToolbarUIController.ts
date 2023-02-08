import { BaseSelectChildrenProps, BaseSelectProps, BaseTextButtonProps, resetDataLabel } from '@univerjs/base-ui';
import { DEFAULT_STYLES, Tools, UIObserver } from '@univerjs/core';
import { SheetUIPlugin } from '..';
import { DefaultToolbarConfig, SheetToolbarConfig } from '../Basics';
import { ColorSelect, LineBold, LineColor, Toolbar } from '../View';
import { FONT_FAMILY_CHILDREN, FONT_SIZE_CHILDREN } from '../View/ToolBar/Const';
import styles from '../View/ToolBar/index.module.less';

// 继承基础下拉属性,添加国际化
export interface BaseToolbarSelectChildrenProps extends BaseSelectChildrenProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolbarSelectChildrenProps[];
}

export interface BaseToolbarSelectProps extends BaseSelectProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolbarSelectChildrenProps[];
}

enum ToolbarType {
    SELECT,
    BUTTON,
}

export interface IToolbarItemProps extends BaseToolbarSelectProps, BaseTextButtonProps {
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    locale?: string; //label国际化
    tooltipLocale?: string; //tooltip国际化 TODO: need right label
    tooltip?: string; //tooltip文字
    border?: boolean;
}

interface BorderInfo {
    color: string;
    type: number;
}

export class ToolbarUIController {
    private _plugin: SheetUIPlugin;

    private _toolbar: Toolbar;

    private _toolList: IToolbarItemProps[];

    private _config: SheetToolbarConfig;

    private _moreText: Record<string, string>;

    private _lineColor: LineColor;

    private _lineBold: LineBold;

    private _colorSelect: ColorSelect[] = [];

    private _borderInfo: BorderInfo; //存储边框信息

    constructor(plugin: SheetUIPlugin, config?: SheetToolbarConfig) {
        this._plugin = plugin;

        this._config = Tools.deepMerge({}, DefaultToolbarConfig, config);

        this._toolList = [
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.undo',
                name: 'undo',
                customLabel: {
                    name: 'ForwardIcon',
                },
                show: this._config.undo,
                onClick: () => this.setUndo(),
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.redo',
                customLabel: {
                    name: 'BackIcon',
                },
                name: 'redo',
                show: this._config.redo,
                onClick: () => this.setRedo(),
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
                show: this._config.font,
                border: true,
                onClick: (fontFamily: string) => {
                    this.setFontFamily(fontFamily);
                },
                children: FONT_FAMILY_CHILDREN,
            },
            {
                type: 1,
                tooltipLocale: 'toolbar.fontSize',
                label: String(DEFAULT_STYLES.fs),
                name: 'fontSize',
                show: this._config.fontSize,
                onClick: (fontSize: number) => {
                    this.setFontSize(fontSize);
                },
                onKeyUp: (fontSize: number) => {
                    this.setFontSize(fontSize);
                },
                children: FONT_SIZE_CHILDREN,
            },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'toolbar.bold',
            //     customLabel: {
            //         name: 'BoldIcon',
            //     },
            //     active: false,
            //     name: 'bold',
            //     show: this._config.bold,
            //     onClick: (isBold: boolean) => {
            //         this._plugin.getObserver('onAfterChangeFontWeightObservable')?.notifyObservers(isBold);
            //     },
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'toolbar.italic',
            //     customLabel: {
            //         name: 'ItalicIcon',
            //     },
            //     name: 'italic',
            //     show: this._config.italic,
            //     onClick: (isItalic: boolean) => {
            //         this._plugin.getObserver('onAfterChangeFontItalicObservable')?.notifyObservers(isItalic);
            //     },
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'toolbar.strikethrough',
            //     customLabel: {
            //         name: 'DeleteLineIcon',
            //     },
            //     name: 'strikethrough',
            //     show: this._config.strikethrough,
            //     onClick: (isStrikethrough: boolean) => {
            //         this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.notifyObservers(isStrikethrough);
            //     },
            // },
            // {
            //     toolbarType: 1,
            //     tooltipLocale: 'toolbar.underline',
            //     customLabel: {
            //         name: 'UnderLineIcon',
            //     },
            //     name: 'underline',
            //     show: this._config.underline,
            //     onClick: (isItalic: boolean) => {
            //         this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.notifyObservers(isItalic);
            //     },
            // },
            // {
            //     type: 5,
            //     tooltipLocale: 'toolbar.textColor.main',
            //     customLabel: {
            //         name: pluginName + ColorSelect.name,
            //         props: {
            //             customLabel: {
            //                 name: 'TextColorIcon',
            //             },
            //             id: 'textColor',
            //         },
            //     },
            //     hideSelectedIcon: true,
            //     className: styles.selectColorPickerParent,
            //     children: [
            //         {
            //             customLabel: {
            //                 name: pluginName + ColorPicker.name,
            //                 props: {
            //                     onClick: (color: string, e: MouseEvent) => {
            //                         const colorSelect = this._colorSelect.find((item) => item.getId() === 'textColor');
            //                         colorSelect?.setColor(color);
            //                         this._plugin.getObserver('onAfterChangeFontColorObservable')?.notifyObservers(color);
            //                     },
            //                     lang: {
            //                         collapseLocale: 'colorPicker.collapse',
            //                         customColorLocale: 'colorPicker.customColor',
            //                         confirmColorLocale: 'colorPicker.confirmColor',
            //                         cancelColorLocale: 'colorPicker.cancelColor',
            //                         changeLocale: 'colorPicker.change',
            //                     },
            //                 },
            //             },
            //             className: styles.selectColorPicker,
            //         },
            //     ],
            //     name: 'textColor',
            //     show: this._config.textColor,
            // },
            // {
            //     type: 5,
            //     tooltipLocale: 'toolbar.fillColor.main',
            //     customLabel: {
            //         name: pluginName + ColorSelect.name,
            //         props: {
            //             customLabel: {
            //                 name: 'FillColorIcon',
            //             },
            //             id: 'fillColor',
            //         },
            //     },
            //     hideSelectedIcon: true,
            //     className: styles.selectColorPickerParent,
            //     children: [
            //         {
            //             customLabel: {
            //                 name: pluginName + ColorPicker.name,
            //                 props: {
            //                     onClick: (color: string, e: MouseEvent) => {
            //                         const colorSelect = this._colorSelect.find((item) => item.getId() === 'fillColor');
            //                         colorSelect?.setColor(color);
            //                         this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.notifyObservers(color);
            //                     },
            //                     lang: {
            //                         collapseLocale: 'colorPicker.collapse',
            //                         customColorLocale: 'colorPicker.customColor',
            //                         confirmColorLocale: 'colorPicker.confirmColor',
            //                         cancelColorLocale: 'colorPicker.cancelColor',
            //                         changeLocale: 'colorPicker.change',
            //                     },
            //                 },
            //             },
            //             className: styles.selectColorPicker,
            //         },
            //     ],
            //     name: 'fillColor',
            //     show: this._config.fillColor,
            // },
            // {
            //     type: 3,
            //     display: 1,
            //     show: this._config.border,
            //     tooltipLocale: 'toolbar.border.main',
            //     className: styles.selectDoubleString,
            //     onClick: (value) => {
            //         if (value) {
            //             this.setBorder(value);
            //         }
            //     },
            //     name: 'border',
            //     children: [
            //         ...BORDER_LINE_CHILDREN,
            //         {
            //             customLabel: {
            //                 name: pluginName + LineColor.name,
            //                 props: {
            //                     locale: 'borderLine.borderColor',
            //                 },
            //             },
            //             unSelectable: true,
            //             className: styles.selectColorPickerParent,
            //             children: [
            //                 {
            //                     customLabel: {
            //                         name: pluginName + ColorPicker.name,
            //                         props: {
            //                             onClick: (color: string, e: MouseEvent) => this.handleLineColor(color, e),
            //                             lang: {
            //                                 collapseLocale: 'colorPicker.collapse',
            //                                 customColorLocale: 'colorPicker.customColor',
            //                                 confirmColorLocale: 'colorPicker.confirmColor',
            //                                 cancelColorLocale: 'colorPicker.cancelColor',
            //                                 changeLocale: 'colorPicker.change',
            //                             },
            //                         },
            //                     },
            //                     className: styles.selectColorPicker,
            //                     onClick: this.handleLineColor,
            //                 },
            //             ],
            //         },
            //         {
            //             customLabel: {
            //                 name: pluginName + LineBold.name,
            //                 props: {
            //                     locale: 'borderLine.borderSize',
            //                 },
            //             },
            //             onClick: (...arg) => this.handleLineBold(arg[1], arg[2], arg[0]),
            //             className: styles.selectLineBoldParent,
            //             unSelectable: true,
            //             children: BORDER_SIZE_CHILDREN,
            //         },
            //     ],
            // },
            // {
            //     type: 5,
            //     tooltipLocale: 'toolbar.mergeCell.main',
            //     customLabel: {
            //         name: 'MergeIcon',
            //     },
            //     show: this._config.mergeCell,
            //     onClick: (value: string) => {
            //         this.setMerge(value);
            //     },
            //     name: 'mergeCell',
            //     children: MERGE_CHILDREN,
            // },
            // {
            //     type: 3,
            //     tooltipLocale: 'toolbar.horizontalAlignMode.main',
            //     className: styles.selectDoubleString,
            //     display: 1,
            //     name: 'horizontalAlignMode',
            //     show: this._config.horizontalAlignMode,
            //     onClick: (value: HorizontalAlign) => {
            //         this.setHorizontalAlignment(value);
            //     },
            //     children: HORIZONTAL_ALIGN_CHILDREN,
            // },
            // {
            //     type: 3,
            //     tooltipLocale: 'toolbar.verticalAlignMode.main',
            //     className: styles.selectDoubleString,
            //     display: 1,
            //     name: 'verticalAlignMode',
            //     show: this._config.verticalAlignMode,
            //     onClick: (value: VerticalAlign) => {
            //         this.setVerticalAlignment(value);
            //     },
            //     children: VERTICAL_ALIGN_CHILDREN,
            // },
            // {
            //     type: 3,
            //     className: styles.selectDoubleString,
            //     tooltipLocale: 'toolbar.textWrapMode.main',
            //     display: 1,
            //     name: 'textWrapMode',
            //     show: this._config.textWrapMode,
            //     onClick: (value: WrapStrategy) => {
            //         this.setWrapStrategy(value);
            //     },
            //     children: TEXT_WRAP_CHILDREN,
            // },
            // {
            //     type: 3,
            //     className: styles.selectDoubleString,
            //     name: 'textRotateMode',
            //     tooltipLocale: 'toolbar.textRotateMode.main',
            //     display: 1,
            //     show: this._config.textRotateMode,
            //     onClick: (value: number | string) => {
            //         this.setTextRotation(value);
            //     },
            //     children: TEXT_ROTATE_CHILDREN,
            // },
        ];
        this._moreText = { more: 'toolbar.toolMore', tip: 'toolbar.toolMoreTip' };
    }

    // 获取Toolbar组件
    getComponent = (ref: Toolbar) => {
        this._toolbar = ref;
        this.setToolbar();
    };

    // 增加toolbar配置
    addToolbarConfig(config: IToolbarItemProps) {
        const index = this._toolList.findIndex((item) => item.name === config.name);
        if (index > -1) {
            this._toolList.push(config);
        }
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
        const locale = this._plugin.getContext().getLocale();
        const toolList = resetDataLabel(this._toolList, locale);
        this._toolbar.setToolbar(toolList);
    }

    setUIObserve<T>(msg: UIObserver<T>) {
        this._plugin.getContext().getObserverManager().requiredObserver<UIObserver<T>>('onUIChangeObservable', 'core').notifyObservers(msg);
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
}
