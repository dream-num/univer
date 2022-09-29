import { Context } from '@univer/core';
import { RefObject } from 'preact';
import { ISlotProps } from './ISiderData';

export type AsyncFunction<T = void, R = void> = (value: T) => Promise<R>;

export interface IShowToolBarConfig {
    undoRedo?: boolean; // Undo redo
    paintFormat?: boolean; // Format brush
    currencyFormat?: boolean; // currency format
    percentageFormat?: boolean; // Percentage format
    numberDecrease?: boolean; // 'Decrease the number of decimal places'
    numberIncrease?: boolean; // 'Increase the number of decimal places
    moreFormats?: boolean; // 'More Formats'
    font?: boolean; // 'font'
    fontSize?: boolean; // 'Font size'
    bold?: boolean; // 'Bold (Ctrl+B)'
    italic?: boolean; // 'Italic (Ctrl+I)'
    strikethrough?: boolean; // 'Strikethrough (Alt+Shift+5)'
    underline?: boolean; // 'Underline (Alt+Shift+6)'
    textColor?: boolean; // 'Text color'
    fillColor?: boolean; // 'Cell color'
    border?: boolean; // 'border'
    mergeCell?: boolean; // 'Merge cells'
    horizontalAlignMode?: boolean; // 'Horizontal alignment'
    verticalAlignMode?: boolean; // 'Vertical alignment'
    textWrapMode?: boolean; // 'Wrap mode'
    textRotateMode?: boolean; // 'Text Rotation Mode'

    image?: boolean; // 'Insert picture'
    link?: boolean; // 'Insert link'
    chart?: boolean; // 'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
    comment?: boolean; // 'comment'
    pivotTable?: boolean; // 'PivotTable'
    function?: boolean; // 'formula'
    frozenMode?: boolean; // 'freeze mode'
    sortAndFilter?: boolean; // 'Sort and filter'
    conditionalFormat?: boolean; // 'Conditional Format'
    dataValidation?: boolean; // 'Data Validation'
    splitColumn?: boolean; // 'Split column'
    screenshot?: boolean; // 'screenshot'
    findAndReplace?: boolean; // 'Find and Replace'
    protection?: boolean; // 'Worksheet protection'
    print?: boolean; // 'Print'
}

export interface ILayout {
    outerLeft?: boolean;

    outerRight?: boolean;

    header?: boolean;

    footer?: boolean;

    innerLeft?: boolean;

    innerRight?: boolean;

    frozenHeaderLT?: boolean;

    frozenHeaderRT?: boolean;

    frozenHeaderLM?: boolean;

    frozenContent?: boolean;

    // Whether to show the toolbar
    toolBar?: boolean;

    // Custom configuration toolbar,can be used in conjunction with showToolBar, showToolBarConfig has a higher priority
    toolBarConfig?: IShowToolBarConfig;

    /**
     * 左右或者上下分割content区域
     *
     * undefined: no split
     * false: no split
     * true: horizontal split
     * "horizontal": horizontal split
     * "vertical": vertical split
     */

    contentSplit?: boolean | string;
}

export interface ISheetContainerConfigBase {
    layout?: string | ILayout;
}
export interface IStyleConfig extends ISheetContainerConfigBase {
    containerId?: HTMLElement | string;
}
export interface ISheetContainerConfig extends ISheetContainerConfigBase {
    // element?: HTMLElement | null;
    skin: string;
    container: HTMLElement;
    context: Context;
    getSplitLeftRef: (ref: RefObject<HTMLDivElement>) => void;
    getContentRef: (ref: RefObject<HTMLDivElement>) => void;
    addButton: (cb: Function) => void;
    addSider: (cb: AsyncFunction<ISlotProps>) => void;
    addMain: (cb: Function) => void;
    showSiderByName: (cb: Function) => void;
    showMainByName: (cb: Function) => void;
    onDidMount: () => void;
}
