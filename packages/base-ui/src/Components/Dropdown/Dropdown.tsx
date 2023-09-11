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
import React, { useEffect, useRef, useState } from 'react';

import { BaseDropdownProps } from '../../Interfaces';
import { Icon } from '..';
import { Menu } from '../Menu';
import { Tooltip } from '../Tooltip';
import styles from './index.module.less';

export function Dropdown(props: BaseDropdownProps) {
    // const MenuRef = useRef<Menu>(null);
    const DropRef = useRef<HTMLDivElement>(null);
    const IconRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<Record<string, string | number>>({});
    const [menuShow, setMenuShow] = useState(false);

    const handleClick = () => {
        props.onClick?.();
        props.onMainClick?.();
        const { icon } = props;
        if (!icon) {
            // MenuRef.current?.showMenu(true);
            setMenuShow(true);
        }
    };

    const handleSubClick = () => {
        console.info('show');
        // MenuRef.current?.showMenu(true);
        setMenuShow(true);
    };

    const hideMenu = () => {
        // MenuRef.current?.showMenu(false);
        setMenuShow(false);
    };

    const hideMenuClick = (e: MouseEvent) => {
        if (!DropRef.current || !DropRef.current?.contains(e.target as Node)) {
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
        window.addEventListener('click', hideMenuClick, true);

        return () => {
            window.removeEventListener('click', hideMenuClick, true);
        };
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
                <div ref={IconRef} className={styles.dropIcon} onClick={handleSubClick}>
                    {props.icon}
                </div>
            )}
            {props.content}
            <Menu
                menuId={props.menu.menuId}
                options={props.menu.options}
                display={props.menu.display}
                onClick={props.menu.onClick}
                // ref={MenuRef}
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
}
