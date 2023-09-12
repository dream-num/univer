import { Component, createRef } from 'react';

import * as Icon from '../Icon';
import styles from './index.module.less';

interface Data {
    label: string;
    checked: boolean;
}
// interface IProps {}
interface IState {
    searchValue: string;
    data: Data[];
    dataClone: Data[];
}

export interface BaseSearchTreeProps {}

class SearchTree extends Component<BaseSearchTreeProps, IState> {
    input = createRef();

    constructor(props: BaseSearchTreeProps) {
        super();
        this.initialize(props);
    }

    initialize(props: BaseSearchTreeProps) {
        this.state = {
            searchValue: '',
            data: [
                { label: '空白', checked: true },
                { label: '空白1', checked: false },
            ],
            dataClone: [],
        };
    }

    setLocale() {
        const locale = this.context.locale;

        const more = locale.get('toolbar.more');
    }

    /**
     * input 事件
     * @param event
     */
    onInput(event: Event) {
        const searchValue = this.input.current.value;
        this.setState({
            searchValue,
        });
        this.search(searchValue);
    }

    /**
     * 搜索
     * @param val
     */
    search(val: string) {
        const data = this.state.data;
        const dataClone = data.filter((item) => item.label.includes(val));
        this.setState({
            dataClone,
        });
    }

    /**
     * 多选框点击
     * @param index
     */
    onClick(index: number) {
        const data = this.state.dataClone;
        data[index].checked = !data[index].checked;
        this.setState({
            dataClone: data,
        });
    }

    /**
     * 全选
     */
    clickAll() {
        const data = this.state.dataClone;
        data.forEach((item) => {
            item.checked = true;
        });
        this.setState({
            dataClone: data,
        });
    }

    /**
     * 清除
     */
    clickClean() {
        const data = this.state.dataClone;
        data.forEach((item) => {
            item.checked = false;
        });
        this.setState({
            dataClone: data,
        });
    }

    /**
     * 反选
     */
    clickInvert() {
        const data = this.state.dataClone;
        data.forEach((item) => {
            item.checked = !item.checked;
        });
        this.setState({
            dataClone: data,
        });
    }

    UNSAFE_componentWillMount() {
        this.setState({ dataClone: this.state.data });
    }

    render() {
        return (
            <div className={styles.searchTreeWarpper}>
                <div>
                    <button onClick={this.clickAll.bind(this)}>全选</button>
                    <button onClick={this.clickClean.bind(this)}>清除</button>
                    <button onClick={this.clickInvert.bind(this)}>反选</button>
                </div>
                <div className={styles.searchTreeInput}>
                    <input ref={this.input} onInput={this.onInput.bind(this)} type="text" placeholder="按照值进行筛选" />
                    <Icon.Sheet.SearchIcon />
                </div>
                <div>
                    {this.state.dataClone.map((item, index: number) => (
                        <div key={index}>
                            <input type="checkbox" checked={item.checked} onClick={this.onClick.bind(this, index)} />
                            {item.label}
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => {
                        console.log(this.state.dataClone);
                    }}
                >
                    点击
                </button>
            </div>
        );
    }
}

export { SearchTree };
