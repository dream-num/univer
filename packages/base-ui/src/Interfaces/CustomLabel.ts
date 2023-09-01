import { ComponentChildren } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ICustomComponent } from '../Common';
import { BaseSelectChildrenProps } from '../Components/Select/Select';

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
    label: string | ICustomComponent | ComponentChildren;
    onChange?: (e: Event) => void;
}

export interface CustomLabelComponent extends BaseComponent<IBaseCustomLabelProps> {
    render(): JSXComponent<IBaseCustomLabelProps>;
}
