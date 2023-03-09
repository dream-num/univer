import { BaseCheckboxGroupOptions, BaseComponentProps, Button, CellRange, CheckboxGroup, Component, createRef, Icon, Input, Modal, Select } from '@univerjs/base-ui';
import { BaseItemProps } from '@univerjs/base-ui/src/Components/Item/Item';
import styles from './index.module.less';

type searchResult = {
    count: number;
    current: number;
};

// Types for props
export interface IProps extends BaseComponentProps {
    findNext: (value: string) => searchResult;
}

// Types for state
interface IState {
    show: boolean;
    hideAdvanced: boolean;
    showRange: boolean;
    current: number;
    count: number;
}

export enum SelectSearch {
    CurrentSheet,
    AllSheets,
    Range,
}

export class FindModal extends Component<IProps, IState> {
    private _searchRef = createRef();

    private _matchGroup: BaseCheckboxGroupOptions[] = [];

    private _select: BaseItemProps[] = [];

    constructor() {
        super();
        this.state = {
            show: false,
            hideAdvanced: true,
            showRange: false,
            current: 0,
            count: 0,
        };

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

        this._select = [
            {
                label: 'find.searchTargetSheet',
                value: SelectSearch.CurrentSheet,
            },
            {
                label: 'find.searchAll',
                value: SelectSearch.AllSheets,
            },
            {
                label: 'find.specific',
                value: SelectSearch.Range,
            },
        ];
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

    // 国际化Select
    getSelect() {
        const arr = JSON.parse(JSON.stringify(this._select));
        arr.forEach((element: BaseCheckboxGroupOptions) => {
            element.label = this.getLocale(element.label as string);
        });
        return arr;
    }

    handleChange(value) {
        console.dir(value);
    }

    handleHideAdvanced(hide: boolean) {
        this.setState({
            hideAdvanced: hide,
        });
    }

    selectSearch(value: number) {
        if (value === SelectSearch.Range) {
            this.setState({
                showRange: true,
            });
            return;
        }
        this.setState({
            showRange: false,
        });
    }

    search() {
        const value = this._searchRef.current.getValue();
        if (!value) return;
        const { count, current } = this.props.findNext(value);
        this.setState({
            count,
            current,
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render() {
        const { show, hideAdvanced, showRange, current, count } = this.state;
        // Set Provider for entire Container
        return (
            <Modal
                onCancel={() => this.handleHideAdvanced(true)}
                className={styles.findModal}
                isDrag
                footer={false}
                mask={false}
                title={this.getLocale(hideAdvanced ? 'find.find' : 'find.findLabel')}
                visible={show}
            >
                <div className={styles.box}>
                    {hideAdvanced ? null : <span>{this.getLocale('find.find')}</span>}
                    <Input ref={this._searchRef}></Input>
                    {count ? (
                        <div className={styles.count}>
                            <span>
                                <Icon.Format.NextIcon rotate={90}></Icon.Format.NextIcon>
                            </span>
                            {current}/{count}
                            <span>
                                <Icon.Format.NextIcon rotate={-90}></Icon.Format.NextIcon>
                            </span>
                        </div>
                    ) : null}
                </div>
                {hideAdvanced ? (
                    <p style={{ display: hideAdvanced ? 'block' : 'none' }} onClick={() => this.handleHideAdvanced(false)}>
                        {this.getLocale('find.replace')}/{this.getLocale('find.advanced')}
                        <Icon.Format.NextIcon />
                    </p>
                ) : (
                    <>
                        <div className={styles.box}>
                            <span>{this.getLocale('find.replaceWith')}</span>
                            <Input></Input>
                        </div>
                        <div className={styles.box}>
                            <span>{this.getLocale('find.search')}</span>
                            <Select onClick={this.selectSearch.bind(this)} type={0} children={this.getSelect()}></Select>
                            {showRange ? <CellRange /> : null}
                        </div>
                        <div className={styles.box}>
                            <span></span>
                            <CheckboxGroup options={this.getMatchGroup()} onChange={this.handleChange}></CheckboxGroup>
                        </div>
                        <div className={styles.buttonGroup}>
                            <Button type="primary">{this.getLocale('button.cancel')}</Button>
                            <Button>{this.getLocale('find.allReplaceBtn')}</Button>
                            <Button>{this.getLocale('find.replace')}</Button>
                            <Button onClick={this.search.bind(this)}>{this.getLocale('find.find')}</Button>
                        </div>
                    </>
                )}
            </Modal>
        );
    }
}
