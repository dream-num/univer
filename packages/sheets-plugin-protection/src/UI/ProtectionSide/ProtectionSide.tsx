import { BaseComponentSheet, Component } from '@univerjs/base-ui';
import { SheetContext, IRangeData, Nullable, Observer, Workbook } from '@univerjs/core';
import { Protection } from '../../Controller/Protection';

import styles from './index.module.less';

type IConfig = {
    context: SheetContext;
    rangeData: IRangeData;
    protection: Protection;
};

interface IProps {
    config: IConfig;
    style?: JSX.CSSProperties;
}
interface IState {
    configTxt: Array<{ checked: boolean; label: string }>;
    isShow: boolean;
    locale: any;
}

class ProtectionSide extends Component<IProps, IState> {
    private _localeObserv: Nullable<Observer<Workbook>>;

    // protectionRef = createRef();
    //
    // SiderModal: FunctionComponent<BaseSiderModalProps>;

    initialize(props: IProps) {
        // super(props);

        const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        // this.SiderModal = render.renderFunction('SiderModal');

        this.state = {
            configTxt: [
                { checked: false, label: '选定1' },
                { checked: false, label: '选定2' },
            ],
            isShow: true,
            locale: null,
        };
    }

    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserv = this.getContext()
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        // this.context.coreContext.getObserverManager().getObserver('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserv);
    }

    setLocale() {
        const locale = this.context.coreContext.getLocale().get('protection');
        this.setState({ locale });
    }

    changeChecked(index: number) {
        const configTxt = this.state.configTxt;
        configTxt[index].checked = !configTxt[index].checked;
        this.setState({
            configTxt,
        });
    }

    footer() {
        return (
            <div className={styles.protectionSideFooter}>
                <div className={styles.protectionSideOk}>{this.state.locale.Ok}</div>
                <div className={styles.protectionSideCancel}>{this.state.locale.Cancel}</div>
            </div>
        );
    }

    render() {
        // const { style } = this.props;
        // return (
        //     <this.SiderModal
        //         title={this.state.locale.protectionLabel}
        //         closeSide={() => {
        //             // this.context.coreContext.getPluginManager().getPluginByName<StyleUniverSheet>('styleUniverSheet')?.showSiderByName(PROTECTION_PLUGIN_NAME, false);
        //         }}
        //         footer={this.footer()}
        //         pluginName={PROTECTION_PLUGIN_NAME}
        //         className={styles.protectionSide}
        //         style={{ ...style }}
        //     >
        //         <div className={styles.protectionSideBody}>
        //             <div className={styles.protectionSideSwich}>
        //                 <input type="checkbox" />
        //                 <label>{this.state.locale.ProtectionWorksheet}</label>
        //             </div>
        //             <div className={styles.protectionSideTxt}>
        //                 <input type="text" placeholder={this.state.locale.Password} />
        //                 <textarea type="text" placeholder="" />
        //             </div>
        //             <ul className={styles.protectionSideConfig}>
        //                 {this.state.configTxt.map((item, index) => (
        //                     <li onClick={this.changeChecked.bind(this, index)}>
        //                         <input type="checkbox" checked={item.checked} />
        //                         <label>{item.label}</label>
        //                     </li>
        //                 ))}
        //             </ul>
        //             <div className={styles.protectionSideCol}>{this.state.locale.AllowUsersToEdit}</div>
        //         </div>
        //     </this.SiderModal>
        // );
        return null;
    }
}

export { ProtectionSide };
