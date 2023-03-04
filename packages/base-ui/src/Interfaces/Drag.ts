import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseDragProps {
    isDrag: boolean;
    className: string;
}

export interface DragComponent extends BaseComponent<BaseDragProps> {
    render(): JSXComponent<BaseDragProps>;
}
