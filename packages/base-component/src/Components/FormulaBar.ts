import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseFormulaBarProps extends BaseComponentProps {}

export interface FormulaBarComponent extends BaseComponent<BaseFormulaBarProps> {
    render(): JSXComponent<BaseFormulaBarProps>;
}
