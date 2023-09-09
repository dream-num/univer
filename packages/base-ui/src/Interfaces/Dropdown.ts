import { ComponentChildren } from 'react';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { BaseMenuProps } from './Menu';

export interface BaseDropdownProps {
    children: ComponentChildren;
    /** @deprecated dropdown shouldn't know what is inside */
    menu: BaseMenuProps;
    placement?: 'Left' | 'Right' | 'Top' | 'Bottom';
    showArrow?: boolean;
    icon?: ComponentChildren;
    onClick?: () => void;
    onMainClick?: () => void; //非功能按钮事件
    tooltip?: string;
    content?: ComponentChildren;
}

export interface DropdownComponent extends BaseComponent<BaseDropdownProps> {
    render(): JSXComponent<BaseDropdownProps>;
}
