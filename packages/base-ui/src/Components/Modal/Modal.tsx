import { Component } from '../../Framework';
import { JSXComponent } from '../../BaseComponent';
import { BaseModalProps, ModalComponent } from '../../Interfaces';
import { Button } from '../Button';
import { Drag } from '../Drag';
import * as Icon from '../Icon';
import styles from './index.module.less';

interface IState {
    visible: boolean;
}

class Modal extends Component<BaseModalProps, IState> {
    initialize() {
        this.state = {
            visible: this.props.visible ?? false,
        };
    }

    handleClickCancel = (cb: Function | undefined) => {
        // this.setState({ visible: false });
        if (cb) cb();
    };

    showModal = (value: boolean) => {
        this.setState((prevState) => ({
            visible: value,
        }));
    };

    componentWillReceiveProps(props: BaseModalProps) {
        if (props.visible !== this.state.visible) {
            this.setState({
                visible: props.visible,
            });
        }
    }

    // maskClick = (e: MouseEvent) => {
    //     const mask = document.querySelector(`.${styles.modalMask}`);
    //     if (e.target === mask) {
    //         this.showModal(false);
    //         this.props.maskClick?.();
    //     }
    // };
    handleClick = (cb?: () => void) => {
        this.showModal(false);
        if (cb) cb();
    };

    render() {
        const { title, width = 500, top = 0, style, children, className = '', group = [], isDrag = false, mask = true, footer = true } = this.props;
        const { visible } = this.state;

        return (
            <>
                {visible ? (
                    <div className={className}>
                        {mask ? (
                            <div
                                className={styles.modalMask}
                                onClick={(e) => {
                                    this.props.onCancel?.(e);
                                    this.showModal(false);
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
                                            this.props.onCancel?.(e);
                                            this.showModal(false);
                                        }}
                                    >
                                        <Icon.Other.Close></Icon.Other.Close>
                                    </span>
                                </div>
                                <div className={styles.modalBody}>{children}</div>
                                {footer ? (
                                    <div className={styles.modalFooter}>
                                        {group.map((item) => (
                                            <Button type={item.type} onClick={() => this.handleClick(item.onClick)}>
                                                {this.getLocale(item.label)}
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

export { Modal };
