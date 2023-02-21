import { Icon } from '..';
import { ComponentChildren, Component, createRef, RefObject } from '../../Framework';
import { BaseMenuItem } from '../../Interfaces';
import { Dropdown } from '../Dropdown';
import { Input } from '../Input';
import { BaseItemProps, Item } from '../Item/Item';
import styles from './index.module.less';

export enum SelectTypes {
    SINGLE, // 普通下拉
    INPUT,
    COLOR,
    DOUBLE,
    FIX,
    DOUBLEFIX,
}

enum DisplayTypes {
    LABEL,
    SUFFIX,
}

interface CustomComponent {
    name: string;
    props?: Record<string, any>;
}

export interface BaseSelectChildrenProps extends BaseItemProps {
    onPressEnter?: (...arg: any) => void;
    children?: BaseSelectChildrenProps[];
    unSelectable?: boolean; //选中后不生效事件
    customLabel?: CustomComponent;
    customSuffix?: CustomComponent;
    name?: string;
}

export interface BaseSelectProps {
    type?: SelectTypes;
    children?: BaseSelectChildrenProps[];
    display?: DisplayTypes;
    label?: ComponentChildren;
    onClick?: (...arg: any) => void; //下拉Ul点击事件
    onPressEnter?: (...arg: any) => void;
    onMainClick?: () => void; // 非功能按钮事件
    defaultColor?: string;
    hideSelectedIcon?: boolean;
    className?: string;
    name?: string;
    customLabel?: CustomComponent;
    customSuffix?: CustomComponent;
    tooltip?: string;
}

interface IState {
    menu: BaseMenuItem[];
    color: string;
    content: ComponentChildren;
    value: any;
}

export class Select extends Component<BaseSelectProps, IState> {
    ColorRef: any;

    onClick: (...arg: any) => void;

    onPressEnter: (...arg: any[]) => void;

    initialize() {
        const { children = [], hideSelectedIcon } = this.props;
        const list = this.resetMenu(children, hideSelectedIcon);

        this.state = {
            menu: list,
            color: this.props.defaultColor ?? '#000',
            content: '',
            value: '',
        };
    }

    getType(type: SelectTypes) {
        switch (type) {
            case 0:
                return this.getSingle();
            case 1:
                return this.getInput();
            case 3:
                return this.getDouble();
            case 4:
                return this.getFix();
            case 5:
                return this.getDoubleFix();
        }
    }

    initData() {
        const { type, display, children = [], label } = this.props;

        // 显示值可变
        if (type === 0 || type === 3) {
            if (!children.length) return;
            let index = children.findIndex((item) => item.selected);
            if (index < 0) index = 0;
            const list = this.handleSelected(index);
            const item = children[index];

            if (display === DisplayTypes.SUFFIX) {
                this.setState({
                    content: item.suffix,
                    menu: list,
                });
            } else {
                this.setState({
                    content: item.label,
                    menu: list,
                });
            }

            this.onClick = (...arg) => {
                const item = children[arg[2]];

                this.props.onClick?.(arg[1], arg[2], arg[3]);

                if (item.unSelectable) {
                    return;
                }

                const list = this.handleSelected(arg[2]);

                if (display === DisplayTypes.SUFFIX) {
                    this.setState({
                        content: children[arg[2]].suffix,
                        menu: list,
                    });
                } else {
                    this.setState({
                        content: children[arg[2]].label,
                        menu: list,
                    });
                }
            };
        } else if (type === 1) {
            // 输入框
            if (!children.length) return;
            // 匹配label和选项label确定选中项
            const getLabel = (label: ComponentChildren) => {
                if (label !== null) {
                    if (label === '') return;
                    let index = children.findIndex((item) => label === item.label);
                    let list = this.handleSelected(index < 0 ? null : index);
                    this.setState({
                        content: label,
                        menu: list,
                    });
                } else {
                    let index = children.findIndex((item) => item.selected);
                    if (index < 0) index = 0;
                    let list = this.handleSelected(index);
                    const item = children[index];

                    this.setState({
                        content: item.label,
                        menu: list,
                    });
                }
            };

            getLabel(label);

            this.onClick = (...arg) => {
                this.props.onClick?.(arg[1], arg[2], arg[3]);

                const list = this.handleSelected(arg[2]);
                this.setState({
                    content: children[arg[2]].label,
                    menu: list,
                });
            };

            this.onPressEnter = (e: KeyboardEvent) => {
                const value = (e.currentTarget as HTMLInputElement).value;
                this.props.onPressEnter?.(value);
                getLabel(value);
            };
        } else if (type === 2) {
            // 颜色选择器
            const list = this.handleSelected(null);
            this.setState({
                menu: list,
            });

            this.onClick = () => {
                const { color } = this.state;
                this.props.onClick?.(color);
            };
        } else if (type === 4 || type === 5) {
            //固定显示值
            if (!children.length) return;
            let index = children.findIndex((item) => item.selected);
            if (index < 0) index = 0;
            const item = children[index];
            const list = this.handleSelected(index);
            this.setState({
                menu: list,
                value: item.value,
            });

            this.onClick = (...arg) => {
                if (arg.length) {
                    this.props.onClick?.(arg[1], arg[2], arg[3]);
                    const list = this.handleSelected(arg[2]);
                    this.setState({
                        menu: list,
                        value: children[arg[2]].value,
                    });
                } else {
                    this.props.onClick?.(this.state.value);
                }
            };
        }
    }

    componentDidMount() {
        this.initData();
    }

    componentWillReceiveProps(nextProps: BaseSelectProps) {
        this.props = Object.assign(this.props, nextProps);
        this.initData();
    }

    resetMenu(children: BaseSelectChildrenProps[], hideSelectedIcon?: boolean) {
        const list: BaseMenuItem[] = [];
        for (let i = 0; i < children.length; i++) {
            let selected = false;
            if (!hideSelectedIcon) {
                selected = children[i].selected ?? false;
            }
            list[i] = { label: '' };
            list[i].label = <Item disabled={children[i].disabled} border={children[i].border} selected={selected} label={children[i].label} suffix={children[i].suffix}></Item>;
            list[i].disabled = children[i].disabled;
            list[i].style = children[i].style;
            list[i].value = children[i].value;
            list[i].className = children[i].className;
            list[i].onClick = children[i].onClick;
            list[i].border = children[i].border;

            if (children[i].children) {
                list[i].children = this.resetMenu(children[i].children!);
            }
        }

        return list;
    }

    // 处理选中
    handleSelected = (index: number | null): BaseMenuItem[] | undefined => {
        const { children = [], hideSelectedIcon } = this.props;
        if (children.length) {
            children.forEach((item) => {
                item.selected = false;
            });
            if (index !== null) {
                children[index].selected = true;
            }
        }

        const list = this.resetMenu(children, hideSelectedIcon);
        return list;
    };

    // 普通下拉
    getSingle = () => {
        const { content, menu } = this.state;
        const { className = '', tooltip, onMainClick } = this.props;

        return (
            <div className={`${styles.selectSingle} ${className}`}>
                <Dropdown onMainClick={onMainClick} tooltip={tooltip} menu={{ menu, onClick: this.onClick }} showArrow>
                    <div>{content}</div>
                </Dropdown>
            </div>
        );
    };

    handlePressEnter = (e: KeyboardEvent, ref: RefObject<Dropdown>) => {
        this.onPressEnter(e);
        ref.current?.hideMenu();
    };

    //Input下拉
    getInput = () => {
        const { content, menu } = this.state;
        const { className = '', tooltip, onMainClick } = this.props;
        const ref = createRef<Dropdown>();

        return (
            <div className={`${styles.selectInput} ${className}`}>
                <Dropdown onMainClick={onMainClick} ref={ref} tooltip={tooltip} menu={{ menu, onClick: this.onClick }} showArrow>
                    <Input onPressEnter={(e) => this.handlePressEnter(e, ref)} onBlur={this.onPressEnter} type="number" value={content as string} />
                </Dropdown>
            </div>
        );
    };

    getDouble = () => {
        const { content, menu } = this.state;
        const { className = '', tooltip, onClick } = this.props;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown onClick={onClick} tooltip={tooltip} menu={{ menu, onClick: this.onClick }} icon={<Icon.NextIcon />}>
                    <div className={styles.selectLabel}>{content}</div>
                </Dropdown>
            </div>
        );
    };

    getFix = () => {
        const { label, className = '', tooltip } = this.props;
        const { menu } = this.state;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown tooltip={tooltip} menu={{ menu, onClick: this.onClick }} showArrow>
                    <div className={styles.selectLabel}>{label}</div>
                </Dropdown>
            </div>
        );
    };

    getDoubleFix = () => {
        const { label, className = '', tooltip, onClick } = this.props;
        const { menu } = this.state;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown tooltip={tooltip} onClick={onClick} menu={{ menu, onClick: this.onClick }} icon={<Icon.NextIcon />}>
                    <div className={styles.selectLabel}>{label}</div>
                </Dropdown>
            </div>
        );
    };

    render() {
        const { type = 0 } = this.props;

        return <div className={styles.selectComponent}>{this.getType(type)}</div>;
    }
}
