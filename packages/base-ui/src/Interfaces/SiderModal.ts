import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ComponentChildren, RefObject } from '../Framework';

export interface BaseSiderModalProps {
    title: string | any;
    closeSide?: Function;
    children?: ComponentChildren;
    footer?: ComponentChildren;
    pluginName: string;
    ref?: RefObject<HTMLElement>;
    className?: string;
    style: JSX.CSSProperties;
}

export interface SiderModalComponent extends BaseComponent<BaseSiderModalProps> {
    render(): JSXComponent<BaseSiderModalProps>;
}
