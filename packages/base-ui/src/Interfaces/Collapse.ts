import { ComponentChildren } from 'react';
import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BasePanelProps {
    children: ComponentChildren;
    header?: ComponentChildren;
}

export interface BaseCollapseProps {
    children: ComponentChildren;
}

export interface PanelComponent extends BaseComponent<BasePanelProps> {
    render(): JSXComponent<BasePanelProps>;
}

export interface CollapseComponent extends BaseComponent<BaseCollapseProps> {
    render(): JSXComponent<BaseCollapseProps>;
}
