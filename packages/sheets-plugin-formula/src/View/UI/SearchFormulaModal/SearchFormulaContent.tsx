import { BaseComponentRender, BaseComponentSheet, Component, createRef, debounce, Select } from '@univerjs/base-ui';
import { FunctionList } from '../../../Basic';
import { FunListILabel, ILabel } from '../../../Controller/SearchFormulaModalController';
import styles from './index.module.less';

interface IProps {
    input: ILabel;
    select: ILabel;
    funList: FunListILabel;
}

interface IState {
    functionList: FunctionList[] | undefined;
    type: number;
}

export class SearchFormulaContent extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    functionListRef = createRef();

    initialize() {
        const component = this.getContext().getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        const functionList = this.props.funList.children?.filter((item) => item.t === 0);

        this.state = {
            functionList,
            type: 0,
        };
    }

    changeInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        let { functionList, type } = this.state;
        if (value) {
            functionList = functionList?.filter((item) => {
                if (item.n?.includes(value) || item.d?.includes(value)) {
                    return item;
                }
                return null;
            });
        } else {
            functionList = this.props.funList.children?.filter((item) => item.t === type);
        }

        this.setState({
            functionList,
        });
    }

    selectType(value: string, index: number) {
        const { funList } = this.props;
        const children = funList.children?.filter((item) => item.t === index);
        this.setState(
            {
                functionList: children,
                type: index,
            },
            () => {
                this.highLightLi(0);
            }
        );
    }

    componentDidMount() {
        this.highLightLi(0);
    }

    highLightLi(index: number) {
        const item = this.functionListRef.current.querySelectorAll(`.${styles.functionListsItem}`);
        for (let i = 0; i < item.length; i++) {
            item[i].classList.remove(styles.functionListsItemActive);
        }
        item[index].classList.add(styles.functionListsItemActive);
        item[index].click();
    }

    handleClick(item: FunctionList, index: number) {
        const { funList } = this.props;
        this.highLightLi(index);
        funList.onClick(item);
    }

    render() {
        const Input = this._render.renderFunction('Input');
        const { input, select, funList } = this.props;
        const { functionList } = this.state;
        if (!input) return;

        return (
            <div className={styles.functionModal}>
                <div className={styles.functionSearch}>
                    <div className={styles.functionLabel}>{input.label}</div>
                    <Input placeholder={input.placeholder} onChange={debounce(this.changeInput.bind(this), 50)} />
                </div>
                <div className={styles.functionSelect}>
                    <div className={styles.functionLabel}>{select.label}</div>
                    <div className={styles.functionSelector}>
                        <Select onClick={this.selectType.bind(this)} type={0} children={select.children} hideSelectedIcon={true}></Select>
                    </div>
                </div>
                <div className={styles.functionList} ref={this.functionListRef}>
                    <div className={styles.functionLabel}>{funList.label}</div>
                    <ul className={styles.functionLists}>
                        {functionList?.map((item, index) => (
                            <li className={`${styles.functionListsItem}`} onClick={() => this.handleClick(item, index)}>
                                <div className={styles.functionListsItemName}>{item.n}</div>
                                <div className={styles.functionListsItemDetail}>{item.d}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}
