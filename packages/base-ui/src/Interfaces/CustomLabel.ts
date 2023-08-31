import { ComponentChildren } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { CustomComponent } from '../Common';

export interface BaseCustomLabelProps {
    label: string | CustomComponent | ComponentChildren;
}

export interface CustomLabelComponent extends BaseComponent<BaseCustomLabelProps> {
    render(): JSXComponent<BaseCustomLabelProps>;
}
