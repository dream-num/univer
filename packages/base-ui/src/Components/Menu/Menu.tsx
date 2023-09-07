import { ICommandService, isRealNum } from '@univerjs/core';
import { Component, ComponentChild, createRef } from 'preact';
import { Subscription } from 'rxjs';

import { AppContext } from '../../Common/AppContext';
import { BaseMenuItem, BaseMenuProps, BaseMenuStyle } from '../../Interfaces';
import { ICustomComponentOption, IDisplayMenuItem, IMenuButtonItem, IMenuItem, IMenuSelectorItem, isValueOptions, IValueOption, MenuItemType } from '../../services/menu/menu';
import { IMenuService } from '../../services/menu/menu.service';
import { joinClassNames } from '../../Utils';
import { CustomLabel, NeoCustomLabel } from '../CustomLabel/CustomLabel';
import styles from './index.module.less';

export interface IBaseMenuState {
    show: boolean;
    posStyle: BaseMenuStyle;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export class Menu extends Component<BaseMenuProps, IBaseMenuState> {
    static override contextType = AppContext;

    private _MenuRef = createRef<HTMLUListElement>();

    private _refs: Menu[] = [];

    constructor(props: BaseMenuProps) {
        super(props);
        this.initialize();
    }

    override componentDidMount(): void {
        this.getSubMenus();
    }

    override componentWillReceiveProps(nextProps: Readonly<BaseMenuProps>): void {
        if (this.props.menuId !== nextProps.menuId) {
            this.getSubMenus();
        }
    }

    getMenuRef = () => this._MenuRef;

    handleClick = (e: MouseEvent, item: BaseMenuItem, index: number) => {
        const { deep = 0 } = this.props;

        item.onClick?.call(null, e, item.value, index, deep);
        this.props.onClick?.call(null, e, item.value, index, deep);
        this.showMenu(false);
    };

    showMenu = (show: boolean) => {
        this.setState(
            (prevState) => ({ show }),
            () => {
                this.getStyle();
            }
        );
    };

    mouseEnter = (e: MouseEvent, index: number) => {
        const { menu = [] } = this.props;
        if (menu[index].children) {
            this._refs[index].showMenu(true);
        }
    };

    mouseLeave = (e: MouseEvent, index: number) => {
        const { menu = [] } = this.props;
        if (menu[index].children) {
            this._refs[index].showMenu(false);
        }
    };

    getStyle = () => {
        const current = this._MenuRef.current;
        if (!current) return;
        const style: BaseMenuStyle = {};
        const curPosition = current.getBoundingClientRect();
        let docPosition;
        const { dom, parent } = this.props;
        if (dom) {
            docPosition = dom.getBoundingClientRect();
        } else {
            docPosition = {
                left: 0,
                right: document.documentElement.clientWidth,
                top: 0,
                bottom: document.documentElement.clientHeight,
            };
        }

        // 处理li中包含的ul右边界
        if (parent) {
            current.style.position = 'fixed';
            // 获取固定定位后 父元素正确的位置信息
            const parPosition = current.parentElement?.getBoundingClientRect();
            if (!parPosition) return;
            if (parPosition.right + curPosition.width > docPosition.right) {
                style.left = `${parPosition.left - curPosition.width}px`;
                style.top = `${parPosition.top}px`;
            } else {
                style.left = `${parPosition.right}px`;
                style.top = `${parPosition.top}px`;
            }
            if (curPosition.bottom > docPosition.bottom) {
                style.top = 'auto';
                style.bottom = `5px`;
            }
            this.setState({
                posStyle: style,
            });
        }
    };

    handleItemClick = (item: IMenuButtonItem) => {
        this.showMenu(false);
    };

    // eslint-disable-next-line max-lines-per-function
    render() {
        const { context, props, state } = this;
        const { className = '', style = '', menu, deep = 0, options, display, value } = props;
        const { posStyle, show, menuItems } = state;

        return (
            <ul className={joinClassNames(styles.colsMenu, className)} style={{ ...style, ...posStyle, display: show ? 'block' : 'none' }} ref={this._MenuRef}>
                {/* legacy: render selections */}
                {menu?.map((item: BaseMenuItem, index: number) => {
                    if (item.show === false) return;
                    return (
                        <>
                            <li
                                className={joinClassNames(styles.colsMenuitem, item.className ?? '', item.disabled ? styles.colsMenuitemDisabled : '')}
                                style={item.style ?? ''}
                                onClick={(e) => this.handleClick(e, item, index)}
                                onMouseEnter={(e) => {
                                    this.mouseEnter(e, index);
                                }}
                                onMouseLeave={(e) => {
                                    this.mouseLeave(e, index);
                                }}
                            >
                                <CustomLabel label={item.label} />
                                {/* TODO: if the menu itself contains a submenu. It should be served as an `IMenuItem` not wrapped options. */}
                                {item.children ? (
                                    <Menu
                                        ref={(ele: Menu) => (this._refs[index] = ele)}
                                        menu={item.children}
                                        onClick={item.onClick}
                                        className={item.className}
                                        style={item.style}
                                        parent={this}
                                        deep={deep + 1}
                                    ></Menu>
                                ) : (
                                    <></>
                                )}
                            </li>
                            {item.border ? <div className={styles.colsMenuitemLine}></div> : ''}
                        </>
                    );
                })}
                {options?.map((option: IValueOption | ICustomComponentOption, index: number) => {
                    // render value option
                    const isValueOption = isValueOptions(option);
                    if (isValueOption) {
                        return (
                            <li
                                className={joinClassNames(styles.colsMenuitem, option.disabled ? styles.colsMenuitemDisabled : '')}
                                onClick={() => {
                                    if (option.value) {
                                        this.props.onOptionSelect!(option);
                                    }
                                }}
                            >
                                <NeoCustomLabel
                                    selected={value === option.value}
                                    value={option.value}
                                    display={display}
                                    label={option.label}
                                    title={typeof option.label === 'string' ? option.label : ''}
                                    icon={option.icon}
                                />
                            </li>
                        );
                    }

                    // custom component option
                    const CustomComponent = context.componentManager?.get(option.id);
                    return (
                        <li className={joinClassNames(styles.colsMenuitem, option.disabled ? styles.colsMenuitemDisabled : '')}>
                            <CustomComponent
                                onValueChange={(v: string | number) => {
                                    this.props.onOptionSelect!({ value: v, label: option.id });
                                    this.showMenu(false);
                                }}
                            />
                        </li>
                    );
                })}
                {/* render submenus */}
                {menuItems?.map((item: IDisplayMenuItem<IMenuItem>, index) => (
                    <MenuItem menuItem={item} index={index} onClick={this.handleItemClick.bind(this, item as IMenuButtonItem)} />
                ))}
            </ul>
        );
    }

    protected initialize() {
        this.state = {
            show: false,
            posStyle: {},
            menuItems: [],
        };
    }

    private getSubMenus() {
        const { menuId } = this.props;

        if (menuId) {
            const menuService: IMenuService = this.context.injector.get(IMenuService);
            this.setState({
                menuItems: menuService.getMenuItems(menuId),
            });
        }
    }
}

export interface IMenuItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    index: number;
    onClick: () => void;
}

export interface IMenuItemState {
    disabled: boolean;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
    value: any;
}

// TODO: this component should have something in common with ToolbarItem

export class MenuItem extends Component<IMenuItemProps, IMenuItemState> {
    static override contextType = AppContext;

    private disabledSubscription: Subscription | undefined;

    private valueSubscription: Subscription | undefined;

    private _refs: Menu[] = [];

    constructor() {
        super();

        this.state = {
            disabled: false,
            value: undefined,
            menuItems: [],
        };
    }

    mouseEnter = (e: MouseEvent, index: number) => {
        this._refs[index]?.showMenu(true);
    };

    mouseLeave = (e: MouseEvent, index: number) => {
        this._refs[index]?.showMenu(false);
    };

    override componentDidMount(): void {
        const { menuItem } = this.props;

        this.disabledSubscription = menuItem.disabled$?.subscribe((disabled) => {
            this.setState({ disabled });
        });

        this.valueSubscription = menuItem.value$?.subscribe((value) => {
            this.setState({ value });
        });

        this.getSubMenus();
    }

    override componentWillUnmount(): void {
        this.disabledSubscription?.unsubscribe();
        this.valueSubscription?.unsubscribe();
    }

    override componentWillReceiveProps(nextProps: Readonly<IMenuItemProps>): void {
        if (this.props.menuItem.id !== nextProps.menuItem.id) {
            this.getSubMenus();
        }
    }

    handleClick = (e: MouseEvent, item: IDisplayMenuItem<IMenuItem>, index: number) => {
        const commandService: ICommandService = this.context.injector.get(ICommandService);
        this.props.onClick();

        // TODO: type here is not correct
        const value = this.state.value;
        // !(item.subMenuItems && item.subMenuItems.length > 0) && commandService.executeCommand(item.id, { value });
    };

    /**
     * user input change value from CustomLabel
     * @param e
     */
    onChange = (v: string | number) => {
        const value = isRealNum(v) && typeof v === 'string' ? parseInt(v) : v;

        this.setState({
            value,
        });
    };

    override render(): ComponentChild {
        switch (this.props.menuItem.type) {
            case MenuItemType.SELECTOR:
                return this.renderSelectorType();
            case MenuItemType.SUBITEMS:
                return this.renderSubItemsType();
            default:
                return this.renderButtonType();
        }
    }

    // button type command should directly execute command
    private renderButtonType(): ComponentChild {
        const { menuItem, onClick } = this.props;
        const { disabled, value } = this.state;
        const { injector } = this.context;

        const commandService: ICommandService = injector.get(ICommandService);
        const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
        const { title, display, label } = item;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                disabled={disabled}
                onClick={() => {
                    commandService.executeCommand(item.id, { value: this.state.value });
                    onClick();
                }}
            >
                <NeoCustomLabel
                    display={display}
                    value={value}
                    title={title}
                    label={label}
                    onChange={(v) => {
                        this.onChange(v);
                        // commandService.executeCommand(item.id, { value });
                        // onClick();
                    }}
                ></NeoCustomLabel>
            </li>
        );
    }

    private renderSelectorType(): ComponentChild {
        const { menuItem, index } = this.props;
        const { disabled, menuItems, value } = this.state;
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem<unknown>>;
        const commandService: ICommandService = this.context.injector.get(ICommandService);

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                onMouseEnter={(e) => this.mouseEnter(e, index)}
                onMouseLeave={(e) => this.mouseLeave(e, index)}
                onClick={(e) => this.handleClick(e, item, index)}
            >
                <NeoCustomLabel title={item.title} value={value} onChange={this.onChange} icon={item.icon} display={item.display} label={item.label}></NeoCustomLabel>
                {item.shortcut && ` (${item.shortcut})`}
                {(menuItems.length > 0 || (item as IMenuSelectorItem<unknown>).selections?.length) && (
                    <Menu
                        ref={(ele: Menu) => (this._refs[index] = ele)}
                        onOptionSelect={(v) => commandService.executeCommand(item.id, { value: v.value })}
                        menuId={item.id}
                        options={item.selections}
                        display={item.display}
                        parent={this}
                    ></Menu>
                )}
            </li>
        );
    }

    private renderSubItemsType(): ComponentChild {
        const { menuItem, index } = this.props;
        const { disabled, menuItems } = this.state;
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem<unknown>>;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                onMouseEnter={(e) => this.mouseEnter(e, index)}
                onMouseLeave={(e) => this.mouseLeave(e, index)}
            >
                <NeoCustomLabel title={item.title} value={item.title} icon={item.icon} display={item.display} label={item.label}></NeoCustomLabel>
                {(menuItems.length > 0 || (item as IMenuSelectorItem<unknown>).selections?.length) && (
                    <Menu ref={(ele: Menu) => (this._refs[index] = ele)} menuId={item.id} parent={this} display={item.display}></Menu>
                )}
            </li>
        );
    }

    private getSubMenus() {
        const { menuItem } = this.props;
        const { id } = menuItem;

        if (id) {
            const menuService: IMenuService = this.context.injector.get(IMenuService);
            this.setState({
                menuItems: menuService.getMenuItems(id),
            });
        }
    }
}
