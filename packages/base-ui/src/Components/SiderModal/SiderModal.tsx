import { Component } from 'preact';
import { BaseSiderModalProps } from '../../Interfaces';
import { Icon } from '../index';
import Style from './index.module.less';

type IState = {
    zIndex: number;
    show: boolean;
};

class SiderModal extends Component<BaseSiderModalProps, IState> {
    constructor(props: BaseSiderModalProps) {
        super();
        this.initialize(props);
    }

    initialize(props: BaseSiderModalProps) {
        this.state = {
            zIndex: props.zIndex ?? 0,
            show: props.show ?? true,
        };
    }

    close() {
        this.setState({
            show: false,
        });
    }

    handleClick() {
        const zIndex = this.context.zIndexManager.getMaxIndex() + 1;
        this.setState({
            zIndex,
        });
    }

    componentWillReceiveProps(props: BaseSiderModalProps): void {
        this.setState({
            show: props.show ?? true,
        });
    }

    render(props: BaseSiderModalProps) {
        const { className = '', style } = props;
        const { zIndex, show } = this.state;
        this.context.zIndexManager.setIndex(props.name, zIndex);

        return show ? (
            <div className={`${Style.siderModal} ${className}`} style={{ ...style, zIndex }} onClick={() => this.handleClick()}>
                <div className={Style.siderModalHeader}>
                    <h3 className={Style.siderModalTitle}>{this.props.title}</h3>
                    <span className={Style.siderModalClose} onClick={() => this.close()}>
                        <Icon.Other.Close></Icon.Other.Close>
                    </span>
                </div>
                <div className={Style.siderModalBody}>
                    <div className={Style.siderModalBodyInner}>{this.props.children}</div>
                </div>
                <div className={Style.siderModalFooter}>{this.props.footer}</div>
            </div>
        ) : null;
    }
}

export { SiderModal };
