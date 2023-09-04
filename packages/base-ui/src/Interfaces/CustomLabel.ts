import { ComponentChildren } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ICustomComponent } from '../Common';
import { BaseSelectChildrenProps, DisplayTypes } from '../Components/Select/Select';

export interface ICustomLabelProps {
    prefix?: string[] | string;
    suffix?: string[] | string;
    options?: BaseSelectChildrenProps[];
    label?: string;
    children?: ICustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface ICustomLabelType {
    name: string;
    props?: ICustomLabelProps;
}

export interface IBaseCustomLabelProps {
    icon?: string;
    value?: string;
    label: string | ICustomComponent | ComponentChildren;
    display?: DisplayTypes;
}

export interface CustomLabelComponent extends BaseComponent<IBaseCustomLabelProps> {
    render(): JSXComponent<IBaseCustomLabelProps>;
}
