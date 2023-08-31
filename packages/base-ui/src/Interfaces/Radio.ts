import { VNode } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseRadioIProps {
    value: string;
    active?: boolean;
    onClick?: () => void;
    label?: string;
    children?: any;
}

export interface BaseRadioGroupProps {
    className?: string;
    active?: string | number;
    vertical?: boolean;
    onChange: (value: string) => void;
    children: Array<VNode<BaseRadioIProps>>;
}

export interface RadioComponent extends BaseComponent<BaseRadioIProps> {
    render(): JSXComponent<BaseRadioIProps>;
}

export interface RadioGroupComponent extends BaseComponent<BaseRadioGroupProps> {
    render(): JSXComponent<BaseRadioGroupProps>;
}
