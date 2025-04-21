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

import type { VariantProps } from 'class-variance-authority';
import { CloseSingle } from '@univerjs/icons';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { clsx } from '../../helper/clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const inputVariants = cva(
    `
      univer-box-border univer-w-full univer-rounded-md univer-border univer-border-solid univer-border-gray-200
      univer-bg-white univer-transition-colors univer-duration-200
      dark:univer-bg-gray-700 dark:univer-border-gray-600 dark:univer-text-white
      focus:univer-border-primary-500 focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-500/20
      placeholder:univer-text-gray-400
    `,
    {
        variants: {
            size: {
                small: 'univer-h-8 univer-px-2 univer-text-sm',
                middle: 'univer-h-10 univer-px-3 univer-text-base',
                large: 'univer-h-12 univer-px-4 univer-text-lg',
            },
        },
        defaultVariants: {
            size: 'small',
        },
    }
);

export interface IInputProps extends Pick<InputProps, 'onFocus' | 'onBlur'>,
    VariantProps<typeof inputVariants> {
    autoFocus?: boolean;
    className?: string;
    style?: React.CSSProperties;
    type?: HTMLInputElement['type'];
    placeholder?: string;
    value?: string;
    allowClear?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onChange?: (value: string) => void;
    inputClass?: string;
    inputStyle?: React.CSSProperties;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
    ({
        autoFocus = false,
        className,
        style,
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
        inputClass,
        inputStyle,
        ...props
    }, ref) => {
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
                    disabled && 'univer-cursor-not-allowed',
                    className
                )}
                style={style}
            >
                <input
                    ref={ref}
                    type={type}
                    className={clsx(
                        inputVariants({ size }),
                        disabled && `
                          univer-cursor-not-allowed univer-text-gray-400 univer-bg-gray-50
                          dark:univer-text-gray-500
                        `,
                        allowClear && 'univer-pr-8',
                        inputClass
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
                    style={inputStyle}
                    {...props}
                />
                {allowClear && value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={`
                          univer-absolute univer-right-2 univer-flex univer-items-center univer-rounded-full
                          univer-border-none univer-bg-transparent univer-p-1 univer-text-gray-400
                          univer-transition-colors univer-duration-200
                          focus:univer-outline-none
                          hover:univer-text-gray-500
                        `}
                    >
                        <CloseSingle className="univer-size-4" />
                    </button>
                )}
            </div>
        );
    }
);
