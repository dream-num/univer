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
import type { InputHTMLAttributes } from 'react';
import { CloseIcon } from '@univerjs/icons';
import { cva } from 'class-variance-authority';
import { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { borderClassName, inputStateClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { FormLayoutContext } from '../form-layout/FormLayout';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const inputVariants = cva(
    `
      univer-box-border univer-w-full univer-rounded-md univer-bg-gray-0 univer-text-gray-900 univer-transition-colors
      univer-duration-200
      placeholder:univer-text-gray-500
      motion-reduce:univer-transition-none
      dark:!univer-bg-gray-700 dark:!univer-text-gray-0
      dark:placeholder:univer-text-gray-300
    `,
    {
        variants: {
            size: {
                mini: 'univer-h-7 univer-px-1.5 univer-text-sm',
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

export interface IInputProps extends Omit<InputProps, 'onChange' | 'size' | 'slot' | 'value'>,
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
    slot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
    ({
        autoFocus = false,
        className,
        style,
        type = 'text',
        placeholder,
        value,
        size,
        allowClear = false,
        disabled = false,
        onClick,
        onKeyDown,
        onChange,
        onFocus,
        onBlur,
        slot,
        inputClass,
        inputStyle,
        ...props
    }, ref) => {
        const { direction, locale } = useContext(ConfigContext);
        const invalid = useContext(FormLayoutContext);
        const inputRef = useRef<HTMLInputElement>(null);

        const mergedRef = (node: HTMLInputElement | null) => {
            if (ref) {
                if (typeof ref === 'function') {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }
            inputRef.current = node;
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.('');
            inputRef.current?.focus();
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value);
        };

        const showClearButton = Boolean(allowClear && value && !disabled);
        const hasSlotContent = showClearButton || Boolean(slot);

        const [slotPadding, setSlotPadding] = useState(0);
        const slotRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!slot || !slotRef.current) {
                return;
            }

            const slotEl = slotRef.current;
            const updatePadding = () => {
                const width = slotEl.offsetWidth;
                setSlotPadding(width > 0 ? width + 12 : 0);
            };

            const mutationObserver = new MutationObserver(updatePadding);
            mutationObserver.observe(slotEl, { childList: true, subtree: true });

            const resizeObserver = typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(updatePadding)
                : null;
            resizeObserver?.observe(slotEl);

            updatePadding();

            return () => {
                mutationObserver.disconnect();
                resizeObserver?.disconnect();
            };
        }, [slot]);

        const paddingSide = direction === 'rtl' ? 'paddingLeft' : 'paddingRight';
        const mergedInputStyle = slot && slotPadding > 0
            ? { [paddingSide]: slotPadding, ...inputStyle }
            : inputStyle;

        return (
            <div
                data-u-comp="input"
                dir={direction}
                className={clsx(
                    'univer-relative univer-inline-flex univer-w-full univer-items-center univer-rounded-md',
                    disabled && 'univer-cursor-not-allowed',
                    className
                )}
                style={style}
            >
                <input
                    ref={mergedRef}
                    type={type}
                    className={clsx(
                        inputVariants({ size }),
                        borderClassName,
                        inputStateClassName,
                        !disabled && `
                          hover:univer-border-gray-300
                          dark:hover:!univer-border-gray-500
                        `,
                        disabled && `
                          univer-cursor-not-allowed univer-bg-gray-50 univer-text-gray-400
                          dark:!univer-bg-gray-800 dark:!univer-text-gray-500
                        `,
                        allowClear && !slot && `
                          univer-pr-8
                          rtl:univer-pl-8 rtl:univer-pr-2
                        `,
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
                    style={mergedInputStyle}
                    {...props}
                    aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
                />
                {hasSlotContent && (
                    <div
                        className={`
                          univer-absolute univer-right-2 univer-flex univer-items-center univer-gap-1
                          univer-rounded-full
                          rtl:univer-left-2 rtl:univer-right-auto
                        `}
                        ref={slotRef}
                    >
                        {slot}
                        {showClearButton && (
                            <button
                                type="button"
                                aria-label={locale?.Accessibility.clearInput}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleClear}
                                className={`
                                  univer-flex univer-size-4 univer-cursor-pointer univer-items-center
                                  univer-justify-center univer-rounded-full univer-border-none univer-bg-transparent
                                  univer-p-0 univer-text-gray-500 univer-outline-none univer-transition-colors
                                  univer-duration-200
                                  hover:univer-bg-gray-100 hover:univer-text-gray-900
                                  focus-visible:univer-ring-2 focus-visible:univer-ring-primary-600
                                  motion-reduce:univer-transition-none
                                  dark:!univer-text-gray-300
                                  dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-0
                                  dark:focus-visible:!univer-ring-primary-300
                                `}
                            >
                                <CloseIcon aria-hidden="true" className="univer-size-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
