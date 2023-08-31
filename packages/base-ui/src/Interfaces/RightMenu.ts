import { ComponentChildren } from 'preact';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface List {
    content: ComponentChildren;
    onClick?: () => void;
    vertical?: boolean;
    type?: string;
    children?: List[];
}

export interface BaseRightMenuProps extends BaseComponentProps {
    onClick?: () => void;
    style?: {};
}

export interface RightMenuComponent extends BaseComponent<BaseRightMenuProps> {
    render(): JSXComponent<BaseRightMenuProps>;
}
