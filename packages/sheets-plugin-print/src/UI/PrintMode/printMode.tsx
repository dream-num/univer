import {
    BaseButtonProps,
    BaseCheckboxGroupProps,
    BaseCollapseProps,
    BaseComponentSheet,
    BasePanelProps,
    BaseRadioGroupProps,
    BaseRadioIProps,
    Component,
    FunctionComponent,
} from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { IConfig } from '../../IData';
import styles from './index.module.less';
import { PrintInput } from './printInput';
import { PrintSelect } from './printSelsct';

interface Options {
    key: number;
    value: string;
}
interface IProps {
    visible: boolean;
    onCancel: () => void;
    config: IConfig;
}
interface IState {
    active: string | number;
    options: Options;
    printSheet: any;
    printPaperSize: any;
    printZoom: any;
    printMargin: any;
    printPageOrder: any;
    printHorizontal: any;
    printVertical: any;
    paperSizeCustom: boolean;
    locale: any;
}

class PrintMode extends Component<IProps, IState> {
    // printModeRef = createRef();

    private _localeObserver: Nullable<Observer<Workbook>>;

    Button: FunctionComponent<BaseButtonProps>;

    CheckboxGroup: FunctionComponent<BaseCheckboxGroupProps>;

    Collapse: FunctionComponent<BaseCollapseProps>;

    Panel: FunctionComponent<BasePanelProps>;

    Radio: FunctionComponent<BaseRadioIProps>;

    RadioGroup: FunctionComponent<BaseRadioGroupProps>;

    initialize(props: IProps) {
        const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        this.Button = render.renderFunction('Button');
        this.CheckboxGroup = render.renderFunction('CheckboxGroup');
        this.Collapse = render.renderFunction('Collapse');
        this.Panel = render.renderFunction('Panel');
        this.Radio = render.renderFunction('Radio');
        this.RadioGroup = render.renderFunction('RadioGroup');

        this.state = {
            active: '1',
            options: { key: 1, value: '111' },
            paperSizeCustom: false,
            printSheet: [
                {
                    name: 'print.menuItemPrint',
                    label: '???????????????',
                },
            ],
            printPaperSize: [
                {
                    name: 'print.menuItemPrint',
                    label: '?????????21.6??????x27.9?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '?????????27.9??????x43.2?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '??????????????????21.6??????x35.6?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '?????????14.0??????x21.6?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '??????????????????18.4??????x26.7?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '????????????18.4??????x26.7?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: 'A3???29.7??????x42.0?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: 'A4???21.0??????x29.7?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: 'A5???14.8??????x21.0?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: 'B4???25.0??????x35.3?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: 'B5???17.6??????x25.0?????????',
                },
                {
                    name: 'print.custom',
                    label: '?????????',
                },
            ],
            printZoom: [
                {
                    name: 'print.menuItemPrint',
                    label: '?????????100%???',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '????????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '????????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '??????????????????',
                },
            ],
            printMargin: [
                {
                    name: 'print.menuItemPrint',
                    label: '??????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '???',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '???',
                },
            ],
            printPageOrder: [
                {
                    name: 'print.menuItemPrint',
                    label: '?????????????????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '?????????????????????',
                },
            ],
            printHorizontal: [
                {
                    name: 'print.menuItemPrint',
                    label: '????????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '?????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '?????????',
                },
            ],
            printVertical: [
                {
                    name: 'print.menuItemPrint',
                    label: '????????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '????????????',
                },
                {
                    name: 'print.menuItemPrint',
                    label: '????????????',
                },
            ],
            locale: null,
        };
    }

    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setLocale() {
        const locale = this._context.getLocale().get('print');
        this.setState({ locale });
    }

    onChange(val: string | number) {
        this.setState({
            active: val,
        });
    }

    onReturn() {
        this.props.onCancel();
    }

    render() {
        const { Button, CheckboxGroup, Collapse, Panel, Radio, RadioGroup } = this;
        const { locale } = this.state.locale;
        return (
            <>
                {this.props.visible ? (
                    <div className={styles.printMode}>
                        <div className={styles.printHeader}>
                            <div className={styles.printHeaderTitle}>{locale.printSettings}</div>
                            <div className={styles.printHeaderBtn}>
                                <Button className={styles.printReturn} onClick={this.onReturn.bind(this)}>
                                    {locale.cancel}
                                </Button>
                                <Button type="primary">{locale.next}</Button>
                            </div>
                        </div>
                        <div className={styles.printContainer}>
                            <div className={styles.printLeft}>{locale.preview}</div>
                            <div className={styles.printSide}>
                                <PrintSelect config={this.props.config} title={locale.print} onChange={(value) => {}} children={this.state.printSheet} />
                                <PrintSelect
                                    config={this.props.config}
                                    title={locale.paperSize}
                                    onChange={(value) => {
                                        console.log(value);
                                        switch (value.name) {
                                            case 'print.custom':
                                                this.setState({
                                                    paperSizeCustom: true,
                                                });
                                                break;

                                            default:
                                                this.setState({
                                                    paperSizeCustom: false,
                                                });
                                                break;
                                        }
                                    }}
                                    children={this.state.printPaperSize}
                                />
                                {this.state.paperSizeCustom ? (
                                    <div className={styles.printInputGroup}>
                                        <PrintInput
                                            title={locale.width}
                                            onInput={(value) => {
                                                console.log(value);
                                            }}
                                        ></PrintInput>
                                        <PrintInput
                                            title={locale.height}
                                            onInput={(value) => {
                                                console.log(value);
                                            }}
                                        ></PrintInput>
                                    </div>
                                ) : null}
                                <div className={styles.printRadio}>
                                    <div className={styles.printSelectTitle}>{locale.pageOrientation}</div>
                                    <RadioGroup className={styles.printRadioGroup} onChange={this.onChange.bind(this)} active={this.state.active}>
                                        <Radio value="1">11111</Radio>
                                        <Radio value="2">22222</Radio>
                                    </RadioGroup>
                                </div>
                                <PrintSelect config={this.props.config} title={locale.zoom} onChange={() => {}} children={this.state.printZoom} />
                                <PrintSelect config={this.props.config} title={locale.margin} onChange={() => {}} children={this.state.printMargin} />
                                <Collapse>
                                    <Panel header={locale.formatOptions}>
                                        <>
                                            <CheckboxGroup
                                                options={[
                                                    {
                                                        name: '',
                                                        label: '???????????????',
                                                        value: '1',
                                                    },
                                                    {
                                                        name: '',
                                                        label: '????????????',
                                                        value: '2',
                                                    },
                                                ]}
                                                onChange={(value) => {}}
                                            ></CheckboxGroup>
                                            <PrintSelect config={this.props.config} title={locale.pageOrder} onChange={() => {}} children={this.state.printPageOrder} />
                                            <div className={styles.printSideTitle}>{locale.alignment}</div>
                                            <div style={{ width: '50%' }}>
                                                <PrintSelect config={this.props.config} title={locale.level} onChange={() => {}} children={this.state.printHorizontal} />
                                                <PrintSelect config={this.props.config} title={locale.vertical} onChange={() => {}} children={this.state.printVertical} />
                                            </div>
                                        </>
                                    </Panel>
                                    <Panel header={locale.headerAndFooter}>
                                        <>
                                            <CheckboxGroup
                                                options={[
                                                    {
                                                        name: '',
                                                        label: '??????',
                                                        value: '1',
                                                    },
                                                    {
                                                        name: '',
                                                        label: '???????????????',
                                                        value: '2',
                                                    },
                                                    {
                                                        name: '',
                                                        label: '???????????????',
                                                        value: '3',
                                                    },
                                                    {
                                                        name: '',
                                                        label: '????????????',
                                                        value: '4',
                                                    },
                                                    {
                                                        name: '',
                                                        label: '????????????',
                                                        value: '5',
                                                    },
                                                ]}
                                                onChange={(value) => {}}
                                            ></CheckboxGroup>
                                            <div className={styles.printSideTitle}>{locale.headers}</div>
                                            <div className={styles.printSideTitle}>??????????????????&gt;???????????????????????????????????????????????????/???</div>
                                            <CheckboxGroup
                                                options={[
                                                    {
                                                        name: '',
                                                        label: '???????????????',
                                                        value: '1',
                                                        disabled: true,
                                                    },
                                                    {
                                                        name: '',
                                                        label: '???????????????',
                                                        value: '2',
                                                        disabled: true,
                                                    },
                                                ]}
                                                onChange={(value) => {}}
                                            ></CheckboxGroup>
                                        </>
                                    </Panel>
                                </Collapse>
                            </div>
                        </div>
                    </div>
                ) : null}
            </>
        );
    }
}

export { PrintMode };
