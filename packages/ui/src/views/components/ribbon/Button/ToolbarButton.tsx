/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import { clsx } from '@univerjs/design';

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

    return (
        <button
            type="button"
            className={clsx(`
              univer-flex univer-h-6 univer-min-w-6 univer-cursor-pointer univer-items-center univer-justify-center
              univer-rounded univer-border-none univer-bg-transparent univer-p-0 univer-text-base univer-text-gray-900
              univer-outline-none univer-transition-colors univer-animate-in univer-fade-in
              dark:univer-text-white dark:hover:univer-bg-gray-700 dark:disabled:univer-text-gray-600
              disabled:univer-cursor-not-allowed disabled:univer-text-gray-300 disabled:hover:univer-bg-transparent
              hover:univer-bg-gray-100
            `, {
                'univer-p-4': noIcon,
                '!univer-bg-gray-200 dark:!univer-bg-gray-500': active,
            })}
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
