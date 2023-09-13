// interface IState {
//     menuStyle: JSX.CSSProperties;
// }
// export class Dropdown extends PureComponent<BaseDropdownProps, IState> {
//     MenuRef = createRef<Menu>();
//     DropRef = createRef<HTMLDivElement>();
//     IconRef = createRef<HTMLDivElement>();
//     constructor(props: BaseDropdownProps) {
//         super(props);
//         this.initialize();
//     }
//     handleClick = (e: MouseEvent) => {
//         this.props.onClick?.();
//         this.props.onMainClick?.();
//         const { icon } = this.props;
//         if (!icon) {
//             this.MenuRef.current?.showMenu(true);
//         }
//     };
//     handleSubClick = () => {
//         this.MenuRef.current?.showMenu(true);
//     };
//     hideMenu = () => {
//         this.MenuRef.current?.showMenu(false);
//     };
//     hideMenuClick = (e: MouseEvent) => {
//         if (!this.DropRef.current || !this.DropRef.current?.contains(e.target as Node)) {
//             this.hideMenu();
//         }
//     };
//     override componentDidMount() {
//         const { placement } = this.props;
//         const style: Record<string, string | number> = { position: 'absolute' };
//         if (!placement || placement === 'Bottom') {
//             style.left = 0;
//             style.top = '100%';
//         } else if (placement === 'Top') {
//             style.left = 0;
//             style.top = '-100%';
//         } else if (placement === 'Left') {
//             style.left = '-100%';
//             style.top = 0;
//         } else {
//             style.left = '100%';
//             style.top = 0;
//         }
//         this.setState({
//             menuStyle: style,
//         });
//         window.addEventListener('click', this.hideMenuClick, true);
//     }
//     override componentWillUnmount() {
//         window.removeEventListener('click', this.hideMenuClick, true);
//     }
//     render() {
//         const { children, menu, showArrow, icon, tooltip, content } = this.props;
//         const { menuStyle } = this.state;
//         return (
//             <div className={styles.dropdown} ref={this.DropRef}>
//                 <Tooltip title={tooltip} placement={'bottom'}>
//                     <div className={styles.dropContent} onClick={this.handleClick}>
//                         {children}
//                         {showArrow ? <Icon.Format.NextIcon /> : ''}
//                     </div>
//                 </Tooltip>
//                 {icon && (
//                     <div ref={this.IconRef} className={styles.dropIcon} onClick={this.handleSubClick}>
//                         {icon}
//                     </div>
//                 )}
//                 {content}
//                 <Menu
//                     menuId={menu.menuId}
//                     options={menu.options}
//                     display={menu.display}
//                     onClick={menu.onClick}
//                     ref={this.MenuRef}
//                     value={menu.value}
//                     menu={menu.menu}
//                     className={menu.className}
//                     style={{ ...menu.style, ...menuStyle }}
//                     onOptionSelect={(v) => {
//                         menu.onOptionSelect?.(v);
//                         this.hideMenu();
//                     }}
//                 ></Menu>
//             </div>
//         );
//     }
//     protected initialize() {
//         this.state = {
//             menuStyle: {},
//         };
//     }
// }
import { IKeyValue } from '@univerjs/core';
import React, { useEffect, useRef, useState } from 'react';

import { Icon } from '..';
import { Menu } from '../Menu';
import { BaseMenuProps } from '../Menu/Menu';
import { Tooltip } from '../Tooltip';
import styles from './index.module.less';

export interface BaseDropdownProps {
    children: React.ReactNode;
    /** @deprecated dropdown shouldn't know what is inside */
    menu: BaseMenuProps;
    placement?: 'Left' | 'Right' | 'Top' | 'Bottom';
    showArrow?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
    onMainClick?: () => void; //非功能按钮事件
    tooltip?: string;
    content?: React.ReactNode;
}

export const Dropdown = (props: BaseDropdownProps) => {
    const DropRef = useRef<HTMLDivElement>(null);
    const IconRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<Record<string, string | number>>({});
    const [menuShow, setMenuShow] = useState(false);

    const handleClick = () => {
        props.onClick?.();
        props.onMainClick?.();
        const { icon } = props;
        if (!icon) {
            showMenu();
        }
    };

    const showMenu = () => {
        setMenuShow(true);
        window.addEventListener('click', hideMenuClick, true);
    };

    const hideMenu = () => {
        setMenuShow(false);
        window.removeEventListener('click', hideMenuClick, true);
    };

    const hideMenuClick = (e: MouseEvent) => {
        if (!(DropRef as IKeyValue).current || !(DropRef as IKeyValue).current?.contains(e.target as Node)) {
            hideMenu();
        }
    };

    useEffect(() => {
        const { placement } = props;
        const style: Record<string, string | number> = { position: 'absolute' };
        if (!placement || placement === 'Bottom') {
            style.left = 0;
            style.top = '100%';
        } else if (placement === 'Top') {
            style.left = 0;
            style.top = '-100%';
        } else if (placement === 'Left') {
            style.left = '-100%';
            style.top = 0;
        } else {
            style.left = '100%';
            style.top = 0;
        }
        setMenuStyle(style);
    }, [props.placement]);
    return (
        <div className={styles.dropdown} ref={DropRef}>
            <Tooltip title={props.tooltip} placement={'bottom'}>
                <div className={styles.dropContent} onClick={handleClick}>
                    {props.children}
                    {props.showArrow ? <Icon.Format.NextIcon /> : ''}
                </div>
            </Tooltip>
            {props.icon && (
                <div ref={IconRef} className={styles.dropIcon} onClick={showMenu}>
                    {props.icon}
                </div>
            )}
            {props.content}
            <Menu
                menuId={props.menu.menuId}
                options={props.menu.options}
                display={props.menu.display}
                onClick={props.menu.onClick}
                value={props.menu.value}
                menu={props.menu.menu}
                className={props.menu.className}
                style={{ ...props.menu.style, ...menuStyle }}
                onOptionSelect={(v) => {
                    props.menu.onOptionSelect?.(v);
                    hideMenu();
                }}
                show={menuShow}
            ></Menu>
        </div>
    );
};
