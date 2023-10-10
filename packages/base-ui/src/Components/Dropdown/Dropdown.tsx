import { IKeyValue } from '@univerjs/core';
import React, { useEffect, useRef, useState } from 'react';

import { Icon } from '..';
import { Menu } from '../Menu';
import { BaseMenuProps } from '../Menu/Menu';
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
        <>
            <div className={styles.dropdown} ref={DropRef}>
                <div className={styles.dropContent} onClick={handleClick}>
                    {props.children}
                    {props.showArrow ? <Icon.Format.NextIcon /> : ''}
                </div>
                {props.icon && (
                    <div ref={IconRef} className={styles.dropIcon} onClick={showMenu}>
                        {props.icon}
                    </div>
                )}
                {props.content}
                <div onMouseMove={(e) => e.stopPropagation()} onMouseOver={(e) => e.stopPropagation()}>
                    <Menu
                        menuId={props.menu.menuId}
                        options={props.menu.options}
                        display={props.menu.display}
                        onClick={props.menu.onClick}
                        value={props.menu.value}
                        menu={props.menu.menu}
                        className={props.menu.className}
                        style={{ ...props.menu.style, ...menuStyle }}
                        onClose={props.menu.onClose}
                        onOptionSelect={(v) => {
                            props.menu.onOptionSelect?.(v);
                            // There is no need to hide the menu after selecting the border color or style.
                            !v.show && hideMenu();
                        }}
                        show={menuShow}
                    />
                </div>
            </div>
        </>
    );
};
