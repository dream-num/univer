import { ComponentChildren, RefObject } from 'react';
import { BaseComponent, JSXComponent } from '../BaseComponent';

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
