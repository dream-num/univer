import { BaseCellRangeModalProps, CellRangeModalComponent, Component, createRef, JSXComponent } from '@univer/base-component';
import { SheetContext, Nullable, Observer, Workbook, Worksheet } from '@univer/core';
import { Icon, Input, Modal, ModalProps } from '../index';
import styles from './index.module.less';

// type BaseCellRangeModalProps = {
//     placeholderProps?: string;
//     valueProps?: string;
// };
type CellModalState = {
    modalData: ModalProps[];
    placeholderState: placeholder;
    value: string;
};

type placeholder = {
    name?: string;
    label?: string;
};

export class CellRangeModal extends Component<BaseCellRangeModalProps, CellModalState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    private _localeObserver1: Nullable<Observer<Worksheet>>;

    ref = createRef();
    // refProp = createRef();

    state = {
        modalData: [
            {
                name: 'dataValidation.selectCellRange2',
                show: false,
                group: [
                    {
                        name: 'button.confirm',
                        type: 'primary',
                        onClick: () => this.handleOk(),
                    },
                    {
                        name: 'button.cancel',
                    },
                ],
            },
        ],
        placeholderState: {
            name: 'dataValidation.selectCellRange2',
        },
        value: '',
    };

    showModal = (name: string, isShow: boolean) => {
        let { modalData } = this.state;
        const index = modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            modalData[index].show = isShow;
        }
        this.setValue({ modalData });
    };

    /**
     * modify input value when success
     */
    handleOk = () => {
        const value = this.ref.current.getValue();
        this.showModal('dataValidation.selectCellRange2', false);
        this.setValue({ value });
        // this.refProp.current.setValue(value);
    };

    setLocale() {
        const locale = this.context.locale;

        this.setState((prevState) => {
            let { modalData, placeholderState } = prevState;
            modalData.forEach((item) => {
                item.title = locale.get(item.locale);
                if (item.group && item.group.length) {
                    item.group.forEach((ele) => {
                        ele.label = locale.get(ele.locale);
                    });
                }
            });

            placeholderState.label = locale.get(placeholderState.name);

            return {
                modalData,
                placeholderState,
            };
        });
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    componentWillReceiveProps(nextProps: BaseCellRangeModalProps) {
        this.setValue({ value: nextProps.valueProps });
    }

    componentDidMount() {
        this.setValue({ value: this.props.valueProps });
        // init Locale message
        this.setLocale();

        const cellRangeContext = this._context as SheetContext;
        // when change Locale, update Locale message
        // do not use componentWillUpdate,it will listen all state changes
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });

        this._localeObserver1 = this._context
            .getObserverManager()
            .getObserver<Worksheet>('onAfterSetSelectionObservable', 'worksheet')
            ?.add((text) => {
                console.dir(text);
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
        // this._context.onAfterChangeUILocaleObservable.remove(this._localeObserver);
    }

    // change cell range
    changeRange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.setValue({ value: target.value });
    };

    // 点击的时候设置selection
    showRange = () => {
        this.showModal('dataValidation.selectCellRange2', true);
        this._context.getWorkBook().getActiveSheet()?.getSelection().setSelection({ selection: this.state.value });
    };

    render(props: BaseCellRangeModalProps, state: CellModalState) {
        const { modalData, placeholderState, value } = state;
        const { placeholderProps } = props;
        return (
            <div className={styles.cellRangeModal}>
                <Input placeholder={placeholderProps} value={value} onChange={(e: Event) => this.changeRange(e)}></Input>
                <span className={styles.cellModalIcon} onClick={this.showRange}>
                    <Icon.Sheet.TableIcon />
                </span>
                {modalData.map((item) => {
                    if (!item.show) return;
                    return (
                        <Modal title={item.title} visible={item.show} group={item.group} onCancel={item.onCancel}>
                            <Input readonly={true} placeholder={placeholderState.label} value={value} ref={this.ref}></Input>
                        </Modal>
                    );
                })}
            </div>
        );
    }
}

export class UniverCellRangeModal implements CellRangeModalComponent {
    render(): JSXComponent<BaseCellRangeModalProps> {
        return CellRangeModal;
    }
}
