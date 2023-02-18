import { BaseButtonProps, BaseComponentSheet, BaseModalProps, BaseSelectProps, Component, createRef, FunctionComponent } from '@univerjs/base-ui';
import { Nullable, Observer, Workbook } from '@univerjs/core';
import * as func from '../../Basic/Const/FunctionList'; // 全部公式数组
import { IConfig } from '../../Basic/Interfaces/IFormula';
import styles from './index.module.less';

interface IProps {
    visible: boolean;
    onOk: () => void;
    onCancel: (e: Event) => void;
    config: IConfig;
}
interface IState {
    functionList: func.FunctionList[] | null;
    functionType: func.FunctionType;
    activeIndex: number;
    inputIndex: number;
    option: any;
    selectType: string;
    selectFun: func.FunctionList | null;
    formulaMore: any;
    locale: any;
}

class SearchFormulaModal1 extends Component<IProps, IState> {
    Button: FunctionComponent<BaseButtonProps>;

    Modal: FunctionComponent<BaseModalProps>;

    Select: FunctionComponent<BaseSelectProps>;

    inputRef = createRef();

    funRef = createRef();

    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize(props: IProps) {
        // super();
        const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        this.Button = render.renderFunction('Button');
        this.Modal = render.renderFunction('Modal');
        this.Select = render.renderFunction('Select');
        this.state = {
            functionList: null, // 所有公式
            functionType: func.functionType,
            activeIndex: 0, // 已选公式的下标
            inputIndex: 0, // 已选 input 的下标
            option: [], // 公式类型
            selectType: '',
            selectFun: null, // 选中的公式
            formulaMore: {},
            locale: null,
        };
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();
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
        const locale = this._context.getLocale();
        const functionList = locale.get('functionlist') as unknown as func.FunctionList[];
        const functionType = locale.get('functiontype') as any;
        const formulaMore = locale.get('formulaMore');
        let option = [];
        for (const key in functionType) {
            let op = {
                key,
                value: functionType[key],
                label: functionType[key],
            };
            option.push(op);
        }

        this.setState({
            option,
            functionList,
            formulaMore,
            locale,
        });
    }

    /**
     * search function
     */
    onInput() {
        const searchTxt = this.inputRef.current.value.toUpperCase();
        let list = this._context.getLocale().get('functionlist') as unknown as func.FunctionList[];

        // eslint-disable-next-line array-callback-return
        list = list.filter((item: { n: string; a: string }) => {
            if (item.n.includes(searchTxt) || item.a.includes(searchTxt)) {
                return item;
            }
        });
        this.setState({
            functionList: list,
            activeIndex: 0,
        });
    }

    selectType(val: { key: number }) {
        let list = this._context.getLocale().get('functionlist') as unknown as func.FunctionList[];
        // eslint-disable-next-line array-callback-return
        list = list.filter((item: { t: number }) => {
            if (item.t === val.key) {
                return item;
            }
        });
        this.setState({
            functionList: list,
            activeIndex: 0,
        });
    }

    /**
     * select function
     * @param index
     */
    functionClick(index: number) {
        this.setState({
            activeIndex: index,
        });
    }

    /**
     * select function
     * @param index
     */
    setDescriptionDetail(index: number) {
        this.setState({
            inputIndex: index,
        });
    }

    /**
     * 确定
     */
    okClick() {
        if (this.state.selectFun) {
            console.log(111);
        } else {
            this.setState((prevState) => {
                const fun = (prevState.functionList as func.FunctionList[])[prevState.activeIndex];
                return {
                    selectFun: fun,
                    inputIndex: 0,
                };
            });
        }
    }

    /**
     * 取消
     */
    cancelClick(e: Event) {
        if (this.state.selectFun) {
            this.setState({
                selectFun: null,
                inputIndex: 0,
                activeIndex: 0,
            });
        } else {
            this.props.onCancel(e);
            this.setState({
                activeIndex: 0, // 已选公式的下标
                inputIndex: 0, // 已选 input 的下标
                selectFun: null,
            });
        }
    }

    onCancel(evt: Event) {
        this.props.onCancel(evt);
        this.setState({
            activeIndex: 0, // 已选公式的下标
            inputIndex: 0, // 已选 input 的下标
            selectFun: null,
        });
    }

    handleClick(...args: any[]) {
        // console.dir(args);
    }

    render() {
        const { Modal, Select, Button } = this;
        const { functionList, activeIndex, inputIndex, option, selectFun, formulaMore } = this.state;
        let funParams;
        let funName;
        if (selectFun) {
            funName = selectFun.a as string;
            funParams = selectFun.p as func.P[];
        }
        return (
            <Modal ref={this.funRef} isDrag={true} title={this.state.selectFun?.n} visible={this.props.visible} onCancel={this.onCancel.bind(this)}>
                {selectFun ? null : (
                    <div className={styles.functionModal}>
                        <div className={styles.functionSearch}>
                            <div className={styles.functionLabel}>{formulaMore.findFunctionTitle}</div>
                            <div>
                                <input ref={this.inputRef} onInput={this.onInput.bind(this)} type="text" placeholder={formulaMore.tipInputFunctionName} />
                            </div>
                        </div>
                        <div className={styles.functionSelect}>
                            <div className={styles.functionLabel}>{formulaMore.selectCategory}</div>
                            <div className={styles.functionSelector}>
                                {/* <Select options={option} onChange={(val) => this.selectType(val)} placeholder={formulaMore.whole}></Select> */}
                                <Select label={option[0].label} needChange={true} children={option} onClick={this.handleClick.bind(this)}></Select>
                            </div>
                        </div>
                        <div className={styles.functionList}>
                            <div className={styles.functionLabel}>{formulaMore.selectFunctionTitle}</div>
                            <ul className={styles.functionLists}>
                                {(functionList as func.FunctionList[]).map((item, index) => (
                                    <li onClick={this.functionClick.bind(this, index)} className={`${styles.functionListsItem} ${activeIndex === index ? styles.active : ''}`}>
                                        <div className={styles.functionListsItemName}>{item.n}</div>
                                        <div className={styles.functionListsItemDetail}>{item.d}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                {selectFun ? (
                    <div className={styles.functionParamModal}>
                        <div className={styles.functionParamList}>
                            {(funParams as func.P[]).map((item: { name: string }, index: number) => (
                                <div onClick={this.setDescriptionDetail.bind(this, index)}>
                                    <span>{item.name}：</span>
                                    <input type="text" />
                                    <span>={'{}'}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.functionParamDesc}>
                            <div className={styles.functionParamDescDetail}>{funName}</div>
                            <div className={styles.functionParamDescDetails}>
                                <div>{(funParams as func.P[])[inputIndex].name}</div>
                                <div>{(funParams as func.P[])[inputIndex].detail}</div>
                            </div>
                        </div>
                        <div className={styles.functionParamResult}>
                            {formulaMore.calculationResult}={}
                        </div>
                    </div>
                ) : null}
                <div className={styles.functionBtn}>
                    <Button type="primary" onClick={this.okClick.bind(this)}>
                        {this.state.locale.ok}
                    </Button>
                    <Button onClick={this.cancelClick.bind(this)}> {this.state.locale.cancel}</Button>
                </div>
            </Modal>
        );
    }
}

export { SearchFormulaModal };
