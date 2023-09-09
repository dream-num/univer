import { BooleanNumber } from '@univerjs/core';

import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { BaseSelectProps } from '../Components';

export interface BaseSheetBarProps extends BaseComponentProps, Omit<BaseSelectProps, 'children'> {
    children?: any[];
    index?: string;
    color?: string;
    sheetId?: string;
    style?: React.CSSProperties;
    hidden?: BooleanNumber;
    addSheet?: () => void;
    onMouseDown?: () => void;
    selectSheet?: (slideItemIndex: number) => void;
    changeSheetName?: (sheetId: string, name: string) => void;
    dragEnd?: (elements: HTMLElement[]) => void;
    selected?: boolean;
}

export interface SheetBarComponent extends BaseComponent<BaseSheetBarProps> {
    render(): JSXComponent<BaseSheetBarProps>;
}
