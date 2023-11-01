import { BaseSelectChildrenProps, BaseSelectProps, ComponentManager } from '@univerjs/base-ui';
import {
    BorderType,
    HorizontalAlign,
    IKeyValue,
    IUniverInstanceService,
    Tools,
    UIObserver,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { ColorPicker } from '@univerjs/design';
import { Inject } from '@wendellhu/redi';

import { DefaultToolbarConfig, SLIDE_UI_PLUGIN_NAME, SlideToolbarConfig } from '../Basics';
import { Toolbar } from '../View/Toolbar';
import { TEXT_ROTATE_CHILDREN } from '../View/Toolbar/Const';
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
    suffix?: React.ReactNode;
}

interface BorderInfo {
    type: BorderType;
    color: string;
    style: number;
}

export class ToolbarUIController {
    private _toolbar?: Toolbar;

    private _toolList: IToolbarItemProps[];

    private _config: SlideToolbarConfig;

    private _textColor: string = '#000';

    private _background: string = '#fff';

    private _borderInfo: BorderInfo = {
        type: BorderType.ALL,
        color: '#000',
        style: 1,
    }; //存储边框信息

    constructor(
        config: SlideToolbarConfig | undefined,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._config = Tools.deepMerge({}, DefaultToolbarConfig, config);

        this._toolList = [
            {
                className: styles.selectDoubleString,
                name: 'textRotateMode',
                tooltip: 'toolbar.textRotateMode.main',
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

    /** @deprecated */
    setUIObserve<T>(msg: UIObserver<T>) {}

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

    setMerge(value: string) {
        const msg = {
            name: 'merge',
            value,
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

    setBorder() {
        const msg = {
            name: 'borderInfo',
            value: this._borderInfo,
        };
        this.setUIObserve<IKeyValue>(msg);
    }

    hideTooltip() {
        const dom = (this._toolbar as any).current as HTMLDivElement;
        const tooltip = dom.querySelectorAll(`.${styles.tooltipTitle}.${styles.bottom}`);
        tooltip.forEach((item) => {
            (item as HTMLSpanElement).style.display = 'none';
        });
    }

    private _initialize() {
        this._componentManager.register(SLIDE_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);
    }
}

// {
//     toolbarType: 1,
//     tooltip: 'toolbar.undo',
//     name: 'undo',
//     unActive: true,
//     label: {
//         name: 'UndoSingle',
//     },
//     show: this._config.undo,
//     onClick: () => {
//         this.setUndo();
//         this.hideTooltip();
//     },
// },
// {
//     toolbarType: 1,
//     tooltip: 'toolbar.redo',
//     unActive: true,
//     label: {
//         name: 'RedoSingle',
//     },
//     name: 'redo',
//     show: this._config.redo,
//     onClick: () => {
//         this.setRedo();
//         this.hideTooltip();
//     },
// },
// {
//     type: 0,
//     tooltip: 'toolbar.font',
//     className: styles.selectLabelString,
//     name: 'font',
//     show: this._config.font,
//     border: true,
//     onMainClick: () => {
//         this.hideTooltip();
//     },
//     onClick: (fontFamily: string) => {
//         this.setFontFamily(fontFamily);
//     },
//     children: FONT_FAMILY_CHILDREN,
// },
// {
//     type: 1,
//     tooltip: 'toolbar.fontSize',
//     label: String(DEFAULT_STYLES.fs),
//     name: 'fontSize',
//     show: this._config.fontSize,
//     onClick: (fontSize: number) => {
//         this.setFontSize(fontSize);
//     },
//     onMainClick: () => {
//         this.hideTooltip();
//     },
//     onPressEnter: (fontSize: number) => {
//         this.setFontSize(fontSize);
//         this.hideTooltip();
//     },
//     children: FONT_SIZE_CHILDREN,
// },
// {
//     toolbarType: 1,
//     tooltip: 'toolbar.bold',
//     label: {
//         name: 'BoldSingle',
//     },
//     active: false,
//     name: 'bold',
//     show: this._config.bold,
//     onClick: (e, isBold: boolean) => {
//         this.setFontWeight(isBold);
//         this.hideTooltip();
//     },
// },
// {
//     toolbarType: 1,
//     tooltip: 'toolbar.italic',
//     label: {
//         name: 'ItalicSingle',
//     },
//     name: 'italic',
//     show: this._config.italic,
//     onClick: (e, isItalic: boolean) => {
//         this.setFontStyle(isItalic);
//         this.hideTooltip();
//     },
// },
// {
//     toolbarType: 1,
//     tooltip: 'toolbar.strikethrough',
//     label: {
//         name: 'StrikethroughSingle',
//     },
//     name: 'strikethrough',
//     show: this._config.strikethrough,
//     onClick: (e, isStrikethrough: boolean) => {
//         this.hideTooltip();
//         const strikethroughItem = this._toolList.find((item) => item.name === 'strikethrough');
//         if (!strikethroughItem) return;
//         strikethroughItem.active = isStrikethrough;
//         this.setStrikeThrough(isStrikethrough);
//     },
// },
// {
//     toolbarType: 1,
//     tooltip: 'toolbar.underline',
//     label: {
//         name: 'UnderlineSingle',
//     },
//     name: 'underline',
//     show: this._config.underline,
//     onClick: (e, isUnderLine: boolean) => {
//         this.hideTooltip();
//         const underlineItem = this._toolList.find((item) => item.name === 'underline');
//         if (!underlineItem) return;
//         underlineItem.active = isUnderLine;
//         this.setUnderline(isUnderLine);
//     },
// },
// {
//     type: 5,
//     tooltip: 'toolbar.textColor.main',
//     label: {
//         name: SLIDE_UI_PLUGIN_NAME + ColorSelect.name,
//         props: {
//             getComponent: (ref: ColorSelect) => {
//                 this._colorSelect1 = ref;
//             },
//             color: '#000',
//             label: {
//                 name: 'FontColor',
//             },
//         },
//     },
//     onClick: () => {
//         this.hideTooltip();
//         const textColor = this._toolList.find((item) => item.name === 'textColor');
//         if (!textColor || !textColor.label) return;
//         if (!(textColor.label as ICustomComponent).props?.color) return;
//         (textColor.label as ICustomComponent).props!.color = this._textColor;
//         this.changeColor(this._textColor);
//     },
//     hideSelectedIcon: true,
//     className: styles.selectColorPickerParent,
//     children: [
//         {
//             label: 'toolbar.resetColor',
//         },
//         {
//             label: {
//                 name: SLIDE_UI_PLUGIN_NAME + ColorPicker.name,
//                 props: {
//                     onClick: (color: string, e: MouseEvent) => {
//                         this._colorSelect1.setColor(color);
//                         this._textColor = color;
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
//     tooltip: 'toolbar.fillColor.main',
//     label: {
//         name: SLIDE_UI_PLUGIN_NAME + ColorSelect.name,
//         props: {
//             getComponent: (ref: ColorSelect) => {
//                 this._colorSelect2 = ref;
//             },
//             color: '#fff',
//             label: {
//                 name: 'PaintBucket',
//             },
//         },
//     },
//     onClick: () => {
//         this.hideTooltip();
//         const fillColor = this._toolList.find((item) => item.name === 'fillColor');
//         if (!fillColor || !fillColor.label) return;
//         if (!(fillColor.label as ICustomComponent).props?.color) return;
//         (fillColor.label as ICustomComponent).props!.color = this._background;
//         this.setBackground(this._background);
//     },
//     hideSelectedIcon: true,
//     className: styles.selectColorPickerParent,
//     children: [
//         {
//             label: 'toolbar.resetColor',
//         },
//         {
//             label: {
//                 name: SLIDE_UI_PLUGIN_NAME + ColorPicker.name,
//                 props: {
//                     onClick: (color: string, e: MouseEvent) => {
//                         this._colorSelect2.setColor(color);
//                         this._background = color;
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
//     type: 5,
//     tooltip: 'toolbar.mergeCell.main',
//     label: {
//         name: 'MergeCellSingle',
//     },
//     show: this._config.mergeCell,
//     onClick: (value: string) => {
//         this.setMerge(value ?? 'all');
//         this.hideTooltip();
//     },
//     name: 'mergeCell',
//     children: MERGE_CHILDREN,
// },
// {
//     type: 3,
//     tooltip: 'toolbar.horizontalAlignMode.main',
//     className: styles.selectDoubleString,
//     display: 1,
//     name: 'horizontalAlignMode',
//     show: this._config.horizontalAlignMode,
//     onClick: (value: HorizontalAlign) => {
//         this.setHorizontalAlignment(value);
//         this.hideTooltip();
//     },
//     children: HORIZONTAL_ALIGN_CHILDREN,
// },
// {
//     type: 3,
//     tooltip: 'toolbar.verticalAlignMode.main',
//     className: styles.selectDoubleString,
//     display: 1,
//     name: 'verticalAlignMode',
//     show: this._config.verticalAlignMode,
//     onClick: (value: VerticalAlign) => {
//         this.setVerticalAlignment(value);
//         this.hideTooltip();
//     },
//     children: VERTICAL_ALIGN_CHILDREN,
// },
// {
//     type: 3,
//     className: styles.selectDoubleString,
//     tooltip: 'toolbar.textWrapMode.main',
//     display: 1,
//     name: 'textWrapMode',
//     show: this._config.textWrapMode,
//     onClick: (value: WrapStrategy) => {
//         this.setWrapStrategy(value);
//         this.hideTooltip();
//     },
//     children: TEXT_WRAP_CHILDREN,
// },
