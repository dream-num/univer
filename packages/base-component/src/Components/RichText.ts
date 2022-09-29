import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseRichTextProps {
    style?: {};
    className?: string;
    onClick?: (e: MouseEvent) => void;
    text?: string;
}

export interface RichTextComponent extends BaseComponent<BaseRichTextProps> {
    render(): JSXComponent<BaseRichTextProps>;
}
