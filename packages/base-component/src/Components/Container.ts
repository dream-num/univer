import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

export interface BaseContainerProps extends BaseComponentProps {
    children?: ComponentChildren;
    style?: {};
    className?: string;
    onClick?: (e: MouseEvent) => void;
}
export interface BaseLayoutProps extends BaseComponentProps {
    children?: ComponentChildren;
    className?: string;
    style?: {};
}

export interface ContainerComponent extends BaseComponent<BaseContainerProps> {
    render(): JSXComponent<BaseContainerProps>;
}
export interface LayoutComponent extends BaseComponent<BaseLayoutProps> {
    render(): JSXComponent<BaseLayoutProps>;
}
export interface HeaderComponent extends BaseComponent<BaseLayoutProps> {
    render(): JSXComponent<BaseLayoutProps>;
}
export interface FooterComponent extends BaseComponent<BaseLayoutProps> {
    render(): JSXComponent<BaseLayoutProps>;
}
export interface SiderComponent extends BaseComponent<BaseLayoutProps> {
    render(): JSXComponent<BaseLayoutProps>;
}
export interface ContentComponent extends BaseComponent<BaseLayoutProps> {
    render(): JSXComponent<BaseLayoutProps>;
}
