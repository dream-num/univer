import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

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
