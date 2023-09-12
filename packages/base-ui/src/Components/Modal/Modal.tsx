// class Modal extends Component<BaseModalProps, IState> {
//     constructor(props: BaseModalProps) {
//         super(props);
//         this.initialize();
//     }
//     initialize() {
//         this.state = {
//             visible: this.props.visible ?? false,
//         };
//     }
//     handleClickCancel = (cb: Function | undefined) => {
//         // this.setState({ visible: false });
//         if (cb) cb();
//     };
//     showModal = (value: boolean) => {
//         this.setState((prevState) => ({
//             visible: value,
//         }));
//     };
//     override UNSAFE_componentWillReceiveProps(props: BaseModalProps) {
//         if (props.visible !== this.state.visible) {
//             this.setState({
//                 visible: props.visible,
//             });
//         }
//     }
//     handleClick = (cb?: () => void) => {
//         this.showModal(false);
//         if (cb) cb();
//     };
//     render() {
//         const { title, width = 500, top = 0, style, children, className = '', group = [], isDrag = false, mask = true, footer = true } = this.props;
//         const { visible } = this.state;
//         return (
//             <>
//                 {visible ? (
//                     <div className={className}>
//                         {mask ? (
//                             <div
//                                 className={styles.modalMask}
//                                 onClick={(e) => {
//                                     this.props.onCancel?.(e);
//                                     this.showModal(false);
//                                 }}
//                             ></div>
//                         ) : null}
//                         <Drag isDrag={isDrag} className={styles.modalDrag}>
//                             <div
//                                 className={`${isDrag ? styles.modalDargWrapper : styles.modalWrapper}`}
//                                 style={{
//                                     width: `${width}px`,
//                                     // top: `${top}px`,
//                                     ...style,
//                                 }}
//                             >
//                                 <div className={styles.modalHeader}>
//                                     <span>{title}</span>
//                                     <span
//                                         className={styles.modalClose}
//                                         onClick={(e) => {
//                                             this.props.onCancel?.(e);
//                                             this.showModal(false);
//                                         }}
//                                     >
//                                         <Icon.Other.Close></Icon.Other.Close>
//                                     </span>
//                                 </div>
//                                 <div className={styles.modalBody}>{children}</div>
//                                 {footer ? (
//                                     <div className={styles.modalFooter}>
//                                         {group.map((item, index) => (
//                                             <Button key={index} type={item.type} onClick={() => this.handleClick(item.onClick)}>
//                                                 <CustomLabel label={item.label} />
//                                             </Button>
//                                         ))}
//                                     </div>
//                                 ) : null}
//                             </div>
//                         </Drag>
//                     </div>
//                 ) : null}
//             </>
//         );
//     }
// }
import React, { useEffect, useState } from 'react';

import { Button } from '../Button';
import { ButtonType } from '../Button/Button';
import { CustomLabel } from '../CustomLabel';
import { Drag } from '../Drag';
import * as Icon from '../Icon';
import styles from './index.module.less';

export interface BaseModalProps {
    title?: string | JSX.Element;
    width?: number;
    top?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
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
    onCancel?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    ref?: any;
}

export interface ModalButtonGroup {
    type: ButtonType;
    onClick: () => void;
    label: string;
}

export interface ModalProps extends BaseModalProps {
    show?: boolean;
    locale?: string;
}

export function Modal(props: BaseModalProps) {
    const { title, width = 500, top = 0, style, children, className = '', group = [], isDrag = false, mask = true, footer = true, onCancel, visible: propsVisible } = props;

    const [visible, setVisible] = useState<boolean>(propsVisible || false);

    useEffect(() => {
        setVisible(propsVisible || false);
    }, [propsVisible]);

    // const handleClickCancel = (cb: Function | undefined) => {
    //     if (cb) cb();
    // };

    const showModal = (value: boolean) => {
        setVisible(value);
    };

    const handleClick = (cb?: () => void) => {
        setVisible(false);
        if (cb) cb();
    };

    return (
        <>
            {visible ? (
                <div className={className}>
                    {mask ? (
                        <div
                            className={styles.modalMask}
                            onClick={(e) => {
                                onCancel?.(e);
                                showModal(false);
                            }}
                        ></div>
                    ) : null}
                    <Drag isDrag={isDrag} className={styles.modalDrag}>
                        <div
                            className={`${isDrag ? styles.modalDargWrapper : styles.modalWrapper}`}
                            style={{
                                width: `${width}px`,
                                // top: `${top}px`,
                                ...style,
                            }}
                        >
                            <div className={styles.modalHeader}>
                                <span>{title}</span>
                                <span
                                    className={styles.modalClose}
                                    onClick={(e) => {
                                        onCancel?.(e);
                                        showModal(false);
                                    }}
                                >
                                    <Icon.Other.Close></Icon.Other.Close>
                                </span>
                            </div>
                            <div className={styles.modalBody}>{children}</div>
                            {footer ? (
                                <div className={styles.modalFooter}>
                                    {group.map((item, index) => (
                                        <Button key={index} type={item.type} onClick={() => handleClick(item.onClick)}>
                                            <CustomLabel label={item.label} />
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
