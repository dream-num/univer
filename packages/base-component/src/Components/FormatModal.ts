import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';
import { BaseModalProps } from './Modal';
import { BaseUlProps } from './Ul';

export interface BaseFormatModalProps extends BaseUlProps, BaseModalProps, BaseComponentProps {
    children?: any;
}

export interface FormatModalComponent extends BaseComponent<BaseFormatModalProps> {
    render(): JSXComponent<BaseFormatModalProps>;
}
