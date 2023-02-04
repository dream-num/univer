import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseInfoBarProps extends BaseComponentProps {}

export interface InfoBarComponent extends BaseComponent<BaseInfoBarProps> {
    render(): JSXComponent<BaseInfoBarProps>;
}
