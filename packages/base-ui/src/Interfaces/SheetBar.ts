import { BooleanNumber } from '@univerjs/core';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { BaseSelectProps } from '../Components';

export interface BaseSheetBarProps extends BaseComponentProps, Omit<BaseSelectProps, 'children'> {
    children?: any[];
    index?: string;
    color?: string;
    sheetId?: string;
    style?: JSX.CSSProperties;
    hidden?: BooleanNumber;
    addSheet?: () => void;
    onDown?: () => void;
    selectSheet?: () => void;
    changeSheetName?: (e: Event) => void;
    dragEnd?: (elements: HTMLElement[]) => void;
    selected?: boolean;
}

export interface SheetBarComponent extends BaseComponent<BaseSheetBarProps> {
    render(): JSXComponent<BaseSheetBarProps>;
}
