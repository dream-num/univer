import {
    BaseButtonProps,
    BaseComponentSheet,
    BaseIconProps,
    BaseModalProps,
    BaseRadioGroupProps,
    BaseRadioIProps,
    BaseSelectProps,
    Component,
    FunctionComponent,
} from '@univerjs/base-component';
import { SheetContext } from '@univerjs/core';

import styles from './index.module.less';

type Options = {
    key: string | number;
    value: string | number;
};

type IProps = {
    visible: boolean;
    onOk: () => void;
    onCancel: (e: Event) => void;
    config: { context: SheetContext; locale: any };
};
type IState = {
    active: string | number;
    options: Options[];
    sortRules: Array<{ options: Options[]; order: string | number }>;
};

class SortCustom extends Component<IProps, IState> {
    Modal: FunctionComponent<BaseModalProps>;

    Button: FunctionComponent<BaseButtonProps>;

    CloseIcon: FunctionComponent<BaseIconProps>;

    Select: FunctionComponent<BaseSelectProps>;

    RadioGroup: FunctionComponent<BaseRadioGroupProps>;

    Radio: FunctionComponent<BaseRadioIProps>;

    initialize() {
        // super();
        const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        this.CloseIcon = render.renderFunction('CloseIcon');
        this.Select = render.renderFunction('Select');
        this.Modal = render.renderFunction('Modal');
        this.Button = render.renderFunction('Button');
        this.RadioGroup = render.renderFunction('RadioGroup');
        this.Radio = render.renderFunction('Radio');

        this.state = {
            active: '1',
            options: [{ key: 1, value: '111' }],
            sortRules: [
                { options: [{ key: 1, value: '111' }], order: '1' },
                { options: [{ key: 2, value: '222' }], order: '2' },
            ],
        };
    }

    sortRulesDelete(index: number) {
        let sortRules = this.state.sortRules;
        sortRules.splice(index, 1);
        this.setState({
            sortRules,
        });
    }

    row(item: { options: Options[]; order: string | number }, i: number) {
        const { Select, CloseIcon, RadioGroup, Radio } = this;
        const locale = this.props.config.locale;
        return (
            <div className={styles.sortRadio}>
                <div className={styles.sortSelect}>
                    {i !== 0 && (
                        <span onClick={this.sortRulesDelete.bind(this, i)} className={styles.sortRulesClose}>
                            <CloseIcon />
                        </span>
                    )}
                    <span className={styles.sortSelectLabel}>{i === 0 ? locale.hasTitle : locale.secondaryTitle}</span>
                    <Select children={item.options} />
                </div>
                <RadioGroup
                    vertical={true}
                    onChange={(val: string | number) => {
                        this.setState((prevState) => {
                            let sortRules = prevState.sortRules;
                            sortRules[i].order = val;
                            return {
                                sortRules,
                            };
                        });
                    }}
                    active={item.order}
                >
                    <Radio value="1">{locale.asc}A-Z</Radio>
                    <Radio value="2">{locale.desc}Z-A</Radio>
                </RadioGroup>
            </div>
        );
    }

    addRow() {
        let sortRulesIndex = this.state.sortRules.length;
        this.setState((prevState) => {
            let sortRules = prevState.sortRules;
            let option: { options: Options[]; order: string | number } = {
                options: [
                    {
                        key: sortRulesIndex + 1,
                        value: sortRulesIndex + 1,
                    },
                ],
                order: '1',
            };
            sortRules.push(option);
            return {
                sortRules,
            };
        });
    }

    modeClose(e: Event) {
        this.setState({
            sortRules: [
                { options: [{ key: 1, value: '111' }], order: '1' },
                { options: [{ key: 2, value: '222' }], order: '2' },
            ],
        });
        this.props.onCancel(e);
    }

    render() {
        const locale = this.props.config.locale;
        const { Modal, Button } = this;
        return (
            <Modal title={`${locale.sortRangeTitle}A1${locale.sortRangeTitleTo}B1`} isDrag={true} visible={this.props.visible} onCancel={(e) => this.modeClose.bind(this, e)}>
                <>
                    <div>{locale.hasTitle}</div>
                    {this.state.sortRules.map((item, index) => this.row(item, index))}
                    <div>
                        <Button className={styles.sortAddButton} type="primary" onClick={this.addRow.bind(this)}>
                            {locale.addOthers}
                        </Button>
                    </div>
                </>
            </Modal>
        );
    }
}

export { SortCustom };
