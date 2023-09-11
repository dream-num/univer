import { RefObject } from 'react';

import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseInputProps extends BaseComponentProps {
    type?: 'text' | 'button' | 'checkbox' | 'file' | 'hidden' | 'image' | 'password' | 'radio' | 'reset' | 'submit' | 'number';
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    bordered?: boolean;
    disabled?: boolean;
    // maxLength?: number;
    // onPressEnter?: KeyboardEvent;
    onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    onValueChange?: (value: string) => void;
    className?: string;
    readonly?: boolean;
    id?: string;
    ref?: RefObject<HTMLInputElement>;
}

export interface InputComponent extends BaseComponent<BaseInputProps> {
    render(): JSXComponent<BaseInputProps>;
}
