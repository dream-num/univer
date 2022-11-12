import { BaseFormatModalProps, Component, FormatModalComponent, JSXComponent } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { Modal, Ul } from '../index';
import styles from './index.module.less';

// interface FormatModalProps extends UlProps, ModalProps {
//     children?: any;
// }

type localeProps = {
    name: string;
    value: string;
};

type FormatModalState = {
    data: BaseFormatModalProps[];
};

export class FormatModal extends Component<BaseFormatModalProps, FormatModalState> {
    refs: Ul[] = [];

    ModalRefs: Modal[] = [];

    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize(props: BaseFormatModalProps) {
        // super(props);

        this.state = {
            data: [
                {
                    name: 'format.titleCurrency',
                    show: false,
                    group: [
                        {
                            locale: 'button.confirm',
                            type: 'primary',
                        },
                        {
                            locale: 'button.cancel',
                        },
                    ],
                    onCancel: () => this.showModal('format.titleCurrency', false),
                },
                {
                    name: 'format.titleDateTime',
                    show: false,
                    group: [
                        {
                            locale: 'button.confirm',
                            type: 'primary',
                        },
                        {
                            locale: 'button.cancel',
                        },
                    ],
                    onCancel: () => this.showModal('format.titleDateTime', false),
                },
                {
                    name: 'format.titleNumber',
                    show: false,
                    group: [
                        {
                            locale: 'button.confirm',
                            type: 'primary',
                        },
                        {
                            locale: 'button.cancel',
                        },
                    ],
                    onCancel: () => this.showModal('format.titleNumber', false),
                },
            ],
        };
    }

    setLocale() {
        const locale = this.context.locale;
        let data = this.state.data;
        data.forEach((item) => {
            item.title = locale.get(item.name);
            if (item.name === 'format.titleCurrency') {
                item.children = locale.get('currencyDetail').map((ele: localeProps) => ({
                    label: ele.name,
                    icon: ele.value,
                }));
            } else if (item.name === 'format.titleDateTime') {
                item.children = locale.get('dateFmtList').map((ele: localeProps) => ({
                    label: ele.name,
                    icon: ele.value,
                }));
            } else if (item.name === 'format.titleNumber') {
                item.children = locale.get('numFmtList').map((ele: localeProps) => ({
                    label: ele.name,
                    icon: ele.value,
                }));
            }
            if (item.group?.length) {
                item.group.forEach((ele) => {
                    ele.label = locale.get(ele.locale);
                });
            }
        });
        this.setState((prevState) => ({
            data,
        }));
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    // show modal
    showModal = (name: string, isShow: boolean) => {
        let data = this.state.data;
        let index = data.findIndex((item) => item.name === name);
        if (index > -1) {
            data[index].show = isShow;
            this.setValue({ data }, () => ({ data }));
        }
    };

    componentWillMount() {
        this.setLocale();

        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    render(props: BaseFormatModalProps, state: FormatModalState) {
        const { data } = state;
        return (
            <>
                {data.map((item, index) => {
                    if (item.show) {
                        return (
                            <Modal title={item.title} className={styles.formatModal} group={item.group} visible={item.show} onCancel={item.onCancel}>
                                {item.label}
                                <Ul show={true} children={item.children} ref={(ele: Ul) => (this.refs[index] = ele)}></Ul>
                            </Modal>
                        );
                    }
                    return <></>;
                })}
            </>
        );
    }
}

export class UniverFormatModal implements FormatModalComponent {
    render(): JSXComponent<BaseFormatModalProps> {
        return FormatModal;
    }
}
