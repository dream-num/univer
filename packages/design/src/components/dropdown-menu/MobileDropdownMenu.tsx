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

import type { ReactNode } from 'react';
import type { DropdownMenuType } from './DropdownMenu';
import { clsx } from '../../helper/clsx';
import { MobileDropdownSurface } from '../dropdown/MobileDropdownSurface';

interface IMobileDropdownMenuProps {
    children: ReactNode;
    items: DropdownMenuType[];
    disabled?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileDropdownMenu(props: IMobileDropdownMenuProps) {
    const { children, items, disabled, open, onOpenChange } = props;

    function renderMenuItem(item: DropdownMenuType, index: number): ReactNode {
        if (item.type === 'separator') {
            return (
                <div
                    key={index}
                    className="
                      univer-my-1 univer-h-px univer-bg-gray-200
                      dark:!univer-bg-gray-700
                    "
                />
            );
        }
        if (item.type === 'custom') {
            return <div key={index} className={item.className}>{item.children}</div>;
        }
        if (item.type === 'radio') {
            return item.options.map((option, optionIndex) => {
                if ('type' in option) {
                    return renderMenuItem(option, optionIndex);
                }

                const { value } = option;
                if (value === undefined) {
                    throw new Error('[DropdownMenu]: `value` is required');
                }

                return (
                    <button
                        key={value}
                        type="button"
                        disabled={option.disabled}
                        className={mobileRowClassName(value === item.value)}
                        onClick={() => {
                            item.onSelect?.(value);
                            onOpenChange(false);
                        }}
                    >
                        {option.label}
                    </button>
                );
            });
        }
        if (item.type === 'checkbox') {
            return (
                <button
                    key={index}
                    type="button"
                    disabled={item.disabled}
                    className={clsx(mobileRowClassName(Boolean(item.checked)), item.className)}
                    onClick={() => {
                        item.onSelect?.(item.value);
                        onOpenChange(false);
                    }}
                >
                    {item.label}
                </button>
            );
        }
        if (item.type === 'item') {
            return (
                <button
                    key={index}
                    type="button"
                    disabled={item.disabled}
                    className={clsx(mobileRowClassName(false), item.className, {
                        '!univer-text-red-600 dark:!univer-text-red-400': item.variant === 'destructive',
                    })}
                    onClick={() => {
                        item.onSelect?.(item);
                        onOpenChange(false);
                    }}
                >
                    {item.children}
                </button>
            );
        }
        return (
            <div key={index} className="univer-flex univer-flex-col univer-gap-2">
                <div className="univer-px-4 univer-py-2 univer-text-sm univer-font-medium univer-text-gray-500">
                    {item.children}
                </div>
                {item.options?.map(renderMenuItem)}
            </div>
        );
    }

    return (
        <MobileDropdownSurface
            open={open}
            disabled={disabled}
            onOpenChange={onOpenChange}
            content={<div className="univer-flex univer-flex-col univer-gap-2">{items.map(renderMenuItem)}</div>}
        >
            {children}
        </MobileDropdownSurface>
    );
}

function mobileRowClassName(active: boolean): string {
    return clsx(`
      univer-flex univer-h-12 univer-w-full univer-items-center univer-rounded-xl univer-border-0 univer-px-4
      univer-text-left univer-text-base univer-text-gray-900 univer-outline-none
      active:univer-bg-gray-200
      disabled:univer-opacity-40
      dark:!univer-text-gray-0
      dark:active:!univer-bg-gray-700
    `, active
        ? `
          univer-bg-primary-50
          dark:!univer-bg-gray-700
        `
        : `
          univer-bg-gray-0
          dark:!univer-bg-gray-800
        `);
}
