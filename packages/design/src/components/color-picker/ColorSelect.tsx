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

import type { AriaAttributes, ComponentProps, ComponentType, ReactNode } from 'react';
import { MoreDownIcon } from '@univerjs/icons';
import { useState } from 'react';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { Dropdown } from '../dropdown/Dropdown';
import { selectClassName } from '../select/Select';
import { ColorPicker } from './ColorPicker';

export interface IColorSelectProps extends AriaAttributes {
    id?: string;
    /** Null or undefined means unset; transparent is an explicit color. */
    value?: string | null;
    placeholder?: ReactNode;
    pickerFallbackValue?: string;
    resetLabel?: ReactNode;
    transparentLabel?: ReactNode;
    disabled?: boolean;
    compact?: boolean;
    className?: string;
    children?: ReactNode;
    onChange?: (value: string) => void;
    onReset?: () => void;
    ButtonComponent?: ComponentType<ComponentProps<typeof Button>>;
    DropdownComponent?: ComponentType<ComponentProps<typeof Dropdown>>;
    ColorPickerComponent?: ComponentType<ComponentProps<typeof ColorPicker>>;
}

export function ColorSelect(props: IColorSelectProps) {
    const {
        value,
        placeholder,
        pickerFallbackValue = '#ffffff',
        resetLabel,
        transparentLabel,
        disabled,
        compact,
        className,
        children,
        onChange,
        onReset,
        ButtonComponent = Button,
        DropdownComponent = Dropdown,
        ColorPickerComponent = ColorPicker,
        ...ariaProps
    } = props;
    const [open, setOpen] = useState(false);

    const handleChange = (color: string) => {
        if (disabled) {
            return;
        }
        onChange?.(color);
        setOpen(false);
    };

    return (
        <DropdownComponent
            disabled={disabled}
            open={!disabled && open}
            onOpenChange={setOpen}
            overlay={(
                <div className="univer-flex univer-flex-col univer-gap-3 univer-p-3">
                    {onReset && resetLabel !== undefined && (
                        <ButtonComponent
                            disabled={disabled}
                            onClick={() => {
                                if (disabled) {
                                    return;
                                }
                                onReset();
                                setOpen(false);
                            }}
                        >
                            {resetLabel}
                        </ButtonComponent>
                    )}
                    {transparentLabel !== undefined && (
                        <ButtonComponent disabled={disabled} onClick={() => handleChange('transparent')}>
                            {transparentLabel}
                        </ButtonComponent>
                    )}
                    <ColorPickerComponent
                        value={value && value !== 'transparent' ? value : pickerFallbackValue}
                        onChange={handleChange}
                    />
                </div>
            )}
        >
            <ButtonComponent
                {...ariaProps}
                type="button"
                disabled={disabled}
                aria-expanded={!disabled && open}
                aria-haspopup="dialog"
                className={clsx(selectClassName, 'univer-w-full !univer-min-w-0 univer-justify-between', {
                    '!univer-w-9 !univer-px-1 !univer-py-0': compact,
                }, className)}
            >
                {children ?? (
                    <>
                        {!compact && (value == null || (value === 'transparent' && transparentLabel !== undefined))
                            ? <span className="univer-truncate">{value === 'transparent' ? transparentLabel : placeholder}</span>
                            : (
                                <span
                                    className={clsx('univer-block univer-size-5 univer-shrink-0 univer-rounded-sm', borderClassName)}
                                    style={{ backgroundColor: value ?? pickerFallbackValue }}
                                />
                            )}
                        {!compact && <MoreDownIcon aria-hidden="true" className="univer-shrink-0" />}
                    </>
                )}
            </ButtonComponent>
        </DropdownComponent>
    );
}
