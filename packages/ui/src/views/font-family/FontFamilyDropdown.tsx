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

import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import type { Observable } from 'rxjs';
import { LocaleService } from '@univerjs/core';
import { clsx, Dropdown } from '@univerjs/design';
import { MoreDownIcon } from '@univerjs/icons';
import { useState } from 'react';
import { useDependency, useObservable } from '../../utils/di';
import { FontFamily } from './FontFamily';
import { FontFamilyItem } from './FontFamilyItem';

export interface IFontFamilyDropdownProps {
    value: string;
    onChange: (value: string) => void;
    ariaLabel?: string;
    className?: string;
    disabled?: boolean;
    disabled$?: Observable<boolean>;
    inputClassName?: string;
    popupClassName?: string;
    popupDataComponent?: string;
    title?: ReactNode;
    onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
    onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
}

export function FontFamilyDropdown(props: IFontFamilyDropdownProps) {
    const {
        value,
        onChange,
        ariaLabel,
        className,
        disabled: disabledProp,
        disabled$,
        inputClassName,
        popupClassName,
        popupDataComponent,
        title,
        onMouseDown,
        onPointerDown,
    } = props;
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const disabledObservableValue = useObservable(disabled$);
    const disabled = Boolean(disabledProp || disabledObservableValue);
    const [open, setOpen] = useState(false);
    const popupDataAttributes = popupDataComponent ? { 'data-u-comp': popupDataComponent } : undefined;

    function handleChange(nextValue: string) {
        setOpen(false);
        onChange(nextValue);
    }

    return (
        <Dropdown
            disabled={disabled}
            open={open}
            onOpenChange={setOpen}
            overlay={(
                <div
                    dir={direction}
                    className={clsx(`
                      univer-max-h-72 univer-min-w-44 univer-overflow-y-auto univer-rounded-lg univer-border
                      univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1 univer-shadow-lg
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                    `, popupClassName)}
                    {...popupDataAttributes}
                >
                    <FontFamilyItem value={value} onChange={handleChange} />
                </div>
            )}
        >
            <div
                aria-disabled={disabled}
                aria-expanded={open}
                aria-label={ariaLabel}
                dir={direction}
                className={clsx(`
                  univer-flex univer-h-6 univer-min-w-0 univer-cursor-default univer-items-center univer-justify-between
                  univer-gap-1 univer-rounded-md univer-px-1.5 univer-text-sm univer-text-gray-900
                  hover:univer-bg-gray-100
                  dark:!univer-text-gray-100
                  dark:hover:!univer-bg-gray-700
                `, {
                    'univer-cursor-not-allowed univer-opacity-60': disabled,
                }, className)}
                role="combobox"
                tabIndex={disabled ? -1 : 0}
                title={typeof title === 'string' ? title : undefined}
                onMouseDown={onMouseDown}
                onPointerDown={onPointerDown}
            >
                <FontFamily
                    className={clsx('univer-min-w-0 univer-flex-1', inputClassName)}
                    value={value}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <MoreDownIcon className="univer-flex-shrink-0 univer-text-xs univer-text-gray-500" />
            </div>
        </Dropdown>
    );
}
