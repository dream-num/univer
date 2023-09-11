import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

// Components interface
const ButtonTypes: string[] = ['default', 'primary'];
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes: string[] = ['circle', 'round'];
export type ButtonShape = typeof ButtonShapes[number];
const SizeTypes: string[] = ['small', 'middle', 'large'];
export type SizeType = typeof SizeTypes[number];
const ButtonHTMLTypes: string[] = ['submit', 'reset', 'button'];
export type ButtonHTMLType = 'submit' | 'reset' | 'button';

export interface BaseButtonProps extends BaseComponentProps {
    type?: ButtonType;
    shape?: ButtonShape;
    size?: SizeType;
    danger?: boolean;
    disabled?: boolean;
    block?: boolean;
    loading?: boolean;
    active?: boolean;
    htmlType?: ButtonHTMLType;
    onClick?: Function;
    children?: any;
    className?: string;
    style?: React.CSSProperties;
    unActive?: boolean;
}

// component class
export interface ButtonComponent extends BaseComponent<BaseButtonProps> {
    render(): JSXComponent<BaseButtonProps>;
}
