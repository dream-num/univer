/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import clsx from 'clsx';
import React from 'react';

import styles from './index.module.less';

export interface IBaseToolbarButtonProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * Disabled state of button
     * @default false
     */
    disabled?: boolean;

    /** Set the handler to handle `click` event */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

    onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

    /**
     * Set the button is activated
     * @default false
     */
    active?: boolean;

    /**
     * This toolbar button has no icon
     */
    noIcon?: boolean;

    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
}

/**
 * Button Component
 */
export function ToolbarButton(props: IBaseToolbarButtonProps) {
    const {
        children,
        className,
        style,
        disabled = false,
        active = false,
        noIcon,
        onClick,
        onDoubleClick,
        ...restProps
    } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        onClick && onClick(e);
    };
    const handleDoubleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        onDoubleClick && onDoubleClick(e);
    };

    const _className = clsx(
        styles.toolbarBtn,
        {
            [`
              ${styles.toolbarBtnActive}
            `]: active,
            [`
              ${styles.toolbarBtnNoIcon}
            `]: noIcon,
        },
        className
    );

    return (
        <button
            type="button"
            className={_className}
            style={style}
            disabled={disabled}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            {...restProps}
        >
            {children}
        </button>
    );
}
