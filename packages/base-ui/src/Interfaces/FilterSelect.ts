import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseFilterSelectProps {}

export interface FilterSelectComponent extends BaseComponent<BaseFilterSelectProps> {
    render(): JSXComponent<BaseFilterSelectProps>;
}
