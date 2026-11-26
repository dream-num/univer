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

import type { ChangeEvent, FocusEvent, InputHTMLAttributes, KeyboardEvent, MouseEvent } from 'react';
import { CloseIcon, MoreDownIcon, MoreUpIcon } from '@univerjs/icons';
import { forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { IInputProps } from '../input/Input';
import { borderClassName, inputStateClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { FormLayoutContext } from '../form-layout/FormLayout';
import { inputVariants } from '../input/Input';

export interface IInputNumberProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'size'> {
    value?: number | null;
    defaultValue?: number;
    size?: IInputProps['size'];
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
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    onPressEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
    allowEmpty?: boolean;
    allowClear?: boolean;
}

type InputNumberSize = NonNullable<IInputProps['size']>;

const LONG_PRESS_DELAY_MS = 350;
const LONG_PRESS_INTERVAL_MS = 75;
const SHIFT_STEP_MULTIPLIER = 10;

const SIZE_STYLES: Record<InputNumberSize, {
    inputControlsPadding: string;
    inputClearPadding: string;
    inputControlsAndClearPadding: string;
    clearPositionWithControls: string;
    clearPositionOnly: string;
    controlsContainer: string;
    icon: string;
}> = {
    mini: {
        inputControlsPadding: 'univer-pr-6 rtl:univer-pl-6 rtl:univer-pr-1.5',
        inputClearPadding: 'univer-pr-6 rtl:univer-pl-6 rtl:univer-pr-1.5',
        inputControlsAndClearPadding: 'univer-pr-11 rtl:univer-pl-11 rtl:univer-pr-1.5',
        clearPositionWithControls: 'univer-right-6 rtl:univer-left-6 rtl:univer-right-auto',
        clearPositionOnly: 'univer-right-1.5 rtl:univer-left-1.5 rtl:univer-right-auto',
        controlsContainer: 'univer-inset-y-0.5 univer-right-0.5 univer-w-5 rtl:univer-left-0.5 rtl:univer-right-auto',
        icon: 'univer-size-3',
    },
    small: {
        inputControlsPadding: 'univer-pr-8 rtl:univer-pl-8 rtl:univer-pr-2',
        inputClearPadding: 'univer-pr-8 rtl:univer-pl-8 rtl:univer-pr-2',
        inputControlsAndClearPadding: 'univer-pr-14 rtl:univer-pl-14 rtl:univer-pr-2',
        clearPositionWithControls: 'univer-right-8 rtl:univer-left-8 rtl:univer-right-auto',
        clearPositionOnly: 'univer-right-2 rtl:univer-left-2 rtl:univer-right-auto',
        controlsContainer: 'univer-inset-y-[3px] univer-right-[3px] univer-w-6 rtl:univer-left-[3px] rtl:univer-right-auto',
        icon: 'univer-size-3.5',
    },
    middle: {
        inputControlsPadding: 'univer-pr-9 rtl:univer-pl-9 rtl:univer-pr-3',
        inputClearPadding: 'univer-pr-9 rtl:univer-pl-9 rtl:univer-pr-3',
        inputControlsAndClearPadding: 'univer-pr-16 rtl:univer-pl-16 rtl:univer-pr-3',
        clearPositionWithControls: 'univer-right-9 rtl:univer-left-9 rtl:univer-right-auto',
        clearPositionOnly: 'univer-right-2.5 rtl:univer-left-2.5 rtl:univer-right-auto',
        controlsContainer: 'univer-inset-y-[3px] univer-right-[3px] univer-w-7 rtl:univer-left-[3px] rtl:univer-right-auto',
        icon: 'univer-size-4',
    },
    large: {
        inputControlsPadding: 'univer-pr-11 rtl:univer-pl-11 rtl:univer-pr-4',
        inputClearPadding: 'univer-pr-10 rtl:univer-pl-10 rtl:univer-pr-4',
        inputControlsAndClearPadding: 'univer-pr-[68px] rtl:univer-pl-[68px] rtl:univer-pr-4',
        clearPositionWithControls: 'univer-right-11 rtl:univer-left-11 rtl:univer-right-auto',
        clearPositionOnly: 'univer-right-3 rtl:univer-left-3 rtl:univer-right-auto',
        controlsContainer: 'univer-inset-y-1 univer-right-1 univer-w-8 rtl:univer-left-1 rtl:univer-right-auto',
        icon: 'univer-size-4',
    },
};

function getDecimalPlaces(num: number): number {
    if (!Number.isFinite(num)) {
        return 0;
    }

    const str = num.toString().toLowerCase();
    if (str.includes('e-')) {
        const [mantissa, exp] = str.split('e-');
        const mantissaDecimals = mantissa.includes('.') ? mantissa.split('.')[1].length : 0;
        return mantissaDecimals + Number.parseInt(exp, 10);
    }

    if (str.includes('e+')) {
        const [mantissa, exp] = str.split('e+');
        const mantissaDecimals = mantissa.includes('.') ? mantissa.split('.')[1].length : 0;
        return Math.max(0, mantissaDecimals - Number.parseInt(exp, 10));
    }

    const dotIndex = str.indexOf('.');
    return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

function multiplyStep(step: number, multiplier: number): number {
    if (multiplier === 1) {
        return step;
    }
    const decimals = Math.min(12, getDecimalPlaces(step));
    const raw = step * multiplier;
    if (!Number.isFinite(raw) || decimals === 0) {
        return raw;
    }
    return Number.parseFloat(raw.toFixed(decimals));
}

function addStep(base: number, delta: number, precision?: number): number {
    const decimals = precision !== undefined
        ? Math.max(0, precision)
        : Math.min(12, Math.max(getDecimalPlaces(base), getDecimalPlaces(delta)));
    const raw = base + delta;
    if (!Number.isFinite(raw)) {
        return raw;
    }
    if (decimals === 0 && precision === undefined) {
        return Object.is(raw, -0) ? 0 : raw;
    }
    const result = Number.parseFloat(raw.toFixed(decimals));
    return Object.is(result, -0) ? 0 : result;
}

export const InputNumber = forwardRef<HTMLInputElement, IInputNumberProps>(
    (
        {
            value,
            defaultValue,
            size,
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
            style,
            disabled,
            onChange,
            onKeyDown,
            onPressEnter,
            onFocus,
            onBlur,
            allowEmpty = false,
            allowClear = false,
            ...inputProps
        },
        ref
    ) => {
        const { direction, locale } = useContext(ConfigContext);
        const invalid = useContext(FormLayoutContext);
        const [internalValue, setInternalValue] = useState<number | null>(
            () => {
                if (value !== undefined) {
                    return value;
                }
                return defaultValue ?? null;
            }
        );
        const internalValueRef = useRef<number | null>(internalValue);
        const lastValidValueRef = useRef<number | null>(internalValue);
        const [inputValue, setInputValue] = useState<string>(() => formatValue(internalValue));
        const inputRef = useRef<HTMLInputElement>(null);
        const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
        const windowCleanupRef = useRef<(() => void) | null>(null);
        const didLongPressRef = useRef(false);

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

        const stopContinuousStep = useCallback(() => {
            if (holdTimeoutRef.current !== null) {
                clearTimeout(holdTimeoutRef.current);
                holdTimeoutRef.current = null;
            }
            if (holdIntervalRef.current !== null) {
                clearInterval(holdIntervalRef.current);
                holdIntervalRef.current = null;
            }
            if (windowCleanupRef.current) {
                windowCleanupRef.current();
                windowCleanupRef.current = null;
            }
        }, []);

        useEffect(() => stopContinuousStep, [stopContinuousStep]);

        // Update internal value when value prop changes
        useEffect(() => {
            if (value !== undefined && value !== internalValue) {
                internalValueRef.current = value;
                setInternalValue(value);
                lastValidValueRef.current = value;
                setInputValue(formatValue(value));
            }
        }, [value]);

        // When the internal value changes, if it's a valid value, update lastValidValue
        useEffect(() => {
            internalValueRef.current = internalValue;
            if (internalValue !== null) {
                lastValidValueRef.current = internalValue;
            }
        }, [internalValue]);

        function formatValue(val: number | null): string {
            if (val === null || val === undefined) {
                return '';
            }

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

        function parseNumberValue(val: string): number | null {
            if (!val) {
                return null;
            }

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

                return result;
            } catch {
                return null;
            }
        }

        function clampValue(val: number | null): number | null {
            if (val === null) {
                return null;
            }

            if (max !== undefined && val > max) {
                return max;
            }
            if (min !== undefined && val < min) {
                return min;
            }

            return val;
        }

        function handleInputValueChange(nextRawValue: string) {
            if (allowEmpty && nextRawValue === '') {
                setInputValue(nextRawValue);
                internalValueRef.current = null;
                setInternalValue(null);
                onChange?.(null);
                return;
            }

            const parsedNumber = parseNumberValue(nextRawValue);
            const parsedValue = clampValue(parsedNumber);
            const isOutOfRange = parsedNumber !== null && parsedValue !== parsedNumber;

            setInputValue(isOutOfRange ? formatValue(parsedValue) : nextRawValue);
            internalValueRef.current = parsedValue;
            setInternalValue(parsedValue);

            onChange?.(parsedValue);
        }

        function handleChange(e: ChangeEvent<HTMLInputElement>) {
            handleInputValueChange(e.target.value);
        }

        function handleClear(e: MouseEvent<HTMLButtonElement>) {
            e.stopPropagation();
            if (disabled) {
                return;
            }
            handleInputValueChange('');
            inputRef.current?.focus();
        }

        function handleBlur(e: FocusEvent<HTMLInputElement>) {
            // Focus can move before the controlled-value effect has rendered its state updates.
            const currentValue = value !== undefined ? value : internalValue;
            // If allowEmpty is true and input is empty, do not restore the last valid value
            if (currentValue === null) {
                if (inputValue === '' && allowEmpty) {
                    // Keep the input empty
                    if (onChange) {
                        onChange(null);
                    }
                } else {
                    // If the input is not empty, restore the last valid value
                    const valueToRestore = lastValidValueRef.current;
                    internalValueRef.current = valueToRestore;
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
            let valueInRange = currentValue;

            // Apply min/max constraints
            if (max !== undefined && valueInRange > max) {
                valueInRange = max;
            }
            if (min !== undefined && valueInRange < min) {
                valueInRange = min;
            }

            if (valueInRange !== currentValue) {
                internalValueRef.current = valueInRange;
                setInternalValue(valueInRange);
                setInputValue(formatValue(valueInRange));

                onChange?.(valueInRange);
            } else {
                // Just ensure the display is formatted correctly
                internalValueRef.current = currentValue;
                setInternalValue(currentValue);
                setInputValue(formatValue(currentValue));
            }

            onBlur?.(e);
        }

        function handleStep(isUp: boolean, multiplier = 1): boolean {
            if (disabled) {
                return false;
            }

            const effectiveStep = multiplyStep(step, multiplier);
            const stepValue = isUp ? effectiveStep : -effectiveStep;

            // When internalValue is null, use 0 as the base value or the last valid value
            let currentValue: number;
            const latestValue = internalValueRef.current;

            if (latestValue !== null) {
                currentValue = latestValue;
            } else if (lastValidValueRef.current !== null) {
                currentValue = lastValidValueRef.current;
            } else {
                // If there's no valid previous value, start from 0 or the minimum value
                currentValue = (min > 0) ? min : 0;
            }

            let newValue = addStep(currentValue, stepValue, precision);

            // Apply min/max constraints
            if (max !== undefined && newValue > max) {
                newValue = max;
            }
            if (min !== undefined && newValue < min) {
                newValue = min;
            }
            // If we've hit a limit, don't change the value
            if (newValue === currentValue) {
                return false;
            }
            internalValueRef.current = newValue;
            setInternalValue(newValue);
            lastValidValueRef.current = newValue;
            setInputValue(formatValue(newValue));

            onChange?.(newValue);
            return true;
        }

        const handleStepRef = useRef(handleStep);
        handleStepRef.current = handleStep;

        // Handle key down events for arrow keys
        function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
            if (disabled) {
                return;
            }

            onKeyDown?.(e);

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                handleStep(true, e.shiftKey ? SHIFT_STEP_MULTIPLIER : 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleStep(false, e.shiftKey ? SHIFT_STEP_MULTIPLIER : 1);
            } else if (e.key === 'Enter') {
                onPressEnter?.(e);
            }
        }

        function handleClick(isUp: boolean, multiplier = 1) {
            if (disabled) {
                return;
            }

            handleStep(isUp, multiplier);

            inputRef.current?.focus();
        }

        function handleControlMouseDown(e: MouseEvent<HTMLSpanElement>, isUp: boolean, isControlDisabled: boolean) {
            e.preventDefault();
            if (isControlDisabled || e.button !== 0) {
                return;
            }

            stopContinuousStep();
            didLongPressRef.current = false;
            const multiplier = e.shiftKey ? SHIFT_STEP_MULTIPLIER : 1;

            const handleWindowRelease = () => {
                stopContinuousStep();
            };

            if (typeof window !== 'undefined') {
                window.addEventListener('mouseup', handleWindowRelease);
                window.addEventListener('blur', handleWindowRelease);
                windowCleanupRef.current = () => {
                    window.removeEventListener('mouseup', handleWindowRelease);
                    window.removeEventListener('blur', handleWindowRelease);
                };
            }

            holdTimeoutRef.current = setTimeout(() => {
                didLongPressRef.current = true;
                if (!handleStepRef.current(isUp, multiplier)) {
                    stopContinuousStep();
                    return;
                }
                inputRef.current?.focus();
                holdIntervalRef.current = setInterval(() => {
                    if (!handleStepRef.current(isUp, multiplier)) {
                        stopContinuousStep();
                    }
                }, LONG_PRESS_INTERVAL_MS);
            }, LONG_PRESS_DELAY_MS);
        }

        function handleControlClick(e: MouseEvent<HTMLSpanElement>, isUp: boolean, isControlDisabled: boolean) {
            if (didLongPressRef.current) {
                didLongPressRef.current = false;
                return;
            }
            if (isControlDisabled) {
                return;
            }

            handleClick(isUp, e.shiftKey ? SHIFT_STEP_MULTIPLIER : 1);
        }

        const resolvedSize: InputNumberSize = size ?? 'small';
        const sizeStyle = SIZE_STYLES[resolvedSize];
        const incrementDisabled = Boolean(disabled || (max !== undefined && internalValue !== null && internalValue >= max));
        const decrementDisabled = Boolean(disabled || (min !== undefined && internalValue !== null && internalValue <= min));
        const showClearButton = Boolean(allowClear && inputValue && !disabled);

        let trailingPaddingClassName: string | undefined;
        if (controls && allowClear) {
            trailingPaddingClassName = sizeStyle.inputControlsAndClearPadding;
        } else if (controls) {
            trailingPaddingClassName = sizeStyle.inputControlsPadding;
        } else if (allowClear) {
            trailingPaddingClassName = sizeStyle.inputClearPadding;
        }

        return (
            <div
                data-u-comp="input-number"
                dir={direction}
                className={clsx('univer-inline-block', className)}
            >
                <div
                    data-u-comp="input"
                    className={clsx(
                        `
                          univer-group univer-relative univer-inline-flex univer-w-full univer-items-center
                          univer-rounded-md
                        `,
                        disabled && 'univer-cursor-not-allowed',
                        inputClassName
                    )}
                    style={style}
                >
                    <input
                        inputMode={min < 0 ? 'text' : 'decimal'}
                        type="text"
                        {...inputProps}
                        ref={mergedRef}
                        className={clsx(
                            inputVariants({ size: resolvedSize }),
                            borderClassName,
                            inputStateClassName,
                            'univer-min-w-0 univer-tabular-nums',
                            !disabled && `
                              group-hover:univer-border-gray-300
                              dark:group-hover:!univer-border-gray-500
                            `,
                            disabled && `
                              univer-cursor-not-allowed univer-bg-gray-50 univer-text-gray-400
                              dark:!univer-bg-gray-800 dark:!univer-text-gray-500
                            `,
                            trailingPaddingClassName
                        )}
                        value={inputValue}
                        disabled={disabled}
                        onChange={handleChange}
                        onFocus={onFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        aria-invalid={inputProps['aria-invalid'] ?? (invalid || undefined)}
                    />

                    {showClearButton && (
                        <button
                            type="button"
                            aria-label={locale?.Accessibility.clearInput}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            className={clsx(
                                `
                                  univer-absolute univer-top-1/2 univer-flex univer-size-4 -univer-translate-y-1/2
                                  univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-full
                                  univer-border-none univer-bg-transparent univer-p-0 univer-text-gray-400
                                  univer-outline-none univer-transition-colors univer-duration-200
                                  hover:univer-bg-gray-100 hover:univer-text-gray-600
                                  focus-visible:univer-ring-2 focus-visible:univer-ring-primary-600
                                  dark:!univer-text-gray-400
                                  dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-100
                                `,
                                controls ? sizeStyle.clearPositionWithControls : sizeStyle.clearPositionOnly
                            )}
                        >
                            <CloseIcon aria-hidden="true" className="univer-size-3" />
                        </button>
                    )}

                    {controls && (
                        <div
                            className={clsx(
                                `
                                  univer-absolute univer-flex univer-flex-col univer-overflow-hidden univer-rounded
                                  univer-transition-colors univer-duration-200
                                `,
                                disabled
                                    ? 'univer-bg-transparent univer-opacity-50'
                                    : `
                                      univer-bg-gray-50
                                      dark:!univer-bg-gray-800
                                    `,
                                sizeStyle.controlsContainer,
                                controlsClassName
                            )}
                        >
                            <span
                                className={clsx(
                                    `
                                      univer-box-border univer-flex univer-min-h-0 univer-flex-1 univer-select-none
                                      univer-items-center univer-justify-center univer-border-none univer-bg-transparent
                                      univer-p-0 univer-leading-none univer-transition-colors univer-duration-150
                                    `,
                                    incrementDisabled
                                        ? `
                                          univer-cursor-not-allowed univer-text-gray-300
                                          dark:!univer-text-gray-500
                                        `
                                        : `
                                          univer-cursor-pointer univer-text-gray-500
                                          hover:univer-bg-gray-100 hover:univer-text-gray-900
                                          active:univer-bg-primary-50 active:univer-text-primary-600
                                          dark:!univer-text-gray-300
                                          dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-0
                                          dark:active:!univer-bg-primary-900 dark:active:!univer-text-primary-300
                                        `
                                )}
                                role="button"
                                aria-label={locale?.Accessibility.increment}
                                aria-disabled={incrementDisabled}
                                tabIndex={-1}
                                onMouseDown={(e) => handleControlMouseDown(e, true, incrementDisabled)}
                                onMouseUp={stopContinuousStep}
                                onMouseLeave={stopContinuousStep}
                                onClick={(e) => handleControlClick(e, true, incrementDisabled)}
                            >
                                <MoreUpIcon
                                    aria-hidden="true"
                                    preserveStrokeWidth
                                    className={clsx('univer-shrink-0', sizeStyle.icon)}
                                />
                            </span>
                            <span
                                aria-hidden="true"
                                className="
                                  univer-mx-1 univer-h-px univer-shrink-0 univer-bg-gray-200
                                  dark:!univer-bg-gray-600
                                "
                            />
                            <span
                                className={clsx(
                                    `
                                      univer-box-border univer-flex univer-min-h-0 univer-flex-1 univer-select-none
                                      univer-items-center univer-justify-center univer-border-none univer-bg-transparent
                                      univer-p-0 univer-leading-none univer-transition-colors univer-duration-150
                                    `,
                                    decrementDisabled
                                        ? `
                                          univer-cursor-not-allowed univer-text-gray-300
                                          dark:!univer-text-gray-500
                                        `
                                        : `
                                          univer-cursor-pointer univer-text-gray-500
                                          hover:univer-bg-gray-100 hover:univer-text-gray-900
                                          active:univer-bg-primary-50 active:univer-text-primary-600
                                          dark:!univer-text-gray-300
                                          dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-0
                                          dark:active:!univer-bg-primary-900 dark:active:!univer-text-primary-300
                                        `
                                )}
                                role="button"
                                aria-label={locale?.Accessibility.decrement}
                                aria-disabled={decrementDisabled}
                                tabIndex={-1}
                                onMouseDown={(e) => handleControlMouseDown(e, false, decrementDisabled)}
                                onMouseUp={stopContinuousStep}
                                onMouseLeave={stopContinuousStep}
                                onClick={(e) => handleControlClick(e, false, decrementDisabled)}
                            >
                                <MoreDownIcon
                                    aria-hidden="true"
                                    preserveStrokeWidth
                                    className={clsx('univer-shrink-0', sizeStyle.icon)}
                                />
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

InputNumber.displayName = 'InputNumber';
