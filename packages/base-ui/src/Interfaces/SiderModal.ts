import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ComponentChildren, RefObject } from '../Framework';

export interface BaseSiderModalProps {
    name: string;
    title: string | any;
    show?: boolean;
    children?: ComponentChildren;
    footer?: ComponentChildren;
    ref?: RefObject<HTMLElement>;
    className?: string;
    zIndex?: number;
    style?: JSX.CSSProperties;
}

export interface SiderModalComponent extends BaseComponent<BaseSiderModalProps> {
    render(): JSXComponent<BaseSiderModalProps>;
}
