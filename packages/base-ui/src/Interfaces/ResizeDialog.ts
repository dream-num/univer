import { ComponentChildren } from 'preact';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseResizeDialogProps extends BaseComponentProps {
    left: number;
    top: number;
    width: number;
    height: number;
    children: ComponentChildren;
    ratio: number;
}

export interface ResizeDialogComponent extends BaseComponent<BaseResizeDialogProps> {
    render(): JSXComponent<BaseResizeDialogProps>;
}
