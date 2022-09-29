import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseCountBarProps {}

export interface CountBarComponent extends BaseComponent<BaseCountBarProps> {
    render(): JSXComponent<BaseCountBarProps>;
}
