import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

export interface BaseTooltipProps extends BaseComponentProps {
    [index: number]: string;
    title?: string;
    children: ComponentChildren;
    placement?: string;
    color?: string;
    styles?: {};
}

export interface TooltipComponent extends BaseComponent<BaseTooltipProps> {
    render(): JSXComponent<BaseTooltipProps>;
}
