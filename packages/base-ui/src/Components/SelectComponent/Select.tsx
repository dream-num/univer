import { BaseSelectProps, createRef, ISelectButton, JSXComponent, SelectComponent } from '@univerjs/base-ui';
import { PureComponent } from 'preact/compat';
import { Button, ColorPicker, Input, Tooltip, Ul } from '../../index';
import styles from './index.module.less';

type BaseSelectState = {
    label?: string | JSX.Element | null | undefined;
    children: BaseSelectProps[];
    color?: string[][];
    selectColor?: string;
};

/**
 * drop-down list
 * The incoming method only needs logic, no attention list
 */
export class Select extends PureComponent<BaseSelectProps, BaseSelectState> {
    ref = createRef();

    inputRef = createRef();

    colorBtn = createRef();

    constructor(props: BaseSelectProps) {
        super(props);
        this.state = {
            label: '',
            children: [],
            selectColor: '#000',
        };

        // Mount update function, when updating the selection range, the cell formats corresponding to different ranges are different, and the toolbar status and values need to be updated in real time
        const { triggerUpdate } = props;
        triggerUpdate && triggerUpdate(this.update.bind(this));
    }

    // show sub components
    showSelect = (e: MouseEvent) => {
        e.stopImmediatePropagation();
        const current = this.ref.current;
        // if (current) current.showSelect();
        if (current && this.props.selectType === ISelectButton.COLOR) {
            current.showSelect(this.colorBtn.current);
        } else if (current) {
            current.showSelect();
        }

        // Click outside to hide child components
        window.addEventListener('click', this.hide, true);
    };

    hide = (e: any) => {
        if (!this.ref.current) return;
        if (!this.ref.current.ulRef && !this.ref.current.ulRef.current) return;
        if (this.ref.current.ulRef.current.contains(e.target)) return;
        this.hideSelect(e);
    };

    // hide child components
    hideSelect = (e: MouseEvent | KeyboardEvent) => {
        const current = this.ref.current;
        current.hideSelect(e);

        window.removeEventListener('click', this.hide, true);
    };

    changeValue = (value: BaseSelectState) => {
        this.setState((prevState) => ({
            ...value,
        }));
    };

    /**
     * update new label
     * @param label
     */
    update = (value: string | number) => {
        const labelType = typeof this.props.label;

        const children = this.state.children;

        let label;

        children?.forEach((ele: BaseSelectProps, i: number) => {
            if (ele.value === value) {
                ele.selected = true;

                if (this.props.needChange) {
                    this.setState({
                        label: labelType === 'string' ? ele.label : ele.icon,
                    });
                    label = ele.label;
                }
            } else {
                ele.selected = false;
            }
        });

        this.setState({
            children,
        });
        this.props.selectType === ISelectButton.INPUT_NUMBER && this.inputRef.current.setValue(label);
    };

    handleClick = (...args: any[]) => {
        const labelType = typeof this.props.label;

        this.hideSelect(args[0]);

        const { item, index } = args[1];

        const children = this.state.children;
        children?.forEach((ele: BaseSelectProps) => (ele.selected = false));

        children[index].selected = true;

        let label = children[index].label;

        this.setState({
            children,
        });

        // update input box info
        if (this.props.needChange) {
            this.setState({
                label: labelType === 'string' ? label : item.icon,
            });

            if ([ISelectButton.INPUT, ISelectButton.INPUT_NUMBER].includes(this.props.selectType as ISelectButton)) {
                this.inputRef.current.setValue(label);
            }

            const propsChildren = this.props.children as any[];

            // border line get selected color
            if (propsChildren[10] && propsChildren[10].locale === 'borderLine.borderColor') {
                const propsColorItem = propsChildren[10] as any;
                const propsColorChildren = propsColorItem.children!;

                let borderLineSelectedColor = propsColorChildren[0].value;
                let borderLineSelectedSize = propsChildren[11].value;

                this.props.onClick?.call(
                    this,
                    children[index].hasOwnProperty('value') ? children[index].value : children[index].label,
                    borderLineSelectedColor,
                    borderLineSelectedSize
                );
                return;
            }
        }

        // The default value is the value. Some labels have the same value as the value. You can also use the label directly.
        this.props.onClick?.call(this, children[index].hasOwnProperty('value') ? children[index].value : children[index].label);
    };

    /**
     * font color/background color / border / merge buttons click
     */
    handleButtonClick = () => {
        const children = this.state.children;
        const selected = children?.find((ele: BaseSelectProps) => ele.selected === true);

        const propsChildren = this.props.children as any[];

        // toolbar font color / fill color
        if (this.props.selectType === 'color') {
            this.props.onClick?.call(this, this.state.selectColor);
        }
        // border line get selected color, TODO: do not use borderLine.borderColor, use new prop instead
        else if (propsChildren && propsChildren[10] && propsChildren[10].locale === 'borderLine.borderColor') {
            const propsColorItem = propsChildren[10] as any;
            const propsColorChildren = propsColorItem.children!;

            let borderLineSelectedColor = propsColorChildren[0].value;
            let borderLineSelectedSize = propsChildren[11].value;

            selected && this.props.onClick?.call(this, selected.hasOwnProperty('value') ? selected.value : selected.label, borderLineSelectedColor, borderLineSelectedSize);
            return;
        }
        // merge cell button click, must be "merge all"
        else if (propsChildren && propsChildren[0] && propsChildren[0].locale && propsChildren[0].locale.indexOf('merge') > -1) {
            this.props.onClick?.call(this, 'all');
            return;
        }

        selected && this.props.onClick?.call(this, selected.hasOwnProperty('value') ? selected.value : selected.label);
    };

    // Press Enter on input element
    handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.props.selectType === ISelectButton.INPUT_NUMBER && this.inputRef.current.base.blur();
            const label = (e.currentTarget as HTMLInputElement).value;

            this.update(label);

            this.hideSelect(e);

            this.props.onKeyUp?.call(this, label);
        }
    };

    componentWillMount() {
        this.changeValue({
            label: this.props.label,
            children: this.props.children,
        });
    }

    // remove to showSelect
    // componentDidMount() {
    //     window.addEventListener('click', this.hideSelect, true);
    // }

    // componentWillUnmount() {
    //     window.removeEventListener('click', this.hideSelect, true);
    // }
    render(props: BaseSelectProps) {
        const { icon, tooltip, selectType, border, slot, style, onClick } = props;
        let classes = '';
        if (typeof this.state.label !== 'object') {
            classes = 'universheet-toolbar-menu-button-text';
        }
        if (selectType === ISelectButton.INPUT || selectType === ISelectButton.INPUT_NUMBER) {
            return (
                <div className={styles.selectButton}>
                    <div className={styles.selectInput}>
                        <Input
                            type={selectType === ISelectButton.INPUT_NUMBER ? 'number' : 'text'}
                            value={this.state.label as string}
                            onClick={this.showSelect}
                            ref={this.inputRef}
                            bordered={false}
                            onKeyUp={this.handleKeyUp}
                        />
                        <span onClick={this.showSelect}>{icon}</span>
                    </div>
                    {border ? <div className={styles.selectLine}></div> : ''}
                    <Ul children={this.state.children} onClick={this.handleClick} ref={this.ref} style={style}></Ul>
                </div>
            );
        }
        if (selectType === ISelectButton.DOUBLE) {
            return (
                <div className={`${styles.selectButton} ${styles.selectDoubleButton}`}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={tooltip!} placement={'bottom'}>
                            <Button type="text" onClick={this.handleButtonClick}>
                                <div className={styles.selectButtonInner}>
                                    <div className={typeof this.state.label === 'string' ? styles.selectButtonInnerLabelString : styles.selectButtonInnerLabelIcon}>
                                        {this.state.label}
                                    </div>
                                </div>
                            </Button>
                        </Tooltip>
                        <Tooltip title={this.props.tooltipRight!} placement={'bottom'}>
                            <Button type="text" onClick={this.showSelect} className={styles.doubleButtons}>
                                <div className={styles.selectButtonInner}>{icon}</div>
                            </Button>
                        </Tooltip>
                    </div>
                    {border ? <div className={styles.selectLine}></div> : ''}

                    <Ul children={this.state.children} onClick={this.handleClick} ref={this.ref} style={style}></Ul>
                </div>
            );
        }
        if (selectType === ISelectButton.COLOR) {
            return (
                <div className={`${styles.selectButton} ${styles.selectDoubleButton}`} ref={this.colorBtn}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={tooltip!} placement={'bottom'}>
                            <Button type="text" onClick={this.handleButtonClick}>
                                <div className={styles.selectButtonInner}>
                                    <div className={typeof this.state.label === 'string' ? styles.selectButtonInnerLabelString : styles.selectButtonInnerLabelIcon}>
                                        {this.state.label}
                                    </div>
                                    <div className={styles.selectColor} style={{ backgroundColor: this.state.selectColor }}></div>
                                </div>
                            </Button>
                        </Tooltip>
                        <Tooltip title={this.props.tooltipRight!} placement={'bottom'}>
                            <Button type="text" onClick={this.showSelect} className={styles.doubleButtons}>
                                <div className={styles.selectButtonInner}>{icon}</div>
                            </Button>
                        </Tooltip>
                    </div>
                    {border ? <div className={styles.selectLine}></div> : ''}
                    <ColorPicker
                        color={'#000'}
                        onClick={(col: string) => {
                            this.setState(
                                {
                                    selectColor: col,
                                },
                                () => {
                                    onClick && onClick(this.state.selectColor);
                                }
                            );
                        }}
                        slot={slot!}
                        ref={this.ref}
                    />
                </div>
            );
        }
        return (
            <div className={styles.selectButton}>
                <Tooltip title={tooltip!} placement={'bottom'}>
                    <Button type="text" onClick={this.showSelect}>
                        <div className={styles.selectButtonInner}>
                            <div className={typeof this.state.label === 'string' ? styles.selectButtonInnerLabelString : styles.selectButtonInnerLabelIcon}>{this.state.label}</div>
                            {icon}
                        </div>
                    </Button>
                </Tooltip>
                {border ? <div className={styles.selectLine}></div> : ''}
                <Ul children={this.state.children} onClick={this.handleClick} ref={this.ref} style={style}></Ul>
            </div>
        );
    }
}

export class UniverSelect implements SelectComponent {
    render(): JSXComponent<BaseSelectProps> {
        return Select;
    }
}
