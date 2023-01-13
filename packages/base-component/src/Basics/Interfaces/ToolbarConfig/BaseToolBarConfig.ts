import { BaseSelectChildrenProps, BaseSelectProps } from '@univer/base-sheets';
import { BaseTextButtonProps } from '@univer/base-sheets/src/View/UI/Common/TextButton/TextButton';

export interface ToolBarConfig extends SheetToolBarConfig, DocToolBarConfig, SlideToolBarConfig {}

export interface BaseToolBarConfig {
    undoRedo?: boolean; // Undo redo
    paintFormat?: boolean; // Format brush
    currencyFormat?: boolean; // currency format
    percentageFormat?: boolean; // Percentage format
    numberDecrease?: boolean; // 'Decrease the number of decimal places'
    numberIncrease?: boolean; // 'Increase the number of decimal places
    font?: boolean; // 'font'
    fontSize?: boolean; // 'Font size'
    bold?: boolean; // 'Bold (Ctrl+B)'
    italic?: boolean; // 'Italic (Ctrl+I)'
    strikethrough?: boolean; // 'Strikethrough (Alt+Shift+5)'
    underline?: boolean; // 'Underline (Alt+Shift+6)'
    textColor?: boolean; // 'Text color'
    fillColor?: boolean; // 'Cell color'
    border?: boolean; // 'border'
    horizontalAlignMode?: boolean; // 'Horizontal alignment'
    verticalAlignMode?: boolean; // 'Vertical alignment'
    textWrapMode?: boolean; // 'Wrap mode'
    textRotateMode?: boolean; // 'Text Rotation Mode'
}

export interface SheetToolBarConfig extends BaseToolBarConfig {
    mergeCell?: boolean; // 'Merge cells'
}

export interface DocToolBarConfig extends BaseToolBarConfig {}

export interface SlideToolBarConfig extends BaseToolBarConfig {}

// 继承基础下拉属性,添加国际化
export interface BaseToolBarSelectChildrenProps extends BaseSelectChildrenProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolBarSelectChildrenProps[];
}

export interface BaseToolBarSelectProps extends BaseSelectProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolBarSelectChildrenProps[];
}

enum ToolbarType {
    SELECT,
    BUTTON,
}

export interface IToolBarItemProps extends BaseToolBarSelectProps, BaseTextButtonProps {
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    locale?: string; //label国际化
    tooltipLocale?: string; //tooltip国际化 TODO: need right label
    tooltip?: string; //tooltip文字
    border?: boolean;
}
