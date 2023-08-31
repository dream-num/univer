import { ComponentChildren } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { CustomComponent } from '../Common';
import { BaseSelectChildrenProps } from '../Components/Select/Select';

export interface CustomLabelProps {
    prefix?: string[] | string;
    suffix?: string[] | string;
    options?: BaseSelectChildrenProps[];
    label?: string;
    children?: CustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface CustomLabelType {
    name: string;
    props?: CustomLabelProps;
}

export interface BaseCustomLabelProps {
    label: string | CustomComponent | ComponentChildren;
}

export interface CustomLabelComponent extends BaseComponent<BaseCustomLabelProps> {
    render(): JSXComponent<BaseCustomLabelProps>;
}
