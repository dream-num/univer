import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

export interface BaseTooltipProps extends BaseComponentProps {
    title?: string;
    children: ComponentChildren;
    placement?: string;
    color?: string;
    styles?: {};
    [index: number]: string;
}

export interface TooltipComponent extends BaseComponent<BaseTooltipProps> {
    render(): JSXComponent<BaseTooltipProps>;
}
