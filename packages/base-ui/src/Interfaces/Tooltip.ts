import { ComponentChildren } from 'preact';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseTooltipProps extends BaseComponentProps {
    [index: number]: string;

    title?: string;
    shortcut?: string;
    children: ComponentChildren;
    placement?: string;
    color?: string;
    styles?: {};
}

export interface TooltipComponent extends BaseComponent<BaseTooltipProps> {
    render(): JSXComponent<BaseTooltipProps>;
}
