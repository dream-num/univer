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

'use client';

import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPrimitive, DropdownMenuSeparator, DropdownMenuTrigger } from './DropdownMenuPrimitive';

export interface IFilterMenuItem {
  /** Unique identifier for the menu item */
    key: string;
  /** Display label */
    label: ReactNode;
  /** Optional icon to display before the label */
    icon?: ReactNode;
}

export interface IDropdownFilterMenuProps {
  /** Menu items to render */
    menus: IFilterMenuItem[];
  /** Currently selected keys */
    value: string[];
  /** Callback when selection changes */
    onChange: (value: string[]) => void;
  /** Custom trigger element */
    trigger: ReactNode;
  /** Optional title for the dropdown content */
    title?: string;
  /** Whether to show confirm/cancel buttons */
    showActions?: boolean;
  /** Confirm button text */
    confirmText?: string;
  /** Cancel button text */
    cancelText?: string;
  /** Dropdown content alignment */
    align?: 'start' | 'center' | 'end';
  /** Dropdown content side */
    side?: 'top' | 'right' | 'bottom' | 'left';
  /** Optional className for the content */
    contentClassName?: string;
  /** Whether the dropdown is disabled */
    disabled?: boolean;
}

export function DropdownFilterMenu(props: IDropdownFilterMenuProps) {
    const {
        menus,
        value,
        onChange,
        trigger,
        title,
        showActions = true,
        confirmText = 'OK',
        cancelText = 'Cancel',
        align = 'end',
        side = 'bottom',
        contentClassName,
        disabled = false,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
  // Internal state for pending changes (when showActions is true)
    const [pendingValue, setPendingValue] = useState<string[]>(value);

  // Sync pending value when dropdown opens
    const handleOpenChange = useCallback((open: boolean) => {
        if (open) {
            setPendingValue(value);
        }
        setIsOpen(open);
    }, [value]);

  // Handle checkbox change
    const handleCheckChange = useCallback((key: string, checked: boolean, currentValue: string[]) => {
        const newValue = checked
            ? [...currentValue, key]
            : currentValue.filter((v) => v !== key);

        if (showActions) {
            setPendingValue(newValue);
        } else {
            onChange(newValue);
        }
    }, [onChange, showActions]);

  // Handle confirm
    const handleConfirm = useCallback(() => {
        onChange(pendingValue);
        setIsOpen(false);
    }, [onChange, pendingValue]);

  // Handle cancel
    const handleCancel = useCallback(() => {
        setPendingValue(value);
        setIsOpen(false);
    }, [value]);

    const currentValue = showActions ? pendingValue : value;

    return (
        <DropdownMenuPrimitive open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild disabled={disabled}>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={clsx('univer-min-w-[240px]', contentClassName)}
                align={align}
                side={side}
            >
                {title && (
                    <>
                        <div className="univer-px-3 univer-py-2 univer-text-sm univer-font-semibold">
                            {title}
                        </div>
                        <DropdownMenuSeparator />
                    </>
                )}

                <div className="univer-max-h-[300px] univer-overflow-y-auto univer-py-1">
                    {menus.map((item) => {
                        const isChecked = currentValue.includes(item.key);

                        return (
                            <DropdownMenuItem
                                key={item.key}
                                className="univer-flex univer-cursor-pointer univer-items-center univer-gap-2"
                                onSelect={(e) => { e.preventDefault(); }}
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onChange={(checked) => {
                                        handleCheckChange(item.key, Boolean(checked), currentValue);
                                    }}
                                />
                                <div
                                    className="
                                      univer-flex univer-flex-1 univer-cursor-pointer univer-items-center univer-gap-2
                                    "
                                    onClick={() => {
                                        handleCheckChange(item.key, !isChecked, currentValue);
                                    }}
                                >
                                    {item.icon && <span className="univer-flex univer-items-center">{item.icon}</span>}
                                    <span className="univer-text-sm">{item.label}</span>
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </div>

                {showActions && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="univer-flex univer-items-center univer-justify-end univer-gap-2 univer-p-2">
                            <Button
                                size="middle"
                                variant="ghost"
                                onClick={handleCancel}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                size="middle"
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenuPrimitive>
    );
}
