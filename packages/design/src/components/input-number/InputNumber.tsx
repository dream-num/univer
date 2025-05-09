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

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { Input } from '../input/Input';

export interface IInputNumberProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
    value?: number | null;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    formatter?: (value: string | number | undefined) => string;
    parser?: (displayValue: string | undefined) => string;
    controls?: boolean;
    className?: string;
    inputClassName?: string;
    controlsClassName?: string;
    onChange?: (value: number | null) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    allowEmpty?: boolean;
}

export const InputNumber = forwardRef<HTMLInputElement, IInputNumberProps>(
    (
        {
            value,
            defaultValue,
            min = Number.MIN_SAFE_INTEGER,
            max = Number.MAX_SAFE_INTEGER,
            step = 1,
            precision,
            formatter,
            parser,
            controls = true,
            className,
            inputClassName,
            controlsClassName,
            disabled,
            onChange,
            onKeyDown,
            onPressEnter,
            onFocus,
            onBlur,
            allowEmpty = false,
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState<number | null>(
            value !== undefined ? value : defaultValue !== undefined ? defaultValue : null
        );
        const lastValidValueRef = useRef<number | null>(internalValue);
        const [inputValue, setInputValue] = useState<string>(formatValue(internalValue));
        const inputRef = useRef<HTMLInputElement>(null);
        const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
        const longPressIntervalRef = useRef<NodeJS.Timeout | null>(null);

        const mergedRef = (node: HTMLInputElement) => {
            if (ref) {
                if (typeof ref === 'function') {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }
            inputRef.current = node;
        };

        // Update internal value when value prop changes
        useEffect(() => {
            if (value !== undefined) {
                setInternalValue(value);
                lastValidValueRef.current = value;
                setInputValue(formatValue(value));
            }
        }, [value]);

        // When the internal value changes, if it's a valid value, update lastValidValue
        useEffect(() => {
            if (internalValue !== null) {
                lastValidValueRef.current = internalValue;
            }
        }, [internalValue]);

        // Clean up timers when component unmounts
        useEffect(() => {
            return () => {
                if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current);
                }
                if (longPressIntervalRef.current) {
                    clearInterval(longPressIntervalRef.current);
                }
            };
        }, []);

        function formatValue(val: number | null): string {
            if (val === null || val === undefined) return '';

            let formattedValue: string | number = val;

            // Apply precision
            if (precision !== undefined) {
                formattedValue = Number(val).toFixed(precision);
            }

            // Apply custom formatter
            if (formatter) {
                return formatter(formattedValue);
            }

            return String(formattedValue);
        }

        function parseValue(val: string): number | null {
            if (!val) return null;

            let parsedValue = val;

            if (parser) {
                parsedValue = parser(val);
            }

            try {
                const cleanedValue = parsedValue.replace(/[^\d.-]/g, '');

                const parts = cleanedValue.split('.');
                const firstPart = parts[0];
                const secondPart = parts.length > 1 ? parts.slice(1).join('') : '';

                const normalizedValue =
                    firstPart + (secondPart ? `.${secondPart}` : '');

                const num = Number(normalizedValue);

                if (Number.isNaN(num)) {
                    return null;
                }

                let result: number;
                if (precision !== undefined) {
                    const factor = 10 ** precision;
                    const roundedNum = Math.round(num * factor) / factor;

                    const numStr = roundedNum.toString();
                    if (numStr.includes('e')) {
                        result = Number.parseFloat(roundedNum.toFixed(precision));
                    } else {
                        result = roundedNum;
                    }
                } else {
                    const numStr = num.toString();
                    if (numStr.includes('e')) {
                        result = Number.parseFloat(num.toFixed(16).replace(/\.?0+$/, ''));
                    } else {
                        result = num;
                    }
                }

                if (max !== undefined && result > max) {
                    result = max;
                }
                if (min !== undefined && result < min) {
                    result = min;
                }

                return result;
            } catch (e) {
                return null;
            }
        }

        function handleInputChange(value: string) {
            setInputValue(value);

            if (allowEmpty && value === '') {
                setInternalValue(null);
                onChange?.(null);
                return;
            }

            const parsedValue = parseValue(value);
            setInternalValue(parsedValue);

            onChange?.(parsedValue);
        }

        function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
            // If allowEmpty is true and input is empty, do not restore the last valid value
            if (internalValue === null) {
                if (inputValue === '' && allowEmpty) {
                    // Keep the input empty
                    if (onChange) {
                        onChange(null);
                    }
                } else {
                    // If the input is not empty, restore the last valid value
                    const valueToRestore = lastValidValueRef.current;
                    setInternalValue(valueToRestore);
                    setInputValue(formatValue(valueToRestore));

                    if (onChange) {
                        onChange(valueToRestore);
                    }
                }
                onBlur?.(e);
                return;
            }

            // When blurring, format the value properly
            let valueInRange = internalValue;

            // Apply min/max constraints
            if (max !== undefined && valueInRange > max) {
                valueInRange = max;
            }
            if (min !== undefined && valueInRange < min) {
                valueInRange = min;
            }

            if (valueInRange !== internalValue) {
                setInternalValue(valueInRange);
                setInputValue(formatValue(valueInRange));

                onChange?.(valueInRange);
            } else {
                // Just ensure the display is formatted correctly
                setInputValue(formatValue(internalValue));
            }

            onBlur?.(e);
        }

        function handleStep(isUp: boolean) {
            if (disabled) return;

            const stepValue = isUp ? step : -step;

            // When internalValue is null, use 0 as the base value or the last valid value
            let currentValue: number;

            if (internalValue !== null) {
                currentValue = internalValue;
            } else if (lastValidValueRef.current !== null) {
                currentValue = lastValidValueRef.current;
            } else {
                // If there's no valid previous value, start from 0 or the minimum value
                currentValue = (min > 0) ? min : 0;
            }

            let newValue = currentValue + stepValue;

            // Apply min/max constraints
            if (max !== undefined && newValue > max) {
                newValue = max;
            }
            if (min !== undefined && newValue < min) {
                newValue = min;
            }
            // If we've hit a limit, don't change the value
            if (newValue === currentValue) return;
            setInternalValue(newValue);
            lastValidValueRef.current = newValue;
            setInputValue(formatValue(newValue));

            onChange?.(newValue);
        }

        // Handle key down events for arrow keys
        function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
            if (disabled) return;

            onKeyDown?.(e);

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                handleStep(true);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleStep(false);
            } else if (e.key === 'Enter') {
                onPressEnter?.(e);
            }
        }

        function handleClick(isUp: boolean) {
            if (disabled) return;

            handleStep(isUp);

            inputRef.current?.focus();
        }

        return (
            <div className={clsx('univer-inline-block', className)}>
                <div className="univer-relative univer-w-full">
                    <Input
                        ref={mergedRef}
                        className={clsx('univer-box-border', inputClassName)}
                        value={inputValue}
                        disabled={disabled}
                        onChange={handleInputChange}
                        onFocus={onFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                    />

                    {controls && (
                        <div
                            className={clsx(
                                `
                                  univer-absolute univer-right-px univer-top-px univer-box-border univer-flex
                                  univer-h-[calc(100%-2px)] univer-w-6 univer-flex-col univer-border univer-border-y-0
                                  univer-border-l univer-border-r-0 univer-border-solid univer-border-gray-200
                                  univer-border-l-gray-200
                                  dark:univer-border-gray-600
                                `,
                                controlsClassName
                            )}
                        >
                            <Button
                                className={`
                                  univer-relative !univer-h-1/2 univer-w-full univer-rounded-none univer-rounded-tr-md
                                  univer-border-none !univer-bg-transparent univer-text-xs
                                  after:univer-absolute after:-univer-bottom-px after:univer-block after:univer-h-px
                                  after:univer-w-full after:univer-bg-gray-200 after:univer-content-['']
                                  dark:after:univer-bg-gray-600
                                `}
                                tabIndex={-1}
                                disabled={disabled || (max !== undefined && internalValue !== null && internalValue >= max)}
                                onClick={() => handleClick(true)}
                            >
                                +
                            </Button>
                            <Button
                                className={`
                                  !univer-h-1/2 univer-w-full univer-rounded-none univer-rounded-br-md
                                  univer-border-none !univer-bg-transparent univer-text-xs
                                `}
                                tabIndex={-1}
                                disabled={disabled || (min !== undefined && internalValue !== null && internalValue <= min)}
                                onClick={() => handleClick(false)}
                            >
                                -
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
