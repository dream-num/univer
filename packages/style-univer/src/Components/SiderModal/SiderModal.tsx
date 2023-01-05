import { BaseSiderModalProps, Component, JSXComponent, SiderModalComponent } from '@univer/base-component';
import { Icon } from '../index';
import Style from './index.module.less';

class SiderModal extends Component<BaseSiderModalProps> {
    initialize(props: BaseSiderModalProps) {
        this.state = {};
    }

    close() {
        this._context.getPluginManager().getPluginByName<any>('spreadsheet')!.showSiderByName(this.props.pluginName, false);
        if (this.props.closeSide) {
            this.props.closeSide();
        }
    }

    render(props: BaseSiderModalProps) {
        const { className = '', style } = props;
        return (
            <div className={`${Style.siderModal} ${className}`} style={{ ...style }}>
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
        );
    }
}

export class UniverSiderModal implements SiderModalComponent {
    render(): JSXComponent<BaseSiderModalProps> {
        return SiderModal;
    }
}

export { SiderModal };
