import { ComponentChildren } from 'preact';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseCheckboxProps extends BaseComponentProps {
    value?: string;
    checked?: boolean;
    className?: string;
    disabled?: boolean;
    name?: string;
    onChange?: (e: Event) => void;
    children?: ComponentChildren;
}

export interface CheckboxComponent extends BaseComponent<BaseCheckboxProps> {
    render(): JSXComponent<BaseCheckboxProps>;
}

export type BaseCheckboxGroupOptions = {
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    label?: ComponentChildren;
    value?: string;
};

export interface BaseCheckboxGroupProps extends BaseComponentProps {
    disabled?: boolean;
    name?: string;
    options: BaseCheckboxGroupOptions[];
    onChange?: (value: string[]) => void;
}

export interface CheckboxGroupComponent extends BaseComponent<BaseCheckboxGroupProps> {
    render(): JSXComponent<BaseCheckboxGroupProps>;
}
