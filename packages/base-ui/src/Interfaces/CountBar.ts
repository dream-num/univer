import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseCountBarProps extends BaseComponentProps {
    changeRatio: (ratio: string) => void;
}

export interface CountBarComponent extends BaseComponent<BaseCountBarProps> {
    render(): JSXComponent<BaseCountBarProps>;
}
