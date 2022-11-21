import { ComponentChildren } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { BaseMenuProps } from './Menu';

export interface BaseDropdownProps {
    children: ComponentChildren;
    menu: BaseMenuProps;
    placement?: 'Left' | 'Right' | 'Top' | 'Bottom';
    showArrow?: boolean;
    icon?: ComponentChildren;
    onClick?: () => void;
    tooltip?: string;
}

export interface DropdownComponent extends BaseComponent<BaseDropdownProps> {
    render(): JSXComponent<BaseDropdownProps>;
}
