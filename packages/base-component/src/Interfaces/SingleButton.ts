import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseSingleButtonProps {
    label?: string | JSX.Element;
    icon?: JSX.Element | string | null | undefined;
    tooltip?: string;
    name?: string;
    key?: string;
    onClick?: (...arg: any[]) => void;
}

export interface SingleButtonComponent extends BaseComponent<BaseSingleButtonProps> {
    render(): JSXComponent<BaseSingleButtonProps>;
}
