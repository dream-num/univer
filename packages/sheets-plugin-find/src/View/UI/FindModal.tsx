import { BaseCheckboxGroupOptions, BaseComponentProps, CheckboxGroup, Component, Icon, Input, Modal, Select } from '@univerjs/base-ui';
import styles from './index.module.less';

// Types for props
export interface IProps extends BaseComponentProps {}

// Types for state
interface IState {
    show: boolean;
    title: string;
    hideAdvanced: boolean;
}

export class FindModal extends Component<IProps, IState> {
    active = 'find';

    private _matchGroup: BaseCheckboxGroupOptions[] = [];

    initialize(props: IProps) {
        this._matchGroup = [
            {
                name: '',
                label: 'find.matchCase',
                value: '1',
            },
            {
                name: '',
                label: 'find.matchAll',
                value: '2',
            },
            {
                name: '',
                label: 'find.matchInFormula',
                value: '3',
            },
        ];

        this.state = {
            show: false,
            title: 'find.find',
            hideAdvanced: true,
        };
    }

    componentDidMount() {
        this.props.getComponent?.(this);
    }

    showFindModal(show: boolean) {
        this.setState({
            show,
        });
    }

    // 国际化checkbox
    getMatchGroup() {
        const arr = JSON.parse(JSON.stringify(this._matchGroup));
        arr.forEach((element: BaseCheckboxGroupOptions) => {
            element.label = this.getLocale(element.label as string);
        });
        return arr;
    }

    handleChange(value) {
        console.dir(value);
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render() {
        const { show, title, hideAdvanced } = this.state;
        // Set Provider for entire Container
        return (
            <Modal className={styles.findModal} isDrag footer={false} title={this.getLocale(title)} visible={show}>
                <div className={styles.findAdvance} style={{ display: hideAdvanced ? 'block' : 'none' }}>
                    <Input></Input>
                    <p>
                        {this.getLocale('find.replace')}/{this.getLocale('find.advanced')}
                        <Icon.Format.NextIcon />
                    </p>
                </div>
                <div className={styles.box}>
                    <span>{this.getLocale('find.find')}</span>
                    <Input></Input>
                </div>
                <div className={styles.box}>
                    <span>{this.getLocale('find.replaceWith')}</span>
                    <Input></Input>
                </div>
                <div className={styles.box}>
                    <span>{this.getLocale('find.replaceWith')}</span>
                    <Select></Select>
                </div>
                <div>
                    <CheckboxGroup options={this.getMatchGroup()} onChange={this.handleChange}></CheckboxGroup>
                </div>
            </Modal>
        );
    }
}
