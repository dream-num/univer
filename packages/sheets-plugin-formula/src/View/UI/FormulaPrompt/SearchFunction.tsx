import { BaseComponentProps, CustomLabel } from '@univerjs/base-ui';
import { Component, createRef } from 'preact';
import { IKeyValue } from '@univerjs/core';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {}

interface IState {
    lang: string;
    locale: [];
    formulaValue: string;
    formula: IKeyValue[];
    functionList: any;
    selectIndex: number;
    searchActive: boolean;
    position: {
        left: number;
        top: number;
    };
}

export class SearchFunction extends Component<IProps, IState> {
    contentRef = createRef<HTMLUListElement>();

    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            lang: '',
            locale: [],
            formulaValue: '',
            functionList: [],
            selectIndex: 0,
            formula: [],
            searchActive: false,
            position: {
                left: 0,
                top: 0,
            },
        };
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    override componentWillUpdate(nextProps: any) {}

    onKeyDown(event: Event) {}

    getContentRef() {
        return this.contentRef;
    }

    /**
     *
     * @param searchActive
     * @param formula
     * @param selectIndex
     */
    updateState(searchActive: boolean, formula: IKeyValue[] = [], selectIndex: number = 0, position = { left: 0, top: 0 }, cb?: () => void) {
        this.setState({ searchActive, formula, selectIndex, position }, cb);
    }

    getState() {
        return this.state;
    }

    render() {
        const { selectIndex, formula, searchActive, position } = this.state;
        return (
            <ul
                className={styles.searchFunction}
                onKeyDown={this.onKeyDown.bind(this)}
                style={{ display: searchActive ? 'block' : 'none', position: 'absolute', left: `${position.left}px`, top: `${position.top}px` }}
                ref={this.contentRef}
            >
                {formula.map((item: any, i: number) => (
                    <li key={i} className={selectIndex === i ? styles.searchFunctionActive : ''}>
                        <div className={styles.formulaName}>{item.n}</div>
                        <div className={styles.formulaDetail}>
                            <CustomLabel label={item.d} />
                        </div>
                    </li>
                ))}
            </ul>
        );
    }
}
