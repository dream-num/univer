import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseColorButtonProps {
    color: string;
}

export interface ColorButtonComponent extends BaseComponent<BaseColorButtonProps> {
    render(): JSXComponent<BaseColorButtonProps>;
}
