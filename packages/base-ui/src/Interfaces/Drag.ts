import React from 'react';

import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseDragProps {
    isDrag: boolean;
    className: string;
    children: React.ReactNode;
}

export interface DragComponent extends BaseComponent<BaseDragProps> {
    render(): JSXComponent<BaseDragProps>;
}
