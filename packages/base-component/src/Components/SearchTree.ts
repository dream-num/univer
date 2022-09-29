import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseSearchTreeProps {}

export interface SearchTreeComponent extends BaseComponent<BaseSearchTreeProps> {
    render(): JSXComponent<BaseSearchTreeProps>;
}
