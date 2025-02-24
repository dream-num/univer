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

import { CloseSingle } from '@univerjs/icons';
import React from 'react';
import { clsx } from '../../helper/clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface IInputProps extends Pick<InputProps, 'onFocus' | 'onBlur'> {
    autoFocus?: boolean;
    className?: string;
    affixWrapperStyle?: React.CSSProperties;
    type?: 'text' | 'password';
    placeholder?: string;
    value?: string;
    size?: 'small' | 'middle' | 'large';
    allowClear?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onChange?: (value: string) => void;
    style?: React.CSSProperties;
}

export const Input = ({
    autoFocus = false,
    className,
    affixWrapperStyle,
    type = 'text',
    placeholder,
    value,
    size = 'small',
    allowClear = false,
    disabled = false,
    onClick,
    onKeyDown,
    onChange,
    onFocus,
    onBlur,
    ...props
}: IInputProps) => {
    const sizeClasses = {
        small: 'univer-h-8 univer-text-sm univer-px-2',
        middle: 'univer-h-10 univer-text-base univer-px-3',
        large: 'univer-h-12 univer-text-lg univer-px-4',
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div
            className={clsx(
                'univer-relative univer-inline-flex univer-w-full univer-items-center univer-rounded-md',
                disabled && 'univer-cursor-not-allowed univer-opacity-50',
                className
            )}
            style={affixWrapperStyle}
        >
            <input
                type={type}
                className={clsx(
                    `
                      univer-box-border univer-w-full univer-rounded-md univer-border univer-border-solid
                      univer-border-gray-300 univer-bg-white
                    `,
                    'univer-transition-colors univer-duration-200',
                    'placeholder:univer-text-gray-400',
                    `
                      focus:univer-border-blue-500 focus:univer-outline-none focus:univer-ring-2
                      focus:univer-ring-blue-500/20
                    `,
                    disabled && 'univer-cursor-not-allowed univer-bg-gray-50',
                    allowClear && 'univer-pr-8',
                    sizeClasses[size]
                )}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                autoFocus={autoFocus}
                onClick={onClick}
                onKeyDown={onKeyDown}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                {...props}
            />
            {allowClear && value && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    className={`
                      univer-absolute univer-right-2 univer-flex univer-items-center univer-rounded-full
                      univer-border-none univer-bg-transparent univer-p-1 univer-text-gray-400 univer-transition-colors
                      univer-duration-200
                      focus:univer-outline-none
                      hover:univer-text-gray-500
                    `}
                >
                    <CloseSingle className="univer-size-4" />
                </button>
            )}
        </div>
    );
};
