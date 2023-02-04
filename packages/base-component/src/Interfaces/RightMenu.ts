import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

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
