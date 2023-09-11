import { RefObject } from 'react';

import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseInputProps extends BaseComponentProps {
    type?: 'text' | 'button' | 'checkbox' | 'file' | 'hidden' | 'image' | 'password' | 'radio' | 'reset' | 'submit' | 'number';
    value?: string;
    placeholder?: string;
    onChange?: (e: Event) => void;
    onPressEnter?: (e: KeyboardEvent) => void;
    bordered?: boolean;
    disabled?: boolean;
    // maxLength?: number;
    // onPressEnter?: KeyboardEvent;
    onFocus?: (e: Event) => void;
    onBlur?: (e: FocusEvent) => void;
    onClick?: (e: MouseEvent) => void;
    onValueChange?: (value: string) => void;
    className?: string;
    readonly?: boolean;
    id?: string;
    ref?: RefObject<HTMLInputElement>;
}

export interface InputComponent extends BaseComponent<BaseInputProps> {
    render(): JSXComponent<BaseInputProps>;
}
