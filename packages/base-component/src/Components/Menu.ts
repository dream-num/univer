import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

export interface BaseMenuProps {
    children: ComponentChildren;
    onClick?: () => void;
}

export interface MenuItemComponent extends BaseComponent<BaseMenuProps> {
    render(): JSXComponent<BaseMenuProps>;
}
export interface MenuComponent extends BaseComponent<BaseMenuProps> {
    render(): JSXComponent<BaseMenuProps>;
}
