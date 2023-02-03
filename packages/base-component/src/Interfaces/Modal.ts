import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ComponentChildren } from '../Framework';

export interface BaseModalProps {
    title?: string;
    width?: number;
    top?: number;
    style?: JSX.CSSProperties;
    children?: ComponentChildren;
    className?: string;
    group?: ModalButtonGroup[];
    maskClick?: () => void;
    /** 模态框是否可以拖动 */
    isDrag?: boolean;

    /** 模态框是否可见 */
    visible?: boolean;

    /** 是否显示遮罩 */
    mask?: boolean;

    /** 是否显示底部 */
    footer?: boolean;

    /** 点击遮罩层或右上角叉或取消按钮的回调 */
    onCancel?: (e: Event) => void;
    ref?: any;
}

export type ModalButtonGroup = {
    locale?: string;
    label?: string;
    onClick?: (e?: any) => void;
    type?: string;
};

export interface ModalProps extends BaseModalProps {
    show?: boolean;
    locale?: string;
}

export interface ModalComponent extends BaseComponent<BaseModalProps> {
    render(): JSXComponent<BaseModalProps>;
}
