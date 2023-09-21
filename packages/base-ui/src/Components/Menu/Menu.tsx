// TODO: this component should have something in common with ToolbarItem
// export class MenuItem extends Component<IMenuItemProps, IMenuItemState> {
//     static contextType = AppContext;
//     private disabledSubscription: Subscription | undefined;
//     private valueSubscription: Subscription | undefined;
//     private _refs: Menu[] = [];
//     constructor() {
//         super();
//         this.state = {
//             disabled: false,
//             value: undefined,
//             menuItems: [],
//         };
//     }
//     mouseEnter = (e: MouseEvent, index: number) => {
//         this._refs[index]?.showMenu(true);
//     };
//     mouseLeave = (e: MouseEvent, index: number) => {
//         this._refs[index]?.showMenu(false);
//     };
//     override componentDidMount(): void {
//         const { menuItem } = this.props;
//         this.disabledSubscription = menuItem.disabled$?.subscribe((disabled) => {
//             this.setState({ disabled });
//         });
//         this.valueSubscription = menuItem.value$?.subscribe((value) => {
//             this.setState({ value });
//         });
//         this.getSubMenus();
//     }
//     override componentWillUnmount(): void {
//         this.disabledSubscription?.unsubscribe();
//         this.valueSubscription?.unsubscribe();
//     }
//     override UNSAFE_componentWillReceiveProps(nextProps: Readonly<IMenuItemProps>): void {
//         if (this.props.menuItem.id !== nextProps.menuItem.id) {
//             this.getSubMenus();
//         }
//     }
//     handleClick = (e: MouseEvent, item: IDisplayMenuItem<IMenuItem>, index: number) => {
//         const commandService: ICommandService = this.context.injector.get(ICommandService);
//         this.props.onClick();
//         // TODO: type here is not correct
//         const value = this.state.value;
//         // !(item.subMenuItems && item.subMenuItems.length > 0) && commandService.executeCommand(item.id, { value });
//     };
//     /**
//      * user input change value from CustomLabel
//      * @param e
//      */
//     onChange = (v: string | number) => {
//         const value = isRealNum(v) && typeof v === 'string' ? parseInt(v) : v;
//         this.setState({
//             value,
//         });
//     };
//     override render() {
//         switch (this.props.menuItem.type) {
//             case MenuItemType.SELECTOR:
//                 return this.renderSelectorType();
//             case MenuItemType.SUBITEMS:
//                 return this.renderSubItemsType();
//             default:
//                 return this.renderButtonType();
//         }
//     }
//     // button type command should directly execute command
//     private renderButtonType() {
//         const { menuItem, onClick } = this.props;
//         const { disabled, value } = this.state;
//         const { injector } = this.context;
//         const commandService: ICommandService = injector.get(ICommandService);
//         const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
//         const { title, display, label } = item;
//         return (
//             <li
//                 className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
//                 disabled={disabled}
//                 onClick={() => {
//                     commandService.executeCommand(item.id, { value: this.state.value });
//                     onClick();
//                 }}
//             >
//                 <NeoCustomLabel
//                     display={display}
//                     value={value}
//                     title={title}
//                     label={label}
//                     onChange={(v) => {
//                         this.onChange(v);
//                         // commandService.executeCommand(item.id, { value });
//                         // onClick();
//                     }}
//                 ></NeoCustomLabel>
//             </li>
//         );
//     }
//     private renderSelectorType() {
//         const { menuItem, index } = this.props;
//         const { disabled, menuItems, value } = this.state;
//         const item = menuItem as IDisplayMenuItem<IMenuSelectorItem<unknown>>;
//         const commandService: ICommandService = this.context.injector.get(ICommandService);
//         return (
//             <li
//                 className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
//                 onMouseEnter={(e) => this.mouseEnter(e, index)}
//                 onMouseLeave={(e) => this.mouseLeave(e, index)}
//                 onClick={(e) => this.handleClick(e, item, index)}
//             >
//                 <NeoCustomLabel title={item.title} value={value} onChange={this.onChange} icon={item.icon} display={item.display} label={item.label}></NeoCustomLabel>
//                 {item.shortcut && ` (${item.shortcut})`}
//                 {(menuItems.length > 0 || (item as IMenuSelectorItem<unknown>).selections?.length) && (
//                     <Menu
//                         ref={(ele: Menu) => (this._refs[index] = ele)}
//                         onOptionSelect={(v) => commandService.executeCommand(item.id, { value: v.value })}
//                         menuId={item.id}
//                         options={item.selections}
//                         display={item.display}
//                         parent={this}
//                     ></Menu>
//                 )}
//             </li>
//         );
//     }
//     private renderSubItemsType() {
//         const { menuItem, index } = this.props;
//         const { disabled, menuItems } = this.state;
//         const item = menuItem as IDisplayMenuItem<IMenuSelectorItem<unknown>>;
//         return (
//             <li
//                 className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
//                 onMouseEnter={(e) => this.mouseEnter(e, index)}
//                 onMouseLeave={(e) => this.mouseLeave(e, index)}
//                 onClick={(e) => this.handleClick(e, item, index)}
//             >
//                 <NeoCustomLabel title={item.title} value={item.title} icon={item.icon} display={item.display} label={item.label}></NeoCustomLabel>
//                 {(menuItems.length > 0 || (item as IMenuSelectorItem<unknown>).selections?.length) && (
//                     <Menu ref={(ele: Menu) => (this._refs[index] = ele)} menuId={item.id} parent={this} display={item.display}></Menu>
//                 )}
//             </li>
//         );
//     }
//     private getSubMenus() {
//         const { menuItem } = this.props;
//         const { id } = menuItem;
//         if (id) {
//             const menuService: IMenuService = this.context.injector.get(IMenuService);
//             this.setState({
//                 menuItems: menuService.getMenuItems(id),
//             });
//         }
//     }
// }

// export class Menu extends Component<BaseMenuProps, IBaseMenuState> {
//     static override contextType = AppContext;
//     private _MenuRef = createRef<HTMLUListElement>();
//     private _refs: Menu[] = [];
//     constructor(props: BaseMenuProps) {
//         super(props);
//         this.initialize();
//     }
//     override componentDidMount(): void {
//         this.getSubMenus();
//     }
//     override UNSAFE_componentWillReceiveProps(nextProps: Readonly<BaseMenuProps>): void {
//         if (this.props.menuId !== nextProps.menuId) {
//             this.getSubMenus();
//         }
//     }
//     getMenuRef = () => this._MenuRef;
//     handleClick = (e: MouseEvent, item: BaseMenuItem, index: number) => {
//         const { deep = 0 } = this.props;
//         item.onClick?.call(null, e, item.value, index, deep);
//         this.props.onClick?.call(null, e, item.value, index, deep);
//         this.showMenu(false);
//     };
//     showMenu = (show: boolean) => {
//         this.setState(
//             (prevState) => ({ show }),
//             () => {
//                 this.getStyle();
//             }
//         );
//     };
//     mouseEnter = (e: MouseEvent, index: number) => {
//         const { menu = [] } = this.props;
//         if (menu[index].children) {
//             this._refs[index].showMenu(true);
//         }
//     };
//     mouseLeave = (e: MouseEvent, index: number) => {
//         const { menu = [] } = this.props;
//         if (menu[index].children) {
//             this._refs[index].showMenu(false);
//         }
//     };
//     getStyle = () => {
//         const current = this._MenuRef.current;
//         if (!current) return;
//         const style: BaseMenuStyle = {};
//         const curPosition = current.getBoundingClientRect();
//         let docPosition;
//         const { dom, parent } = this.props;
//         if (dom) {
//             docPosition = dom.getBoundingClientRect();
//         } else {
//             docPosition = {
//                 left: 0,
//                 right: document.documentElement.clientWidth,
//                 top: 0,
//                 bottom: document.documentElement.clientHeight,
//             };
//         }
//         // 处理li中包含的ul右边界
//         if (parent) {
//             current.style.position = 'fixed';
//             // 获取固定定位后 父元素正确的位置信息
//             const parPosition = current.parentElement?.getBoundingClientRect();
//             if (!parPosition) return;
//             if (parPosition.right + curPosition.width > docPosition.right) {
//                 style.left = `${parPosition.left - curPosition.width}px`;
//                 style.top = `${parPosition.top}px`;
//             } else {
//                 style.left = `${parPosition.right}px`;
//                 style.top = `${parPosition.top}px`;
//             }
//             if (curPosition.bottom > docPosition.bottom) {
//                 style.top = 'auto';
//                 style.bottom = `5px`;
//             }
//             this.setState({
//                 posStyle: style,
//             });
//         }
//     };
//     handleItemClick = (item: IMenuButtonItem) => {
//         this.showMenu(false);
//     };
//     // eslint-disable-next-line max-lines-per-function
//     override render() {
//         const { context, props, state } = this;
//         const { className = '', style = '', menu, deep = 0, options, display, value } = props;
//         const { posStyle, show, menuItems } = state;
//         return (
//             <ul className={joinClassNames(styles.colsMenu, className)} style={{ ...style, ...posStyle, display: show ? 'block' : 'none' }} ref={this._MenuRef}>
//                 {/* legacy: render selections */}
//                 {menu?.map((item: BaseMenuItem, index: number) => {
//                     if (item.show === false) return;
//                     return (
//                         <Fragment key={index}>
//                             <li
//                                 className={joinClassNames(styles.colsMenuitem, item.className ?? '', item.disabled ? styles.colsMenuitemDisabled : '')}
//                                 style={item.style}
//                                 onClick={(e) => this.handleClick(e, item, index)}
//                                 onMouseEnter={(e) => {
//                                     this.mouseEnter(e, index);
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     this.mouseLeave(e, index);
//                                 }}
//                             >
//                                 <CustomLabel label={item.label} />
//                                 {/* TODO: if the menu itself contains a submenu. It should be served as an `IMenuItem` not wrapped options. */}
//                                 {item.children ? (
//                                     <Menu
//                                         ref={(ele: Menu) => (this._refs[index] = ele)}
//                                         menu={item.children}
//                                         onClick={item.onClick}
//                                         className={item.className}
//                                         style={item.style}
//                                         parent={this}
//                                         deep={deep + 1}
//                                     ></Menu>
//                                 ) : (
//                                     <></>
//                                 )}
//                             </li>
//                             {item.border ? <div className={styles.colsMenuitemLine}></div> : ''}
//                         </Fragment>
//                     );
//                 })}
//                 {options?.map((option: IValueOption | ICustomComponentOption, index: number) => {
//                     // render value option
//                     const isValueOption = isValueOptions(option);
//                     if (isValueOption) {
//                         return (
//                             <li
//                                 key={index}
//                                 className={joinClassNames(styles.colsMenuitem, option.disabled ? styles.colsMenuitemDisabled : '')}
//                                 onClick={() => {
//                                     if (option.value) {
//                                         this.props.onOptionSelect!(option);
//                                     }
//                                 }}
//                             >
//                                 <NeoCustomLabel
//                                     selected={value === option.value}
//                                     value={option.value}
//                                     display={display}
//                                     label={option.label}
//                                     title={typeof option.label === 'string' ? option.label : ''}
//                                     icon={option.icon}
//                                 />
//                             </li>
//                         );
//                     }
//                     // custom component option
//                     const CustomComponent = context.componentManager?.get(option.id);
//                     return (
//                         <li key={index} className={joinClassNames(styles.colsMenuitem, option.disabled ? styles.colsMenuitemDisabled : '')}>
//                             <CustomComponent
//                                 onValueChange={(v: string | number) => {
//                                     this.props.onOptionSelect!({ value: v, label: option.id });
//                                     this.showMenu(false);
//                                 }}
//                             />
//                         </li>
//                     );
//                 })}
//                 {/* render submenus */}
//                 {menuItems?.map((item: IDisplayMenuItem<IMenuItem>, index) => (
//                     <MenuItem menuItem={item} key={index} index={index} onClick={this.handleItemClick.bind(this, item as IMenuButtonItem)} />
//                 ))}
//             </ul>
//         );
//     }
//     protected initialize() {
//         this.state = {
//             show: false,
//             posStyle: {},
//             menuItems: [],
//         };
//     }
//     private getSubMenus() {
//         const { menuId } = this.props;
//         if (menuId) {
//             const menuService: IMenuService = this.context.injector.get(IMenuService);
//             this.setState({
//                 menuItems: menuService.getMenuItems(menuId),
//             });
//         }
//     }
// }
import { isRealNum } from '@univerjs/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';

import { AppContext } from '../../Common/AppContext';
import {
    ICustomComponentOption,
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuSelectorItem,
    isValueOptions,
    IValueOption,
    MenuItemType,
} from '../../services/menu/menu';
import { IMenuService } from '../../services/menu/menu.service';
import { joinClassNames } from '../../Utils';
import { CustomLabel, NeoCustomLabel } from '../CustomLabel/CustomLabel';
import { BaseMenuItem } from '../Item/Item';
import { DisplayTypes } from '../Select/Select';
import styles from './index.module.less';

export interface BaseMenuProps {
    /** @deprecated */
    onClick?: (...arg: any) => void;
    /** @deprecated */
    className?: string;
    /** @deprecated */
    style?: React.CSSProperties;
    /** @deprecated */
    parent?: boolean;
    /** @deprecated */
    deep?: number;
    /** @deprecated this is legacy menu mechanism. Do not use it. Use `menuItems` instead. */
    menu?: BaseMenuItem[]; // TODO: should be renamed to `items`

    // NOTE: options above are legacy. They are going to be removed after we complete refactoring.

    display?: DisplayTypes;
    menuId?: string;
    value?: string | number;
    options?: Array<IValueOption | ICustomComponentOption>;
    onOptionSelect?: (option: IValueOption) => void;
    show?: boolean;
    clientPosition?: {
        clientX: number;
        clientY: number;
    }; //Right-click menu adaptive position, send the location of the mouse click
}

export type BaseMenuStyle = {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
};

// export interface IBaseMenuState {
//     show: boolean;
//     posStyle: BaseMenuStyle;
//     menuItems: Array<IDisplayMenuItem<IMenuItem>>;
// } // Replace with your utility function import

// interface IValueOption {
//     value: string | number;
//     label: string;
//     icon?: string;
//     disabled?: boolean;
// }

// interface ICustomComponentOption {
//     id: string;
//     disabled?: boolean;
// }

// interface BaseMenuItem {
//     show?: boolean;
//     className?: string;
//     style?: React.CSSProperties;
//     label: string;
//     children?: BaseMenuItem[];
//     border?: boolean;
//     disabled?: boolean;
//     onClick?: (e: MouseEvent, value: string | number, index: number, deep: number) => void;
// }

// type DisplayTypes = 'block' | 'inline' | 'none';

// type BaseMenuStyle = React.CSSProperties;

// interface BaseMenuProps {
//     display?: DisplayTypes;
//     menuId?: string;
//     value?: string | number;
//     options?: Array<IValueOption | ICustomComponentOption>;
//     onOptionSelect?: (option: IValueOption) => void;
// }

export const Menu = (props: BaseMenuProps) => {
    const {
        display,
        menuId,
        value,
        options,
        onOptionSelect,
        parent,
        onClick,
        deep = 0,
        menu = [],
        className = '',
        style = {},
        show = false,
        clientPosition,
    } = props;
    const context = useContext(AppContext);
    const [isShow, setIsShow] = useState(show);
    const [posStyle, setPosStyle] = useState<BaseMenuStyle>({});
    const [menuItems, setMenuItems] = useState<Array<IDisplayMenuItem<IMenuItem>>>([]);
    const MenuRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        getSubMenus();
    }, [menuId]);

    useEffect(() => {
        const { show = false } = props;
        showMenu(show);
    }, [props.show]);

    useEffect(() => {
        const { clientPosition } = props;
        if (!clientPosition) return;
        const { clientX = 0, clientY = 0 } = clientPosition;
        setAutoPosition(clientX, clientY);
    }, [props.clientPosition]);

    // const handleClick = (e: MouseEvent, item: BaseMenuItem, index: number) => {
    //     item.onClick?.call(null, e, item.label, index, deep);
    //     onClick?.call(null, e, item.value, index, deep);
    //     setIsShow(false);
    // };

    const showMenu = (show: boolean) => {
        setIsShow(show);
        getStyle();
    };

    const getStyle = () => {
        const current = MenuRef.current;
        if (!current) return;
        const style: BaseMenuStyle = {};
        const curPosition = current.getBoundingClientRect();
        const docPosition = {
            left: 0,
            right: document.documentElement.clientWidth,
            top: 0,
            bottom: document.documentElement.clientHeight,
        };

        // Nested submenus
        if (parent) {
            current.style.position = 'fixed';
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
            setPosStyle(style);
        }
    };

    const setAutoPosition = (clientX: number, clientY: number) => {
        const current = MenuRef.current;
        if (!current) return;
        const style: BaseMenuStyle = {};
        const curPosition = current.getBoundingClientRect();
        const docPosition = {
            left: 0,
            right: document.documentElement.clientWidth,
            top: 0,
            bottom: document.documentElement.clientHeight,
        };

        const screenW = docPosition.right;
        const screenH = docPosition.bottom;
        const clickX = clientX;
        const clickY = clientY;
        const rootW = curPosition.width;
        const rootH = curPosition.height;

        // right is true, which means that the width from the mouse click position to the right border of the browser can be used to place the menu. Otherwise, the menu is moved to the left.
        // bottom is true, which means that the menu can be dropped from the height of the mouse click position to the lower border of the browser. Otherwise, the menu is placed above.
        const right = screenW - clickX > rootW;
        const left = !right;
        const bottom = screenH - clickY > rootH;
        const top = !bottom;

        if (right) {
            style.left = `${clickX}px`;
        }

        if (left) {
            style.left = `${clickX - rootW}px`;
        }

        if (bottom) {
            style.top = `${clickY}px`;
        }
        if (top) {
            style.top = `${clickY - rootH}px`;
        }

        setPosStyle(style);
    };

    const getSubMenus = () => {
        if (menuId) {
            const menuService = context.injector?.get(IMenuService); // Assuming context is available
            if (!menuService) {
                throw new Error('menuService is not defined');
            }
            setMenuItems(menuService.getMenuItems(menuId));
        }
    };

    return (
        <ul
            className={joinClassNames(styles.colsMenu, className)}
            style={{ ...style, ...posStyle, display: isShow ? 'block' : 'none' }}
            ref={MenuRef}
        >
            {/* legacy: render selections */}
            {options?.map((option: IValueOption | ICustomComponentOption, index: number) => {
                const isValueOption = isValueOptions(option);
                if (isValueOption) {
                    return (
                        <li
                            key={index}
                            className={joinClassNames(
                                styles.colsMenuitem,
                                option.disabled ? styles.colsMenuitemDisabled : ''
                            )}
                            onClick={() => {
                                if (option.value) {
                                    onOptionSelect?.(option);
                                }
                            }}
                        >
                            <CustomLabel
                                selected={value === option.value}
                                value={String(option.value)}
                                display={display}
                                label={option.label}
                                title={typeof option.label === 'string' ? option.label : ''}
                                icon={option.icon}
                            />
                        </li>
                    );
                }

                const CustomComponent = context.componentManager?.get(option.id) as React.ComponentType<any>;
                return (
                    <li
                        key={index}
                        className={joinClassNames(
                            styles.colsMenuitem,
                            option.disabled ? styles.colsMenuitemDisabled : ''
                        )}
                    >
                        <CustomComponent
                            onValueChange={(v: string | number) => {
                                onOptionSelect?.({ value: v, label: option.id });
                            }}
                        />
                    </li>
                );
            })}
            {/* render submenus */}
            {menuItems?.map((item: IDisplayMenuItem<IMenuItem>, index) => (
                <MenuItem
                    menuItem={item}
                    key={index}
                    index={index}
                    onClick={(object: Partial<IValueOption>) => {
                        onOptionSelect?.({ value: '', label: item.id, ...object });
                    }}
                />
            ))}
        </ul>
    );
};

export interface IMenuItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    index: number;
    onClick: (params: Partial<IValueOption>) => void;
}

export interface IMenuItemState {
    disabled: boolean;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
    value: any;
}

export function MenuItem({ menuItem, index, onClick }: IMenuItemProps) {
    const context = useContext(AppContext);
    const [disabled, setDisabled] = useState(false);
    const [value, setValue] = useState<any>(undefined);
    const [menuItems, setMenuItems] = useState<Array<IDisplayMenuItem<IMenuItem>>>([]);
    const [disabledSubscription, setDisabledSubscription] = useState<Subscription | undefined>();
    const [valueSubscription, setValueSubscription] = useState<Subscription | undefined>();
    const [itemShow, setItemShow] = useState<boolean>(false);

    const mouseEnter = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
        setItemShow(true);
    };

    const mouseLeave = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
        setItemShow(false);
    };

    const getSubMenus = () => {
        const { id } = menuItem;

        if (id) {
            const menuService = context.injector?.get(IMenuService);
            menuService && setMenuItems(menuService.getMenuItems(id));
        }
    };

    // const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, item: IDisplayMenuItem<IMenuItem>, index: number) => {
    //     // const commandService: ICommandService = context.injector.get(ICommandService);
    //     onClick();

    //     const itemValue = value;
    //     // !(item.subMenuItems && item.subMenuItems.length > 0) && commandService.executeCommand(item.id, { value });
    // };

    /**
     * user input change value from CustomLabel
     * @param e
     */
    const onChange = (v: string | number) => {
        const newValue = isRealNum(v) && typeof v === 'string' ? parseInt(v) : v;

        setValue(newValue);
    };

    useEffect(() => {
        setDisabledSubscription(
            menuItem.disabled$?.subscribe((disabled) => {
                setDisabled(disabled);
            })
        );

        setValueSubscription(
            menuItem.value$?.subscribe((newValue) => {
                setValue(newValue);
            })
        );

        getSubMenus();

        return () => {
            disabledSubscription?.unsubscribe();
            valueSubscription?.unsubscribe();
        };
    }, [menuItem]);

    const renderButtonType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
        const { title, display, label } = item;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                // disabled={disabled} // FIXME disabled is not working
                onClick={() => {
                    // commandService.executeCommand(item.id, { value });// move to business components
                    onClick({ value, id: item.id }); // merge cell
                }}
            >
                <NeoCustomLabel
                    display={display}
                    value={value}
                    title={title}
                    label={label}
                    onChange={(v) => {
                        onChange(v);
                    }}
                ></NeoCustomLabel>
            </li>
        );
    };

    const renderSelectorType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem<unknown>>;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                onMouseEnter={(e) => mouseEnter(e, index)}
                onMouseLeave={(e) => mouseLeave(e, index)}
                // onClick={(e) => handleClick(e, item, index)} // Nested select without click events, like border style
            >
                <NeoCustomLabel
                    title={item.title}
                    value={value}
                    onChange={onChange}
                    icon={item.icon}
                    display={item.display}
                    label={item.label}
                ></NeoCustomLabel>
                {item.shortcut && ` (${item.shortcut})`}
                {(menuItems.length > 0 || (item as IMenuSelectorItem<unknown>).selections?.length) && (
                    <Menu
                        show={itemShow}
                        onOptionSelect={(v) => {
                            // commandService.executeCommand(item.id, { value: v.value });
                            onClick({ value: v.value, id: item.id, show: true }); // border style don't trigger hide menu, set show true
                            setItemShow(false); // hide current menu
                        }}
                        menuId={item.id}
                        options={item.selections}
                        display={item.display}
                        parent={true}
                    ></Menu>
                )}
            </li>
        );
    };

    const renderSubItemsType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem<unknown>>;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                onMouseEnter={(e) => mouseEnter(e, index)}
                onMouseLeave={(e) => mouseLeave(e, index)}
                // onClick={(e) => handleClick(e, item, index)} // Nested menus without click events, like right menu delete cell
            >
                <NeoCustomLabel
                    title={item.title}
                    value={item.title}
                    icon={item.icon}
                    display={item.display}
                    label={item.label}
                ></NeoCustomLabel>
                {(menuItems.length > 0 || (item as IMenuSelectorItem<unknown>).selections?.length) && (
                    <Menu
                        show={itemShow}
                        menuId={item.id}
                        display={item.display}
                        parent={true}
                        onOptionSelect={onClick}
                    ></Menu>
                )}
            </li>
        );
    };

    return (
        <>
            {menuItem.type === MenuItemType.SELECTOR && renderSelectorType()}
            {menuItem.type === MenuItemType.SUBITEMS && renderSubItemsType()}
            {menuItem.type !== MenuItemType.SELECTOR && menuItem.type !== MenuItemType.SUBITEMS && renderButtonType()}
        </>
    );
}
