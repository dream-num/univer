import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ComponentChildren, JSX } from '../Framework';

export interface BaseMenuItem {
    className?: string;
    style?: JSX.CSSProperties;
    label: ComponentChildren;
    children?: BaseMenuProps;
    hide?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

export interface BaseMenuProps {
    list: BaseMenuItem[];
    onClick?: () => void;
    className?: string;
    style?: JSX.CSSProperties;
    parent?: any;
}

export interface MenuComponent extends BaseComponent<BaseMenuProps> {
    render(): JSXComponent<BaseMenuProps>;
}
