import { ComponentChildren, createRef, RefObject } from 'preact';
import { PureComponent } from 'preact/compat';
import { AppContext, ICustomComponent } from '../../Common';
import { BaseMenuItem } from '../../Interfaces';
import { Dropdown } from '../Dropdown';
import { Input } from '../Input';
import { BaseItemProps, Item } from '../Item/Item';
import { CustomLabel, NeoCustomLabel } from '../CustomLabel';
import styles from './index.module.less';
import { Icon, IDisplayMenuItem, IMenuItem, IMenuService } from '../..'; // FIXME: strange import

// TODO: these type definitions should be moved out of components to menu service

export enum SelectTypes {
    SINGLE,
    /** dropdown with input */
    INPUT,
    COLOR,
    DOUBLE,
    FIX,
    DOUBLEFIX,

    /** This should be the only type. The enum would be removed after we finish refactor. */
    NEO,
}

export enum DisplayTypes {
    LABEL,

    /** @deprecated */
    SUFFIX,

    ICON,

    /** Label as color display. */
    COLOR,

    INPUT,

    FONT,
}

export interface BaseSelectChildrenProps extends BaseItemProps {
    onPressEnter?: (...arg: any) => void;
    children?: BaseSelectChildrenProps[];
    unSelectable?: boolean; //选中后不生效事件
    label?: ICustomComponent | ComponentChildren | string;
    suffix?: ICustomComponent | ComponentChildren | string;
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
    suffix?: any;
    tooltip?: string;
    value?: string | number;
    icon?: string;
    id?: string;
    title?: string;
}

interface IState {
    menu: BaseMenuItem[];
    color: string; // TODO@wzhudev: this state is strange
    content: ComponentChildren;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export class Select extends PureComponent<BaseSelectProps, IState> {
    static override contextType = AppContext;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ColorRef: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (...arg: any) => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPressEnter: (...arg: any[]) => void;

    constructor(props: BaseSelectProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        const { children = [], hideSelectedIcon } = this.props;
        const list = this.resetMenu(children, hideSelectedIcon);

        this.state = {
            menu: list,
            color: this.props.defaultColor ?? '#000',
            content: '',
            value: '',
            menuItems: [],
        };
    }

    getType(type: SelectTypes) {
        switch (type) {
            case SelectTypes.SINGLE:
                return this.getSingle();
            case SelectTypes.INPUT:
                return this.getInput();
            case SelectTypes.DOUBLE:
                return this.getDouble();
            case SelectTypes.FIX:
                return this.getFix();
            case SelectTypes.DOUBLEFIX:
                return this.getDoubleFix();
            case SelectTypes.NEO:
                return this.renderNeo();
        }
    }

    // eslint-disable-next-line max-lines-per-function
    initData() {
        const { type, display, children = [], label } = this.props;

        // TODO@wzhudev: the way of binding onClick is ridiculous. Fix it.

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
                    const index = children.findIndex((item) => label === item.label);
                    const list = this.handleSelected(index < 0 ? null : index);
                    this.setState({
                        content: label,
                        menu: list,
                    });
                } else {
                    let index = children.findIndex((item) => item.selected);
                    if (index < 0) index = 0;
                    const list = this.handleSelected(index);
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

    updateData() {
        if (this.props.type === SelectTypes.INPUT) {
            this.setState({ content: this.props.label });
        }
    }

    override componentDidMount() {
        this.initData();
        this.getSubMenus();
    }

    override componentWillReceiveProps(nextProps: BaseSelectProps) {
        this.updateData();

        if (this.props.id !== nextProps.id && nextProps.id) {
            this.getSubMenus();
        }
    }

    resetMenu(children: BaseSelectChildrenProps[], hideSelectedIcon?: boolean) {
        const list: BaseMenuItem[] = [];
        // TODO@wzhudev: ID prop is not handled
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
                    <div>
                        <CustomLabel label={content} />
                    </div>
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
                    <Input
                        onPressEnter={(e) => this.handlePressEnter(e, ref)}
                        onBlur={this.onPressEnter}
                        type="number"
                        value={`${this.props.label as number}` ?? (content as string)}
                    />
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
                    <div className={styles.selectLabel}>
                        <CustomLabel label={content} />
                    </div>
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
                    <div className={styles.selectLabel}>
                        <CustomLabel label={label} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    getDoubleFix = () => {
        const { label, className = '', tooltip, onClick, display, value, icon } = this.props;
        const { menu } = this.state;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown tooltip={tooltip} onClick={onClick} menu={{ menu, onClick: this.onClick }} icon={<Icon.NextIcon />}>
                    <div className={styles.selectLabel}>
                        <CustomLabel display={display} label={label} value={`${value}`} icon={icon} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    renderNeo = () => {
        const { tooltip, onClick, display, value, icon, title, id } = this.props;
        const { menuItems } = this.state;

        const onClickInner = (...args: unknown[]) => {
            onClick?.(args[1] as number | string);
        };

        return (
            <div className={`${styles.selectDouble}`}>
                {/* TODO@wzhudev: we should compose options and builtin component here. They may have different onClick callback. */}
                {/* TODO@wzhudev: should pass in a value to set the menu's selected status. */}
                <Dropdown tooltip={tooltip} onClick={onClick} menu={{ parentId: id, onClick: onClickInner, menuItems }} icon={<Icon.NextIcon />}>
                    {/* TODO@wzhudev: change menu props of Dropdown. Dropdown shouldn't know how to create a menu. */}
                    <div className={styles.selectLabel}>
                        <NeoCustomLabel icon={icon} display={display} title={title!} value={value} onChange={(v) => onClick?.(v)} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    render() {
        const { type = 0 } = this.props;

        return <div className={styles.selectComponent}>{this.getType(type)}</div>;
    }

    private getSubMenus() {
        const { id } = this.props;
        if (id) {
            const menuService: IMenuService = this.context.injector.get(IMenuService);
            this.setState({
                menuItems: menuService.getSubMenuItems(id),
            });
        }
    }
}
