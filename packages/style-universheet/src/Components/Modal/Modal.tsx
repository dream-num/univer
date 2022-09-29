import { BaseModalProps, Component, JSXComponent, ModalComponent, ModalProps } from '@univer/base-component';

import { Button } from '../Button';
import { Drag } from '../Drag';
import * as Icon from '../Icon';
import styles from './index.module.less';

interface IState {}

// export interface ModalBaseProps {
//     title?: string;
//     width?: number;
//     style?: JSX.CSSProperties;
//     children?: any;
//     className?: string;
//     group?: Array<ModalButtonGroup>;
//     maskClick?: () => void;
//     /** 模态框是否可以拖动 */
//     isDrag?: boolean;

//     /** 模态框是否可见 */
//     visible?: boolean;

//     /** 是否显示遮罩 */
//     mask?: boolean;

//     /** 是否显示底部 */
//     footer?: boolean;

//     /** 点击遮罩层或右上角叉或取消按钮的回调 */
//     onCancel?: (e: Event) => void;
// }

// export type ModalButtonGroup = {
//     name?: string;
//     label?: string;
//     onClick?: (e?: any) => void;
//     type?: string;
// };

// interface ModalProps extends ModalBaseProps {
//     show?: boolean;
//     name?: string;
// }

class Modal extends Component<BaseModalProps, IState> {
    handleClickCancel = (cb: Function | undefined) => {
        // this.setState({ visible: false });
        if (cb) cb();
    };

    // showModal = (value: boolean) => {
    //     this.setState((prevState) => {
    //         return {
    //             visible: value,
    //         };
    //     });
    // };
    // maskClick = (e: MouseEvent) => {
    //     const mask = document.querySelector(`.${styles.modalMask}`);
    //     if (e.target === mask) {
    //         this.showModal(false);
    //         this.props.maskClick?.();
    //     }
    // };
    handleClick = (cb?: () => void) => {
        // this.showModal(false);
        if (cb) cb();
    };

    render() {
        const { title, width = 500, top = 0, style, children, className, group = [], isDrag = false, mask = true, footer = true, visible } = this.props;

        return (
            <>
                {visible ? (
                    <div className={className}>
                        {mask ? <div className={styles.modalMask} onClick={this.props.onCancel}></div> : null}
                        <Drag isDrag={isDrag}>
                            <div
                                className={`${isDrag ? styles.modalDargWrapper : styles.modalWrapper}`}
                                style={{
                                    width: `${width}px`,
                                    top: `${top}px`,
                                    ...style,
                                }}
                            >
                                <div className={styles.modalHeader}>
                                    <span>{title}</span>
                                    <span className={styles.modalClose} onClick={this.props.onCancel}>
                                        <Icon.Other.Close></Icon.Other.Close>
                                    </span>
                                </div>
                                <div className={styles.modalBody}>{children}</div>
                                {footer ? (
                                    <div className={styles.modalFooter}>
                                        {group.map((item) => (
                                            <Button type={item.type} onClick={() => this.handleClick(item.onClick)}>
                                                {item.label}
                                            </Button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </Drag>
                    </div>
                ) : null}
            </>
        );
    }
}

export class UniverModal implements ModalComponent {
    render(): JSXComponent<BaseModalProps> {
        return Modal;
    }
}

export type { ModalProps };
export { Modal };
